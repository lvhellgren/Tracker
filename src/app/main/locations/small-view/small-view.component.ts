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
import { DeviceEvent, UnitService } from '../unit.service';
import { PlaceService } from '../places/place.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-small-view',
  templateUrl: './small-view.component.html',
  styleUrls: ['./small-view.component.css']
})
export class SmallViewComponent implements OnInit, OnDestroy {
  deviceId: string;
  documentId: string;

  unitHistoryDisabled = true;
  unitInfoDisabled = true;

  private deviceSelectSubscription: Subscription;
  private enableDetailsSubscription: Subscription;

  constructor(private unitService: UnitService,
              private placeService: PlaceService) {
  }

  ngOnInit() {
    this.deviceSelectSubscription = this.unitService.itemSelect$.subscribe((deviceEvent: DeviceEvent) => {
      this.unitHistoryDisabled = this.unitInfoDisabled = !!!deviceEvent;
      if (!!deviceEvent) {
        this.deviceId = deviceEvent.deviceId;
        this.documentId = deviceEvent.documentId;
        this.unitHistoryDisabled = this.unitInfoDisabled = false;
      } else {
        this.unitHistoryDisabled = this.unitInfoDisabled = true;
      }
    });

    this.enableDetailsSubscription = this.unitService.hasDetails$.subscribe(documentId => {
      if (!!documentId) {
        this.documentId = documentId;
        this.unitInfoDisabled = false;
      } else {
        this.unitInfoDisabled = true;
      }
    });

    if (this.enableDetailsSubscription) {
      this.enableDetailsSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    if (this.deviceSelectSubscription) {
      this.deviceSelectSubscription.unsubscribe();
    }
  }

  placeDisabled() {
    return !!!this.placeService.landmarkDoc;
  }
}
