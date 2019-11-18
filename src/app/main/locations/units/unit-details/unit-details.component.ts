import { Component, OnDestroy, OnInit } from '@angular/core';
import { DeviceEvent, Landmark, UnitService } from '../../unit.service';
import { UnitsMapService } from '../../units-map/units-map.service';
import { GlobalService } from '../../../../sevices/global';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import * as moment from 'moment';
import * as firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import { HelpService, LOC_UNIT_DETAILS } from '../../../../drawers/help/help.service';


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
  private accountSubscription: Subscription;
  private routeSubscription: Subscription;
  private eventSubscription: Subscription;

  constructor(private authService: AuthService,
              public unitService: UnitService,
              private mapService: UnitsMapService,
              private global: GlobalService,
              private router: Router,
              private route: ActivatedRoute,
              private helpService: HelpService) {
  }

  ngOnInit() {
    // Navigate back to units page on account switch:
    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      if (!!!this.accountId) {
        this.accountId = accountId;
      } else if (this.accountId !== accountId) {
        this.router.navigate([`/locations/${this.global.currentWidth}/units`]);
        this.unitService.clear();
      }
    });

    this.routeSubscription = this.route.params.subscribe((params: Params) => {
      let docId = params['id'];
      if (!docId && this.unitService.currentDeviceEvent) {
        docId = this.unitService.currentDeviceEvent.documentId;
      }
      if (docId) {
        this.deviceName = this.unitService.getDeviceName();
        this.eventSubscription = this.unitService.fetchHistoryDoc(docId).subscribe((deviceEvent: DeviceEvent) => {
          if (!!deviceEvent) {
            this.rows = [];
            const landMarkNames: string[] = this.getLandmarkNames(deviceEvent);
            this.addRow('Account', deviceEvent.accountId);
            this.addRow('Accuracy', deviceEvent.accuracy);
            this.addRow('Address', '');
            this.addRow('Street', deviceEvent.address.subThoroughfare, 1, true);
            this.addRow('Locality', deviceEvent.address.thoroughfare, 1, true);
            this.addRow('Postal Code', deviceEvent.address.postalCode, 1, true);
            this.addRow('County', deviceEvent.address.subAdminArea, 1, true);
            this.addRow('Country', deviceEvent.address.countryName, 1, true);
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
    });

    this.helpService.component$.next(LOC_UNIT_DETAILS);
  }

  ngOnDestroy(): void {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
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
