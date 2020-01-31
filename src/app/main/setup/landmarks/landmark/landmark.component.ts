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
import { Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { AuthService } from '../../../core/auth/auth.service';
import { DatePipe, Location } from '@angular/common';
import { LatLngLiteral, MapsAPILoader } from '@agm/core';
import { ConfirmationDlgComponent } from '../../../core/confirmation-dlg/confirmation-dlg-component';
import { SetupService } from '../../setup.service';
import { AccountLandmarkDoc, LandmarkService } from '../landmark.service';
import { ErrorDlgComponent } from '../../../core/error-dlg/error-dlg.component';
import GeocoderResult = google.maps.GeocoderResult;
import GeocoderStatus = google.maps.GeocoderStatus;
import { ACT_LANDMARK, HelpService } from '../../../../drawers/help/help.service';

const DEFAULT_RADIUS = 300;
const DEFAULT_COLOR = 'red';

@Component({
  selector: 'app-landmark',
  templateUrl: './landmark.component.html',
  styleUrls: ['./landmark.component.css']
})
export class LandmarkComponent implements OnInit, OnDestroy {
  fullView = true;
  msg: string;
  returnPath: string;
  createLandmark = false;
  accountId: string;

  active = new FormControl();
  landmarkForm: FormGroup;

  accountSubscription: Subscription;
  routeSubscription: Subscription;
  coordsSubscription: Subscription;
  landmarkSubscription: Subscription;
  msgSubscription: Subscription;

  geocoder: any;

  static toDate(ts: any) {
    let date: Date;
    if (ts) {
      date = ts.toDate();
    }
    return date;
  }

  constructor(private fb: FormBuilder,
              private landmarkService: LandmarkService,
              private setupService: SetupService,
              private router: Router,
              private route: ActivatedRoute,
              private location: Location,
              private authService: AuthService,
              private datePipe: DatePipe,
              private mapsApiLoader: MapsAPILoader,
              private dialog: MatDialog,
              private helpService: HelpService) {
  }

  ngOnInit() {
    this.fullView = !this.setupService.smallView;
    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      if (!!this.accountId && this.accountId !== accountId) {
        this.router.navigate([`./setup/${this.returnPath}`]);
      } else {
        this.accountId = accountId;
      }
    });

    this.routeSubscription = this.route.url.subscribe(segment => {
      const path = segment[0].path;
      if (path === 'account-landmark-add') {
        this.landmarkService.clearLandmark();
        this.active.setValue(true);
        this.createLandmark = true;
      }
      this.returnPath = 'account-landmarks-list';
    });

    this.landmarkForm = this.fb.group({
      active: ['', []],
      accountId: ['', []],
      landmarkId: ['', [Validators.required]],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      radius: [DEFAULT_RADIUS, [Validators.required]],
      color: [DEFAULT_COLOR, [Validators.required]],
      subThoroughfare: ['', []],
      thoroughfare: ['', []],
      locality: ['', []],
      area: ['', []],
      postalCode: ['', []],
      countryName: ['', []],
      modifiedAt: [''],
      createdAt: [''],
      comment: ['']
    });

    // Issue fetch for landmark id passed in URL
    this.route.params.subscribe((params: Params) => {
      const landmarkKey = params['id'];
      if (landmarkKey) {
        this.landmarkService.fetchLandmark(landmarkKey);
      }
    });

    // Handle response to landmark fetch request
    this.landmarkSubscription = this.landmarkService.fetchedLandmark$.subscribe((landmarkDoc: AccountLandmarkDoc) => {
      this.landmarkForm.setValue({
        active: landmarkDoc.active,
        accountId: landmarkDoc.accountId,
        landmarkId: landmarkDoc.landmarkId,
        latitude: landmarkDoc.latitude,
        longitude: landmarkDoc.longitude,
        radius: landmarkDoc.radius,
        color: landmarkDoc.color,
        subThoroughfare: landmarkDoc.subThoroughfare ? landmarkDoc.subThoroughfare : '',
        thoroughfare: landmarkDoc.thoroughfare ? landmarkDoc.thoroughfare : '',
        locality: landmarkDoc.locality ? landmarkDoc.locality : '',
        area: landmarkDoc.area ? landmarkDoc.area : '',
        postalCode: landmarkDoc.postalCode ? landmarkDoc.postalCode : '',
        countryName: landmarkDoc.countryName ? landmarkDoc.countryName : '',
        modifiedAt: this.datePipe.transform(LandmarkComponent.toDate(landmarkDoc.modifiedAt), 'short'),
        createdAt: this.datePipe.transform(LandmarkComponent.toDate(landmarkDoc.createdAt), 'short'),
        comment: landmarkDoc.comment ? landmarkDoc.comment : ''
      });
      this.active.setValue(landmarkDoc.active);
      this.landmarkService.setLandmarkMarker(landmarkDoc);
    });

    // Initialize landmark at point of map click
    this.coordsSubscription = this.landmarkService.clickCoordinates$.subscribe((coords: LatLngLiteral) => {
      const landmarkDoc: AccountLandmarkDoc = this.landmarkForm.value;
      landmarkDoc.latitude = coords.lat;
      landmarkDoc.longitude = coords.lng;
      this.landmarkForm.setValue(landmarkDoc);
      this.landmarkService.setLandmarkMarker(landmarkDoc);
    });

    this.msgSubscription = this.landmarkService.msg$.subscribe(msg => {
      this.msg = msg;
    });

    this.mapsApiLoader.load().then(() => {
      this.geocoder = new google.maps.Geocoder();
    });

    this.helpService.component$.next(ACT_LANDMARK);
  }

  ngOnDestroy(): void {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.coordsSubscription) {
      this.coordsSubscription.unsubscribe();
    }
    if (this.landmarkSubscription) {
      this.landmarkSubscription.unsubscribe();
    }
    if (this.msgSubscription) {
      this.msgSubscription.unsubscribe();
    }
  }

  public onClear() {
    this.landmarkService.clearLandmark();
    this.landmarkService.setLandmarkMarker({});
    this.active.setValue(true);
    this.landmarkForm.reset();
    this.msg = '';
  }

  public onCancel() {
    this.location.back();
  }

  public onPreview() {
    const landmarkDoc: AccountLandmarkDoc = this.landmarkForm.value;
    if ((!!!landmarkDoc.latitude || !!!landmarkDoc.longitude)) {
      try {
        let geoAddress = '';
        if (!!landmarkDoc.subThoroughfare) {
          geoAddress += ' ' + landmarkDoc.subThoroughfare;
        }
        if (!!landmarkDoc.thoroughfare) {
          geoAddress += ' ' + landmarkDoc.thoroughfare;
        }
        if (!!landmarkDoc.locality) {
          geoAddress += ' ' + landmarkDoc.locality;
        }
        if (!!landmarkDoc.area) {
          geoAddress += ' ' + landmarkDoc.area;
        }
        if (!!landmarkDoc.postalCode) {
          geoAddress += ' ' + landmarkDoc.postalCode;
        }
        if (!!landmarkDoc.countryName) {
          geoAddress += ' ' + landmarkDoc.countryName;
        }

        if (geoAddress.length > 0) {
          this.geocoder.geocode({
            'address': geoAddress
          }, (results: GeocoderResult[], status: GeocoderStatus) => {
            if (status === google.maps.GeocoderStatus.OK) {
              if (results.length > 0) {
                const latitude = results[0].geometry.location.lat();
                const longitude = results[0].geometry.location.lng();
                landmarkDoc.latitude = latitude;
                landmarkDoc.longitude = longitude;
                this.landmarkForm.patchValue({latitude: latitude, longitude: longitude});
                this.landmarkService.setLandmarkMarker(landmarkDoc);
              }
            } else {
              this.dialog.open(ErrorDlgComponent, {
                data: {
                  msg: `Error geocoding address: ${results[0].formatted_address}`
                }
              });
            }
          });
        }
      } catch (error) {
        this.dialog.open(ErrorDlgComponent, {
          data: {
            msg: `Geocoding failed: ${error}`
          }
        });
      }
    }
    this.landmarkForm.setValue(landmarkDoc);
    this.landmarkService.setLandmarkMarker(landmarkDoc);
  }

  public onSubmit() {
    this.msg = '';
    const landmarkDoc: AccountLandmarkDoc = this.landmarkForm.value;
    landmarkDoc.active = this.active.value;
    this.confirmSetLandmark(landmarkDoc);
  }

  confirmSetLandmark(landmarkDoc: AccountLandmarkDoc) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Add or Modify Landmark',
        msg: `Add or Modify Landmark for ${this.authService.currentUserAccountId} account?`,
        no: 'Cancel',
        yes: 'OK'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        this.landmarkService.saveLandmark(landmarkDoc, this.returnPath);
      }
    });
  }

  public onDelete() {
    this.msg = '';
    this.confirmDeleteLandmark(this.landmarkForm.value);
  }

  confirmDeleteLandmark(landmarkDoc: AccountLandmarkDoc) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Delete Landmark',
        msg: `Delete ${landmarkDoc.landmarkId} and associated subscriptions and subscribers?`,
        no: 'Cancel',
        yes: 'OK'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        this.landmarkService.deleteLandmark(landmarkDoc, this.returnPath);
      }
    });
  }
}
