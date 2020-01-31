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

import { Injectable } from '@angular/core';
import { AccountConstraint, AccountService } from '../accounts/account.service';
import { ACCOUNT_LANDMARKS } from '../landmarks/landmark.service';
import { ACCOUNT_SUBSCRIPTIONS, ACCOUNT_USERS, SUBSCRIBERS } from '../subscribers/subscriber.service';
import { ACCOUNT_DEVICES } from '../devices/device.service';
import { BehaviorSubject } from 'rxjs';
import * as firebase from 'firebase';

export interface ServiceStatusItem {
  constraintId: string;
  currentValue: any;
  maxValue: any;
}

export const CURRENT_MONTH_YEAR = 'current-month-year';
export const ACCOUNT_TRAFFIC = 'account-traffic';

@Injectable({
  providedIn: 'root'
})
export class ServiceStatusService {
  private db;

  private serviceStatusSubject = new BehaviorSubject<any[]>([]);
  public serviceStatus$ = this.serviceStatusSubject.asObservable();

  private static insertServiceExpiration(constraintId: string, expiration: string, serviceStatus: any[]) {
    serviceStatus.push({
      constraintId: constraintId,
      currentValue: '',
      maxValue: expiration
    });
  }

  private static addItem(constraintId: string, currentValue: number, maxValue: number, serviceStatus: any[]) {
    serviceStatus.push(<ServiceStatusItem>{
      constraintId: constraintId,
      currentValue: currentValue,
      maxValue: maxValue
    });
  }

  private static addMonthlyEvents(data: any, maxValue: number, serviceStatus: any[]) {
    const currentValue = !!data ? data.events : 0;
    ServiceStatusService.addItem('monthlyEvents', currentValue, maxValue, serviceStatus);
  }

  private static addMonthlyEmails(data: any, maxValue: number, serviceStatus: any[]) {
    const currentValue = !!data ? data.emails : 0;
    ServiceStatusService.addItem('monthlyNotificationEmails', currentValue, maxValue, serviceStatus);
  }

  private static addMonthlyTexts(data: any, maxValue: number, serviceStatus: any[]) {
    const currentValue = !!data ? data.texts : 0;
    ServiceStatusService.addItem('monthlyNotificationTexts', currentValue, maxValue, serviceStatus);
  }

  constructor(private accountService: AccountService) {
    this.db = firebase.firestore();
  }

  public fetchServiceStatus(accountId: string) {
    return this.accountService.getAccountConstraint(accountId).then((constraint: AccountConstraint) => {
      const serviceStatus = [];
      if (constraint) {
        this.insertDeviceCount(accountId, 'devices', constraint.maxDevices, serviceStatus);
        this.insertUserCount(accountId, 'users', constraint.maxUsers, serviceStatus);
        this.insertLandmarkCount(accountId, 'landmarks', constraint.maxLandmarks, serviceStatus);
        this.insertNotificationSubscriptionCount(accountId, 'notificationSubscriptions',
          constraint.maxNotificationSubscriptions, serviceStatus);
        this.insertNotificationSubscriberCount(accountId, 'notificationSubscribers',
          constraint.maxNotificationSubscribers, serviceStatus);
        ServiceStatusService.insertServiceExpiration('serviceExpiration', constraint.serviceExpiration, serviceStatus);
        this.insertMonthlyCounts(accountId, constraint, serviceStatus);
      }
      this.serviceStatusSubject.next(serviceStatus);
    });
  }

  private insertDeviceCount(accountId: string, constraintId: string, maxValue: number, serviceStatus: any[]) {
    this.db.collection(ACCOUNT_DEVICES).where('accountId', '==', accountId)
      .get()
      .then(snap => {
        ServiceStatusService.addItem(constraintId, snap.size, maxValue, serviceStatus);
      });
  }

  private insertUserCount(accountId: string, constraintId: string, maxValue: number, serviceStatus: any[]) {
    this.db.collection(ACCOUNT_USERS).where('accountId', '==', accountId)
      .get()
      .then(snap => {
        ServiceStatusService.addItem(constraintId, snap.size, maxValue, serviceStatus);
      });
  }

  private insertLandmarkCount(accountId: string, constraintId: string, maxValue: number, serviceStatus: any[]) {
    this.db.collection(ACCOUNT_LANDMARKS).where('accountId', '==', accountId)
      .get()
      .then(snap => {
        ServiceStatusService.addItem(constraintId, snap.size, maxValue, serviceStatus);
      });
  }

  private insertNotificationSubscriptionCount(accountId: string, constraintId: string, maxValue: number, serviceStatus: any[]) {
    this.db.collection(ACCOUNT_SUBSCRIPTIONS).where('accountId', '==', accountId)
      .get()
      .then(snap => {
        ServiceStatusService.addItem(constraintId, snap.size, maxValue, serviceStatus);
      });
  }

  private insertNotificationSubscriberCount(accountId: string, constraintId: string, maxValue: number, serviceStatus: any[]) {
    this.db.collection(SUBSCRIBERS).where('accountId', '==', accountId)
      .get()
      .then(snap => {
        ServiceStatusService.addItem(constraintId, snap.size, maxValue, serviceStatus);
      });
  }

  private insertMonthlyCounts(accountId: string, constraint: AccountConstraint, serviceStatus: any[]) {
    const now = new Date();
    const key = `${accountId}:${now.getMonth() + 1}:${now.getFullYear()}`;
    this.db.collection(CURRENT_MONTH_YEAR)
      .doc(key)
      .get()
      .then(snap => {
        if (!snap.empty) {
          this.db.collection(ACCOUNT_TRAFFIC).doc(key)
            .get()
            .then(traffic => {
              if (!traffic.empty) {
                const data = traffic.data();
                ServiceStatusService.addMonthlyEvents(data, constraint.maxMonthlyEvents, serviceStatus);
                ServiceStatusService.addMonthlyEmails(data, constraint.maxMonthlyNotificationEmails, serviceStatus);
                ServiceStatusService.addMonthlyTexts(data, constraint.maxMonthlyNotificationTexts, serviceStatus);
              }
            });
        }
      });
  }
}
