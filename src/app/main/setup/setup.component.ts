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
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, PRINCIPAL_ACCOUNT_ID } from '../core/auth/auth.service';

export const MENU_NAMES: Map<string, string[]> = new Map([
  ['blank',                     ['',               'Setup']],
  ['principal-accounts-list',   ['Principal View', 'All Accounts']],
  ['principal-account-details', ['Principal View', 'Account Details']],
  ['create-principal-account',  ['Principal View', 'Add Account']],
  ['principal-users-list',      ['Principal View', 'All Users']],
  ['principal-devices-list',    ['Principal View', 'All Devices']],
  ['principal-user-details',    ['Principal View', 'User Details']],
  ['user-accounts-list',        ['Account View',   'All Accounts for User']],
  ['account-details',           ['Account View',   'Account Details']],
  ['account-users-list',        ['Account View',   'Users']],
  ['account-user-details',      ['Account View',   'User Details']],
  ['account-user-add',          ['Account View',   'Add User']],
  ['account-devices-list',      ['Account View',   'Devices']],
  ['account-device-details',    ['Account View',   'Device Details']],
  ['account-device-add',        ['Account View',   'Add Device']]
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

  @ViewChild('setupDrawer') setupDrawer;

  userAccountSelectSubscription: Subscription;
  routeSubscription: Subscription;

  constructor(private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.userAccountSelectSubscription = this.authService.userAccountSelect.subscribe(account => {
      this.principalView = account === PRINCIPAL_ACCOUNT_ID;

      if (!this.principalView && this.principalForm) {
        this.router.navigate([`./`], {relativeTo: this.route});
      }
    });

    this.routeSubscription = this.route.url.subscribe(segment => {
      this.setupDrawer.open();
    });
  }

  ngOnDestroy(): void {
    if (this.userAccountSelectSubscription) {
      this.userAccountSelectSubscription.unsubscribe();
    }

    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
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
}
