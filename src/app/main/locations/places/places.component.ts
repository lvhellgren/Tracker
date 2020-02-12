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

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AccountLandmarkDoc } from '../../setup/landmarks/landmark.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { PlaceService, UnitInfo } from './place.service';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MsgDlgComponent } from '../../core/msg-dlg/msg-dlg.component';
import { HelpService, LOC_LANDMARKS } from '../../../drawers/help/help.service';

@Component({
  selector: 'app-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.css']
})
export class PlacesComponent implements OnInit, OnDestroy {

  dataSource = new MatTableDataSource<AccountLandmarkDoc>();
  displayedColumns = ['landmarkId', 'radius', 'units'];

  accountSubscription: Subscription;
  landmarksSubscription: Subscription;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private tapCount = 0;

  constructor(private authService: AuthService,
              private dialog: MatDialog,
              private placeService: PlaceService,
              private route: ActivatedRoute,
              private router: Router,
              private helpService: HelpService) {
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      this.placeService.fetchLandmarks(accountId);
    });

    this.landmarksSubscription = this.placeService.landmarks$.subscribe((landmarks: AccountLandmarkDoc[]) => {
      this.dataSource.data = landmarks;
    });

    this.helpService.component$.next(LOC_LANDMARKS);
  }

  ngOnDestroy() {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
    if (this.landmarksSubscription) {
      this.landmarksSubscription.unsubscribe();
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getUnitCount(unitsPresent: UnitInfo[]): string {
    return !!unitsPresent && unitsPresent.length > 0 ? <string><unknown>unitsPresent.length : '';
  }

  onRowClick(row: AccountLandmarkDoc) {
    this.placeService.setLandmark(row);
  }

  onRowDblClick(row: AccountLandmarkDoc) {
    if (row.landmarkId) {
      // const landmarkKey = LandmarkService.makeAccountLandmarkKey(row.accountId, row.landmarkId);

      // TODO: Needs fix

      // No auxiliary route will show the wrong map:
      // this.router.navigate([`../place`, landmarkKey], {relativeTo: this.route});

      // Not working auxiliary route navigation attempt:
      // this.router.navigate([{outlets: {primary: ['../place'], map: ['place-map']}}], {relativeTo: this.route});

      this.dialog.open(MsgDlgComponent, {
        data: {title: 'Landmark Detail Information', msg: `Please select the row and click on LANDMARK above`, ok: 'OK'}
      });
    } else {
      const msg = 'Invalid landmark data in table row';
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: msg}
      });
      console.error(msg);
    }
  }

  // To handle click and dblClick also for mobile devices
  onRowTap(row: AccountLandmarkDoc) {
    this.tapCount++;
    setTimeout(() => {
      if (this.tapCount === 1) {
        this.tapCount = 0;
        this.onRowClick(row);
      }
      if (this.tapCount > 1) {
        this.tapCount = 0;
        this.onRowDblClick(row);
      }
    }, 300);
  }

  rowBackground(row) {
    return this.isSelected(row) ? '#3f51b5' : '';
  }

  rowColor(row) {
    return this.isSelected(row) ? 'white' : '';
  }

  isSelected(row: AccountLandmarkDoc): boolean {
    const landmarkId = this.placeService.getLandmarkId();
    return row && landmarkId && landmarkId === row.landmarkId;
  }
}
