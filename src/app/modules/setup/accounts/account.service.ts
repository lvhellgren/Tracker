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
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
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
import { ACCOUNT_USERS_COLL, ACCOUNTS_COLL, AccountUserDoc, AuthService, HUB_ACCOUNT_ID } from '../../core/auth/auth.service';
import { MatDialog } from '@angular/material';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';

export interface AccountDto {
  active?: boolean;
  id?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  modifiedAt?: any;
  createdAt?: any;
  description?: string;
}

@Injectable()
export class AccountService {

  accounts: AccountDto[];
  accounts$ = new Subject<AccountDto[]>();
  accountId: string;
  msg$ = new Subject<string>();

  private db;
  private accountsRef;
  private accountUsersRef;

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
  }

  /**
   * References all accounts in the data base. Subscribers automatically receive updates of changes to accounts in the data base.
   */
  get allAccounts$(): Observable<AccountDto[]> {
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
            return account.id !== HUB_ACCOUNT_ID;
          } else {
            console.error(`Invalid account for user ${userId}`);
          }
        });
        this.accounts$.next(filtered);
      })
      .catch((error) => {
        console.error(`Error getting document for ${userId}: ${error}`);
        const dlg = this.dialog.open(ErrorDlgComponent, {
          data: {msg: error}
        });
      });
  }

  /**
   * Fetches a given account
   * @param id An account ID
   */
  fetchAccount$(id: string): Observable<AccountDto> {
    const doc: AngularFirestoreDocument<AccountDto> = this.afs.doc(`${ACCOUNTS_COLL}/${id}`);
    this.accountId = id;
    return doc.valueChanges();
  }

  /**
   * Creates a new account or updates an existing one
   * @param dto Account data
   * @param create If value true a new account is created
   */
  saveAccount(dto: AccountDto, returnPath: string, create) {
    this.accountsRef.doc(dto.id).get().then((doc) => {
      if (doc.exists) {
        if (create) {
          const msg = `Account with ID ${dto.id} already exists`;
          this.msg$.next(msg);
        } else {
          this.createOrUpdateAccount(dto, returnPath, false);
        }
      } else {
        if (!create) {
          const msg = `Account with ID ${dto.id} does not exist`;
          this.msg$.next(msg);
        } else {
          dto.createdAt = this.timestamp;
          this.createOrUpdateAccount(dto, returnPath, true);
        }
      }
    }).catch((error) => {
      console.error(`Error getting document for ${dto.id}: ${error}`);
      this.msg$.next(error);
    });
  }

  private createOrUpdateAccount(accountDto: AccountDto, returnPath: string, create) {
    const userId = this.authService.getUserId();

    const accountRef = this.accountsRef.doc(accountDto.id);

    accountDto.modifiedAt = this.timestamp;

    const batch = this.db.batch();
    batch.set(accountRef, accountDto, {merge: !create});
    if (create) {
      const accountUserDoc = this.buildAccountUserDoc(accountDto, userId);
      const accountUserKey = this.authService.makeAccountUserKey(accountDto.id, userId);
      const accountUserRef = this.accountUsersRef.doc(accountUserKey);
      batch.set(accountUserRef, accountUserDoc, {merge: false});
    }
    batch.commit().then(() => {
      this.accountId = accountDto.id;
      this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
    }).catch((error) => {
      console.error(`Error saving account ${accountDto.id}: ${error}`);
      this.msg$.next(error);
    });
  }

  clearAccount() {
    this.accountId = null;
  }

  private buildAccountUserDoc(accountDto: AccountDto, userId: string): AccountUserDoc {
    const accountUserDoc: AccountUserDoc = {
      accountId: accountDto.id,
      active: accountDto.active,
      userId: userId,
      roles: ['CREATOR']
    };

    return accountUserDoc;
  }

  private get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }
}
