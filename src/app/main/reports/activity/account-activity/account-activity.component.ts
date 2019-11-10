import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccountTraffic, ActivityReport, ActivityService } from '../activity.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AccountConstraint } from '../../../setup/accounts/account.service';
import { Subscription } from 'rxjs';

export interface Row {
  name: string;
  value: any;
  limit: any;
}

@Component({
  selector: 'app-account-activity',
  templateUrl: './account-activity.component.html',
  styleUrls: ['./account-activity.component.css']
})
export class AccountActivityComponent implements OnInit, OnDestroy {
  time: string;
  rows: Row[];

  accountSubscription: Subscription;

  constructor(private authService: AuthService,
              private activityService: ActivityService) {
  }

  ngOnInit() {
    this.time = new Date().toDateString();
    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      this.rows = [];
      if (!!accountId) {
        this.activityService.fetchAccountActivityInfo(accountId)
          .then((activityReport: ActivityReport) => {
            if (!!activityReport) {
              const record: AccountTraffic = activityReport.accountTraffic;
              const constraint: AccountConstraint = activityReport.accountConstraint;
              if (!!record && !!constraint) {
                this.rows = [];
                this.addRow('Service Expiration', '', constraint.serviceExpiration);
                this.addRow('Devices', activityReport.deviceCount, constraint.maxDevices);
                this.addRow('Landmarks', activityReport.landmarkCount, constraint.maxLandmarks);
                this.addRow('Users ', activityReport.userCount, constraint.maxUsers);
                this.addRow('Notification Subscribers', activityReport.subscriberCount, constraint.maxNotificationSubscribers);
                this.addRow('Events/Month', record.events, constraint.maxMonthlyEvents);
                this.addRow('Notification Emails/Month', record.emails, constraint.maxMonthlyNotificationEmails);
                this.addRow('Notification Texts/Month', record.texts, constraint.maxMonthlyNotificationTexts);
              }
            }
          });
      }
    });
  }

  ngOnDestroy() {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
  }

  addRow(name: string, value: any, limit: any) {
    this.rows.push({name: name, value: value, limit: limit});
  }
}
