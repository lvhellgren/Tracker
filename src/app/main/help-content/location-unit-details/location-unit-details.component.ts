import { Component } from '@angular/core';
import { LOC_UNIT_DETAILS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './location-unit-details.component.html',
  styles: []
})
export class LocationUnitDetailsComponent {
  static page;
  public classRef = LocationUnitDetailsComponent;

  constructor() {
    LocationUnitDetailsComponent.page = LOC_UNIT_DETAILS;
  }
}
