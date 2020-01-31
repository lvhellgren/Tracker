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
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';
import { AccountLandmarkDoc, LandmarkService } from './landmark.service';
import { SetupService } from '../setup.service';
import { ACT_LANDMARKS, HelpService } from '../../../drawers/help/help.service';

@Component({
  selector: 'app-landmarks',
  templateUrl: './landmarks.component.html',
  styleUrls: ['./landmarks.component.css']
})
export class LandmarksComponent implements OnInit, OnDestroy {

  fullView = true;

  dataSource = new MatTableDataSource<AccountLandmarkDoc>();
  displayedColumns = ['landmarkId', 'active'];
  landmarkId: string;

  accountSubscription: Subscription;
  landmarksSubscription: Subscription;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  private tapCount = 0;

  constructor(
    private authService: AuthService,
    private landmarkService: LandmarkService,
    private setupService: SetupService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private helpService: HelpService) {
  }

  ngOnInit() {
    this.fullView = !this.setupService.smallView;

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      this.landmarkService.fetchLandmarks(accountId);
    });

    this.landmarksSubscription = this.landmarkService.fetchedLandmarks$.subscribe((landmarks: AccountLandmarkDoc[]) => {
      this.dataSource.data = landmarks;
      this.landmarkService.setLandmarkMarkers(landmarks);
    });

    this.helpService.component$.next(ACT_LANDMARKS);
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

  onRowClick(row: AccountLandmarkDoc) {
    this.landmarkService.setLandmarkId(row.landmarkId);
  }

  onRowDblClick(row: AccountLandmarkDoc) {
    if (row.landmarkId) {
      this.landmarkId = row.landmarkId;
      const landmarkKey = LandmarkService.makeAccountLandmarkKey(row.accountId, row.landmarkId);
      this.router.navigate([`../account-landmark`, landmarkKey], {relativeTo: this.route});
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
    const landmarkId = this.landmarkService.getLandmarkId();
    return row && landmarkId && landmarkId === row.landmarkId;
  }
}
