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
import { Observable, Subject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/auth/auth.service';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';
import { ACCOUNT_DEVICES, BASE_MARKER_ICON, DEVICE_DEFAULTS_KEY, MapmarkerService, MarkerIcon } from '../../../sevices/mapmarker.service';


export interface AccountDeviceDoc {
  accountId: string;
  name: string;
  deviceId: string;
  active: boolean;
  markerIcon?: MarkerIcon;
  comment?: string;
  modifiedAt: any;
  createdAt?: any;
}

@Injectable()
export class DeviceService {
  private db;
  private accountDevicesRef;
  private deviceId: string;

  msg$ = new Subject<string>();

  private defaultDeviceMarkerIcon = new Subject<any>();
  defaultDeviceMarkerIcon$ = this.defaultDeviceMarkerIcon.asObservable();

  static get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  constructor(
    private authService: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.db = firebase.firestore();
    this.accountDevicesRef = this.db.collection(ACCOUNT_DEVICES);
  }

  allDevices$(): Observable<{}[]> {
    return this.afs.collection(ACCOUNT_DEVICES, ref => ref
      .orderBy('accountId', 'asc')
      .orderBy('name', 'asc')
    ).valueChanges();
  }

  accountDevices$(accountId: string): Observable<{}[]> {
    return this.afs.collection(ACCOUNT_DEVICES, ref => ref
      .where('accountId', '==', accountId)
      .orderBy('name', 'asc')
    ).valueChanges();
  }

  fetchAccountDevice(accountId: string, deviceId: string) {
    this.deviceId = deviceId;
    const accountDeviceKey = MapmarkerService.makeAccountDeviceKey(accountId, deviceId);
    return this.accountDevicesRef.doc(accountDeviceKey).get();
  }

  saveDevice(deviceDoc: AccountDeviceDoc, returnPath: string) {
    const accountId = this.authService.currentUserAccountId;
    const deviceId = this.deviceId = deviceDoc.deviceId;
    const accountDeviceKey = MapmarkerService.makeAccountDeviceKey(accountId, deviceId);

    this.accountDevicesRef.doc(accountDeviceKey).get().then((snap) => {
      if (!snap.exists) {
        deviceDoc.createdAt = DeviceService.timestamp;
        this.accountDevicesRef.doc(accountDeviceKey).set(deviceDoc);
      } else {
        delete deviceDoc.createdAt;
        this.accountDevicesRef.doc(accountDeviceKey).update(deviceDoc);
      }
      this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
    }).catch((error) => {
      this.msg$.next(error);
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: `Error saving account device document for ${accountId}, ${deviceId}`}
      });
    });
  }

  fetchDefaultMapMarkerIcon(accountId: string) {
    const accountDeviceKey = MapmarkerService.makeAccountDeviceKey(accountId, DEVICE_DEFAULTS_KEY);
    this.accountDevicesRef.doc(accountDeviceKey).get()
      .then((snap) => {
        let icon;
        if (snap.exists && !!snap.data().markerIcon) {
          icon = snap.data().markerIcon;
        } else {
          icon = BASE_MARKER_ICON;
        }
        this.defaultDeviceMarkerIcon.next(icon);
      })
      .catch((error) => {
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: error}
        });
      });
  }

  saveDeviceDefaultMarkerIcon(markerIcon: Object) {
    const accountId = this.authService.currentUserAccountId;
    const accountDeviceKey = MapmarkerService.makeAccountDeviceKey(accountId, DEVICE_DEFAULTS_KEY);
    this.accountDevicesRef.doc(accountDeviceKey).set({markerIcon: markerIcon}, {merge: true})
      .then(() => {
        this.msg$.next(`Default marker icon saved`);
      })
      .catch((error) => {
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: error}
        });
      });
  }

  getDeviceId() {
    return this.deviceId;
  }

  clearDevice() {
    this.deviceId = null;
  }
}
