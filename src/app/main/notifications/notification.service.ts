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
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { ErrorDlgComponent } from '../core/error-dlg/error-dlg.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import Timestamp = firebase.firestore.Timestamp;


export interface NotificationDoc {
  activity?: string;
  accountId?: string;
  subscriptionId?: string;
  deviceName?: string;
  deviceId?: string;
  landmarkId?: string;
  deviceTime?: Date;
  selected?: boolean;
  documentId?: string;
  comment?: string;
  checked?: boolean;
}

const NOTIFICATIONS = 'notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public currentNotification: NotificationDoc;

  msg$ = new Subject<string>();

  constructor(private afs: AngularFirestore,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog) {
  }

  notifications$(accountId: string, startAfter: Timestamp, limit: number) {
    if (!!startAfter) {
      return this.afs.collection(NOTIFICATIONS, ref => ref
        .where('accountId', '==', accountId)
        .orderBy('deviceTime', 'desc')
        .startAfter(startAfter)
        .limit(limit)
      ).valueChanges();
    } else {
      return this.afs.collection(NOTIFICATIONS, ref => ref
        .where('accountId', '==', accountId)
        .orderBy('deviceTime', 'desc')
        .limit(limit)
      ).valueChanges();
    }
  }

  getNotificationId() {
    return this.currentNotification ? this.currentNotification.documentId : null;
  }

  loadNotificationDoc(id: string) {
    try {
      firebase.firestore().collection(NOTIFICATIONS).doc(id).get().then((doc) => {
        if (doc.exists) {
          this.currentNotification = doc.data();
        } else {
          const msg = `No document for ID: id`;
          this.dialog.open(ErrorDlgComponent, {
            data: {msg: msg}
          });
        }
      });
    } catch (error) {
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: `Error loading notification document with id: ${id}`}
      });
    }
  }

  deleteNotification(notificationDoc: NotificationDoc, returnPath: string) {
    const id = notificationDoc.documentId;
    firebase.firestore().collection(NOTIFICATIONS).doc(id).delete()
      .then(() => {
        this.currentNotification = null;
        this.router.navigate([`./${returnPath}`], {relativeTo: this.route});
      })
      .catch((error) => {
        this.msg$.next(error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Error deleting notification document`}
        });
      });
  }

  deleteNotifications(selectedIds: Set<string>, returnPath: string) {
    let success = true;
    selectedIds.forEach(id => {
      firebase.firestore().collection(NOTIFICATIONS).doc(id).delete()
        .catch((error) => {
          success = false;
          this.msg$.next(error);
          this.dialog.open(ErrorDlgComponent, {
            data: {msg: `Error deleting notification documents`}
          });
        });
    });
    if (success) {
      this.router.navigate([`./${returnPath}`], {relativeTo: this.route});
      this.currentNotification = null;
    }
  }
}
