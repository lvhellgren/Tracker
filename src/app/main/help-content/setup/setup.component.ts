import { Component, OnInit } from '@angular/core';
import { SETUP } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './setup.component.html',
  styles: []
})
export class SetupComponent {
  static page;
  public classRef = SetupComponent;

  constructor() {
    SetupComponent.page = SETUP;
  }
}
