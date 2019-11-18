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
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { NotificationDoc, NotificationService } from './notification.service';
import { Subscription } from 'rxjs';
import { LANDMARK_ACTIVITIES } from '../setup/subscriptions/subscription.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationDlgComponent } from '../core/confirmation-dlg/confirmation-dlg-component';
import { AuthService } from '../core/auth/auth.service';
import { HelpService, NOTIFICATIONS } from '../../drawers/help/help.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  public selectedIds: Set<string> = new Set();

  private notificationSubscription: Subscription;
  private msgSubscription: Subscription;
  private accountSubscription: Subscription;

  private accountId: string;
  private tapCount = 0;

  msg: string;

  dataSource = new MatTableDataSource<NotificationDoc>();
  displayedColumns = [
    'subscriptionId',
    'deviceTime',
    'activity',
    'landmarkId',
    'deviceName'
  ];

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

  constructor(private authService: AuthService,
              private notificationService: NotificationService,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private helpService: HelpService) {
  }

  ngOnInit() {
    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      if (!!accountId) {
        if (!!this.accountId && this.accountId !== accountId) {
          this.dataSource.data = [];
          this.resetPagination();
        }
        this.accountId = accountId;
        this.fetchPage(accountId);
      }
    });

    this.msgSubscription = this.notificationService.msg$.subscribe(msg => {
      this.msg = msg;
    });

    this.helpService.component$.next(NOTIFICATIONS);
  }

  fetchPage(accountId: string) {
    this.notificationSubscription =
      this.notificationService.notifications$(accountId, this.bottomPageRows[this.bottomPageRows.length - 1], this.pageSize)
        .subscribe((notifications: NotificationDoc[]) => {
          if (notifications.length > 0) {
            this.dataSource.data = notifications;
            const fetchCount = notifications.length;
            // @ts-ignore
            this.bottomPageRows.push(notifications[fetchCount - 1].deviceTime.seconds);
            if (fetchCount === this.pageSize) {
              this.length = (this.pageIndex + 2) * this.pageSize;
            } else {
              this.length = this.pageIndex * this.pageSize + fetchCount;
            }
          }
        });
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.msgSubscription) {
      this.msgSubscription.unsubscribe();
    }
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
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

  onRowTap(row: NotificationDoc) {
    this.tapCount++;
    setTimeout(() => {
      if (this.tapCount === 1) {
        this.tapCount = 0;
      }
      if (this.tapCount > 1) {
        this.tapCount = 0;
        this.onRowDblclick(row);
      }
    }, 300);
  }

  onRowDblclick(row: NotificationDoc) {
    this.notificationService.loadNotificationDoc(row.documentId);
    this.notificationService.currentNotification = <NotificationDoc>row;
    this.router.navigate([`/notification`, row.documentId]);
  }

  onPageEvent(event) {
    if (this.pageSize !== event.pageSize) {
      this.pageSize = event.pageSize;
      this.resetPagination();
    } else {
      this.pageIndex = event.pageIndex;
      this.previousPageIndex = event.previousPageIndex;

      if (this.pageIndex < this.previousPageIndex) {
        this.bottomPageRows.pop();
        this.bottomPageRows.pop();
      }
    }

    // Show the length to be one page size longer, since we do not know the total number of documents
    this.length = (event.pageIndex + 1) * event.pageSize + event.pageSize;

    this.fetchPage(this.accountId);
  }

  onSelectAll(checked: boolean) {
    this.selectedIds.clear();
    if (checked) {
      this.dataSource.data.forEach((doc: NotificationDoc) => {
        doc.checked = true;
        this.selectedIds.add(doc.documentId);
      });
    } else {
      this.dataSource.data.forEach((doc: NotificationDoc) => {
        doc.checked = false;
      });
    }
  }

  onSelectOne(row: NotificationDoc, checked: boolean) {
    if (checked) {
      this.selectedIds.add(row.documentId);
    } else {
      this.selectedIds.delete(row.documentId);
    }
  }

  onDelete() {
    this.msg = null;
    this.confirmDeleteNotifications(this.selectedIds);
  }

  confirmDeleteNotifications(selectedIds: Set<string>) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Delete',
        msg: `Delete all selected notifications?`,
        no: 'Cancel',
        yes: 'OK'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        this.notificationService.deleteNotifications(selectedIds, 'notifications');
      }
    });
  }

  getActivityName(code) {
    return LANDMARK_ACTIVITIES.get(code);
  }

  resetPagination() {
    this.bottomPageRows = [0];
    this.pageIndex = 0;
    this.previousPageIndex = 0;
    this.length = 2 * this.pageSize;
  }

  rowBackground(row: NotificationDoc) {
    return this.isSelected(row) ? '#3f51b5' : '';
  }

  rowColor(row: NotificationDoc) {
    return this.isSelected(row) ? 'white' : '';
  }

  isSelected(row: NotificationDoc): boolean {
    const id = this.notificationService.getNotificationId();
    return row && id && id === row.documentId;
  }
}
