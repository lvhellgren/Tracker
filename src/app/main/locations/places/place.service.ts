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
import { ACCOUNT_LANDMARKS, AccountLandmarkDoc } from '../../setup/landmarks/landmark.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import * as firebase from 'firebase';
import { ACCOUNT_DEVICES } from '../../setup/devices/device.service';

export const LANDMARK_ACTIVITY = 'landmark-activity';

export interface PlaceDoc extends AccountLandmarkDoc {
  unitsPresent?: UnitInfo[];
}

export interface UnitInfo {
  deviceId?: string;
  deviceName?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlaceService implements OnDestroy {

  landmarkDoc: PlaceDoc;

  // Landmarks fetched from DB.
  private landmarksSubject = new BehaviorSubject<AccountLandmarkDoc[]>([]);
  public landmarks$ = this.landmarksSubject.asObservable();

  // Landmarks to be shown on Landmarks Map
  private markersSubject = new Subject<any>();
  markers$ = this.markersSubject.asObservable();

  // Currently selected landmark
  private selectedLandmarkSubject = new Subject<string>();
  public selectedLandmark$ = this.selectedLandmarkSubject.asObservable();

  public landmarksSubscription: Subscription;

  static makeAccountLandmarkKey(accountId: string, landmarkId: string): string {
    return `${accountId}:${landmarkId}`;
  }

  constructor(private afs: AngularFirestore,
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
      const placeDocs: PlaceDoc[] = [];
      docs.map((placeDoc: PlaceDoc) => {
        placeDoc.unitsPresent = [];
        this.fetchLandmarkActivity(placeDoc);
        placeDocs.push(placeDoc);
      });
      this.landmarksSubject.next(placeDocs);
      this.markersSubject.next(placeDocs);
    });
  }

  fetchLandmarkActivity(placeDoc: PlaceDoc, getName = false) {
    return firebase.firestore().collection(LANDMARK_ACTIVITY)
      .where('account', '==', placeDoc.accountId)
      .where('landmarkId', '==', placeDoc.landmarkId)
      .get()
      .then((snap) => {
        if (!snap.empty) {
          const promises = [];
          snap.docs.forEach(doc => {
            const unitInfo: UnitInfo = {};
            unitInfo.deviceId = doc.data().deviceId;
            unitInfo.latitude = doc.data().latitude;
            unitInfo.longitude = doc.data().longitude;
            if (getName) {
              promises.push(this.fetchDeviceName(placeDoc.accountId, unitInfo));
            }
            placeDoc.unitsPresent.push(unitInfo);
          });
          return Promise.all(promises);
        }
      });
  }

  fetchLandmark(landmarkKey: string) {
    this.afs.collection(ACCOUNT_LANDMARKS).doc(landmarkKey).ref.get()
      .then((doc) => {
        if (doc.exists) {
          const placeDoc: PlaceDoc = doc.data();
          placeDoc.unitsPresent = [];
          this.fetchLandmarkActivity(placeDoc, true)
            .then(() => {
              this.landmarksSubject.next([placeDoc]);
              this.markersSubject.next([placeDoc]);
              this.landmarkDoc = placeDoc;
            });
        } else {
          console.error(`No landmark document exists for ID: ${landmarkKey}`);
        }
      })
      .catch((error) => {
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Error getting landmark document: ${error}`}
        });
      });
  }

  private fetchDeviceName(accountId: string, unitInfo: UnitInfo) {
    return firebase.firestore().collection(ACCOUNT_DEVICES)
      .where('accountId', '==', accountId)
      .where('deviceId', '==', unitInfo.deviceId)
      .get()
      .then((snap) => {
        if (!snap.empty) {
          unitInfo.deviceName = snap.docs[0].data().name;
        }
      });
  }

  getLandmarkId() {
    return !!this.landmarkDoc ? this.landmarkDoc.landmarkId : null;
  }

  setLandmark(landmarkDoc) {
    this.landmarkDoc = landmarkDoc;
    this.selectedLandmarkSubject.next(landmarkDoc.landmarkId);
  }

  clearLandmark() {
    this.landmarkDoc = null;
  }
}
