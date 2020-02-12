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
import { DEVICE_EVENTS, DeviceEvent } from '../locations/unit.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';
import { ErrorDlgComponent } from '../core/error-dlg/error-dlg.component';
import { Subject } from 'rxjs';
import { GeoAddress, GeoLocation, GeoService } from '../core/geo-service/geo.service';
import { MsgDlgComponent } from '../core/msg-dlg/msg-dlg.component';


const SIMULATOR_EVENTS = 'simulator-events';

@Injectable({
  providedIn: 'root'
})
export class SimulatorService {

  triggeredEvent: DeviceEvent;
  currentEvent: DeviceEvent;

  msg$ = new Subject<string>();

  // Event fetched from DB
  private fetchedEventSubject = new Subject<DeviceEvent>();
  public fetchedEvent$ = this.fetchedEventSubject.asObservable();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private afs: AngularFirestore,
              private geoService: GeoService,
              private dialog: MatDialog) {
  }

  events$(startAfter: string, limit: number) {
    if (startAfter !== '') {
      return this.afs.collection(SIMULATOR_EVENTS, ref => ref
        .orderBy('eventType', 'asc')
        .startAfter(startAfter)
        .limit(limit)
      ).valueChanges();
    } else {
      return this.afs.collection(SIMULATOR_EVENTS, ref => ref
        .orderBy('eventType', 'asc')
        .limit(limit)
      ).valueChanges();
    }
  }

  saveMoveEvent(deviceEvent: DeviceEvent, returnPath: string) {
    try {
      const geoAddress: GeoAddress = deviceEvent.address;
      this.geoService.getGeolocation(geoAddress)
        .then((geoLocation: GeoLocation) => {
          deviceEvent.latitude = geoLocation.latitude;
          deviceEvent.longitude = geoLocation.longitude;
        })
        .then(() => {
          if (!!!deviceEvent.documentId) {
            deviceEvent.documentId = firebase.firestore().collection(SIMULATOR_EVENTS).doc().id;
          }
          firebase.firestore().collection(SIMULATOR_EVENTS).doc(deviceEvent.documentId).set(deviceEvent)
            .then(() => {
              this.router.navigate([`./simulator/${returnPath}`], {relativeTo: this.route});
            });
        });
    } catch (error) {
      this.msg$.next(error);
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: `Error saving simulator document`}
      });
    }
  }

  triggerEvent(deviceEvent: DeviceEvent) {
    this.triggeredEvent = deviceEvent;
    deviceEvent.documentId = firebase.firestore().collection(DEVICE_EVENTS).doc().id;
    firebase.firestore().collection(DEVICE_EVENTS).doc(deviceEvent.documentId).set(deviceEvent)
      .then(() => {
        this.dialog.open(MsgDlgComponent, {
          data: {title: 'Success', msg: `Event triggered`, ok: 'OK'}
        });
      })
      .catch((error) => {
        console.error(error.toString());
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: error.toString()}
        });
      });
  }

  setCurrentEvent(deviceEvent: DeviceEvent) {
    this.currentEvent = deviceEvent;
  }

  clearCurrentEvent() {
    this.currentEvent = null;
  }

  getTriggeredEventId() {
    return this.triggeredEvent ? this.triggeredEvent.documentId : null;
  }

  getCurrentEventId() {
    return this.currentEvent ? this.currentEvent.documentId : null;
  }

  fetchEventDoc(id: string) {
    try {
      firebase.firestore().collection(SIMULATOR_EVENTS).doc(id).get().then((doc) => {
        if (doc.exists) {
          this.currentEvent = doc.data();
          this.fetchedEventSubject.next(doc.data());
        } else {
          this.dialog.open(ErrorDlgComponent, {
            data: {msg: `No document for ID: id`}
          });
        }
      });
    } catch (error) {
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: `Error fetching event document with id: ${id}`}
      });
    }
  }

}
