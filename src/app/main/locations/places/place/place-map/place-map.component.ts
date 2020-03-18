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
import { PlaceDoc, PlaceService } from '../../place.service';


@Component({
  selector: 'app-place-map',
  templateUrl: './place-map.component.html',
  styleUrls: ['./place-map.component.css']
})
export class PlaceMapComponent implements OnInit, OnDestroy {
  map: google.maps.Map;
  placeDoc: PlaceDoc;

  private markerSubscription: Subscription;

  constructor(private placeService: PlaceService) {
  }

  ngOnInit() {
    this.markerSubscription = this.placeService.markers$.subscribe((docs: PlaceDoc[]) => {
      this.placeDoc = docs[0];
    });
  }

  ngOnDestroy() {
    if (this.markerSubscription != null) {
      this.markerSubscription.unsubscribe();
    }
  }

  onMapReady(map) {
    this.map = map;
  }

  getZoom(radius: number) {
    let zoom: number;
    if (radius < 50) {
      zoom = 20;
    } else if (radius < 200) {
      zoom = 18;
    } else {
      zoom = 16;
    }
    return zoom;
  }
}
