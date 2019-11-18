import { Component } from '@angular/core';
import { PRINC_ACCOUNTS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './principal-accounts.component.html',
  styles: []
})
export class PrincipalAccountsComponent {
  static page;
  public classRef = PrincipalAccountsComponent;

  constructor() {
    PrincipalAccountsComponent.page = PRINC_ACCOUNTS;
  }
}
