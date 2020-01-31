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
import { Subscription } from 'rxjs';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { DeviceDto, DeviceService } from '../device.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDlgComponent } from '../../../core/error-dlg/error-dlg.component';
import { HelpService, PRINC_DEVICES } from '../../../../drawers/help/help.service';

@Component({
  selector: 'app-all-devices',
  templateUrl: './all-devices.component.html',
  styleUrls: ['./all-devices.component.css']
})
export class AllDevicesComponent implements OnInit, OnDestroy {

  deviceSubscription: Subscription;
  dataSource = new MatTableDataSource<DeviceDto>();

  displayedColumns = ['name', 'deviceId', 'accountId', 'active'];

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  constructor(
    private authService: AuthService,
    private deviceService: DeviceService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private helpService: HelpService) {
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.deviceSubscription = this.deviceService.fetchAllDevices$().subscribe((devices: DeviceDto[]) => {
      this.dataSource.data = devices;
    });

    this.helpService.component$.next(PRINC_DEVICES);
  }

  ngOnDestroy(): void {
    if (this.deviceSubscription) {
      this.deviceSubscription.unsubscribe();
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

  onDeviceClick(row) {
    if (row.deviceId) {
      this.router.navigate([`../account-device-details`, row.deviceId], {relativeTo: this.route});
    } else {
      const msg = 'Invalid device data in table row';
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: msg}
      });
      console.error(msg);
    }
  }

  rowBackground(row) {
    return this.isSelected(row) ? '#3f51b5' : '';
  }

  rowColor(row) {
    return this.isSelected(row) ? 'white' : '';
  }

  isSelected(row): boolean {
    const deviceId = this.deviceService.getDeviceId();
    return row && deviceId && deviceId === row.deviceId;
  }
}
