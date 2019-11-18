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

import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export const HELP_CENTER = 'Help Center';
export const LOC_UNITS = 'Locations - Units';
export const LOC_UNIT = 'Locations - Unit';
export const LOC_UNIT_DETAILS = 'Locations - Unit Details';
export const LOC_LANDMARKS = 'Locations - Landmarks';
export const LOC_LANDMARK = 'Locations - Landmark';
export const NOTIFICATIONS = 'Notifications';
export const NOTIFICATION = 'Notification';
export const REPORTS = 'Reports';
export const ACT_ACTIVITY_REPORT = 'Account Activity Report';
export const SETUP = 'Setup';
export const PRINC_ACCOUNTS = 'All Accounts';
export const PRINC_ACCOUNT = 'Account';
export const PRINC_ACCOUNT_CONSTRAINTS = 'Account Constraints';
export const PRINC_USERS = 'All Users';
export const PRINC_DEVICES = 'All Devices';
export const ACT_USER_ACCOUNTS = 'All Accounts for User';
export const ACT_USERS = 'Users';
export const ACT_USER = 'User';
export const ACT_DEVICES = 'Devices';
export const ACT_DEVICE = 'Device';
export const ACT_LANDMARKS = 'Landmarks';
export const ACT_LANDMARK = 'Landmark';
export const ACT_NOTIFICATION_SUBSCRIPTIONS = 'Notification Subscriptions';
export const ACT_NOTIFICATION_SUBSCRIPTION = 'Notification Subscription';
export const ACT_NOTIFICATION_SUBSCRIBERS = 'Notification Subscribers';
export const ACT_NOTIFICATION_SUBSCRIBER = 'Notification Subscriber';
export const SIMULATOR_EVENTS = 'Simulator Events';
export const SIMULATOR_EVENT = 'Simulator Move Event';

@Injectable({
  providedIn: 'root'
})
export class HelpService {
  // public component$: Subject<string> = new Subject();
  public component$: BehaviorSubject<string> = new BehaviorSubject('');

  constructor() {
  }
}
