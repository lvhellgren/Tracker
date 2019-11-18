import { Component } from '@angular/core';
import { PRINC_USERS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './principal-users.component.html',
  styles: []
})
export class PrincipalUsersComponent {
  static page;
  public classRef = PrincipalUsersComponent;

  constructor() {
    PrincipalUsersComponent.page = PRINC_USERS;
  }
}
