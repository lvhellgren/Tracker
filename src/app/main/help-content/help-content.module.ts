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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CenterComponent } from './center/center.component';
import { LocationUnitsComponent } from './location-units/location-units.component';
import { LocationUnitDetailsComponent } from './location-unit-details/location-unit-details.component';
import { LocationUnitComponent } from './location-unit/location-unit.component';
import { LocationLandmarksComponent } from './location-landmarks/location-landmarks.component';
import { LocationLandmarkComponent } from './location-landmark/location-landmark.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ReportsComponent } from './reports/reports.component';
import { SetupComponent } from './setup/setup.component';
import { PrincipalAccountsComponent } from './principal-accounts/principal-accounts.component';
import { PrincipalAccountComponent } from './principal-account/principal-account.component';
import { PrincipalUsersComponent } from './principal-users/principal-users.component';
import { PrincipalDevicesComponent } from './principal-devices/principal-devices.component';
import { ActUserAccountsComponent } from './act-user-accounts/act-user-accounts.component';
import { ActUsersComponent } from './act-users/act-users.component';
import { ActUserComponent } from './act-user/act-user.component';
import { ActDevicesComponent } from './act-devices/act-devices.component';
import { ActDeviceComponent } from './act-device/act-device.component';
import { ActLandmarksComponent } from './act-landmarks/act-landmarks.component';
import { ActLandmarkComponent } from './act-landmark/act-landmark.component';
import { ActSubscriptionsComponent } from './act-subscriptions/act-subscriptions.component';
import { ActSubscriptionComponent } from './act-subscription/act-subscription.component';
import { ActSubscribersComponent } from './act-subscribers/act-subscribers.component';
import { ActSubscriberComponent } from './act-subscriber/act-subscriber.component';
import { NotificationComponent } from './notification/notification.component';
import { ActivityReportComponent } from './activity-report/activity-report.component';
import { SimulatorEventsComponent } from './simulator-events/simulator-events.component';
import { SimulatorMoveEventComponent } from './simulator-move-event/simulator-move-event.component';
import { PrincipalAccountConstraintsComponent } from './principal-account-constraints/principal-account-constraints.component';



@NgModule({
  declarations: [
    CenterComponent,
    LocationUnitsComponent,
    LocationUnitDetailsComponent,
    LocationUnitComponent,
    LocationLandmarksComponent,
    LocationLandmarkComponent,
    NotificationComponent,
    NotificationsComponent,
    ReportsComponent,
    SetupComponent,
    PrincipalAccountsComponent,
    PrincipalAccountComponent,
    PrincipalUsersComponent,
    PrincipalDevicesComponent,
    ActUserAccountsComponent,
    ActUsersComponent,
    ActUserComponent,
    ActDevicesComponent,
    ActDeviceComponent,
    ActLandmarksComponent,
    ActLandmarkComponent,
    ActSubscriptionsComponent,
    ActSubscriptionComponent,
    ActSubscribersComponent,
    ActSubscriberComponent,
    ActivityReportComponent,
    SimulatorEventsComponent,
    SimulatorMoveEventComponent,
    PrincipalAccountConstraintsComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CenterComponent
  ],
  entryComponents: [
    CenterComponent,
    LocationUnitsComponent,
    LocationUnitDetailsComponent,
    LocationUnitComponent,
    LocationLandmarksComponent,
    LocationLandmarkComponent,
    NotificationComponent,
    NotificationsComponent,
    ReportsComponent,
    SetupComponent,
    PrincipalAccountsComponent,
    PrincipalAccountComponent,
    PrincipalUsersComponent,
    PrincipalDevicesComponent,
    ActUserAccountsComponent,
    ActUsersComponent,
    ActUserComponent,
    ActDevicesComponent,
    ActDeviceComponent,
    ActLandmarksComponent,
    ActLandmarkComponent,
    ActSubscriptionsComponent,
    ActSubscriptionComponent,
    ActSubscribersComponent,
    ActSubscriberComponent,
    ActivityReportComponent,
    SimulatorEventsComponent,
    SimulatorMoveEventComponent,
    PrincipalAccountConstraintsComponent
  ]
})
export class HelpContentModule { }
