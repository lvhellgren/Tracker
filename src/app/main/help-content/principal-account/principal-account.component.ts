import { Component } from '@angular/core';
import { PRINC_ACCOUNT } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './principal-account.component.html',
  styles: []
})
export class PrincipalAccountComponent {
  static page;
  public classRef = PrincipalAccountComponent;

  constructor() {
    PrincipalAccountComponent.page = PRINC_ACCOUNT;
  }
}
