import { Component, OnDestroy, OnInit } from '@angular/core';
import { DeviceEvent, UnitService } from '../unit.service';
import { PlaceService } from '../places/place.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-full-view',
  templateUrl: './full-view.component.html',
  styleUrls: ['./full-view.component.css']
})
export class FullViewComponent implements OnInit, OnDestroy {
  deviceId: string;
  documentId: string;

  unitHistoryDisabled = true;
  unitInfoDisabled = true;
  placesDisabled = false;

  private deviceSelectSubscription: Subscription;
  private enableDetailsSubscription: Subscription;

  constructor(private unitService: UnitService,
              private placeService: PlaceService) {
  }

  ngOnInit() {
    this.deviceSelectSubscription = this.unitService.itemSelect$.subscribe((deviceEvent: DeviceEvent) => {
      this.unitHistoryDisabled = !!!deviceEvent;
      if (!!deviceEvent) {
        this.deviceId = deviceEvent.deviceId;
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
  }

  ngOnDestroy() {
    if (this.deviceSelectSubscription) {
      this.deviceSelectSubscription.unsubscribe();
    }
    if (this.enableDetailsSubscription) {
      this.enableDetailsSubscription.unsubscribe();
    }
  }

  placeDisabled() {
    return !!!this.placeService.landmarkDoc;
  }
}
