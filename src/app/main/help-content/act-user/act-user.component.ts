import { Component } from '@angular/core';
import { ACT_USER } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './act-user.component.html',
  styles: []
})
export class ActUserComponent {
  static page;
  public classRef = ActUserComponent;

  constructor() {
    ActUserComponent.page = ACT_USER;
  }
}
