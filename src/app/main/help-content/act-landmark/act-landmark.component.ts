import { Component, OnInit } from '@angular/core';
import { ACT_LANDMARK } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './act-landmark.component.html',
  styles: []
})
export class ActLandmarkComponent {
  static page;
  public classRef = ActLandmarkComponent;

  constructor() {
    ActLandmarkComponent.page = ACT_LANDMARK;
  }
}
