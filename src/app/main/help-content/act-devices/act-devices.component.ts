import { Component } from '@angular/core';
import { ACT_DEVICES } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './act-devices.component.html',
  styles: []
})
export class ActDevicesComponent {
  static page;
  public classRef = ActDevicesComponent;

  constructor() {
    ActDevicesComponent.page = ACT_DEVICES;
  }
}
