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
import { QuerySnapshot } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/auth/auth.service';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';
import { BASE_MARKER_ICON, DEVICE_DEFAULTS_KEY, MarkerIcon } from '../../../sevices/device-access.service';

export interface DeviceDto {
  name?: string;
  deviceId?: string;
  markerIcon?: MarkerIcon;
  comment?: string;
  active?: boolean;
  accountId?: string;
  modifiedAt?: any;
  createdAt?: any;
}

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

export const DEVICES = 'devices';
export const ACCOUNT_DEVICES = 'account-devices';

interface DeviceDoc {
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
  private devicesRef;
  private accountDevicesRef;
  private devicesSubject = new Subject<DeviceDto[]>();
  private allDevicesSubject = new Subject<DeviceDto[]>();
  private deviceId: string;

  accountDevices$: Observable<DeviceDto[]>;
  allDevices$: Observable<DeviceDto[]>;
  msg$ = new Subject<string>();

  private defaultDeviceMarkerIcon = new Subject<any>();
  defaultDeviceMarkerIcon$ = this.defaultDeviceMarkerIcon.asObservable();

  static makeAccountDeviceKey(accountId: String, deviceId: String): String {
    return `${accountId}:${deviceId}`;
  }

  static buildDeviceDto(deviceDoc: DeviceDoc, accountDeviceDoc: AccountDeviceDoc): DeviceDto {
    let deviceDto: DeviceDto;
    if (!!accountDeviceDoc) {
      deviceDto = {};
      deviceDto.name = deviceDoc.name;
      deviceDto.deviceId = deviceDoc.deviceId;
      deviceDto.comment = deviceDoc.comment;
      deviceDto.active = accountDeviceDoc ? accountDeviceDoc.active : false;
      deviceDto.accountId = accountDeviceDoc ? accountDeviceDoc.accountId : '';
      deviceDto.createdAt = deviceDoc.createdAt;
      deviceDto.modifiedAt = deviceDoc.modifiedAt;
    }
    return deviceDto;
  }

  static get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  static buildAccountDeviceDoc(accountId: string, deviceDto: DeviceDto): AccountDeviceDoc {
    return {
      accountId: accountId,
      name: deviceDto.name,
      deviceId: deviceDto.deviceId,
      active: deviceDto.active,
      markerIcon: deviceDto.markerIcon,
      comment: deviceDto.comment,
      modifiedAt: this.timestamp
    };
  }

  static buildDeviceDoc(deviceDto: DeviceDto): DeviceDoc {
    return {
      active: deviceDto.active,
      accountId: deviceDto.accountId,
      name: deviceDto.name,
      deviceId: deviceDto.deviceId,
      markerIcon: deviceDto.markerIcon,
      comment: deviceDto.comment,
      modifiedAt: this.timestamp,
      createdAt: deviceDto.createdAt
    };
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.db = firebase.firestore();
    this.devicesRef = this.db.collection(DEVICES);
    this.accountDevicesRef = this.db.collection(ACCOUNT_DEVICES);

    this.accountDevices$ = this.devicesSubject.asObservable();
    this.allDevices$ = this.allDevicesSubject.asObservable();
  }

  fetchAllDevices$(): Subject<DeviceDto[]> {
    const subject = new Subject<DeviceDto[]>();
    this.accountDevicesRef.get()
      .then((accoutDeviceSnap: QuerySnapshot<AccountDeviceDoc>) => {
        const deviceDtos: DeviceDto[] = [];
        accoutDeviceSnap.docs.map(accountDeviceDoc => {
          this.devicesRef
            .where('deviceId', '==', accountDeviceDoc.data().deviceId)
            .get()
            .then((deviceSnap: QuerySnapshot<DeviceDoc>) => {
              deviceSnap.docs.map(deviceDoc => {
                const deviceDto: DeviceDto = DeviceService.buildDeviceDto(deviceDoc.data(), accountDeviceDoc.data());
                if (!!deviceDto) {
                  deviceDtos.push(deviceDto);
                }
              });
              subject.next(deviceDtos);
            });
        });
      })
      .catch((error) => {
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: error}
        });
      });

    return subject;
  }

  /**
   * Fetches device collection documents for all devices assigned to a given account.
   * @param accountId
   */
  fetchAccountDevices(accountId: string) {
    if (accountId) {
      this.accountDevicesRef.where('accountId', '==', accountId)
        .get()
        .then((accountDeviceSnap: QuerySnapshot<AccountDeviceDoc>) => {
          const deviceDtos: DeviceDto[] = [];
          if (!accountDeviceSnap.empty) {
            accountDeviceSnap.docs.map(accountDeviceDoc => {
              this.devicesRef
                .where('deviceId', '==', accountDeviceDoc.data().deviceId)
                .get()
                .then((deviceSnap: QuerySnapshot<DeviceDoc>) => {
                  deviceSnap.docs.map(deviceDoc => {
                    const deviceDto: DeviceDto = DeviceService.buildDeviceDto(deviceDoc.data(), accountDeviceDoc.data());
                    if (!!deviceDto) {
                      deviceDtos.push(deviceDto);
                    }
                  });
                  this.devicesSubject.next(deviceDtos);
                });
            });
          } else {
            this.devicesSubject.next(deviceDtos);
          }
        })
        .catch((error) => {
          this.dialog.open(ErrorDlgComponent, {
            data: {msg: error}
          });
        });
    }
  }

  /**
   * Fetches device details.
   * @param accountId
   * @param deviceId
   */
  // async fetchAccountDeviceX(accountId: string, deviceId: string) {
  //   this.deviceId = deviceId;
  //   const accountDeviceKey = DeviceService.makeAccountDeviceKey(accountId, deviceId);
  //
  //   const snaps = await Promise.all([
  //     this.devicesRef.doc(deviceId).get(),
  //     this.accountDevicesRef.doc(accountDeviceKey).get()
  //   ]);
  //
  //   return DeviceService.buildDeviceDto(snaps[0].data(), snaps[1].data());
  // }

  fetchAccountDevice(accountId: string, deviceId: string) {
    this.deviceId = deviceId;
    const accountDeviceKey = DeviceService.makeAccountDeviceKey(accountId, deviceId);
    return this.accountDevicesRef.doc(accountDeviceKey).get();
  }

  saveDevice(deviceDto: AccountDeviceDoc, returnPath: string) {
    const accountId = this.authService.currentUserAccountId;
    const deviceId = this.deviceId = deviceDto.deviceId;
    const accountDeviceKey = DeviceService.makeAccountDeviceKey(accountId, deviceId);
    const batch = this.db.batch();

    this.accountDevicesRef.doc(accountDeviceKey).get().then((accountDevicesRefDoc) => {
      const accountDeviceDoc: AccountDeviceDoc = DeviceService.buildAccountDeviceDoc(accountId, deviceDto);

      if (!accountDevicesRefDoc.exists) {
        accountDeviceDoc.createdAt = DeviceService.timestamp;
        batch.set(this.accountDevicesRef.doc(accountDeviceKey), accountDeviceDoc);
      } else {
        delete accountDeviceDoc.createdAt;
        batch.update(this.accountDevicesRef.doc(accountDeviceKey), accountDeviceDoc);
      }

      this.devicesRef.doc(deviceId).get().then((devicesRefDoc) => {
        const deviceDoc: DeviceDoc = DeviceService.buildDeviceDoc(deviceDto);

        if (!devicesRefDoc.exists) {
          deviceDoc.createdAt = DeviceService.timestamp;
          batch.set(this.devicesRef.doc(deviceId), deviceDoc);
        } else {
          delete deviceDoc.createdAt;
          batch.update(this.devicesRef.doc(deviceId), deviceDoc);
        }

        batch.commit()
          .then(() => {
            this.deviceId = deviceDto.deviceId;
            this.router.navigate([`./setup/${returnPath}`], {relativeTo: this.route});
          })
          .catch((error) => {
            this.msg$.next(error);
            this.dialog.open(ErrorDlgComponent, {
              data: {msg: `Error committing device document for ${accountId}, ${deviceId}`}
            });
          });
      }).catch((error) => {
        this.msg$.next(error);
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: `Error saving device document for ${deviceId}`}
        });
      });
    }).catch((error) => {
      this.msg$.next(error);
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: `Error saving account device document for ${accountId}, ${deviceId}`}
      });
    });
  }

  fetchDefaultMapMarkerIcon(accountId: string) {
    const accountDeviceKey = DeviceService.makeAccountDeviceKey(accountId, DEVICE_DEFAULTS_KEY);
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
    const accountDeviceKey = DeviceService.makeAccountDeviceKey(accountId, DEVICE_DEFAULTS_KEY);
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
