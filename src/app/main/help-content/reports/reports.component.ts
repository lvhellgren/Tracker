import { Component } from '@angular/core';
import { REPORTS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './reports.component.html',
  styles: []
})
export class ReportsComponent {
  static page;
  public classRef = ReportsComponent;

  constructor() {
    ReportsComponent.page = REPORTS;
  }
}
