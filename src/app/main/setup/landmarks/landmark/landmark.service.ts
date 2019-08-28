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
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material';
import * as firebase from 'firebase';
import { ErrorDlgComponent } from '../../../core/error-dlg/error-dlg.component';

export interface LandmarkDoc {
  accountId?: string;
  landmarkId?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  color?: string;
  comment?: string;
  active?: boolean;
  modifiedAt?: any;
  createdAt?: any;
}

export const ACCOUNT_LANDMARKS_COLL = 'account-landmarks';

@Injectable({
  providedIn: 'root'
})
export class LandmarkService {
  private db;
  private landmarksRef;
  private landmarkSubject = new Subject<LandmarkDoc>();
  public landmark$: Observable<LandmarkDoc>;

  private landmarkId: string;

  msg$ = new Subject<string>();

  static makeAccountLandmarkKey(accountId: String, landmarkId: String): String {
    return `${accountId}:${landmarkId}`;
  }

  static get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private dialog: MatDialog
  ) {
    this.db = firebase.firestore();
    this.landmarksRef = this.db.collection(ACCOUNT_LANDMARKS_COLL);
    this.landmark$ = this.landmarkSubject.asObservable();
  }

  saveLandmark(landmarkDoc: LandmarkDoc, returnPath: string) {
    const accountId = this.authService.currentUserAccountId;
    const landmarkId = this.landmarkId = landmarkDoc.landmarkId;
    const accountLandmarkKey = LandmarkService.makeAccountLandmarkKey(accountId, landmarkId);

    this.landmarksRef.doc(accountLandmarkKey).get().then((accountLandmarksRefDoc) => {
      if (!accountLandmarksRefDoc.exists) {
        landmarkDoc.createdAt = LandmarkService.timestamp;
      }

      this.landmarksRef.doc(accountLandmarkKey).set(landmarkDoc)
        .then(() => {
          this.landmarkId = landmarkDoc.landmarkId;
          console.log('Landmark document saved');
        });
    }).catch((error) => {
      this.msg$.next(error);
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: `Error saving landmark document for ${accountId}, ${landmarkId}`}
      });
    });
  }

  fetchLandmark(landmarkKey: string) {
    this.afs.collection(ACCOUNT_LANDMARKS_COLL).doc(landmarkKey).ref.get()
      .then((doc) => {
        if (doc.exists) {
          const landmarkDoc: LandmarkDoc = doc.data();
          this.landmarkSubject.next(landmarkDoc);
          this.landmarkId = landmarkDoc.landmarkId;
        } else {
          console.error(`No landmark document exists for ID: ${landmarkKey}`);
        }
      })
      .catch((error) => {
        this.msg$.next(error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Error getting landmark document for ID: ${landmarkKey}`}
        });
      });
  }

  getLandmarkId() {
    return this.landmarkId;
  }

  setLandmarkId(landmarkId: string) {
    this.landmarkId = landmarkId;
  }

  clearLandmark() {
    this.landmarkId = null;
  }
}
