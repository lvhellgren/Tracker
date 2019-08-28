// Copyright (c) 2019 Lars Hellgren (lars@exelor.com).
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
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { MatDialog } from '@angular/material';
import { AuthService } from '../../../core/auth/auth.service';
import { LandmarkDoc, LandmarkService } from './landmark.service';
import { DatePipe, Location } from '@angular/common';
import { LandmarkMapService } from './landmark-map/landmark-map.service';
import { LatLngLiteral } from '@agm/core';
import { ConfirmationDlgComponent } from '../../../core/confirmation-dlg/confirmation-dlg-component';
import { SetupService } from '../../setup.service';

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

  active = new FormControl();

  landmarkForm: FormGroup;

  routeSubscription: Subscription;
  coordsSubscription: Subscription;
  landmarkSubscription: Subscription;
  msgSubscription: Subscription;

  static toDate(ts: any) {
    let date: Date;
    if (ts) {
      date = ts.toDate();
    }
    return date;
  }

  constructor(private fb: FormBuilder,
              private landmarkService: LandmarkService,
              private landmarkMapService: LandmarkMapService,
              private setupService: SetupService,
              private route: ActivatedRoute,
              private location: Location,
              private authService: AuthService,
              private datePipe: DatePipe,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.fullView = !this.setupService.smallView;

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
      // address: [''],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      radius: [DEFAULT_RADIUS, [Validators.required]],
      color: [DEFAULT_COLOR, [Validators.required]],
      modifiedAt: [''],
      createdAt: [''],
      comment: ['']
    });

    // Fetch landmark for id passed in URL
    this.route.params.subscribe((params: Params) => {
      const landmarkKey = params['id'];
      if (landmarkKey) {
        this.landmarkService.fetchLandmark(landmarkKey);
      }
    });

    // Handle response to landmark fetch request
    this.landmarkSubscription = this.landmarkService.landmark$.subscribe((landmarkDoc: LandmarkDoc) => {
      // this.landmarkForm.setValue(landmarkDoc);
      const createdAt = this.datePipe.transform(LandmarkComponent.toDate(landmarkDoc.createdAt), 'long');
      this.landmarkForm.setValue({
        active: landmarkDoc.active,
        accountId: landmarkDoc.accountId,
        landmarkId: landmarkDoc.landmarkId,
        latitude: landmarkDoc.latitude,
        longitude: landmarkDoc.longitude,
        radius: landmarkDoc.radius,
        color: landmarkDoc.color,
        modifiedAt: this.datePipe.transform(LandmarkComponent.toDate(landmarkDoc.modifiedAt), 'long'),
        createdAt: this.datePipe.transform(LandmarkComponent.toDate(landmarkDoc.createdAt), 'long'),
        comment: landmarkDoc.comment
      });
      this.landmarkMapService.setLandmark(landmarkDoc);
    });

    // Initialize landmark at point of map click
    this.coordsSubscription = this.landmarkMapService.coords$.subscribe((coords: LatLngLiteral) => {
      const landmarkDoc: LandmarkDoc = this.landmarkForm.value;
      landmarkDoc.latitude = coords.lat;
      landmarkDoc.longitude = coords.lng;
      this.landmarkForm.setValue(landmarkDoc);
      this.landmarkMapService.setLandmark(landmarkDoc);
    });

    this.msgSubscription = this.landmarkService.msg$.subscribe(msg => {
      this.msg = msg;
    });
  }

  ngOnDestroy(): void {
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
    this.landmarkMapService.setLandmark({});
    this.active.setValue(true);
    this.landmarkForm.reset();
    this.msg = '';
  }

  public onCancel() {
    this.location.back();
  }

  public onPreview() {
    const landmarkDoc: LandmarkDoc = this.landmarkForm.value;
    console.log(landmarkDoc);
    this.landmarkForm.setValue(landmarkDoc);
    this.landmarkMapService.setLandmark(landmarkDoc);
  }

  public onSubmit() {
    this.msg = '';
    const landmarkDoc: LandmarkDoc = this.landmarkForm.value;
    landmarkDoc.active = this.active.value;
    this.confirmSetLandmark(landmarkDoc);
  }

  confirmSetLandmark(landmarkDoc: LandmarkDoc) {
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
        landmarkDoc.accountId = this.authService.currentUserAccountId;
        this.landmarkService.saveLandmark(landmarkDoc, this.returnPath);
        this.location.back();
      }
    });
  }
}
