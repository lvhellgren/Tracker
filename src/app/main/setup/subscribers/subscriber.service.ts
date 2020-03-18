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

import { Injectable } from '@angular/core';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';
import * as firebase from 'firebase';
import { Observable, Subject } from 'rxjs';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { AccountUserDoc, AuthService } from '../../core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SubscriptionDoc } from '../subscriptions/subscription.service';

export interface SubscriberDoc {
  active?: string;
  documentId?: string;
  accountId?: string;
  subscriptionId?: string;
  subscriber?: string;
  emailNotification?: boolean;
  textNotification?: boolean;
  modifiedAt?: any;
  createdAt?: any;
  comment?: string;
}

export const SUBSCRIBERS = 'subscribers';
export const ACCOUNT_USERS = 'account-users';
export const ACCOUNT_SUBSCRIPTIONS = 'account-subscriptions';

@Injectable({
  providedIn: 'root'
})
export class SubscriberService {

  msg$ = new Subject<string>();
  subscriberId: string;

  private allUsersSubject = new Subject<string[]>();
  public allUsers$: Observable<string[]>;
  private allSubscriptionsSubject = new Subject<string[]>();
  public allSubscriptions$: Observable<string[]>;

  static get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  constructor(private afs: AngularFirestore,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
    this.allUsers$ = this.allUsersSubject.asObservable();
    this.allSubscriptions$ = this.allSubscriptionsSubject.asObservable();
  }

  subscribers$(accountId: string, startAfter: number, limit: number): Observable<SubscriptionDoc[]> {
    return this.afs.collection(SUBSCRIBERS, ref => ref
      .where('accountId', '==', accountId)
      .orderBy('subscriber', 'asc')
      .orderBy('subscriptionId', 'asc')
      .startAfter(startAfter)
      .limit(limit)
    ).valueChanges();
  }

  setSubscriber(subscriberDoc: SubscriberDoc, returnPath: string) {
    subscriberDoc.createdAt = SubscriberService.timestamp;
    subscriberDoc.modifiedAt = SubscriberService.timestamp;

    const documentId = firebase.firestore().collection('notifications').doc().id;
    subscriberDoc.documentId = documentId;

    firebase.firestore().collection(SUBSCRIBERS).doc(documentId).set(subscriberDoc)
      .then(() => {
        this.subscriberId = subscriberDoc.documentId;
        this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
      })
      .catch(error => {
        this.msg$.next(error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Error  saving document`}
        });
      });
  }

  updateSubscriber(subscriberDoc: SubscriberDoc, returnPath: string) {
    delete subscriberDoc.createdAt;
    subscriberDoc.modifiedAt = SubscriberService.timestamp;

    firebase.firestore().collection(SUBSCRIBERS).doc(subscriberDoc.documentId).update(subscriberDoc)
      .then(() => {
        this.subscriberId = subscriberDoc.documentId;
        this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
      })
      .catch((error) => {
        this.msg$.next(error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Error updating subscriber document`}
        });
      });
  }

  getSubscriber(key: string) {
    return firebase.firestore().collection(SUBSCRIBERS).doc(key).get()
      .then(doc => {
        if (doc.exists) {
          this.subscriberId = doc.data().documentId;
          return doc.data();
        } else {
          this.dialog.open(ErrorDlgComponent, {
            data: {msg: `No subscriber document for ID: ${key}`}
          });
        }
      })
      .catch(error => {
        this.msg$.next(error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Error getting subscriber document for ID: ${key}`}
        });
      });
  }

  deleteSubscriber(documentId: string, returnPath: string) {
    return firebase.firestore().collection(SUBSCRIBERS).doc(documentId).delete()
      .then(() => {
        this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
      })
      .catch(error => {
        this.msg$.next(error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Error deleting subscriber document`}
        });
      });
  }

  /**
   * Deletes all subscribers for a given subscription.
   */
  async deleteSubscriptionSubscribers(subscriptionId: string) {
    const accountId = this.authService.currentUserAccountId;
    const batch = firebase.firestore().batch();
    const docs = await firebase.firestore().collection(SUBSCRIBERS)
      .where('accountId', '==', accountId)
      .where('subscriptionId', '==', subscriptionId)
      .get();
    docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    return batch.commit().catch(error => {
      this.msg$.next(error);
      const msg = `Error deleting subscribers for ${accountId}:${subscriptionId} - `;
      console.error(msg + error);
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: msg}
      });
    });
  }

  /**
   * Fetches users collection IDs for all users assigned to the current account.
   */
  fetchAccountUsers() {
    const accountId = this.authService.currentUserAccountId;
    firebase.firestore().collection(ACCOUNT_USERS)
      .where('accountId', '==', accountId)
      .where('active', '==', true)
      .get()
      .then((snapshot: QuerySnapshot<AccountUserDoc>) => {
        const users = [];
        snapshot.docs.map((doc) => {
          users.push(doc.data().userId);
        });
        this.allUsersSubject.next(users);
      })
      .catch((error) => {
        const msg = `Error getting user info for ${accountId} - `;
        console.error(msg + error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: msg}
        });
      });
  }

  /**
   * Fetches subscriptions collection IDs for all subscriptions assigned to the current account.
   */
  fetchAccountSubscriptions() {
    const accountId = this.authService.currentUserAccountId;
    firebase.firestore().collection(ACCOUNT_SUBSCRIPTIONS)
      .where('accountId', '==', accountId)
      .where('active', '==', true)
      .get()
      .then((snapshot: QuerySnapshot<SubscriptionDoc>) => {
        const subscriptions = [];
        snapshot.docs.map(doc => {
          subscriptions.push(doc.data().subscriptionId);
        });
        this.allSubscriptionsSubject.next(subscriptions);
      })
      .catch((error) => {
        const msg = `Error getting subscription info for ${accountId} - `;
        console.error(msg + error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: msg}
        });
      });
  }

  getSubscriberId() {
    return this.subscriberId;
  }

  clearSubscriber() {
    this.subscriberId = null;
  }
}
