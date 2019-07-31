import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UnitService } from '../unit.service';

@Component({
  selector: 'app-small-view',
  templateUrl: './small-view.component.html',
  styleUrls: ['./small-view.component.css']
})
export class SmallViewComponent implements OnInit {

  constructor (public unitService: UnitService) { }

  ngOnInit() {
  }

  get unitId() {
    return this.unitService.currentUnit ? `/${this.unitService.currentUnit.deviceId}` : '';
  }

  get docId() {
    return this.unitService.currentUnit ? `/${this.unitService.currentUnit.documentId}` : '';
  }

  unitHistoryDisabled() {
    return this.unitService.currentUnit === undefined || this.unitService.currentUnit === null;
  }

  unitInfoDisabled() {
    return this.unitService.currentUnitStep === undefined || this.unitService.currentUnitStep === null;
  }

  placesDisabled() {
    return true;
  }

  placeDisabled() {
    return true;
  }
}
