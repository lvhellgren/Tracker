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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { DeviceEvent, Landmark, UnitService } from '../../unit.service';
import { GlobalService } from '../../../../sevices/global';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import * as moment from 'moment';
import * as firebase from 'firebase';
import { HelpService, LOC_UNIT_DETAILS } from '../../../../drawers/help/help.service';
import Timestamp = firebase.firestore.Timestamp;


export interface Row {
  name: string;
  value: any;
  rowspan: number;
  isAddressItem: boolean;
}

@Component({
  selector: 'app-unit-details',
  templateUrl: './unit-details.component.html',
  styleUrls: ['./unit-details.component.css']
})
export class UnitDetailsComponent implements OnInit, OnDestroy {
  public deviceName: String;
  public rows: Row[];

  private accountId: string;
  private accountChangeSubscription: Subscription;
  private routeSubscription: Subscription;
  private eventFetchSubscription: Subscription;
  private itemSelectSubscription: Subscription;

  constructor(private authService: AuthService,
              public unitService: UnitService,
              private global: GlobalService,
              private router: Router,
              private route: ActivatedRoute,
              private helpService: HelpService) {
  }

  ngOnInit() {
    // Navigate back to units page on account switch:
    this.accountChangeSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      if (!!!this.accountId) {
        this.accountId = accountId;
      } else if (this.accountId !== accountId) {
        this.router.navigate([`/locations/${this.global.currentWidth}/units`]);
      }
    });

    // Handle URL with document ID parameter:
    this.routeSubscription = this.route.params.subscribe((params: Params) => {
      const documentId = params['id'];
      if (documentId) {
        this.showDetails(documentId);
      }
    });

    // Handle map marker clicks
    this.itemSelectSubscription = this.unitService.itemSelect$.subscribe(deviceEvent => {
      if (!!deviceEvent) {
        this.showDetails(deviceEvent.documentId);
      }
    });

    // Set up help context:
    this.helpService.component$.next(LOC_UNIT_DETAILS);
  }

  ngOnDestroy(): void {
    if (this.accountChangeSubscription) {
      this.accountChangeSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.eventFetchSubscription) {
      this.eventFetchSubscription.unsubscribe();
    }
    if (this.itemSelectSubscription) {
      this.itemSelectSubscription.unsubscribe();
    }
  }

  showDetails(documentId: string) {
    this.eventFetchSubscription = this.unitService.fetchHistoryDoc(documentId).subscribe((deviceEvent: DeviceEvent) => {
      if (!!deviceEvent) {
        this.deviceName = deviceEvent.deviceName;
        this.rows = [];
        const landMarkNames: string[] = this.getLandmarkNames(deviceEvent);
        this.addRow('Account', deviceEvent.accountId);
        this.addRow('Accuracy', deviceEvent.accuracy);
        this.addRow('Address', '');
        if (!!deviceEvent.address) {
          let streetNum = '';
          if (deviceEvent.address.subThoroughfare) {
            streetNum = deviceEvent.address.subThoroughfare + ' ';
          }
          this.addRow('Street', streetNum + deviceEvent.address.thoroughfare, 1, true);
          this.addRow('Locality (City)', deviceEvent.address.locality, 1, true);
          this.addRow('Postal Code', deviceEvent.address.postalCode, 1, true);
          this.addRow('County', deviceEvent.address.subAdminArea, 1, true);
          this.addRow('Country', deviceEvent.address.countryName, 1, true);
        }
        this.addRow('Altitude', deviceEvent.altitude);
        this.addRow('Altitude Given', deviceEvent.hasAltitude);
        this.addRow('Bearing', deviceEvent.bearing);
        this.addRow('Bearing Given', deviceEvent.hasBearing);
        this.addRow('Bearing Forward', deviceEvent.bearingForward);
        this.addRow('Device ID', deviceEvent.deviceId);
        this.addRow('Device Time', this.formatTime(deviceEvent.deviceTime));
        this.addRow('Document ID', deviceEvent.documentId);
        this.addRow('Email', deviceEvent.email);
        this.addRow('Landmarks', landMarkNames, landMarkNames.length > 1 ? landMarkNames.length : 1);
        this.addRow('Latitude', deviceEvent.latitude);
        this.addRow('Longitude', deviceEvent.longitude);
        this.addRow('Previous Location Bearing', deviceEvent.previousEventBearing);
        this.addRow('Server Time', this.formatTime(deviceEvent.serverTime));
        this.addRow('Speed', deviceEvent.speed);
        this.addRow('Speed Given', deviceEvent.hasSpeed);
        this.addRow('Step Length', deviceEvent.stepLength);
      }
    });
  }

  addRow(name: string, value: any, rowspan: number = 1, isAddressItem: boolean = false) {
    this.rows.push({name: name, value: value, rowspan: rowspan, isAddressItem: isAddressItem});
  }

  getLandmarkNames(deviceEvent: DeviceEvent) {
    const names: string[] = [];
    if (deviceEvent && deviceEvent.landmarks) {
      deviceEvent.landmarks.forEach((landmark: Landmark) => {
        names.push(landmark.landmarkId);
      });
    }
    return names;
  }

  formatTime(ts: Timestamp): string {
    let time = '';
    if (!!ts) {
      time = moment(ts.toDate()).format('YYYY-MM-DD, HH:mm:ss');
    }
    return time;
  }
}
