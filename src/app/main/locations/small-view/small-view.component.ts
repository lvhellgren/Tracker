import { Component, OnDestroy, OnInit } from '@angular/core';
import { DeviceEvent, UnitService } from '../unit.service';
import { PlaceService } from '../places/place.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-small-view',
  templateUrl: './small-view.component.html',
  styleUrls: ['./small-view.component.css']
})
export class SmallViewComponent implements OnInit, OnDestroy {
  deviceId: string;
  documentId: string;

  unitHistoryDisabled = true;
  unitInfoDisabled = true;

  private deviceSelectSubscription: Subscription;
  private enableDetailsSubscription: Subscription;

  constructor(private unitService: UnitService,
              private placeService: PlaceService) {
  }

  ngOnInit() {
    this.deviceSelectSubscription = this.unitService.itemSelect$.subscribe((deviceEvent: DeviceEvent) => {
      this.unitHistoryDisabled = this.unitInfoDisabled = !!!deviceEvent;
      if (!!deviceEvent) {
        this.deviceId = deviceEvent.deviceId;
        this.documentId = deviceEvent.documentId;
        this.unitHistoryDisabled = this.unitInfoDisabled = false;
      } else {
        this.unitHistoryDisabled = this.unitInfoDisabled = true;
      }
    });

    this.enableDetailsSubscription = this.unitService.hasDetails$.subscribe(documentId => {
      if (!!documentId) {
        this.documentId = documentId;
        this.unitInfoDisabled = false;
      } else {
        this.unitInfoDisabled = true;
      }
    });

    if (this.enableDetailsSubscription) {
      this.enableDetailsSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    if (this.deviceSelectSubscription) {
      this.deviceSelectSubscription.unsubscribe();
    }
  }

  placeDisabled() {
    return !!!this.placeService.landmarkDoc;
  }
}
