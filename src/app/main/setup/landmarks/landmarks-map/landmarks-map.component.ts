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
import { google } from '@agm/core/services/google-maps-types';
import { SetupService } from '../../setup.service';
import { AccountLandmarkDoc, LandmarkService } from '../landmark.service';

interface MarkerDoc extends AccountLandmarkDoc {
  icon?: string;
  animation?: string;
}

@Component({
  selector: 'app-landmarks-map',
  templateUrl: './landmarks-map.component.html',
  styleUrls: ['./landmarks-map.component.css']
})
export class LandmarksMapComponent implements OnInit, OnDestroy {
  markerIcon = '/assets/landmark_flag_red.png';
  selectedMarkerIcon = '/assets/landmark_flag_blue.png';

  landmarksMapSubscription: Subscription;
  selectLandmarkSubscription: Subscription;

  map: google.maps.Map;
  landmarks: MarkerDoc[] = [];

  constructor(
    private landmarkService: LandmarkService,
    private setupService: SetupService
  ) {
  }

  ngOnInit() {
    // Pick CSS file based on display size
    if (this.setupService.smallView) {
      require('style-loader!./landmarks-map.component-sm.css');
    } else {
      require('style-loader!./landmarks-map.component.css');
    }

    // Landmarks to display
    this.landmarksMapSubscription = this.landmarkService.landmarkMarkers$.subscribe(
      (landmarkDocs: MarkerDoc[]) => {
        const selectedLandmarkId = this.landmarkService.getLandmarkId();
        landmarkDocs.forEach((doc: MarkerDoc) => {
          doc.icon = doc.landmarkId === selectedLandmarkId ? this.selectedMarkerIcon : this.markerIcon;
        });
        this.landmarks = landmarkDocs;
      });

    // Selected landmark
    this.selectLandmarkSubscription = this.landmarkService.selectedLandmark$.subscribe(landmarkId => {
      this.selectMarker(landmarkId);
    });
  }

  ngOnDestroy() {
    if (this.landmarksMapSubscription !== null) {
      this.landmarksMapSubscription.unsubscribe();
    }
    if (this.selectLandmarkSubscription !== null) {
      this.selectLandmarkSubscription.unsubscribe();
    }
  }

  onMapReady(map) {
    this.map = map;
  }

  onMouseOver(infoWindow) {
    infoWindow.open();
  }

  onMouseOut(infoWindow) {
    infoWindow.close();
  }

  selectMarker(landmarkId) {
    this.landmarks.forEach((doc: MarkerDoc) => {
      if (doc.landmarkId === landmarkId) {
        doc.icon = this.selectedMarkerIcon;
        doc.animation = 'BOUNCE';
        this.stopAnimation(doc);
      } else {
        doc.icon = this.markerIcon;
      }
    });
  }

  stopAnimation(item) {
    setTimeout(() => {
      item.animation = null;
    }, 1000);
  }
}
