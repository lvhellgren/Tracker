import { Component } from '@angular/core';
import { PRINC_ACCOUNT_CONSTRAINTS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './principal-account-constraints.component.html',
  styles: []
})
export class PrincipalAccountConstraintsComponent {
  static page;
  public classRef = PrincipalAccountConstraintsComponent;

  constructor() {
    PrincipalAccountConstraintsComponent.page = PRINC_ACCOUNT_CONSTRAINTS;
  }
}
