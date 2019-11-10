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
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { ConfirmationDlgComponent } from '../../../../core/confirmation-dlg/confirmation-dlg-component';
import { google } from '@agm/core/services/google-maps-types';
import { SetupService } from '../../../setup.service';
import { AccountLandmarkDoc, LandmarkService } from '../../landmark.service';

const CLOSE_UP_ZOOM = 16;

@Component({
  selector: 'app-landmark-map',
  templateUrl: './landmark-map.component.html',
})
export class LandmarkMapComponent implements OnInit, OnDestroy {
  landmarkIcon = '/assets/landmark_flag_blue.png';

  isLoading = false;
  landmarkMapSubscription: Subscription;

  map: google.maps.Map;
  landmark: AccountLandmarkDoc = null;
  zoom = CLOSE_UP_ZOOM;

  constructor(
    private landmarkService: LandmarkService,
    private setupService: SetupService,
    private dialog: MatDialog) {
  }

  ngOnInit() {
    // Pick CSS file based on display size
    if (this.setupService.smallView) {
      require('style-loader!./landmark-map.component-sm.css');
    } else {
      require('style-loader!./landmark-map.component.css');
    }

    // Landmark to display
    this.landmarkMapSubscription = this.landmarkService.landmarkMarker$.subscribe(
      (landmarkDoc: AccountLandmarkDoc) => {
        this.landmark = (!!landmarkDoc && !!landmarkDoc.latitude) ? landmarkDoc : this.fauxLandmark();
      });
  }

  ngOnDestroy() {
    if (this.landmarkMapSubscription) {
      this.landmarkMapSubscription.unsubscribe();
    }
  }

  fauxLandmark() {
    this.isLoading = true;
    const geolocation: Geolocation = navigator.geolocation;
    const landmarkDoc: AccountLandmarkDoc = {
      latitude: 0,
      longitude: 0
    };
    geolocation.getCurrentPosition((position: Position) => {
        if (position) {
          landmarkDoc.latitude = position.coords.latitude;
          landmarkDoc.longitude = position.coords.longitude;
        }
        this.isLoading = false;
      },
      (error) => {
        console.error(error);
        this.isLoading = false;
      });
    return landmarkDoc;
  }

  onMapReady(map) {
    this.map = map;
  }

  onMapClick($event) {
    this.confirmLandmarkLocation($event);
  }

  confirmLandmarkLocation($event) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Create Landmark',
        msg: `Set landmark at lat / long ${$event.coords.lat} / ${$event.coords.lng}`,
        no: 'Cancel',
        yes: 'OK'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        this.landmarkService.setMapCoordinates($event.coords);
      }
    });
  }

  onMouseOver(infoWindow) {
    infoWindow.open();
  }

  onMouseOut(infoWindow) {
    infoWindow.close();
  }
}
