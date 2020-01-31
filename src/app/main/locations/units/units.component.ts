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

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitsMapService } from '../units-map/units-map.service';
import { GlobalService } from '../../../sevices/global';
import { DeviceEvent, UnitService } from '../unit.service';
import { AuthService } from '../../core/auth/auth.service';
import { CenterComponent } from '../../help-content/center/center.component';
import { HelpService, LOC_UNITS } from '../../../drawers/help/help.service';

@Component({
  selector: 'app-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.css']
})

export class UnitsComponent implements OnInit, OnDestroy, AfterViewInit {
  public dataSource = new MatTableDataSource<DeviceEvent>();

  public displayedColumns = ['deviceName', 'deviceTime', 'street', 'city', 'landmarks'];

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  private tapCount = 0;

  private accountSubscription: Subscription;
  private lastMoveSubscription: Subscription;

  constructor(private authService: AuthService,
              private mapService: UnitsMapService,
              private unitService: UnitService,
              private route: ActivatedRoute,
              private router: Router,
              private global: GlobalService,
              private helpService: HelpService) {
  }

  ngOnInit() {
    // Issue last-moves fetch request for the selected account:
    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      this.unitService.fetchLastMoves(accountId);
    });

    // Receive response to last-moves fetch request:
    this.lastMoveSubscription = this.unitService.lastMoves$.subscribe((deviceEvents: DeviceEvent[]) => {
      this.dataSource.data = deviceEvents;
      this.mapService.setMarkers(deviceEvents);
    });

    this.helpService.component$.next(LOC_UNITS);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
    if (this.lastMoveSubscription) {
      this.lastMoveSubscription.unsubscribe();
    }
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

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  onRowClick(deviceEvent: DeviceEvent) {
    this.unitService.currentDeviceEvent = <DeviceEvent>deviceEvent;
    this.mapService.setMarkers(this.dataSource.data);
  }

  onRowDblClick(deviceEvent: DeviceEvent) {
    this.unitService.historyEndDate = this.unitService.historyStartDate = new Date(deviceEvent.deviceTime.toDate());
    this.unitService.currentDeviceEvent = <DeviceEvent>deviceEvent;
    this.router.navigate([`/locations/${this.global.currentWidth}/unit-history`, deviceEvent.deviceId]);
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
    if (row && this.unitService.currentDeviceEvent && this.unitService.currentDeviceEvent.deviceId === row.deviceId) {
      bg = '#3f51b5';
    }
    return bg;
  }

  rowColor(row) {
    let c = '';
    if (row && this.unitService.currentDeviceEvent && this.unitService.currentDeviceEvent.deviceId === row.deviceId) {
      c = 'white';
    }
    return c;
  }

  onPageEvent(event) {
    console.log('UnitsComponent.onPageEvent: ');
    console.dir(event);
  }
}
