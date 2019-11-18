import { Component } from '@angular/core';
import { ACT_DEVICE } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './act-device.component.html',
  styles: []
})
export class ActDeviceComponent {
  static page;
  public classRef = ActDeviceComponent;

  constructor() {
    ActDeviceComponent.page = ACT_DEVICE;
  }
}
