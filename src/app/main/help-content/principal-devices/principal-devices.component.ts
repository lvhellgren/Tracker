import { Component } from '@angular/core';
import { PRINC_DEVICES } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './principal-devices.component.html',
  styles: []
})
export class PrincipalDevicesComponent {
  static page;
  public classRef = PrincipalDevicesComponent;

  constructor() {
    PrincipalDevicesComponent.page = PRINC_DEVICES;
  }
}
