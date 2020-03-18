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
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DeviceEvent, UnitService } from '../../unit.service';
import { GlobalService } from '../../../../sevices/global';
import { FormControl } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { HelpService, LOC_UNIT } from '../../../../drawers/help/help.service';
import { DEFAULT_PAGE_SIZE, UserPreferences, UserPreferencesService } from '../../../../sevices/user-preferences.service';

@Component({
  selector: 'app-unit',
  templateUrl: './unit-history.component.html',
  styleUrls: ['./unit-history.component.css'],
})
export class UnitHistoryComponent implements OnInit, OnDestroy {
  public dataSource = new MatTableDataSource<DeviceEvent>();
  public displayedColumns = ['time', 'street', 'city', 'landmarks'];

  public startDate;
  public endDate;
  public maxStartDate = new Date();
  public maxEndDate = new Date();

  private accountId: string;
  private deviceId: string;
  public deviceName: String;
  public documentId: String;

  // Page attributes:
  public pageIndex = 0;
  public previousPageIndex = 0;
  public pageSize = DEFAULT_PAGE_SIZE;
  public pageSizeOptions = [this.pageSize, 25, 50, 100];
  public length = (this.pageIndex + 1) * this.pageSize + this.pageSize;
  private bottomPageRows = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private tapCount = 0;

  private accountChangeSubscription: Subscription;
  private routeSubscription: Subscription;
  private historySubscription: Subscription;
  private userPreferencesSubscription: Subscription;
  private itemSelectSubscription: Subscription;
  private lastMoveSubscription: Subscription;
  private markerDblclickSubscription: Subscription;

  constructor(private authService: AuthService,
              private unitService: UnitService,
              private global: GlobalService,
              private userPreferencesService: UserPreferencesService,
              private router: Router,
              private route: ActivatedRoute,
              private helpService: HelpService) {
  }

  ngOnInit() {
    this.startDate = new FormControl(new Date());
    this.endDate = new FormControl(new Date());

    // Check for a different account being selected:
    this.accountChangeSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      if (!!!this.accountId) {
        this.accountId = accountId;
      } else if (this.accountId !== accountId) {
        this.router.navigate([`/locations/${this.global.currentWidth}/units`]);
      }
    });

    // Get user preferences:
    this.userPreferencesSubscription = this.userPreferencesService.userPreferences$.subscribe((preferences: UserPreferences) => {
      this.pageSize = !!preferences.pageSize ? preferences.pageSize : DEFAULT_PAGE_SIZE;
      const newOptions = [this.pageSize];
      for (const option of this.pageSizeOptions) {
        if (option !== this.pageSize) {
          newOptions.push(option);
        }
      }
      this.pageSizeOptions = newOptions;
    });

    // Handle URL with device ID parameter:
    this.routeSubscription = this.route.params.subscribe((params: Params) => {
      this.deviceId = params['id'];
      if (this.deviceId) {
        this.showMostRecentEvents(this.deviceId);
      }
    });

    // Handle map marker clicks:
    this.itemSelectSubscription = this.unitService.itemSelect$.subscribe((deviceEvent: DeviceEvent) => {
      if (!!deviceEvent) {
        this.documentId = deviceEvent.documentId;
      }
    });

    // Handle map marker double clicks:
    this.markerDblclickSubscription = this.unitService.markerDblclick$.subscribe((deviceEvent: DeviceEvent) => {
      if (!!deviceEvent) {
        this.onRowDblClick(deviceEvent);
      }
    });

    // Set up help context:
    this.helpService.component$.next(LOC_UNIT);
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.accountChangeSubscription) {
      this.accountChangeSubscription.unsubscribe();
    }
    if (this.historySubscription) {
      this.historySubscription.unsubscribe();
    }
    if (this.userPreferencesSubscription) {
      this.userPreferencesSubscription.unsubscribe();
    }
    if (this.itemSelectSubscription) {
      this.itemSelectSubscription.unsubscribe();
    }
    if (this.lastMoveSubscription) {
      this.lastMoveSubscription.unsubscribe();
    }
    if (this.markerDblclickSubscription) {
      this.markerDblclickSubscription.unsubscribe();
    }
  }

  fetchPage(deviceId: String) {
    if (deviceId) {
      if (this.historySubscription) {
        this.historySubscription.unsubscribe();
      }
      this.historySubscription = this.unitService.deviceEventHistory$(this.accountId, deviceId, this.startDate.value, this.endDate.value,
        this.bottomPageRows[this.bottomPageRows.length - 1], this.pageSize)
        .subscribe((deviceEvents: DeviceEvent[]) => {
          const fetchCount = deviceEvents.length;
          if (fetchCount > 0) {
            this.deviceName = deviceEvents[0].deviceName;
            this.dataSource.data = deviceEvents;
            this.unitService.updateMap(deviceEvents);
            if (fetchCount === this.pageSize) {
              this.bottomPageRows.push(deviceEvents[fetchCount - 1].deviceTime);
              this.length = (this.pageIndex + 2) * this.pageSize;
            } else {
              this.length = this.pageIndex * this.pageSize + fetchCount;
            }
          }
        });
    }
  }

  showMostRecentEvents(deviceId: string) {
    this.lastMoveSubscription = this.unitService.lastMove$(this.accountId, this.deviceId).subscribe((event: any[]) => {
        if (event.length > 0) {
          const lastDay = new Date(event[0].deviceTime.toDate());
          this.startDate = new FormControl(lastDay);
          this.endDate = new FormControl(lastDay);
          this.fetchPage(deviceId);
        } else {
          console.error('Failed reading device: ' + deviceId);
        }
      }, (error) => {
        console.error(error);
      }
    );
  }

  getLandmarkIds(landmarks: any[]) {
    let ids = '';
    if (!!landmarks) {
      landmarks.forEach((landmark) => {
        if (ids.length > 0) {
          ids += ', ';
        }
        ids += landmark.landmarkId;
      });
    }
    return ids;
  }

  onRowClick(deviceEvent: DeviceEvent) {
    this.documentId = deviceEvent.documentId;
    this.unitService.onItemSelect(deviceEvent);
    this.unitService.enableDetails(deviceEvent.documentId);
  }

  onRowDblClick(deviceEvent: DeviceEvent) {
    this.unitService.onItemSelect(deviceEvent);
    this.unitService.enableDetails(deviceEvent.documentId);
    this.router.navigate([`/locations/${this.global.currentWidth}/unit-details`, deviceEvent.documentId]);
  }

  // To handle click and dblClick also for mobile devices
  onRowTap(deviceEvent: DeviceEvent) {
    this.tapCount++;
    setTimeout(() => {
      if (this.tapCount === 1) {
        this.tapCount = 0;
        this.onRowClick(deviceEvent);
      }
      if (this.tapCount > 1) {
        this.tapCount = 0;
        this.onRowDblClick(deviceEvent);
      }
    }, 300);
  }

  rowBackground(row) {
    let bg = '';
    if (row && this.documentId === row.documentId) {
      bg = '#3f51b5';
    }
    return bg;
  }

  rowColor(row) {
    let c = '';
    if (row && this.documentId === row.documentId) {
      c = 'white';
    }
    return c;
  }

  onPageEvent(event) {
    if (this.pageSize !== event.pageSize) {
      this.pageSize = event.pageSize;
      this.userPreferencesService.saveUserPreference('pageSize', this.pageSize);
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

    this.fetchPage(this.deviceId);
  }

  onStartDateChange($event) {
    const startDate: Date = new Date($event.value);
    let endDate: Date = this.endDate.value;
    if (endDate < startDate) {
      endDate = startDate;
    }
    this.applyDateRangeChange(startDate, endDate);
    this.fetchPage(this.deviceId);
  }

  onEndDateChange($event) {
    let startDate: Date = this.startDate.value;
    const endDate: Date = new Date($event.value);
    if (endDate < startDate) {
      startDate = endDate;
    }
    this.applyDateRangeChange(startDate, endDate);
    this.fetchPage(this.deviceId);
  }

  applyDateRangeChange(startDate: Date, endDate: Date) {
    this.startDate = new FormControl(startDate);
    this.endDate = new FormControl(endDate);
    this.resetPagination();
  }

  resetPagination() {
    this.bottomPageRows = [null];
    this.pageIndex = 0;
    this.previousPageIndex = 0;
    this.length = 2 * this.pageSize;
  }
}
