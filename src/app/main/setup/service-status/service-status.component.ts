import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { constraintNames } from '../accounts/account.service';
import { ServiceStatusItem, ServiceStatusService } from './service-status.service';
import { ACT_NOTIFICATION_SUBSCRIBERS, ACT_SERVICE_STATUS, HelpService } from '../../../drawers/help/help.service';

@Component({
  selector: 'app-service-status',
  templateUrl: './service-status.component.html',
  styleUrls: ['./service-status.component.css']
})
export class ServiceStatusComponent implements OnInit, OnDestroy {
  private accountSubscription: Subscription;

  serviceStatus$: Observable<ServiceStatusItem[]>;

  constraintNames = constraintNames;

  constructor(private authService: AuthService,
              private serviceStatusService: ServiceStatusService,
              public helpService: HelpService) {
  }

  ngOnInit() {
    // Subscribe to account changes
    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      if (!!accountId) {
        this.serviceStatusService.fetchServiceStatus(accountId);
      }
    });

    this.serviceStatus$ = this.serviceStatusService.serviceStatus$;

    this.helpService.component$.next(ACT_SERVICE_STATUS);
  }

  ngOnDestroy() {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
  }

  isSpent(current: any, max: any) {
    if (current === '') {
      // Assume expiration date
      try {
        const monthYear = max.split('/', 2);
        const maxDate = new Date(+monthYear[1], +monthYear[0], 1, 0, 0, 0, 0);
        if (!(new Date() < maxDate)) {
          return true;
        }
      } catch (e) {
        console.error(`Error getting expiration date: ${e.toString()}`);
      }
    } else if (!(max > current)) {
      return true;
    }
    return false;
  }
}
