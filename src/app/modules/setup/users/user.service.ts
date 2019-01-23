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

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';
import { ACCOUNT_USERS_COLL, ACCOUNTS_COLL, AccountUserDoc, AuthService, USERS_COLL } from '../../core/auth/auth.service';
import { ConfirmationDlgComponent } from '../../core/confirmation-dlg/confirmation-dlg-component';
import { MatDialog } from '@angular/material';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';

export interface UserDto {
  email: string;
  name?: string;
  phone?: string;
  roles?: string[];
  comment?: string;
  activeUser?: boolean;
  activeAccountUser?: boolean;
  signedInAt?: any;
  modifiedAt?: any;
  createdAt?: any;
}

export interface UserDoc {
  email: string;
  name?: string;
  phone?: string;
  comment?: string;
  active: boolean;
  signedInAt?: any;
  modifiedAt?: any;
  createdAt?: any;
  // currentAccountId?: string;
  uid?: string;
}

@Injectable()
export class UserService {
  private db;
  private usersRef;
  private accountsRef;
  private accountUsersRef;
  private usersSubject = new Subject<UserDto[]>();
  private userId: string;

  accountUsers$: Observable<UserDto[]>;
  msg$ = new Subject<string>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.db = firebase.firestore();
    this.usersRef = this.db.collection(USERS_COLL);
    this.accountsRef = this.db.collection(ACCOUNTS_COLL);
    this.accountUsersRef = this.db.collection(ACCOUNT_USERS_COLL);

    this.accountUsers$ = this.usersSubject.asObservable();
  }

  fetchAllUsers$(): Observable<UserDoc[]> {
    return this.afs.collection<UserDoc>(`${USERS_COLL}`).valueChanges();
  }

  /**
   * Fetches users collection documents for all users having access to a given account.
   * @param userId
   */
  fetchAccountUsers(accountId: string) {
    if (accountId) {
      this.accountUsersRef.where('accountId', '==', accountId)
        .get()
        .then((accountUserSnap: QuerySnapshot<AccountUserDoc>) => {
          const userDtos: UserDto[] = [];
          accountUserSnap.docs.map(accountUserDoc => {
            this.usersRef
              .where('email', '==', accountUserDoc.data().userId)
              .get()
              .then((userSnap: QuerySnapshot<UserDoc>) => {
                userSnap.docs.map(userDoc => {
                  const userDto: UserDto = this.buildUserDto(userDoc.data(), accountUserDoc.data());
                  userDtos.push(userDto);
                  this.usersSubject.next(userDtos);
                });
              });
          });
        })
        .catch((error) => {
          console.error(`Error getting document for ${accountId}: ${error}`);
          const dlg = this.dialog.open(ErrorDlgComponent, {
            data: {msg: error}
          });
        });
    }
  }

  /**
   * Fetches user details.
   * @param accountId
   * @param userId
   */
  async fetchAccountUser(accountId: string, userId: string) {
    this.userId = userId;
    const accountUserKey = this.authService.makeAccountUserKey(accountId, userId);
    const snaps = await Promise.all([
      this.usersRef.doc(userId).get(),
      this.accountUsersRef.doc(accountUserKey).get()
    ]);
    const userDto: UserDto = this.buildUserDto(snaps[0].data(), snaps[1].data());
    return userDto;
  }

  saveUser(userDto: UserDto, returnPath: string, create: boolean) {
    const userId = userDto.email;
    this.usersRef.doc(userId).get().then((doc) => {
      const accountId = this.authService.currentUserAccountId;
      const accountUserDoc = this.buildAccountUserDoc(accountId, userDto);

      if (doc.exists) {
        if (create) {
          const userDoc: UserDoc = doc.data();
          this.confirmIncludeUser(userDoc, accountUserDoc, returnPath);
        } else {
          const userDoc: UserDoc = this.buildUserDoc(userDto);
          this.updateUserDocs(userDoc, accountUserDoc, returnPath);
        }
      } else {
        this.afAuth.auth.fetchProvidersForEmail(userDto.email)
          .then(providers => {
            const userDoc: UserDoc = this.buildUserDoc(userDto);
            if (providers.length === 0) {
              this.createUserDocs(userDoc, accountUserDoc, returnPath);
            } else {
              // User already has an email authentication provider
              this.updateUserDocs(userDoc, accountUserDoc, returnPath);
            }
          })
          .catch(error => {
            this.msg$.next(error);
            console.error(error);
          });
      }
    }).catch((error) => {
      console.error(`Error getting document for ${userId}: ${error}`);
      this.msg$.next(error);
    });
  }

  private confirmIncludeUser(userDoc: UserDoc, accountUserDoc: AccountUserDoc, returnPath: string) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Include User',
        msg: `Are you sure you want to include the existing user, ${userDoc.email}, to this account?
        Form field values other than Account Roles and Account Access will be ignored.`,
        no: 'Cancel',
        yes: 'Include'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((include: boolean) => {
      if (include) {
        this.updateUserDocs(userDoc, accountUserDoc, returnPath);
      } else {
        this.msg$.next(`User with email ${userDoc.email} already exists`);
      }
    });
  }

  // Creates Firebase authentication and application user documents.
  private createUserDocs(userDoc: UserDoc, accountUserDoc: AccountUserDoc, returnPath: string) {
    userDoc.createdAt = this.timestamp;

    const userRef = this.usersRef.doc(userDoc.email);

    const accountUserKey = this.authService.makeAccountUserKey(accountUserDoc.accountId, userDoc.email);
    const accountUserRef = this.accountUsersRef.doc(accountUserKey);

    const batch = this.db.batch();
    batch.set(userRef, userDoc, {merge: false});
    batch.set(accountUserRef, accountUserDoc, {merge: false});
    batch.commit()
      .then(() => {
        this.authService.updateUserInfo(userDoc.email);
        this.authService.saveCurrentAccountId(userDoc.email, accountUserDoc.accountId);

        this.afAuth.auth
          .createUserWithEmailAndPassword(userDoc.email, this.makePassword(8))
          .then(res => {
            // Now signed in with the new user ID
            this.authService.saveUserUid(userDoc.email, res.user.uid);
            this.authService.userAccountIds = [accountUserDoc.accountId];
            this.authService.userAccountSelect.next(accountUserDoc.accountId);
          })
          .catch(function (err) {
            console.error(err);
            throw(err);
          });
      })
      .catch((error) => {
        console.error(`Error updating user ${userDoc.email}: ${error}`);
        // firebase.auth().currentUser
        //   .delete()
        //   .then(() => {
        //     console.log('User creation rolled back');
        //   })
        //   .catch(function (err) {
        //     console.error(err);
        //   });
        const dlg = this.dialog.open(ErrorDlgComponent, {
          data: {msg: error}
        });
        // dlg.afterClosed().subscribe((add: boolean) => {
        //   this.authService.signOut();
        // });
      });
  }

  // Updates existing application user documents.
  private updateUserDocs(userDoc: UserDoc, accountUserDoc: AccountUserDoc, returnPath: string) {
    const userRef = this.usersRef.doc(userDoc.email);
    const batch = this.db.batch();
    batch.set(userRef, userDoc, {merge: true});
    if (accountUserDoc) {
      const accountUserKey = this.authService.makeAccountUserKey(accountUserDoc.accountId, userDoc.email);
      const accountUserRef = this.accountUsersRef.doc(accountUserKey);
      batch.set(accountUserRef, accountUserDoc, {merge: true});
    }
    batch.commit().then(() => {
      this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
    }).catch((error) => {
      console.error(`Error updating user ${userDoc.email}: ${error}`);
      this.msg$.next(error);
    });
  }

  private buildUserDoc(userDto: UserDto): UserDoc {
    const userDoc: UserDoc = {
      email: userDto.email,
      name: userDto.name,
      phone: userDto.phone,
      comment: userDto.comment,
      active: userDto.activeUser,
      modifiedAt: this.timestamp
    };

    return userDoc;
  }

  private buildUserDto(userDoc: UserDoc, accountUserDoc: AccountUserDoc): UserDto {
    const userDto: UserDto = {
      email: userDoc.email,
      name: userDoc.name,
      roles: accountUserDoc ? accountUserDoc.roles : [],
      phone: userDoc.phone,
      comment: userDoc.comment,
      activeUser: userDoc.active,
      activeAccountUser: accountUserDoc ? accountUserDoc.active : false,
      createdAt: userDoc.createdAt,
      modifiedAt: userDoc.modifiedAt,
      signedInAt: userDoc.signedInAt
    };

    return userDto;
  }

  private buildAccountUserDoc(accountId: string, userDto: UserDto): AccountUserDoc {
    const accountUserDoc: AccountUserDoc = {
      accountId: accountId,
      userId: userDto.email,
      active: userDto.activeAccountUser,
      roles: userDto.roles
    };

    return accountUserDoc;
  }

  // Make sure only valid roles are submitted
  private buildUserRoles(userDto: UserDto, roleMap: Map<string, string>) {
    const roles: string[] = [];
    userDto.roles.forEach(role => {
      if (role.length > 0) {
        if (roleMap.get(role)) {
          roles.push(role);
        }
      }
    });
    return roles;
  }

  getUserId() {
    return this.userId;
  }

  clearUser() {
    this.userId = null;
  }

  private get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  private makePassword(length: number) {
    return Array(length).fill(0).map(x => Math.random().toString(36).charAt(2)).join('');
  }
}

