import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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

export const DEVICE_EVENTS_COLL = 'device-events';
export const LAST_MOVES_COLL = 'last-moves';

@Injectable()
export class UnitService {
  historyStartDate: Date;
  historyEndDate: Date;

  private db;
  movesRef;
  currentDeviceEvent: DeviceEvent;

  // Last moves fetched from DB.
  private lastMovesSubject = new BehaviorSubject<DeviceEvent[]>([]);
  public lastMoves$ = this.lastMovesSubject.asObservable();

  // Device events fetched from DB.
  private deviceEventsSubject = new BehaviorSubject<DeviceEvent[]>([]);
  public deviceEvents$ = this.deviceEventsSubject.asObservable();

  constructor(
    private afs: AngularFirestore) {
    this.db = firebase.firestore();
    this.movesRef = this.db.collection(DEVICE_EVENTS_COLL);
  }

  fetchLastMoves(accountId: string) {
    this.afs.collection(LAST_MOVES_COLL, ref => ref.where('accountId', '==', accountId))
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
      return this.afs.collection(DEVICE_EVENTS_COLL, ref => ref
        .where('accountId', '==', accountId)
        .where('deviceId', '==', deviceId)
        .where('deviceTime', '>', startTs)
        .where('deviceTime', '<', endTs)
        .orderBy('deviceTime', 'desc')
        .startAfter(startAfter)
        .limit(limit)
      ).valueChanges();
    } else {
      return this.afs.collection(DEVICE_EVENTS_COLL, ref => ref
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
    return this.afs.collection(DEVICE_EVENTS_COLL).doc(documentId).valueChanges();
  }
}

