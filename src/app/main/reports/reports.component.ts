import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SimulatorService } from '../simulator/simulator.service';
import { ReportService } from './report.service';
import { HelpService, REPORTS } from '../../drawers/help/help.service';

export const MENU_NAMES: Map<string, string> = new Map([
  ['blank', 'Reports']
]);

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  panelName: string;
  headerTitle: string;

  constructor(private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private reportService: ReportService,
              private helpService: HelpService) {
  }

  ngOnInit() {
    this.helpService.component$.next(REPORTS);
  }

  onActivate($event) {
    if ($event) {
      const childPath = this.router.url.split('/')[2];
      this.panelName = this.getMenuName(childPath);
      this.headerTitle = this.getMenuName(childPath);
    }
  }

  getMenuName(key: string) {
    if (key === '') {
      return '';
    }
    return MENU_NAMES.get(key);
  }
}
