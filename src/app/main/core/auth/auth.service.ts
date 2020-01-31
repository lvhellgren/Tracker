// Copyright (c) 2020 Lars Hellgren (lars@exelor.com).
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

import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { User } from 'firebase';
import { UiService } from '../ui-service/ui.service';
import { Account } from '../../setup/accounts/account.service';
import { UserDoc } from '../../setup/users/user.service';
import { ErrorDlgComponent } from '../error-dlg/error-dlg.component';
import { MatDialog } from '@angular/material';

export const SIGN_IN_PAGE = '/sign-in';
export const HOME_PAGE = '/locations';

export const PRINCIPAL_ACCOUNT_ID = 'Principal';

export const USERS = 'users';
export const ACCOUNTS = 'accounts';
export const ACCOUNT_USERS = 'account-users';

export const PRINCIPAL_USER_ROLES: Map<string, string> = new Map([
  ['CREATOR', 'Creator'],
  ['EDITOR', 'Editor'],
  ['VIEWER', 'Viewer']
]);

export const ACCOUNT_USER_ROLES: Map<string, string> = new Map([
  ['CREATOR', 'Creator'],
  ['EDITOR', 'Editor'],
  ['OPERATOR', 'Operator'],
  ['VIEWER', 'Viewer']
]);

export interface AccountUserDoc {
  userId: string;
  accountId: string;
  active: boolean;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private db;
  private usersRef;

  // Used in AuthGuard to check user being signed in
  user$: Observable<User>;

  authChange = new Subject<any>();
  authMsg = new Subject<string>();
  userAccountSelect = new BehaviorSubject<string>('');
  userSubscription: Subscription;
  userAccountSubscription: Subscription;
  accountUserSubscription: Subscription;
  accountIdsSubscription: Subscription;

  userAccountIds: string[];
  currentUserAccountId: string;
  currentUserRoles: string[];
  isPrincipalUser = false;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private uiService: UiService,
    private dialog: MatDialog,
    private zone: NgZone
  ) {
    this.db = firebase.firestore();
    this.usersRef = this.db.collection(USERS);
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          this.authChange.next(true);

          // Create an inner observable to the user's document:
          const user$ = this.afs.doc<UserDoc>(`${USERS}/${user.email}`).valueChanges();
          this.userSubscription = user$.subscribe(
            (userDoc: UserDoc) => {
              if (!userDoc.active) {
                this.signOut();
                this.authMsg.next(`Application access denied for user ${userDoc.email}`);
                return of(null);
              }
              this.fetchUserAccountIds(user.email, userDoc);
            },
            error => {
              if (!this.userSubscription.closed) {
                console.log(error);
              }
            });
          return user$;
        } else {
          return of(null);
        }
      })
    );

    this.userAccountSubscription = this.userAccountSelect.subscribe(accountId => {
      this.fetchAccountUserRoles(accountId, this.getUserId());
      this.saveCurrentAccountId(this.getUserId(), accountId);
    });
  }

  emailSignIn(email: string, password: string) {
    this.uiService.loadingStateChanged.next(true);
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        this.authChange.next(true);
        this.updateUserInfo(email);
        this.uiService.loadingStateChanged.next(false);
      })
      .catch(error => {
        this.uiService.loadingStateChanged.next(false);
        this.authMsg.next(error);
        console.error(error);
        this.uiService.loadingStateChanged.next(false);
      });
  }

  signOut(): void {
    if (!!this.afAuth.auth.currentUser) {
      this.afAuth.auth.signOut()
        .then(() => {
          this.authChange.next(false);
          this.router.navigate([SIGN_IN_PAGE]);
        })
        .catch(error => {
          console.error(`signOut: ${error}`);
        });
      }

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.accountUserSubscription) {
      this.accountUserSubscription.unsubscribe();
    }
    if (this.accountIdsSubscription) {
      this.accountIdsSubscription.unsubscribe();
    }
  }

  googleSignIn() {
    this.uiService.loadingStateChanged.next(true);
    return new Promise<any>(() => {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      this.afAuth.auth
        .signInWithPopup(provider)
        .then(res => {
          if (res.additionalUserInfo.isNewUser) {
            const currentUser = this.afAuth.auth.currentUser;
            this.usersRef.doc(currentUser.email).get().then((doc) => {
              if (doc.exists) {
                this.authChange.next(true);
                this.updateUserInfo(currentUser.email);
                this.saveCurrentAccountId(currentUser.email, currentUser.email);
              } else {
                const userRef = this.usersRef.doc(currentUser.email);
                const userDoc: UserDoc = {
                  email: currentUser.email,
                  name: currentUser.displayName,
                  phone: currentUser.phoneNumber,
                  comment: '',
                  active: true,
                  createdAt: this.timestamp,
                  modifiedAt: this.timestamp,
                  signedInAt: this.timestamp,
                  uid: res.user.uid
                };
                userDoc.currentAccountId = currentUser.email;

                const accountUserKey = this.makeAccountUserKey(currentUser.email, currentUser.email);
                const accountUserRef = this.db.collection(ACCOUNT_USERS).doc(accountUserKey);
                const accountUserDoc: AccountUserDoc = {
                  accountId: currentUser.email,
                  userId: currentUser.email,
                  active: true,
                  roles: ['EDITOR', 'CREATOR', 'VIEWER']
                };

                const accountRef = this.db.collection(ACCOUNTS).doc(currentUser.email);
                const account: Account = {
                  active: true,
                  accountId: currentUser.email,
                  modifiedAt: this.timestamp,
                  createdAt: this.timestamp,
                  description: 'Demo account created through Google Sign In by a first-time user'
                };

                const batch = this.db.batch();
                batch.set(userRef, userDoc, {merge: false});
                batch.set(accountUserRef, accountUserDoc, {merge: false});
                batch.set(accountRef, account, {merge: false});
                batch.commit().then(() => {
                  this.authChange.next(true);
                  this.zone.run(() => {
                    this.router.navigate([HOME_PAGE]);
                  });
                })
                  .catch(error => {
                    console.error(error);
                    this.authMsg.next(error);
                    this.uiService.loadingStateChanged.next(false);
                  });
              }
            });
          } else {
            this.updateUserInfo(this.afAuth.auth.currentUser.email);
            this.uiService.loadingStateChanged.next(false);
          }
        })
        .catch(error => {
          console.error(error);
          this.authMsg.next(error);
          this.uiService.loadingStateChanged.next(false);
        });
    })
      .catch(error => {
        console.error(error);
      });
  }

  get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  updateUserInfo(email: string): void {
    this.afs.collection(USERS).doc(email)
      .set({signedInAt: this.timestamp}, {merge: true})
      .then(() => {
        this.zone.run(() => {
          this.router.navigate([HOME_PAGE]);
        });
      })
      .catch(error => {
        this.signOut();
        console.error(error);
        this.authMsg.next(error);
      });
  }

  saveCurrentAccountId(userId: string, accountId: string): void {
    if (userId && accountId) {
      this.afs.collection(USERS).doc(userId)
        .set({currentAccountId: accountId}, {merge: true})
        .then(() => {
        })
        .catch(error => {
          this.signOut();
          console.error(error);
          this.authMsg.next(error);
        });
    }
  }

  saveUserUid(userId: string, uid: string): void {
    if (userId && uid) {
      this.afs.collection(USERS).doc(userId)
        .set({uid: uid}, {merge: true})
        .then(() => {
        })
        .catch(error => {
          this.signOut();
          console.error(error);
          this.authMsg.next(error);
        });
    }
  }

  // TODO: Use or remove
  private getAllAccountIds() {
    this.afs.collection(ACCOUNTS)
      .valueChanges()
      .subscribe(
        (recs: Account[]) => {
          this.userAccountIds = [];
          recs.forEach((rec: Account) => {
            this.userAccountIds.push(rec['accountId']);
          });
        },
        error => {
          console.error('accounts collection: ', error);
          this.authMsg.next(error);
          this.dialog.open(ErrorDlgComponent, {
            data: {msg: error}
          });
        });
  }

  /**
   * Fetches all accounts accessible to a given user.
   * @param userId
   */
  private fetchUserAccountIds(userId: string, userDoc: UserDoc) {
    const accountIds$ = this.afs.collection(ACCOUNT_USERS, ref => ref
      .where('userId', '==', userId)
      .where('active', '==', true))
      .valueChanges();
    this.accountIdsSubscription = accountIds$.subscribe(
      (recs: AccountUserDoc[]) => {
        this.userAccountIds = [];
        recs.forEach((accountUserDoc: AccountUserDoc) => {
          if (accountUserDoc.accountId === PRINCIPAL_ACCOUNT_ID) {
            this.isPrincipalUser = true;
          }
          this.userAccountIds.push(accountUserDoc['accountId']);
        });
        if (this.userAccountIds.length > 0) {
          if (!this.userAccountIds.includes(userDoc.currentAccountId)) {
            userDoc.currentAccountId = this.userAccountIds[0];
            this.currentUserAccountId = userDoc.currentAccountId;
          }

          this.currentUserAccountId = userDoc.currentAccountId;
          this.userAccountSelect.next(this.currentUserAccountId);
        } else {
          console.error(`User ${userId} has no account assignments`);
        }
      },
      error => {
        if (!this.accountIdsSubscription.closed) {
          console.error(error);
        }
      });
  }

  /**
   * Fetches the roles for a given account and user.
   * @param accountId
   * @param userId
   */
  private fetchAccountUserRoles(accountId: string, userId: string) {
    this.currentUserRoles = [];
    const accountUsers$ = this.afs.doc(`${ACCOUNT_USERS}/${this.makeAccountUserKey(accountId, userId)}`)
      .valueChanges();
    this.accountUserSubscription = accountUsers$.subscribe(
      (accountUserDoc: AccountUserDoc) => {
        if (accountUserDoc) {
          this.currentUserRoles = accountUserDoc.roles;
        }
      },
      error => {
        if (!this.accountUserSubscription.closed) {
          console.log('fetchAccountUserRoles: ' + error);
        }
      });
  }

  /**
   * Checks if the currently signed in user has a given role.
   * @param role
   */
  hasRole(role) {
    return this.currentUserRoles.includes(role);
  }

  getRoles() {
    return this.isPrincipalUser ? PRINCIPAL_USER_ROLES : ACCOUNT_USER_ROLES;
  }

  getDefaultRole() {
    return ['VIEWER'];
  }

  /**
   * The key used for accessing the account user and account user roles collections.
   * @param accountId
   * @param userId
   */
  makeAccountUserKey(accountId: string, userId: string) {
    return `${accountId}:${userId}`;
  }

  getUserId() {
    const user = firebase.auth().currentUser;
    return user ? user.email : '';
  }

  resetPassword(email: string) {
    const auth = firebase.auth();
    return auth.sendPasswordResetEmail(email)
      .then(() => {
        this.authMsg.next('Please check your email for password reset instructions.');
      })
      .catch((error) => {
        console.error(error);
        this.authMsg.next(error);
      });
  }
}
