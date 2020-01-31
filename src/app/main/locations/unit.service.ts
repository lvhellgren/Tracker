import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
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
  historyStartDate: Date;
  historyEndDate: Date;

  currentDeviceEvent: DeviceEvent;

  // Last moves fetched from DB.
  private lastMovesSubject = new BehaviorSubject<DeviceEvent[]>([]);
  public lastMoves$ = this.lastMovesSubject.asObservable();

  // Device events fetched from DB.
  private deviceEventsSubject = new BehaviorSubject<DeviceEvent[]>([]);
  public deviceEvents$ = this.deviceEventsSubject.asObservable();

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
        this.lastMovesSubject.next(deviceEvents);
      });
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

  getDeviceName() {
    return this.currentDeviceEvent ? this.currentDeviceEvent.deviceName : '[No unit selected]';
  }

  clear() {
    this.currentDeviceEvent = null;
  }

  fetchHistoryDoc(documentId: string): Observable<DeviceEvent> {
    return this.afs.collection(DEVICE_EVENTS).doc(documentId).valueChanges();
  }
}

