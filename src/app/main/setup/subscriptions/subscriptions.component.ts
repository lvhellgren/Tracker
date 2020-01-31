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
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';
import { LANDMARK_ACTIVITIES, SubscriptionDoc, SubscriptionService } from './subscription.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ACT_NOTIFICATION_SUBSCRIPTIONS, HelpService } from '../../../drawers/help/help.service';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  dataSource = new MatTableDataSource<SubscriptionDoc>();
  displayedColumns = ['subscriptionId', 'landmarkId', 'activity', 'deviceIds', 'active', 'modifiedAt'];
  subscriptionId: string;
  allDevices = new Map<string, string>();

  accountSubscription: Subscription;
  subscriptionsSubscription: Subscription;
  deviceSubscription: Subscription;

  // Page attributes:
  public pageIndex = 0;
  public previousPageIndex = 0;
  public startPageSize = 20;
  public pageSize = this.startPageSize;
  public pageSizeOptions = [this.startPageSize, 50, 100];
  public length = (this.pageIndex + 1) * this.pageSize + this.pageSize;
  private bottomPageRows = [0];

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  constructor(
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private helpService: HelpService) {
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.accountSubscription = this.authService.userAccountSelect.subscribe((accountId: string) => {
      if (this.subscriptionsSubscription) {
        this.subscriptionsSubscription.unsubscribe();
      }
      this.subscriptionsSubscription =
        this.subscriptionService.subscriptions$(accountId, this.bottomPageRows[this.bottomPageRows.length - 1], this.pageSize)
        .subscribe(docs => {
          this.dataSource.data = docs;
        });
    });

    // Issue a fetch request for all devices for the account
    this.subscriptionService.fetchAccountDevices();

    // Subscribe to the devices fetch response
    this.deviceSubscription = this.subscriptionService.allDevices$.subscribe(allDevices => {
      this.allDevices = allDevices;
    });

    this.helpService.component$.next(ACT_NOTIFICATION_SUBSCRIPTIONS);
  }

  ngOnDestroy() {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
    if (this.subscriptionsSubscription) {
      this.subscriptionsSubscription.unsubscribe();
    }
    if (this.deviceSubscription) {
      this.deviceSubscription.unsubscribe();
    }
  }

  getDeviceName(deviceId: string) {
    return this.allDevices.get(deviceId);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onSubscriptionClick(row) {
    if (row.subscriptionId) {
      const key = SubscriptionService.makeAccountSubscriptionKey(row.accountId, row.subscriptionId);
      this.router.navigate([`../account-subscription`, key], {relativeTo: this.route});
    } else {
      const msg = 'Invalid subscription data in table row';
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: msg}
      });
      console.error(msg);
    }
  }

  getActivityName(activity) {
    return LANDMARK_ACTIVITIES.get(activity);
  }

  rowBackground(row) {
    return this.isSelected(row) ? '#3f51b5' : '';
  }

  rowColor(row) {
    return this.isSelected(row) ? 'white' : '';
  }

  isSelected(row): boolean {
    const id = this.subscriptionService.getSubscriptionId();
    return row && id && id === row.subscriptionId;
  }
}
