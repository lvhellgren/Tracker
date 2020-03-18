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
import * as firebase from 'firebase';


export interface MarkerIcon {
  path?: any;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWeight?: number;
  strokeOpacity?: number;
  scale?: number;
  rotation?: number;
}

export const BASE_MARKER_ICON = {
  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
  fillColor: 'white',
  fillOpacity: 1,
  strokeColor: 'red',
  strokeWeight: 3,
  strokeOpacity: 1,
  scale: 4,
  rotation: 0
};

export const ACCOUNT_DEVICES = 'account-devices';
export const DEVICE_DEFAULTS_KEY = 'device_defaults';

export const SHAPE_NAMES = [
  {id: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, name: 'Closed Arrow'},
  {id: google.maps.SymbolPath.FORWARD_OPEN_ARROW, name: 'Open Arrow'},
  {id: google.maps.SymbolPath.CIRCLE, name: 'Circle'}
];

@Injectable({
  providedIn: 'root'
})
export class MapmarkerService {
  map: google.maps.Map;

  private deviceId: string;
  private markerIcon;

  static makeAccountDeviceKey(accountId: String, deviceId: string): string {
    return `${accountId}:${deviceId}`;
  }

  constructor() {
  }

  getEndpointMarkerIcon(markerIcon: google.maps.Symbol) {
    let icon: google.maps.Symbol;
    if (markerIcon.path !== google.maps.SymbolPath.CIRCLE) {
      icon = {...markerIcon};
      icon.path = google.maps.SymbolPath.CIRCLE;
      icon.scale = icon.scale * 1.5;
    } else {
      icon = markerIcon;
    }
    return icon;
  }

  async getDeviceMarkerIcon(accountId: string, deviceId: string) {
    if (this.deviceId === deviceId) {
      if (!!this.markerIcon) {
        return this.markerIcon;
      }
    } else {
      this.deviceId = deviceId;
      this.markerIcon = null;
    }
    return await this.fetchDeviceMarkerIcon(accountId, deviceId);
  }

  fetchDeviceMarkerIcon(accountId: string, deviceId: string) {
    const db = firebase.firestore();
    const accountDeviceKey = MapmarkerService.makeAccountDeviceKey(accountId, deviceId);
    return db.collection(ACCOUNT_DEVICES).doc(accountDeviceKey).get()
      .then(snap => {
        let markerIcon;
        if (snap.exists) {
          markerIcon = snap.data().markerIcon;
          this.markerIcon = markerIcon;
        } else {
          markerIcon = null;
        }
        return markerIcon;
      });
  }

  fetchDefaultMapMarkerIcon(accountId: string) {
    const accountDeviceKey = MapmarkerService.makeAccountDeviceKey(accountId, DEVICE_DEFAULTS_KEY);
    const db = firebase.firestore();
    return db.collection(ACCOUNT_DEVICES).doc(accountDeviceKey).get();
  }

}
