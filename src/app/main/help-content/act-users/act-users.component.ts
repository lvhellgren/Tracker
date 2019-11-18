import { Component } from '@angular/core';
import { ACT_USERS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './act-users.component.html',
  styles: []
})
export class ActUsersComponent {
  static page;
  public classRef = ActUsersComponent;

  constructor() {
    ActUsersComponent.page = ACT_USERS;
  }
}
