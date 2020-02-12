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

import { Injectable, OnDestroy } from '@angular/core';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';
import * as firebase from 'firebase';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject, Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ACCOUNT_DEVICES, AccountDeviceDoc } from '../devices/device.service';
import { SubscriberService } from '../subscribers/subscriber.service';
import { ACCOUNT_LANDMARKS, AccountLandmarkDoc, LandmarkService } from '../landmarks/landmark.service';

export interface SubscriptionDoc {
  active?: string;
  accountId?: string;
  subscriptionId?: string;
  landmarkId?: string;
  deviceIds?: string[];
  activity?: string;
  modifiedAt?: any;
  createdAt?: any;
  comment?: string;
}

export const LANDMARK_ACTIVITIES: Map<string, string> = new Map([
  ['ENTRY', 'Arrival'],
  ['EXIT', 'Departure']
]);

const ACCOUNT_SUBSCRIPTIONS = 'account-subscriptions';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService implements OnDestroy {
  msg$ = new Subject<string>();
  subscriptionsRef;
  accountLandmarksRef;
  accountDevicesRef;

  // Landmarks available for subscription
  private allLandmarksSubject = new Subject<string[]>();
  public allLandmarks$ = this.allLandmarksSubject.asObservable();

  // Devices available for subscription
  private allDeviesSubject = new Subject<Map<string, string>>();
  public allDevices$ = this.allDeviesSubject.asObservable();

  deleteLandmarkSubscription: Subscription;

  subscriptionId: string;

  static makeAccountSubscriptionKey(accountId: String, subscriptionId: String): String {
    return `${accountId}:${subscriptionId}`;
  }

  static get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  constructor(private afs: AngularFirestore,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private subscriberService: SubscriberService,
              private landmarkService: LandmarkService,
              private dialog: MatDialog) {
    this.subscriptionsRef = firebase.firestore().collection(ACCOUNT_SUBSCRIPTIONS);
    this.accountLandmarksRef = firebase.firestore().collection(ACCOUNT_LANDMARKS);
    this.accountDevicesRef = firebase.firestore().collection(ACCOUNT_DEVICES);

    this.deleteLandmarkSubscription = this.landmarkService.deleteSubscriptions$.subscribe((landmarkId: string) => {
      this.deleteLandmarkSubscriptions(landmarkId);
    });
  }

  ngOnDestroy() {
    if (this.deleteLandmarkSubscription) {
      this.deleteLandmarkSubscription.unsubscribe();
    }
  }

  subscriptions$(accountId: string, startAfter: number, limit: number): Observable<SubscriptionDoc[]> {
    return this.afs.collection(ACCOUNT_SUBSCRIPTIONS, ref => ref
      .where('accountId', '==', accountId)
      .orderBy('subscriptionId', 'asc')
      .startAfter(startAfter)
      .limit(limit)
    ).valueChanges();
  }

  setSubscription(subscriptionDoc: SubscriptionDoc, returnPath: string) {
    const accountId = this.authService.currentUserAccountId;
    const subscriptionId = subscriptionDoc.subscriptionId;
    const accountSubscriptionKey = SubscriptionService.makeAccountSubscriptionKey(accountId, subscriptionId);

    this.subscriptionsRef.doc(accountSubscriptionKey).get().then((doc) => {
      if (!doc.exists) {
        subscriptionDoc.createdAt = SubscriptionService.timestamp;
        subscriptionDoc.modifiedAt = SubscriptionService.timestamp;

        this.subscriptionsRef.doc(accountSubscriptionKey).set(subscriptionDoc)
          .then(() => {
            this.subscriptionId = subscriptionDoc.subscriptionId;
            this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
          }).catch((error) => {
            this.msg$.next(error);
            this.dialog.open(ErrorDlgComponent, {
              data: {msg: `Error adding subscription document`}
          });
        });
      } else {
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Duplicate subscription document for ${accountId}, ${subscriptionId}`}
        });
      }
    }).catch((error) => {
      this.msg$.next(error);
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: `Error adding subscription document`}
      });
    });
  }

  updateSubscription(subscriptionDoc: SubscriptionDoc, returnPath: string) {
    const accountId = this.authService.currentUserAccountId;
    const subscriptionId = this.subscriptionId = subscriptionDoc.subscriptionId;
    const accountSubscriptionKey = SubscriptionService.makeAccountSubscriptionKey(accountId, subscriptionId);

    delete subscriptionDoc.createdAt;
    subscriptionDoc.modifiedAt = SubscriptionService.timestamp;

    this.subscriptionsRef.doc(accountSubscriptionKey).update(subscriptionDoc)
      .then(() => {
        this.subscriptionId = subscriptionDoc.subscriptionId;
        this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
      })
      .catch((error) => {
        this.msg$.next(error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Error updating subscription document`}
        });
      });
  }

  getSubscription(key: string) {
    return this.subscriptionsRef.doc(key).get()
      .then(doc => {
        if (doc.exists) {
          this.subscriptionId = doc.data().subscriptionId;
          return doc.data();
        } else {
          this.dialog.open(ErrorDlgComponent, {
            data: {msg: `No subscription document for ID: ${key}`}
          });
        }
      })
      .catch(error => {
        this.msg$.next(error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Error getting subscription document for ID: ${key}`}
        });
      });
  }

  deleteSubscription(subscriptionDoc: SubscriptionDoc, returnPath: string) {
    const key = SubscriptionService.makeAccountSubscriptionKey(subscriptionDoc.accountId, subscriptionDoc.subscriptionId);
    this.subscriptionsRef.doc(key).delete()
      .then(() => {
        this.subscriberService.deleteSubscriptionSubscribers(subscriptionDoc.subscriptionId)
          .then(() => {
            this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
          });
      })
      .catch(error => {
        this.msg$.next(error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Error deleting subscription document for ID: ${key}`}
        });
      });
  }

  async deleteLandmarkSubscriptions(landmarkId) {
    const accountId = this.authService.currentUserAccountId;
    const batch = firebase.firestore().batch();
    const docs = await firebase.firestore().collection(ACCOUNT_SUBSCRIPTIONS)
      .where('accountId', '==', accountId)
      .where('landmarkId', '==', landmarkId)
      .get();
    docs.forEach(doc => {
      this.subscriberService.deleteSubscriptionSubscribers(doc.data().subscriptionId).then(() => {
        batch.delete(doc.ref);
      });
    });
    return batch.commit().catch(error => {
      this.msg$.next(error);
      const msg = `Error deleting subscriptions for ${accountId}:${landmarkId} - `;
      console.error(msg + error);
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: msg}
      });
    });
  }

  /**
   * Fetches landmark collection IDs for all landmarks assigned to the current account.
   */
  fetchAccountLandmarks() {
    const accountId = this.authService.currentUserAccountId;
    this.accountLandmarksRef
      .where('accountId', '==', accountId)
      .where('active', '==', true)
      .get()
      .then((snapshot: QuerySnapshot<AccountLandmarkDoc>) => {
        const landmarkIds = [];
        snapshot.docs.map(accountLandmarkDoc => {
          landmarkIds.push(accountLandmarkDoc.data().landmarkId);
        });
        this.allLandmarksSubject.next(landmarkIds);
      })
      .catch((error) => {
        console.error(`Error getting landmark info for ${accountId}: ${error}`);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: error}
        });
      });
  }

  /**
   * Fetches device collection info for all devices assigned to the current account.
   */
  fetchAccountDevices() {
    const accountId = this.authService.currentUserAccountId;
    this.accountDevicesRef
      .where('accountId', '==', accountId)
      .where('active', '==', true)
      .get()
      .then((snapshot: QuerySnapshot<AccountDeviceDoc>) => {
        const deviceInfo = new Map<string, string>();
        snapshot.docs.map(accountDeviceDoc => {
          deviceInfo.set(accountDeviceDoc.data().deviceId, accountDeviceDoc.data().name);
        });
        this.allDeviesSubject.next(deviceInfo);
      })
      .catch((error) => {
        console.error(`Error getting device info for ${accountId}: ${error}`);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: error}
        });
      });
  }

  clearSubscription() {
    this.subscriptionId = null;
  }

  getSubscriptionId() {
    return this.subscriptionId;
  }
}
