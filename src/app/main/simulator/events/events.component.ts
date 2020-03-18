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
import { MatTableDataSource } from '@angular/material/table';
import { DeviceEvent } from '../../locations/unit.service';
import { NotificationDoc } from '../../notifications/notification.service';
import { Subscription } from 'rxjs';
import { GeoAddress, GeoService } from '../../core/geo-service/geo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SimulatorService } from '../simulator.service';
import * as firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import { AuthService } from '../../core/auth/auth.service';
import { HelpService, SIMULATOR_EVENTS } from '../../../drawers/help/help.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';


export interface SimulatorEvent extends DeviceEvent {
  addressLine: string;
}

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit, OnDestroy {
  private eventSubscription: Subscription;
  private msgSubscription: Subscription;
  private tapCount = 0;

  msg: string;
  dataSource = new MatTableDataSource<SimulatorEvent>();
  displayedColumns = [
    'trigger',
    'eventType',
    'deviceId',
    'email',
    'addressLine'
  ];

  // Page attributes:
  public pageIndex = 0;
  public previousPageIndex = 0;
  public startPageSize = 20;
  public pageSize = this.startPageSize;
  public pageSizeOptions = [this.startPageSize, 50, 100];
  public length = (this.pageIndex + 1) * this.pageSize + this.pageSize;
  private bottomPageRows: string[] = [''];

  constructor(private authService: AuthService,
              private simulatorService: SimulatorService,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private geoService: GeoService,
              private helpService: HelpService) {
  }

  ngOnInit() {
    this.fetchPage();

    this.msgSubscription = this.simulatorService.msg$.subscribe(msg => {
      this.msg = msg;
    });

    this.helpService.component$.next(SIMULATOR_EVENTS);
  }

  ngOnDestroy() {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    if (this.msgSubscription) {
      this.msgSubscription.unsubscribe();
    }
  }

  fetchPage() {
    this.eventSubscription =
      this.simulatorService.events$(this.bottomPageRows[this.bottomPageRows.length - 1], this.pageSize)
        .subscribe((simulatorEvents: SimulatorEvent[]) => {
          simulatorEvents.forEach((simulatorEvent) => {
            const geoAddress: GeoAddress = {
              subThoroughfare: simulatorEvent.address.subThoroughfare,
              thoroughfare: simulatorEvent.address.thoroughfare,
              locality: simulatorEvent.address.locality,
              area: simulatorEvent.address.area,
              postalCode: simulatorEvent.address.postalCode,
              subAdminArea: simulatorEvent.address.subAdminArea,
              countryName: simulatorEvent.address.countryName
            };
            simulatorEvent.addressLine = this.geoService.buildAddressLine(geoAddress);
          });
          this.dataSource.data = simulatorEvents;
          const fetchCount = simulatorEvents.length;
          this.bottomPageRows.push(simulatorEvents[fetchCount - 1].documentId);
          if (fetchCount === this.pageSize) {
            this.length = (this.pageIndex + 2) * this.pageSize;
          } else {
            this.length = this.pageIndex * this.pageSize + fetchCount;
          }
        },
          (error) => {
            this.dialog.open(ErrorDlgComponent, {
              data: {msg: error}
            });
        });
  }

  onRowTap(deviceEvent: DeviceEvent) {
    this.tapCount++;
    setTimeout(() => {
      if (this.tapCount === 1) {
        this.tapCount = 0;
        this.onRowClick(deviceEvent);
      }
      if (this.tapCount > 1) {
        this.tapCount = 0;
        this.onRowDblclick(deviceEvent);
      }
    }, 300);
  }

  onRowClick(deviceEvent: DeviceEvent) {
    this.simulatorService.setCurrentEvent(deviceEvent);
  }

  onRowDblclick(deviceEvent: DeviceEvent) {
    this.simulatorService.fetchEventDoc(deviceEvent.documentId);
    this.router.navigate([`/simulator/move-event`, deviceEvent.documentId]);
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

    this.fetchPage();
  }

  getTriggerColor(row: NotificationDoc) {
    return this.isSelected(row) ? 'accent' : 'primary';
  }

  onTrigger(simulatorEvent: SimulatorEvent) {
    const deviceEvent: DeviceEvent = {...simulatorEvent};
    delete deviceEvent['addressLine'];
    deviceEvent.deviceTime = Timestamp.now();
    deviceEvent.accountId = this.authService.currentUserAccountId;
    this.simulatorService.triggerEvent(deviceEvent);
  }

  resetPagination() {
    this.bottomPageRows = [''];
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
    const id = this.simulatorService.getCurrentEventId();
    return row && id && id === row.documentId;
  }
}
