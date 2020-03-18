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
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;


export interface Address extends GeoAddress {
  notUsed?: boolean;
}

export interface DeviceEvent {
  accountId?: string;
  accuracy?: number;
  address?: GeoAddress;
  altitude?: number;
  bearing?: number;
  bearingForward?: number;
  previousEventBearing?: number;
  deviceName?: string;
  deviceId?: string;
  deviceTime?: Timestamp;
  deviceType?: string;
  documentId?: string;
  email?: string;
  hasAccuracy?: boolean;
  hasAltitude?: boolean;
  hasBearing?: boolean;
  hasSpeed?: boolean;
  latitude?: number;
  longitude?: number;
  landmarks?: Landmark[];
  serverTime?: Timestamp;
  speed?: number;
  stepLength?: number;
  isLastMove?: boolean;
}

export interface GeoAddress {
  subThoroughfare: string;
  thoroughfare: string;
  locality: string;
  area: string;
  postalCode: string;
  subAdminArea: string;
  countryName: string;
}

export interface Landmark {
  landmarkId?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  color?: string;
}

export const DEVICE_EVENTS = 'device-events';
export const LAST_MOVES = 'last-moves';

@Injectable()
export class UnitService implements OnDestroy {

  // Signals that the map should be redrawn
  private mapUpdates = new BehaviorSubject<DeviceEvent[]>([]);
  public mapUpdates$ = this.mapUpdates.asObservable();

  // Signals a click on a table row or a map marker
  private itemSelect = new BehaviorSubject<DeviceEvent>(null);
  public itemSelect$ = this.itemSelect.asObservable();

  // Signals a double click on a map marker.
  private markerDblclick = new Subject<DeviceEvent>();
  public markerDblclick$ = this.markerDblclick.asObservable();

  // Signals availability of unit details info
  private hasDetails = new BehaviorSubject<string>(null);
  public hasDetails$ = this.hasDetails.asObservable();

  // Last moves fetched from DB.
  private lastMoves = new BehaviorSubject<DeviceEvent[]>([]);
  public lastMoves$ = this.lastMoves.asObservable();

  private lastMovesSubscription: Subscription;

  constructor(
    private afs: AngularFirestore) {
  }

  ngOnDestroy() {
    if (!!this.lastMovesSubscription) {
      this.lastMovesSubscription.unsubscribe();
    }
  }

  fetchLastMoves(accountId: string) {
    if (!!this.lastMovesSubscription) {
      this.lastMovesSubscription.unsubscribe();
    }
    this.lastMovesSubscription = this.afs.collection(LAST_MOVES, ref => ref.where('accountId', '==', accountId))
      .valueChanges()
      .subscribe((deviceEvents: DeviceEvent[]) => {
        this.lastMoves.next(deviceEvents);
      });
  }

  lastMove$(accountId: string, deviceId: string) {
    return this.afs.collection(LAST_MOVES, ref => ref
      .where('accountId', '==', accountId)
      .where('deviceId', '==', deviceId))
      .valueChanges();
  }

  deviceEventHistory$(accountId: string, deviceId: String, startDate: Date, endDate: Date, startAfter: Timestamp, limit: number):
    Observable<DeviceEvent[]> {
    const startTs = Timestamp.fromDate(new Date(startDate.setHours(0, 0, 0, 0).valueOf()));
    const endTs = Timestamp.fromDate(new Date(endDate.setHours(23, 59, 59, 999).valueOf()));

    if (!!startAfter) {
      return this.afs.collection(DEVICE_EVENTS, ref => ref
        .where('accountId', '==', accountId)
        .where('deviceId', '==', deviceId)
        .where('deviceTime', '>', startTs)
        .where('deviceTime', '<', endTs)
        .orderBy('deviceTime', 'desc')
        .startAfter(startAfter)
        .limit(limit)
      ).valueChanges();
    } else {
      return this.afs.collection(DEVICE_EVENTS, ref => ref
        .where('accountId', '==', accountId)
        .where('deviceId', '==', deviceId)
        .where('deviceTime', '>', startTs)
        .where('deviceTime', '<', endTs)
        .orderBy('deviceTime', 'desc')
        .limit(limit)
      ).valueChanges();
    }
  }

  fetchHistoryDoc(documentId: string): Observable<DeviceEvent> {
    return this.afs.collection(DEVICE_EVENTS).doc(documentId).valueChanges();
  }

  /**
   * Issues map update notifications to observers of tableRowSelect$.
   */
  public updateMap<T>(deviceEvents: DeviceEvent[]) {
    this.mapUpdates.next(deviceEvents);
  }

  /**
   * Issues device select notifications to observers of itemSelect$.
   */
  public onItemSelect<T>(deviceEvent: DeviceEvent) {
    this.itemSelect.next(deviceEvent);
  }

  /**
   * Issues event select notifications to observers of markerDblclick$.
   */
  public onMarkerDblclick<T>(deviceEvent: DeviceEvent) {
    this.markerDblclick.next(deviceEvent);
  }

  /**
   * Issues notifications to observers of hasDetails$.
   */
  public enableDetails<T>(documentId: string) {
    this.hasDetails.next(documentId);
  }
}

