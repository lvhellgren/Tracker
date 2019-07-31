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

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDlgComponent } from '../../../core/error-dlg/error-dlg.component';
import { DeviceDto, DeviceService } from '../device.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-account-devices',
  templateUrl: './account-devices.component.html',
  styleUrls: ['./account-devices.component.css']
})
export class AccountDevicesComponent implements OnInit, OnDestroy {

  deviceSubscription: Subscription;
  accountSubscription: Subscription;
  dataSource = new MatTableDataSource<DeviceDto>();

  displayedColumns = ['name', 'deviceId', 'active'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private authService: AuthService,
    private deviceService: DeviceService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router) {
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      this.deviceService.fetchAccountDevices(accountId);
    });

    this.deviceSubscription = this.deviceService.accountDevices$.subscribe(devices => {
      this.dataSource.data = devices;
    });
  }

  ngOnDestroy(): void {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }

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
      const dlg = this.dialog.open(ErrorDlgComponent, {
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
