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
