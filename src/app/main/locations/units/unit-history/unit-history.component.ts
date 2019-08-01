import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MapService } from '../../map/map.service';
import { Subscription } from 'rxjs';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { StepDoc, UnitService } from '../../unit.service';
import { GlobalService } from '../../../../sevices/global';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-unit',
  templateUrl: './unit-history.component.html',
  styleUrls: ['./unit-history.component.css'],
})
export class UnitHistoryComponent implements OnInit, OnDestroy {

  public dataSource = new MatTableDataSource<StepDoc>();
  public displayedColumns = ['time', 'street', 'city'];

  private routeSubscription: Subscription;
  private historySubscription: Subscription;

  public startDate;
  public endDate;
  public maxStartDate = new Date();
  public maxEndDate = new Date();

  private unitId: string;
  public unitName: String;

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

  private tapCount = 0;

  constructor(public unitService: UnitService,
              private mapService: MapService,
              private global: GlobalService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    if (!this.unitService.historyStartDate) {
      this.unitService.historyStartDate = new Date();
    }
    if (!this.unitService.historyEndDate) {
      this.unitService.historyEndDate = new Date();
    }
    this.startDate = new FormControl(this.unitService.historyStartDate);
    this.endDate = new FormControl(this.unitService.historyEndDate);

    this.routeSubscription = this.route.params.subscribe((params: Params) => {
      this.unitId = params['id'] ? params['id'] : this.unitService.currentUnit;
      if (params['id']) {
        this.unitId = params['id'];
      } else if (this.unitService.currentUnit) {
        this.unitId = this.unitService.currentUnit.deviceId;
      }
      if (this.unitId) {
        this.unitName = this.unitService.getUnitName();
        this.fetchPage(this.unitId);
      }
    });
  }

  fetchPage(unitId: String) {
    if (this.unitId) {
      this.historySubscription = this.unitService.unitHistory$(unitId, this.startDate.value, this.endDate.value,
        this.bottomPageRows[this.bottomPageRows.length - 1], this.pageSize)
        .subscribe(steps => {
          this.dataSource.data = steps;
          this.mapService.setMarkers(steps);
          const fetchCount = steps.length;
          if (fetchCount === this.pageSize) {
            this.bottomPageRows.push(steps[fetchCount - 1].timestamp);
            this.length = (this.pageIndex + 2) * this.pageSize;
          } else {
            this.length = this.pageIndex * this.pageSize + fetchCount;
          }
        });
    }
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  onRowClick(row: StepDoc) {
    this.unitService.currentUnitStep = row;
    this.mapService.setMarkers(this.dataSource.data);
  }

  onRowDblClick(row: StepDoc) {
    this.unitService.currentUnitStep = row;
    this.router.navigate([`/locations/${this.global.currentWidth}/unit-details`, row.documentId]);
  }

  // To handle click and dblClick also for mobile devices
  onRowTap(row: StepDoc) {
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
    let bg = '';
    if (row && this.unitService.currentUnitStep && this.unitService.currentUnitStep.documentId === row.documentId) {
      bg = '#3f51b5';
    }
    return bg;
  }

  rowColor(row) {
    let c = '';
    if (row && this.unitService.currentUnitStep && this.unitService.currentUnitStep.documentId === row.documentId) {
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

    this.fetchPage(this.unitId);
  }

  onStartDateChange($event) {
    const startDate: Date = new Date($event.value);
    let endDate: Date = this.endDate.value;
    if (endDate < startDate) {
      endDate = startDate;
    }
    this.resetQuery(startDate, endDate);
    this.fetchPage(this.unitId);
  }

  onEndDateChange($event) {
    let startDate: Date = this.startDate.value;
    const endDate: Date = new Date($event.value);
    if (endDate < startDate) {
      startDate = endDate;
    }
    this.resetQuery(startDate, endDate);
    this.fetchPage(this.unitId);
  }

  resetQuery(startDate: Date, endDate: Date) {
    this.startDate = new FormControl(startDate);
    this.endDate = new FormControl(endDate);
    this.unitService.historyStartDate = startDate;
    this.unitService.historyEndDate = endDate;
    this.resetPagination();
  }

  resetPagination() {
    this.bottomPageRows = [0];
    this.pageIndex = 0;
    this.previousPageIndex = 0;
    this.length = 2 * this.pageSize;
    this.bottomPageRows = [];
  }
}
