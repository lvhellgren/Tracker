// Copyright (c) 2019 Lars Hellgren (lars@exelor.com).
// All rights reserved.
//
// This code is licensed under the MIT License.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files(the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions :
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, QuerySnapshot } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { ACCOUNT_USERS_COLL, ACCOUNTS_COLL, AccountUserDoc, AuthService, PRINCIPAL_ACCOUNT_ID } from '../../core/auth/auth.service';
import { MatDialog } from '@angular/material';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';

export interface Account {
  active?: boolean;
  accountId?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  modifiedAt?: any;
  createdAt?: any;
  description?: string;
}

export interface AccountConstraint {
  accountId?: string;
  maxDevices?: number;
  maxUsers?: number;
  maxLandmarks?: number;
  maxNotificationSubscriptions?: number;
  maxNotificationSubscribers?: number;
  maxMonthlyEvents?: number;
  maxMonthlyNotificationEmails?: number;
  maxMonthlyNotificationTexts?: number;
  serviceExpiration?: string;
  serviceExpirationYear?: number;  // For use in Firestore rules
  serviceExpirationMonth?: number; // For use in Firestore rules
  modifiedAt?: any;
  comment?: string;
}

export const ACCOUNT_CONSTRAINTS_COLL = 'account-constraints';

@Injectable()
export class AccountService {

  accounts: Account[];
  accounts$ = new Subject<Account[]>();
  accountId: string;
  msg$ = new Subject<string>();

  private db;
  private accountsRef;
  private accountUsersRef;
  private accountConstraintsRef;

  static buildAccountUserDoc(account: Account, userId: string): AccountUserDoc {
    return {
      accountId: account.accountId,
      active: account.active,
      userId: userId,
      roles: ['CREATOR']
    };
  }

  static get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private authService: AuthService,
    private dialog: MatDialog) {
    this.db = firebase.firestore();
    this.accountsRef = this.db.collection(ACCOUNTS_COLL);
    this.accountUsersRef = this.db.collection(ACCOUNT_USERS_COLL);
    this.accountConstraintsRef = this.db.collection(ACCOUNT_CONSTRAINTS_COLL);
  }

  /**
   * References all accounts in the data base. Subscribers automatically receive updates of changes to accounts in the data base.
   */
  get allAccounts$(): Observable<Account[]> {
    return this.afs.collection(ACCOUNTS_COLL).valueChanges();
  }

  /**
   * Fetches accounts collection documents for all accounts accessible by a given user.
   * @param userId
   */
  async fetchUserAccounts(userId: string) {
    this.accountUsersRef
      .where('userId', '==', userId)
      .get()
      .then(async (accountUserSnap: QuerySnapshot<AccountUserDoc>) => {
        const accountDocs = accountUserSnap.docs.map(async (accountUserDoc) => {
          const accountSnap = await this.accountsRef.doc(accountUserDoc.data().accountId)
            .get();
          return accountSnap.data();
        });

        const accounts = await Promise.all(accountDocs);
        const filtered = accounts.filter(account => {
          if (account) {
            return account.id !== PRINCIPAL_ACCOUNT_ID;
          } else {
            console.error(`Invalid account for user ${userId}`);
          }
        });
        this.accounts$.next(filtered);
      })
      .catch((error) => {
        console.error(`Error getting document for ${userId}: ${error}`);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: error}
        });
      });
  }

  /**
   * Fetches a given account
   * @param id An account ID
   */
  fetchAccount$(id: string): Observable<Account> {
    const doc: AngularFirestoreDocument<Account> = this.afs.doc(`${ACCOUNTS_COLL}/${id}`);
    this.accountId = id;
    return doc.valueChanges();
  }

  /**
   * Creates a new account or updates an existing one
   * @param account Account data
   * @param create If value true a new account is created
   * @param returnPath Routing path
   */
  saveAccount(account: Account, returnPath: string, create) {
    this.accountsRef.doc(account.accountId).get().then((doc) => {
      if (doc.exists) {
        if (create) {
          const msg = `Account with ID ${account.accountId} already exists`;
          this.msg$.next(msg);
        } else {
          this.createOrUpdateAccount(account, returnPath, false);
        }
      } else {
        if (!create) {
          const msg = `Account with ID ${account.accountId} does not exist`;
          this.msg$.next(msg);
        } else {
          account.createdAt = AccountService.timestamp;
          this.createOrUpdateAccount(account, returnPath, true);
        }
      }
    }).catch((error) => {
      console.error(`Error getting document for ${account.accountId}: ${error}`);
      this.msg$.next(error);
    });
  }

  private createOrUpdateAccount(account: Account, returnPath: string, create) {
    const userId = this.authService.getUserId();

    const accountRef = this.accountsRef.doc(account.accountId);

    account.modifiedAt = AccountService.timestamp;

    const batch = this.db.batch();
    batch.set(accountRef, account, {merge: !create});
    if (create) {
      const accountUserDoc = AccountService.buildAccountUserDoc(account, userId);
      const accountUserKey = this.authService.makeAccountUserKey(account.accountId, userId);
      const accountUserRef = this.accountUsersRef.doc(accountUserKey);
      batch.set(accountUserRef, accountUserDoc, {merge: false});

      const accountConstraint: AccountConstraint = this.initConstraints(account.accountId);
      const accountConstraintsRef = this.accountConstraintsRef.doc(account.accountId);
      accountConstraint.modifiedAt = AccountService.timestamp;
      batch.set(accountConstraintsRef, accountConstraint, {merge: false});
    }
    batch.commit().then(() => {
      this.accountId = account.accountId;
      this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
    }).catch((error) => {
      console.error(`Error saving account ${account.accountId}: ${error}`);
      this.msg$.next(error);
    });
  }

  private initConstraints(accountId: string) {
    const now = new Date();
    const expiration = now.getFullYear().toString() + '/' + (now.getMonth() + 1).toString();
    return <AccountConstraint> {
      accountId: accountId,
      maxDevices: 10,
      maxUsers: 10,
      maxLandmarks: 100,
      maxNotificationSubscriptions: 100,
      maxNotificationSubscribers: 10,
      maxMonthlyEvents: 1500,
      maxMonthlyNotificationEmails: 100,
      maxMonthlyNotificationTexts: 100,
      serviceExpiration: expiration,
      comment: ''
    };
  }

  getAccountConstraint(accountId: string) {
    return this.accountConstraintsRef.doc(accountId).get().then((accountSnap) => {
      if (accountSnap.exists) {
        return accountSnap.data();
      } else {
        const msg = `Account Constraint with ID ${accountId} does not exist`;
        this.msg$.next(msg);
      }
    }).catch((error) => {
      this.msg$.next(`Error reading Account Constraint ${accountId}: ${error}`);
    });
  }

  saveAccountConstraint(accountConstraint: AccountConstraint, returnPath: string) {
    accountConstraint.modifiedAt = AccountService.timestamp;

    const yearDate = accountConstraint.serviceExpiration.split('/');
    accountConstraint.serviceExpirationMonth = parseInt(yearDate[0], 10);
    accountConstraint.serviceExpirationYear = parseInt(yearDate[1], 10);

    this.accountConstraintsRef.doc(accountConstraint.accountId).set(accountConstraint)
      .then (() => {
        this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
      })
      .catch((error) => {
        const msg = `Error saving Account Constraint ${accountConstraint.accountId}: ${error}`;
        this.msg$.next(msg);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: msg}
        });
      });
  }

  clearAccount() {
    this.accountId = null;
  }
}
