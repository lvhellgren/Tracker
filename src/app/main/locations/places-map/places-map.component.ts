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
import { AccountLandmarkDoc } from '../../setup/landmarks/landmark.service';
import { PlaceService } from '../places/place.service';

interface MarkerDoc extends AccountLandmarkDoc {
  icon?: string;
  animation?: string;
}

@Component({
  templateUrl: './places-map.component.html',
  styleUrls: ['./places-map.component.css']
})
export class PlacesMapComponent implements OnInit, OnDestroy {
  private markerIcon = '/assets/landmark_flag_red.png';
  private selectedMarkerIcon = '/assets/landmark_flag_blue.png';

  private markerSubscription: Subscription;
  private selectedMarkerSubscription: Subscription;

  map: google.maps.Map;
  landmarks: MarkerDoc[] = [];

  constructor(private placeService: PlaceService) {
  }

  ngOnInit() {
    // Markers to show
    this.markerSubscription = this.placeService.markers$.subscribe((docs: MarkerDoc[]) => {
      const selectedLandmarkId = this.placeService.getLandmarkId();
      docs.forEach((doc: MarkerDoc) => {
        doc.icon = doc.landmarkId === selectedLandmarkId ? this.selectedMarkerIcon : this.markerIcon;
      });
      this.landmarks = docs;
    });

    // Selected landmark marker
    this.selectedMarkerSubscription = this.placeService.selectedLandmark$.subscribe(id => {
      this.selectMarker(id);
    });
  }

  ngOnDestroy(): void {
    if (this.markerSubscription) {
      this.markerSubscription.unsubscribe();
    }
    if (this.selectedMarkerSubscription) {
      this.selectedMarkerSubscription.unsubscribe();
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

  selectMarker(id) {
    this.landmarks.forEach((doc: MarkerDoc) => {
      if (doc.landmarkId === id) {
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
