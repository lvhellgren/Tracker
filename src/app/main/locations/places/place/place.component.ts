import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlaceDoc, PlaceService, UnitInfo } from '../place.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LandmarkService } from '../../../setup/landmarks/landmark.service';
import * as moment from 'moment';
import { HelpService, LOC_LANDMARK } from '../../../../drawers/help/help.service';


export interface Row {
  name: string;
  value: any;
  rowspan: number;
}

@Component({
  selector: 'app-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.css']
})
export class PlaceComponent implements OnInit, OnDestroy {
  public landmarkId: string;
  public rows: Row[];

  private accountId: string;
  private accountSubscription: Subscription;
  private routeSubscription: Subscription;
  private landmarkSubscription: Subscription;

  constructor(private authService: AuthService,
              private placeService: PlaceService,
              private router: Router,
              private route: ActivatedRoute,
              private helpService: HelpService) {
  }

  ngOnInit() {
    // Subscribe to account changes
    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      if (!!this.accountId && this.accountId !== accountId) {
        this.router.navigate(['../'], {relativeTo: this.route});
      } else {
        this.accountId = accountId;
      }
    });

    this.routeSubscription = this.route.params.subscribe((params: Params) => {
      let docId = params['id'];
      if (!docId && this.placeService.landmarkDoc) {
        docId = LandmarkService.makeAccountLandmarkKey(this.authService.currentUserAccountId, this.placeService.landmarkDoc.landmarkId);
      }
      if (docId) {
        this.placeService.fetchLandmark(docId);
      }
    });

    this.landmarkSubscription = this.placeService.landmarks$.subscribe((docs: PlaceDoc[]) => {
      if (!!docs) {
        this.rows = [];
        const doc: PlaceDoc = docs[0];
        if (!!doc) {
          const unitNames: string[] = this.getUnitsPresent(doc);
          this.landmarkId = doc.landmarkId;
          this.addRow('Landmark ID', doc.landmarkId);
          this.addRow('Units Present', unitNames, unitNames.length > 1 ? unitNames.length : 1);
          this.addRow('Fence Radius (meters)', doc.radius);
          this.addRow('Latitude', doc.latitude);
          this.addRow('Longitude', doc.longitude);
          this.addRow('Last Modified', moment(doc.modifiedAt.toDate()).format('YYYY-MM-DD, HH:mm:ss'));
          this.addRow('Notes', doc.comment);
        }
      }
    });

    this.helpService.component$.next(LOC_LANDMARK);
  }

  ngOnDestroy() {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.landmarkSubscription) {
      this.landmarkSubscription.unsubscribe();
    }
  }

  addRow(name: string, value: any, rowspan: number = 1) {
    this.rows.push({name: name, value: value, rowspan: rowspan});
  }

  getUnitsPresent(placeDoc: PlaceDoc) {
    const names: string[] = [];
    if (!!placeDoc.unitsPresent) {
      placeDoc.unitsPresent.forEach(((unit: UnitInfo) => {
        names.push(unit.deviceName);
      }));
    }
    return names;
  }
}
