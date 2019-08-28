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

import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { google } from '@agm/core/services/google-maps-types';
import { LandmarkDoc, LandmarkService } from '../landmark/landmark.service';
import { LandmarksMapService } from './landmarks-map.service';
import { SetupService } from '../../setup.service';

@Component({
  selector: 'app-landmarks-map',
  templateUrl: './landmarks-map.component.html'
})
export class LandmarksMapComponent implements OnInit {
  landmarkIcon = '/assets/landmark_flag.png';

  landmarksMapSubscription: Subscription;

  map: google.maps.Map;
  landmarks: LandmarkDoc[] = [];

  constructor(
    private landmarksMapService: LandmarksMapService,
    private landmarkService: LandmarkService,
    private setupService: SetupService
  ) {
  }

  ngOnInit() {
    // Pick CSS file based on display size
    if (this.setupService.smallView) {
      console.log('small');
      require('style-loader!./landmarks-map.component-sm.css');
    } else {
      require('style-loader!./landmarks-map.component.css');
      console.log('full');
    }

    // Landmark to display
    this.landmarksMapSubscription = this.landmarksMapService.landmarks$.subscribe(
      (landmarkDocs: LandmarkDoc[]) => {
        this.landmarks = landmarkDocs;
      });
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

  getIconAnimation(landmarkDoc: LandmarkDoc) {
    return landmarkDoc.landmarkId === this.landmarkService.getLandmarkId() ? 'BOUNCE' : null;
  }
}
