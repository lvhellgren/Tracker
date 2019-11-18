import { Component } from '@angular/core';
import { ACT_USER_ACCOUNTS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './act-user-accounts.component.html',
  styles: []
})
export class ActUserAccountsComponent {
  static page;
  public classRef = ActUserAccountsComponent;

  constructor() {
    ActUserAccountsComponent.page = ACT_USER_ACCOUNTS;
  }
}
