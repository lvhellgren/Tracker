import { Component } from '@angular/core';
import { LOC_LANDMARKS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './location-landmarks.component.html',
  styles: []
})
export class LocationLandmarksComponent {
  static page;
  public classRef = LocationLandmarksComponent;

  constructor() {
    LocationLandmarksComponent.page = LOC_LANDMARKS;
  }
}
