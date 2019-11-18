import { Component } from '@angular/core';
import { LOC_LANDMARK } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './location-landmark.component.html',
  styles: []
})
export class LocationLandmarkComponent {
  static page;
  public classRef = LocationLandmarkComponent;

  constructor() {
    LocationLandmarkComponent.page = LOC_LANDMARK;
  }
}
