import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { DeviceEvent } from '../../locations/unit.service';
import { NotificationDoc } from '../../notifications/notification.service';
import { Subscription } from 'rxjs';
import { GeoAddress, GeoService } from '../../core/geo-service/geo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SimulatorService } from '../simulator.service';
import * as firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import { AuthService } from '../../core/auth/auth.service';


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
              private geoService: GeoService) {
  }

  ngOnInit() {
    this.fetchPage();

    this.msgSubscription = this.simulatorService.msg$.subscribe(msg => {
      this.msg = msg;
    });
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
