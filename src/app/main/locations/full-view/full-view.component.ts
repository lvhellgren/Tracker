import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UnitService } from '../unit.service';
import { PlaceService } from '../places/place.service';

@Component({
  selector: 'app-full-view',
  templateUrl: './full-view.component.html',
  styleUrls: ['./full-view.component.css']
})
export class FullViewComponent implements OnInit {

  constructor(private unitService: UnitService,
              private placeService: PlaceService) { }

  ngOnInit() {
  }

  get unitId() {
    return this.unitService.currentDeviceEvent ? `/${this.unitService.currentDeviceEvent.deviceId}` : '';
  }

  get docId() {
    return this.unitService.currentDeviceEvent ? `/${this.unitService.currentDeviceEvent.documentId}` : '';
  }

  unitHistoryDisabled() {
    return !!!this.unitService.currentDeviceEvent;
  }

  unitInfoDisabled() {
    return !!!this.unitService.currentDeviceEvent;
  }

  placesDisabled() {
    return false;
  }

  placeDisabled() {
    return !!!this.placeService.landmarkDoc;
  }
}
