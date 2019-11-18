import { Component } from '@angular/core';
import { ACT_LANDMARKS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './act-landmarks.component.html',
  styles: []
})
export class ActLandmarksComponent {
  static page;
  public classRef = ActLandmarksComponent;

  constructor() {
    ActLandmarksComponent.page = ACT_LANDMARKS;
  }
}
