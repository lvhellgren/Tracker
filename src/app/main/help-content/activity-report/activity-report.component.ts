import { Component, OnInit } from '@angular/core';
import { ACT_USERS, ACT_ACTIVITY_REPORT } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './activity-report.component.html',
  styles: []
})
export class ActivityReportComponent {
  static page;
  public classRef = ActivityReportComponent;

  constructor() {
    ActivityReportComponent.page = ACT_ACTIVITY_REPORT;
  }
}
