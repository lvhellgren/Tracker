// Copyright (c) 2019 Lars Hellgren (lars@exelor.com).
// All rights reserved.
//
// This code is licensed under the MIT License.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files(the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions :
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { Component, ComponentFactoryResolver, ComponentRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import {
  ACT_DEVICE,
  ACT_LANDMARK,
  ACT_NOTIFICATION_SUBSCRIPTION,
  ACT_NOTIFICATION_SUBSCRIBER,
  ACT_USER,
  ACT_DEVICES,
  ACT_LANDMARKS,
  ACT_NOTIFICATION_SUBSCRIPTIONS,
  ACT_NOTIFICATION_SUBSCRIBERS,
  ACT_USER_ACCOUNTS,
  ACT_USERS,
  HELP_CENTER,
  HelpService,
  LOC_LANDMARK,
  LOC_LANDMARKS,
  LOC_UNIT,
  LOC_UNIT_DETAILS,
  LOC_UNITS,
  NOTIFICATIONS,
  NOTIFICATION,
  PRINC_ACCOUNT,
  PRINC_ACCOUNT_CONSTRAINTS,
  PRINC_ACCOUNTS,
  PRINC_DEVICES,
  PRINC_USERS,
  REPORTS,
  ACT_ACTIVITY_REPORT,
  SETUP,
  SIMULATOR_EVENTS,
  SIMULATOR_EVENT
} from './help.service';
import { ActDeviceComponent } from '../../main/help-content/act-device/act-device.component';
import { ActLandmarkComponent } from '../../main/help-content/act-landmark/act-landmark.component';
import { ActSubscriptionComponent } from '../../main/help-content/act-subscription/act-subscription.component';
import { ActSubscriberComponent } from '../../main/help-content/act-subscriber/act-subscriber.component';
import { ActUserComponent } from '../../main/help-content/act-user/act-user.component';
import { ActLandmarksComponent } from '../../main/help-content/act-landmarks/act-landmarks.component';
import { ActSubscribersComponent } from '../../main/help-content/act-subscribers/act-subscribers.component';
import { ActSubscriptionsComponent } from '../../main/help-content/act-subscriptions/act-subscriptions.component';
import { ActUsersComponent } from '../../main/help-content/act-users/act-users.component';
import { ActUserAccountsComponent } from '../../main/help-content/act-user-accounts/act-user-accounts.component';
import { CenterComponent } from '../../main/help-content/center/center.component';
import { LocationLandmarkComponent } from '../../main/help-content/location-landmark/location-landmark.component';
import { LocationLandmarksComponent } from '../../main/help-content/location-landmarks/location-landmarks.component';
import { LocationUnitComponent } from '../../main/help-content/location-unit/location-unit.component';
import { LocationUnitDetailsComponent } from '../../main/help-content/location-unit-details/location-unit-details.component';
import { LocationUnitsComponent } from '../../main/help-content/location-units/location-units.component';
import { PrincipalAccountComponent } from '../../main/help-content/principal-account/principal-account.component';
import { NotificationsComponent } from '../../main/help-content/notifications/notifications.component';
import { PrincipalAccountsComponent } from '../../main/help-content/principal-accounts/principal-accounts.component';
import { PrincipalDevicesComponent } from '../../main/help-content/principal-devices/principal-devices.component';
import { PrincipalUsersComponent } from '../../main/help-content/principal-users/principal-users.component';
import { ReportsComponent } from '../../main/help-content/reports/reports.component';
import { SetupComponent } from '../../main/help-content/setup/setup.component';
import { NotificationComponent } from '../../main/help-content/notification/notification.component';
import { ActivityReportComponent } from '../../main/help-content/activity-report/activity-report.component';
import { ActDevicesComponent } from '../../main/help-content/act-devices/act-devices.component';
import { SimulatorEventsComponent } from '../../main/help-content/simulator-events/simulator-events.component';
import { SimulatorMoveEventComponent } from '../../main/help-content/simulator-move-event/simulator-move-event.component';
// tslint:disable-next-line:max-line-length
import { PrincipalAccountConstraintsComponent } from '../../main/help-content/principal-account-constraints/principal-account-constraints.component';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit, OnDestroy {
  @Input() appdrawer;

  @ViewChild('entry', {static: false, read: ViewContainerRef})
  entry: ViewContainerRef;

  componentRef: ComponentRef<any>;

  componentSubscription: Subscription;

  currentComponent = '';

  public version: string = environment.VERSION;

  constructor(private resolver: ComponentFactoryResolver,
              private helpService: HelpService) {
  }

  ngOnInit() {
    this.componentSubscription = this.helpService.component$.subscribe((component: string) => {
      switch (component) {
        case HELP_CENTER: {
          this.insert(CenterComponent);
          break;
        }
        case ACT_DEVICE: {
          this.insert(ActDeviceComponent);
          break;
        }
        case ACT_LANDMARK: {
          this.insert(ActLandmarkComponent);
          break;
        }
        case ACT_NOTIFICATION_SUBSCRIPTION: {
          this.insert(ActSubscriptionComponent);
          break;
        }
        case ACT_NOTIFICATION_SUBSCRIBER: {
          this.insert(ActSubscriberComponent);
          break;
        }
        case ACT_USER: {
          this.insert(ActUserComponent);
          break;
        }
        case ACT_DEVICES: {
          this.insert(ActDevicesComponent);
          break;
        }
        case ACT_LANDMARKS: {
          this.insert(ActLandmarksComponent);
          break;
        }
        case ACT_NOTIFICATION_SUBSCRIPTIONS: {
          this.insert(ActSubscriptionsComponent);
          break;
        }
        case ACT_NOTIFICATION_SUBSCRIBERS: {
          this.insert(ActSubscribersComponent);
          break;
        }
        case ACT_USER_ACCOUNTS: {
          this.insert(ActUserAccountsComponent);
          break;
        }
        case ACT_USERS: {
          this.insert(ActUsersComponent);
          break;
        }
        case LOC_LANDMARK: {
          this.insert(LocationLandmarkComponent);
          break;
        }
        case LOC_LANDMARKS: {
          this.insert(LocationLandmarksComponent);
          break;
        }
        case LOC_UNIT: {
          this.insert(LocationUnitComponent);
          break;
        }
        case LOC_UNIT_DETAILS: {
          this.insert(LocationUnitDetailsComponent);
          break;
        }
        case LOC_UNITS: {
          this.insert(LocationUnitsComponent);
          break;
        }
        case NOTIFICATIONS: {
          this.insert(NotificationsComponent);
          break;
        }
        case NOTIFICATION: {
          this.insert(NotificationComponent);
          break;
        }
        case PRINC_ACCOUNT: {
          this.insert(PrincipalAccountComponent);
          break;
        }
        case PRINC_ACCOUNTS: {
          this.insert(PrincipalAccountsComponent);
          break;
        }
        case PRINC_ACCOUNT_CONSTRAINTS: {
          this.insert(PrincipalAccountConstraintsComponent);
          break;
        }
        case PRINC_DEVICES: {
          this.insert(PrincipalDevicesComponent);
          break;
        }
        case PRINC_USERS: {
          this.insert(PrincipalUsersComponent);
          break;
        }
        case REPORTS: {
          this.insert(ReportsComponent);
          break;
        }
        case ACT_ACTIVITY_REPORT: {
          this.insert(ActivityReportComponent);
          break;
        }
        case SETUP: {
          this.insert(SetupComponent);
          break;
        }
        case SIMULATOR_EVENTS: {
          this.insert(SimulatorEventsComponent);
          break;
        }
        case SIMULATOR_EVENT: {
          this.insert(SimulatorMoveEventComponent);
          break;
        }
        default: {
          this.insert(CenterComponent);
          break;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    if (this.componentSubscription) {
      this.componentSubscription.unsubscribe();
    }
  }

  insert<T>(component) {
    setTimeout(() => {
      this.entry.clear();
      const factory = this.resolver.resolveComponentFactory(component);
      this.componentRef = this.entry.createComponent(factory);
    }, 100);
  }

  onHelpCenterClick() {
    this.insert(CenterComponent);
  }

  close() {
    this.appdrawer.close();
  }
}
