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
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlaceDoc, PlaceService, UnitInfo } from '../place.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LandmarkService } from '../../../setup/landmarks/landmark.service';
import * as moment from 'moment';
import { HelpService, LOC_LANDMARK } from '../../../../drawers/help/help.service';


export interface Row {
  name: string;
  value: any;
  rowspan: number;
}

@Component({
  selector: 'app-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.css']
})
export class PlaceComponent implements OnInit, OnDestroy {
  public landmarkId: string;
  public rows: Row[];

  private accountId: string;
  private accountSubscription: Subscription;
  private routeSubscription: Subscription;
  private landmarkSubscription: Subscription;

  constructor(private authService: AuthService,
              private placeService: PlaceService,
              private router: Router,
              private route: ActivatedRoute,
              private helpService: HelpService) {
  }

  ngOnInit() {
    // Subscribe to account changes
    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      if (!!this.accountId && this.accountId !== accountId) {
        this.router.navigate(['../'], {relativeTo: this.route});
      } else {
        this.accountId = accountId;
      }
    });

    this.routeSubscription = this.route.params.subscribe((params: Params) => {
      let docId = params['id'];
      if (!docId && this.placeService.landmarkDoc) {
        docId = LandmarkService.makeAccountLandmarkKey(this.authService.currentUserAccountId, this.placeService.landmarkDoc.landmarkId);
      }
      if (docId) {
        this.placeService.fetchLandmark(docId);
      }
    });

    this.landmarkSubscription = this.placeService.landmarks$.subscribe((docs: PlaceDoc[]) => {
      if (!!docs) {
        this.rows = [];
        const doc: PlaceDoc = docs[0];
        if (!!doc) {
          const unitNames: string[] = this.getUnitsPresent(doc);
          this.landmarkId = doc.landmarkId;
          this.addRow('Landmark ID', doc.landmarkId);
          this.addRow('Units Present', unitNames, unitNames.length > 1 ? unitNames.length : 1);
          this.addRow('Fence Radius (meters)', doc.radius);
          this.addRow('Latitude', doc.latitude);
          this.addRow('Longitude', doc.longitude);
          this.addRow('Last Modified', moment(doc.modifiedAt.toDate()).format('YYYY-MM-DD, HH:mm:ss'));
          this.addRow('Notes', doc.comment);
        }
      }
    });

    this.helpService.component$.next(LOC_LANDMARK);
  }

  ngOnDestroy() {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.landmarkSubscription) {
      this.landmarkSubscription.unsubscribe();
    }
  }

  addRow(name: string, value: any, rowspan: number = 1) {
    this.rows.push({name: name, value: value, rowspan: rowspan});
  }

  getUnitsPresent(placeDoc: PlaceDoc) {
    const names: string[] = [];
    if (!!placeDoc.unitsPresent) {
      placeDoc.unitsPresent.forEach(((unit: UnitInfo) => {
        names.push(unit.deviceName);
      }));
    }
    return names;
  }
}
