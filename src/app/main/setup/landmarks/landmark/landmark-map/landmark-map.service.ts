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

import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { LatLngLiteral } from '@agm/core/services/google-maps-types';
import { LandmarkDoc } from '../landmark.service';

@Injectable({
  providedIn: 'root'
})
export class LandmarkMapService {

  // Landmarks to be shown on the map
  private landmark = new BehaviorSubject<LandmarkDoc>(null);
  landmark$ = this.landmark.asObservable();

  // Coords for map click
  private coords = new Subject<LatLngLiteral>();
  coords$ = this.coords.asObservable();

  setLandmark<T>(landmark: LandmarkDoc) {
    this.landmark.next(landmark);
  }

  setCoords(coords: LatLngLiteral) {
    this.coords.next(coords);
  }
}