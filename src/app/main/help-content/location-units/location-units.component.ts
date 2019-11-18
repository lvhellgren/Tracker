import { Component } from '@angular/core';
import { LOC_UNITS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './location-units.component.html',
  styles: []
})
export class LocationUnitsComponent {
  static page;
  public classRef = LocationUnitsComponent;

  constructor() {
    LocationUnitsComponent.page = LOC_UNITS;
  }
}
