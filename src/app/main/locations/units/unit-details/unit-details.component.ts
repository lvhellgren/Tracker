import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { UnitService } from '../../unit.service';
import { MapService } from '../../map/map.service';
import { GlobalService } from '../../../../sevices/global';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-unit-details',
  templateUrl: './unit-details.component.html',
  styleUrls: ['./unit-details.component.css']
})
export class UnitDetailsComponent implements OnInit, OnDestroy {
  private routeSubscription: Subscription;
  public unitName: String;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  constructor(public unitService: UnitService,
              private mapService: MapService,
              private global: GlobalService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.routeSubscription = this.route.params.subscribe((params: Params) => {
      let docId = params['id'];
      if (!docId && this.unitService.currentUnit) {
        docId = this.unitService.currentUnit.documentId;
      }
      if (docId) {
        this.unitName = this.unitService.getUnitName();
        this.unitService.loadHistoryDoc(docId);
      }
    });
  }

  get stepDoc() {
    return this.unitService.currentUnitStep;
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
