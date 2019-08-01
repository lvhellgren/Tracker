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

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { MapService } from '../map/map.service';
import { GlobalService } from '../../../sevices/global';
import { StepDoc, UnitService } from '../unit.service';

@Component({
  selector: 'app-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.css']
})

export class UnitsComponent implements OnInit, OnDestroy, AfterViewInit {
  private lastStepSubscription: Subscription;
  public dataSource = new MatTableDataSource<StepDoc>();

  public displayedColumns = ['name', 'time', 'street', 'city'];

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  private tapCount = 0;

  constructor(private mapService: MapService,
              private unitService: UnitService,
              private route: ActivatedRoute,
              private router: Router,
              private global: GlobalService) {
  }

  ngOnInit() {
    this.lastStepSubscription = this.unitService.allLastSteps$.subscribe(steps => {
      this.dataSource.data = steps;
      this.mapService.setMarkers(steps);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (this.lastStepSubscription) {
      this.lastStepSubscription.unsubscribe();
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  onRowClick(row: StepDoc) {
    this.unitService.currentUnit = <StepDoc>row;
    this.mapService.setMarkers(this.dataSource.data);
  }

  onRowDblClick(row: StepDoc) {
    this.unitService.historyEndDate = this.unitService.historyStartDate = new Date(row.timestamp);
    this.unitService.currentUnit = <StepDoc>row;
    this.unitService.currentUnitStep = null;
    this.router.navigate([`/locations/${this.global.currentWidth}/unit-history`, row.deviceId]);
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
    if (row && this.unitService.currentUnit && this.unitService.currentUnit.deviceId === row.deviceId) {
      bg = '#3f51b5';
    }
    return bg;
  }

  rowColor(row) {
    let c = '';
    if (row && this.unitService.currentUnit && this.unitService.currentUnit.deviceId === row.deviceId) {
      c = 'white';
    }
    return c;
  }

  onPageEvent(event) {
    console.log('UnitsComponent.onPageEvent: ');
    console.dir(event);
  }
}
