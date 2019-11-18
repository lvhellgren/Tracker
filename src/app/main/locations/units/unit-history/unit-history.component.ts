import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UnitsMapService } from '../../units-map/units-map.service';
import { Subscription } from 'rxjs';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { DeviceEvent, UnitService } from '../../unit.service';
import { GlobalService } from '../../../../sevices/global';
import { FormControl } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { HelpService, LOC_UNIT } from '../../../../drawers/help/help.service';

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

  // Page attributes:
  public pageIndex = 0;
  public previousPageIndex = 0;
  public startPageSize = 20;
  public pageSize = this.startPageSize;
  public pageSizeOptions = [this.startPageSize, 50, 100];
  public length = (this.pageIndex + 1) * this.pageSize + this.pageSize;
  private bottomPageRows = [];

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  private tapCount = 0;

  private accountSubscription: Subscription;
  private routeSubscription: Subscription;
  private historySubscription: Subscription;

  constructor(private authService: AuthService,
              private unitService: UnitService,
              private mapService: UnitsMapService,
              private global: GlobalService,
              private router: Router,
              private route: ActivatedRoute,
              private helpService: HelpService) {
  }

  ngOnInit() {
    // Check for a different account being selected:
    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      if (!!!this.accountId) {
        this.accountId = accountId;
      } else if (this.accountId !== accountId) {
        this.router.navigate([`/locations/${this.global.currentWidth}/units`]);
        this.unitService.clear();
      }
    });

    if (!this.unitService.historyStartDate) {
      this.unitService.historyStartDate = new Date();
    }
    if (!this.unitService.historyEndDate) {
      this.unitService.historyEndDate = new Date();
    }
    this.startDate = new FormControl(this.unitService.historyStartDate);
    this.endDate = new FormControl(this.unitService.historyEndDate);

    this.routeSubscription = this.route.params.subscribe((params: Params) => {
      this.deviceId = params['id'] ? params['id'] : this.unitService.currentDeviceEvent;
      if (params['id']) {
        this.deviceId = params['id'];
      } else if (this.unitService.currentDeviceEvent) {
        this.deviceId = this.unitService.currentDeviceEvent.deviceId;
      }
      if (this.deviceId) {
        this.deviceName = this.unitService.getDeviceName();
        this.fetchPage(this.deviceId);
      }
    });

    this.helpService.component$.next(LOC_UNIT);
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
  }

  fetchPage(deviceId: String) {
    if (deviceId) {
      this.historySubscription = this.unitService.deviceEventHistory$(this.accountId, deviceId, this.startDate.value, this.endDate.value,
        this.bottomPageRows[this.bottomPageRows.length - 1], this.pageSize)
        .subscribe((deviceEvents: DeviceEvent[]) => {
          this.dataSource.data = deviceEvents;
          this.mapService.setMarkers(deviceEvents);
          const fetchCount = deviceEvents.length;
          if (fetchCount === this.pageSize) {
            this.bottomPageRows.push(deviceEvents[fetchCount - 1].deviceTime);
            this.length = (this.pageIndex + 2) * this.pageSize;
          } else {
            this.length = this.pageIndex * this.pageSize + fetchCount;
          }
        });
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

  onRowClick(deviceEvent: DeviceEvent) {
    this.unitService.currentDeviceEvent = deviceEvent;
    this.mapService.setMarkers(this.dataSource.data);
  }

  onRowDblClick(deviceEvent: DeviceEvent) {
    this.unitService.currentDeviceEvent = deviceEvent;
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
    if (row && this.unitService.currentDeviceEvent && this.unitService.currentDeviceEvent.documentId === row.documentId) {
      bg = '#3f51b5';
    }
    return bg;
  }

  rowColor(row) {
    let c = '';
    if (row && this.unitService.currentDeviceEvent && this.unitService.currentDeviceEvent.documentId === row.documentId) {
      c = 'white';
    }
    return c;
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

    this.fetchPage(this.deviceId);
  }

  onStartDateChange($event) {
    const startDate: Date = new Date($event.value);
    let endDate: Date = this.endDate.value;
    if (endDate < startDate) {
      endDate = startDate;
    }
    this.resetQuery(startDate, endDate);
    this.fetchPage(this.deviceId);
  }

  onEndDateChange($event) {
    let startDate: Date = this.startDate.value;
    const endDate: Date = new Date($event.value);
    if (endDate < startDate) {
      startDate = endDate;
    }
    this.resetQuery(startDate, endDate);
    this.fetchPage(this.deviceId);
  }

  resetQuery(startDate: Date, endDate: Date) {
    this.startDate = new FormControl(startDate);
    this.endDate = new FormControl(endDate);
    this.unitService.historyStartDate = startDate;
    this.unitService.historyEndDate = endDate;
    this.resetPagination();
  }

  resetPagination() {
    this.bottomPageRows = [null];
    this.pageIndex = 0;
    this.previousPageIndex = 0;
    this.length = 2 * this.pageSize;
  }
}
