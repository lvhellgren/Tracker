// Copyright (c) 2020 Lars Hellgren.
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

import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupComponent } from './setup.component';
import { AccountsComponent } from './accounts/accounts.component';
import { CoreModule } from '../core/core.module';
import { AppAngularMaterialModule } from '../../app-angular-material.module';
import { UserService } from './users/user.service';
import { UserComponent } from './users/user/user.component';
import { AccountComponent } from './accounts/account/account.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AccountService } from './accounts/account.service';
import { SetupRoutingModule } from './setup-routing.module';
import { BlankComponent } from './blank/blank.component';
import { AllUsersComponent } from './users/all-users/all-users.component';
import { AccountUsersComponent } from './users/account-users/account-users.component';
import { AllDevicesComponent } from './devices/all-devices/all-devices.component';
import { DeviceComponent } from './devices/device/device.component';
import { DeviceService } from './devices/device.service';
import { LandmarksComponent } from './landmarks/landmarks.component';
import { LandmarksMapComponent } from './landmarks/landmarks-map/landmarks-map.component';
import { LandmarkComponent } from './landmarks/landmark/landmark.component';
import { LandmarkMapComponent } from './landmarks/landmark/landmark-map/landmark-map.component';
import { AppMapModule } from '../../app-map.module';
import { AccountDevicesComponent } from './devices/account-devices/account-devices.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { SubscriptionComponent } from './subscriptions/subscription/subscription.component';
import { SubscribersComponent } from './subscribers/subscribers.component';
import { SubscriberComponent } from './subscribers/subscriber/subscriber.component';
import { AccountConstraintsComponent } from './accounts/account-constraints/account-constraints.component';
import { ServiceStatusComponent } from './service-status/service-status.component';

@NgModule({
  imports: [
    FlexLayoutModule,
    CommonModule,
    CoreModule,
    AppMapModule,
    SetupRoutingModule,
    AppAngularMaterialModule
  ],
  declarations: [
    SetupComponent,
    AccountsComponent,
    UserComponent,
    AccountComponent,
    BlankComponent,
    AllUsersComponent,
    AccountUsersComponent,
    AllDevicesComponent,
    DeviceComponent,
    AccountDevicesComponent,
    LandmarksComponent,
    LandmarksMapComponent,
    LandmarkComponent,
    LandmarkMapComponent,
    SubscriptionsComponent,
    SubscriptionComponent,
    SubscribersComponent,
    SubscriberComponent,
    AccountConstraintsComponent,
    ServiceStatusComponent,
  ],
  providers: [
    UserService,
    AccountService,
    DeviceService
  ]
})
export class SetupModule {
}
