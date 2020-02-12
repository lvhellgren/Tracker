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
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { LatLngLiteral } from '@agm/core';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';
import { AuthService } from '../../core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import * as firebase from 'firebase';
import FieldValue = firebase.firestore.FieldValue;

export interface AccountLandmarkDoc {
  accountId?: string;
  landmarkId?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  color?: string;
  comment?: string;
  active?: boolean;
  modifiedAt?: any;
  createdAt?: FieldValue;
  // Street Number
  subThoroughfare?: string;
  // Street
  thoroughfare?: string;
  // Locality/City
  locality?: string;
  // State
  area?: string;
  // ZIP
  postalCode?: string;
  // County
  subAdminArea?: string;
  // Country
  countryName?: string;
}

export interface Address {
  // Street Number
  subThoroughfare?: string;
  // Street
  thoroughfare?: string;
  // Locality/City
  locality?: string;
  // State
  area?: string;
  // ZIP
  postalCode?: string;
  // County
  subAdminArea?: string;
  // Country
  countryName?: string;
}

export const ACCOUNT_LANDMARKS = 'account-landmarks';

@Injectable({
  providedIn: 'root'
})
export class LandmarkService implements OnDestroy {
  private landmarkId: string;

  msg$ = new Subject<string>();

  // Landmarks fetched from DB.
  private fetchedLandmarksSubject = new BehaviorSubject<AccountLandmarkDoc[]>([]);
  public fetchedLandmarks$ = this.fetchedLandmarksSubject.asObservable();

  // Landmark fetched from DB
  private fetchedLandmarkSubject = new Subject<AccountLandmarkDoc>();
  public fetchedLandmark$ = this.fetchedLandmarkSubject.asObservable();

  // Landmarks to be shown on Landmarks Map
  private landmarkMarkersSubject = new Subject<any>();
  landmarkMarkers$ = this.landmarkMarkersSubject.asObservable();

  // Landmark to be shown on the Landmark map
  private landmarkMarkerSubject = new BehaviorSubject<AccountLandmarkDoc>(null);
  landmarkMarker$ = this.landmarkMarkerSubject.asObservable();

  // Coordinates for map point of click
  private coordSubject = new Subject<LatLngLiteral>();
  clickCoordinates$ = this.coordSubject.asObservable();

  // Currently selected landmark
  private selectedLandmarkSubject = new Subject<string>();
  public selectedLandmark$ = this.selectedLandmarkSubject.asObservable();

  // Deletes landmark subscriptions with landmark
  private deleteSubscriptionsSubject = new Subject<string>();
  public deleteSubscriptions$ = this.deleteSubscriptionsSubject.asObservable();

  private landmarksSubscription: Subscription;

  static makeAccountLandmarkKey(accountId: string, landmarkId: string): string {
    return `${accountId}:${landmarkId}`;
  }

  static get timestamp(): FieldValue {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  constructor(private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private afAuth: AngularFireAuth,
              private afs: AngularFirestore,
              private dialog: MatDialog) {
  }

  ngOnDestroy() {
    if (!!this.landmarksSubscription) {
      this.landmarksSubscription.unsubscribe();
    }
  }

  fetchLandmarks(accountId: string) {
    const landmarks$ = this.afs.collection(ACCOUNT_LANDMARKS, ref => ref.where('accountId', '==', accountId));
    if (!!this.landmarksSubscription) {
      this.landmarksSubscription.unsubscribe();
    }
    this.landmarksSubscription = landmarks$.valueChanges().subscribe((docs: any) => {
      const landmarkDocs: AccountLandmarkDoc[] = [];
      docs.map((landmarkDoc: AccountLandmarkDoc) => {
        landmarkDocs.push(landmarkDoc);
      });
      this.fetchedLandmarksSubject.next(landmarkDocs);
    });
  }

  fetchLandmark(landmarkKey: string) {
    this.afs.collection(ACCOUNT_LANDMARKS).doc(landmarkKey).ref.get()
      .then((doc) => {
        if (doc.exists) {
          const landmarkDoc: AccountLandmarkDoc = doc.data();
          this.fetchedLandmarkSubject.next(landmarkDoc);
          this.landmarkId = landmarkDoc.landmarkId;
        } else {
          console.error(`No landmark document exists for ID: ${landmarkKey}`);
        }
      })
      .catch((error) => {
        this.msg$.next(error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Error getting landmark document`}
        });
      });
  }

  saveLandmark(landmarkDoc: AccountLandmarkDoc, returnPath: string) {
    landmarkDoc.accountId = this.authService.currentUserAccountId;
    const accountLandmarkKey = LandmarkService.makeAccountLandmarkKey(landmarkDoc.accountId, landmarkDoc.landmarkId);

    delete landmarkDoc.createdAt;

    firebase.firestore().collection(ACCOUNT_LANDMARKS).doc(accountLandmarkKey).get().then((accountLandmarksRefDoc) => {
      landmarkDoc.modifiedAt = LandmarkService.timestamp;
      if (accountLandmarksRefDoc.exists) {
        firebase.firestore().collection(ACCOUNT_LANDMARKS).doc(accountLandmarkKey).update(landmarkDoc)
          .then(() => {
            this.landmarkId = landmarkDoc.landmarkId;
            this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
          })
          .catch(error => {
            this.msg$.next(error);
            this.dialog.open(ErrorDlgComponent, {
              data: {msg: `Could not save the landmark`}
            });
          });
      } else {
        landmarkDoc.createdAt = LandmarkService.timestamp;
        firebase.firestore().collection(ACCOUNT_LANDMARKS).doc(accountLandmarkKey).set(landmarkDoc)
          .then(() => {
            this.landmarkId = landmarkDoc.landmarkId;
            this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
          })
          .catch(error => {
            this.msg$.next(error);
            this.dialog.open(ErrorDlgComponent, {
              data: {msg: `Could not save the landmark`}
            });
          });
      }
    }).catch((error) => {
      this.msg$.next(error);
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: `Could not save the landmark`}
      });
    });
  }

  deleteLandmark(landmarkDoc: AccountLandmarkDoc, returnPath: string) {
    landmarkDoc.accountId = this.authService.currentUserAccountId;
    const accountLandmarkKey = LandmarkService.makeAccountLandmarkKey(landmarkDoc.accountId, landmarkDoc.landmarkId);
    firebase.firestore().collection(ACCOUNT_LANDMARKS).doc(accountLandmarkKey).delete()
      .then(() => {
        this.deleteSubscriptionsSubject.next(landmarkDoc.landmarkId);
        this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
      })
      .catch((error) => {
        this.msg$.next(error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Error deleting landmark document for ID: ${accountLandmarkKey}`}
        });
      });
  }

  setLandmarkMarkers<T>(landmarks: T[]) {
    this.landmarkMarkersSubject.next(landmarks);
  }

  setLandmarkMarker<T>(landmarkDoc: AccountLandmarkDoc) {
    this.landmarkMarkerSubject.next(landmarkDoc);
  }

  setMapCoordinates(coordinates: LatLngLiteral) {
    this.coordSubject.next(coordinates);
  }

  getLandmarkId() {
    return this.landmarkId;
  }

  setLandmarkId(landmarkId: string) {
    this.landmarkId = landmarkId;
    this.selectedLandmarkSubject.next(landmarkId);
  }

  clearLandmark() {
    this.landmarkId = null;
  }
}
