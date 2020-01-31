// Copyright (c) 2020 Lars Hellgren (lars@exelor.com).
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

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, PRINCIPAL_ACCOUNT_ID } from '../core/auth/auth.service';
import { SetupService } from './setup.service';
import { HelpService, SETUP } from '../../drawers/help/help.service';

export const MENU_NAMES: Map<string, string[]> = new Map([
  ['blank', ['', 'Setup']],
  ['principal-accounts-list', ['Principal View', 'All Accounts']],
  ['principal-account-details', ['Principal View', 'Account Details']],
  ['create-principal-account', ['Principal View', 'Add Account']],
  ['principal-account-constraints', ['Principal View', 'Account Constraints']],
  ['principal-users-list', ['Principal View', 'All Users']],
  ['principal-devices-list', ['Principal View', 'All Devices']],
  ['principal-user-details', ['Principal View', 'User Details']],
  ['user-accounts-list', ['Account View', 'All Accounts for User']],
  ['account-details', ['Account View', 'Account Details']],
  ['account-users-list', ['Account View', 'Users']],
  ['account-user-details', ['Account View', 'User Details']],
  ['account-user-add', ['Account View', 'Add User']],
  ['account-devices-list', ['Account View', 'Devices']],
  ['account-device-details', ['Account View', 'Device Details']],
  ['account-device-add', ['Account View', 'Add Device']],
  ['account-landmarks-list', ['Account View', 'Landmarks']],
  ['account-landmark', ['Account View', 'Landmark']],
  ['account-landmark-add', ['Account View', 'Add Landmark']],
  ['account-subscriptions-list', ['Account View', 'Notification Subscriptions']],
  ['account-subscription', ['Account View', 'Subscription']],
  ['account-subscription-add', ['Account View', 'Add Subscription']],
  ['account-subscribers-list', ['Account View', 'Notification Subscribers']],
  ['account-subscriber', ['Account View', 'Subscriber']],
  ['account-subscriber-add', ['Account View', 'Add Subscriber']],
  ['account-service-status', ['Account View', 'Service Status']]
]);

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit, OnDestroy {

  panelName: string;
  headerTitle: string;
  principalView: boolean;
  principalForm: boolean;

  @ViewChild('setupDrawer', {static: false}) setupDrawer;

  userAccountSelectSubscription: Subscription;

  constructor(private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private setupService: SetupService,
              private helpService: HelpService) {
  }

  ngOnInit() {
    this.userAccountSelectSubscription = this.authService.userAccountSelect.subscribe(account => {
      this.principalView = account === PRINCIPAL_ACCOUNT_ID;

      if (!this.principalView && this.principalForm) {
        this.router.navigate([`./`], {relativeTo: this.route});
      }
    });

    this.helpService.component$.next(SETUP);
  }

  ngOnDestroy(): void {
    if (this.userAccountSelectSubscription) {
      this.userAccountSelectSubscription.unsubscribe();
    }
  }

  onActivate($event) {
    if ($event) {
      const childPath = this.router.url.split('/')[2];
      this.panelName = this.getMenuName(childPath, 0);
      this.headerTitle = this.getMenuName(childPath, 1);
      this.principalForm = childPath.includes('principal');
      if (this.principalForm) {
        this.authService.userAccountSelect.next(PRINCIPAL_ACCOUNT_ID);
      }
    }
  }

  getMenuName(key: string, idx: number) {
    if (key === '') {
      return '';
    }
    return MENU_NAMES.get(key)[idx];
  }

  isExpanded(panel: string) {
    return panel === this.panelName;
  }

  isAccountUser() {
    return !this.authService.isPrincipalUser;
  }

  onItemClick(event) {
    if (this.setupService.smallView) {
      this.setupDrawer.toggle(false);
    }
  }
}
