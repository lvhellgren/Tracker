import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';


export interface StepDto {
  name: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  bearing: number;
  address: Address;
  timestamp: number;
}

export interface StepDoc {
  account?: string;
  accuracy?: number;
  address?: Address;
  altitude?: number;
  bearing?: number;
  bearingForward?: number;
  previousBearing?: number;
  datetime?: string;
  deviceId?: string;
  documentId?: string;
  email?: string;
  hasAccuracy?: boolean;
  hasAltitude?: boolean;
  hasBearing?: boolean;
  hasSpeed?: boolean;
  latitude?: number;
  longitude?: number;
  name?: string;
  speed?: number;
  stepLength?: number;
  timestamp?: number;
  type?: string;
  iconUrl?: {};
  animation?: string;
}

export interface Address {
  subThoroughfare: string;
  thoroughfare: string;
  locality: string;
  area: string;
  postalCode: string;
  subAdminArea: string;
  countryName: string;
}

const STEPS_COLL = 'steps';
const LAST_STEPS_COLL = 'last-steps';
const PAGE_SIZE = 10;

@Injectable()
export class UnitService {
  historyStartDate: Date;
  historyEndDate: Date;

  private db;
  lastStepsRef;
  stepsRef;
  currentUnit: StepDoc;
  currentUnitStep: StepDoc = null;

  constructor(
    private afs: AngularFirestore) {
    this.db = firebase.firestore();
    this.lastStepsRef = this.db.collection(LAST_STEPS_COLL);
    this.stepsRef = this.db.collection(STEPS_COLL);
  }

  /**
   * References all last steps in the data base. Subscribers automatically receive updates of collection changes.
   */
  get allLastSteps$(): Observable<StepDoc[]> {
    return this.afs.collection(LAST_STEPS_COLL).valueChanges();
  }

  unitHistory$(unitId: String, startDate: Date, endDate: Date, startAfter: number, limit: number): Observable<StepDoc[]> {
    const _startDate = startDate.setHours(0, 0, 0, 0).valueOf();
    const _endDate = endDate.setHours(23, 59, 59, 999).valueOf();

    if (startAfter > 0) {
      return this.afs.collection(STEPS_COLL, ref => ref
        .where('deviceId', '==', unitId)
        .where('timestamp', '>', _startDate)
        .where('timestamp', '<', _endDate)
        .orderBy('timestamp', 'desc')
        .startAfter(startAfter)
        .limit(limit)
      ).valueChanges();
    } else {
      return this.afs.collection(STEPS_COLL, ref => ref
        .where('deviceId', '==', unitId)
        .where('timestamp', '>', _startDate)
        .where('timestamp', '<', _endDate)
        .orderBy('timestamp', 'desc')
        .limit(limit)
      ).valueChanges();
    }
  }

  getUnitName() {
    return this.currentUnit ? this.currentUnit.name : 'No unit selected';
  }

  loadHistoryDoc(id: String) {
    this.stepsRef.doc(id).get().then((doc) => {
      if (doc.exists) {
        this.currentUnitStep = doc.data();
      } else {
        console.log('No document for ID ' + id);
      }
    }).catch(function (error) {
      console.log('Error getting document:', error);
    });
  }
}

