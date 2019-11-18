import { Component } from '@angular/core';
import { LOC_UNIT } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './location-unit.component.html',
  styles: []
})
export class LocationUnitComponent {
  static page;
  public classRef = LocationUnitComponent;

  constructor() {
    LocationUnitComponent.page = LOC_UNIT;
  }
}
