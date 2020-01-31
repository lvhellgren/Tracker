import { Component, OnInit } from '@angular/core';
import { ACT_SERVICE_STATUS } from '../../../drawers/help/help.service';

@Component({
  selector: 'app-act-service-status',
  templateUrl: './act-service-status.component.html',
  styleUrls: []
})
export class ActServiceStatusComponent {
  static page;
  public classRef = ActServiceStatusComponent;

  constructor() {
    ActServiceStatusComponent.page = ACT_SERVICE_STATUS;
  }
}
