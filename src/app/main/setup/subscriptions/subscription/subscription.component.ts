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
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatDialog } from '@angular/material';
import { LANDMARK_ACTIVITIES, SubscriptionDoc, SubscriptionService } from '../subscription.service';
import { ConfirmationDlgComponent } from '../../../core/confirmation-dlg/confirmation-dlg-component';
import { ACT_NOTIFICATION_SUBSCRIPTION, HelpService } from '../../../../drawers/help/help.service';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit, OnDestroy {

  msg: string;
  returnPath: string;
  createSubscription: boolean;
  accountId: string;

  nameValidators = [
    Validators.required
  ];

  active = new FormControl();
  activity = new FormControl();
  activities: string[][] = Array.from(LANDMARK_ACTIVITIES);
  deviceIds = new FormControl();
  allDevices: string[][];
  landmarkId = new FormControl();
  allLandmarks: string[];

  subscriptionForm: FormGroup;

  accountSubscription: Subscription;
  routeSubscription: Subscription;
  notificationSubscription: Subscription;
  msgSubscription: Subscription;
  subscriptionSubscription: Subscription;
  landmarkSubscription: Subscription;
  deviceSubscription: Subscription;

  static toDate(ts: any) {
    let date: Date;
    if (ts) {
      date = ts.toDate();
    }
    return date;
  }

  constructor(private fb: FormBuilder,
              private datePipe: DatePipe,
              private router: Router,
              private route: ActivatedRoute,
              private location: Location,
              private authService: AuthService,
              private subscriptionService: SubscriptionService,
              private dialog: MatDialog,
              private helpService: HelpService) {
  }

  ngOnInit() {
    // Subscribe to account changes
    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      if (!!this.accountId && this.accountId !== accountId) {
        this.router.navigate([`./setup/${this.returnPath}`]);
      } else {
        this.accountId = accountId;
      }
    });

    this.routeSubscription = this.route.url.subscribe(segment => {
      const path = segment[0].path;
      if (path === 'account-subscription-add') {

        this.subscriptionService.clearSubscription();
        this.active.setValue(true);
        this.createSubscription = true;
      }
      this.returnPath = 'account-subscriptions-list';
    });

    this.subscriptionForm = this.fb.group({
      active: ['', []],
      subscriptionId: ['', this.nameValidators],
      landmarkId: [''],
      deviceIds: [''],
      activity: [''],
      modifiedAt: [''],

      createdAt: [''],
      comment: ['']
    });

    // Get the subscription for the id passed in URL
    this.route.params.subscribe((params: Params) => {
      const key = params['id'];
      if (key) {
        this.subscriptionService.getSubscription(key).then((doc: SubscriptionDoc) => {
          if (doc) {
            this.subscriptionForm.setValue({
              active: doc.active,
              subscriptionId: doc.subscriptionId,
              landmarkId: doc.landmarkId,
              deviceIds: doc.deviceIds,
              activity: doc.activity,
              modifiedAt: this.datePipe.transform(SubscriptionComponent.toDate(doc.modifiedAt), 'long'),
              createdAt: this.datePipe.transform(SubscriptionComponent.toDate(doc.createdAt), 'long'),
              comment: doc.comment
            });
            this.active.setValue(doc.active);
            this.landmarkId.setValue(doc.landmarkId);
            this.deviceIds.setValue(doc.deviceIds);
            this.activity.setValue(doc.activity);
          } else {
            this.activity.setValue('ENTRY');
          }
        });
      }
    });

    this.msgSubscription = this.subscriptionService.msg$.subscribe(msg => {
      this.msg = msg;
    });

    // Issue a fetch request for all landmarks for the account
    this.subscriptionService.fetchAccountLandmarks();

    // Subscribe to the landmarks fetch response
    this.landmarkSubscription = this.subscriptionService.allLandmarks$.subscribe(allLandmarks => {
      this.allLandmarks = allLandmarks;
    });

    // Issue a fetch request for all devices for the account
    this.subscriptionService.fetchAccountDevices();

    // Subscribe to the devices fetch response
    this.deviceSubscription = this.subscriptionService.allDevices$.subscribe(allDevices => {
      this.allDevices = Array.from(allDevices);
    });

    this.helpService.component$.next(ACT_NOTIFICATION_SUBSCRIPTION);
  }

  ngOnDestroy(): void {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.subscriptionSubscription) {
      this.subscriptionSubscription.unsubscribe();
    }
    if (this.msgSubscription) {
      this.msgSubscription.unsubscribe();
    }
    if (this.landmarkSubscription) {
      this.landmarkSubscription.unsubscribe();
    }
    if (this.deviceSubscription) {
      this.deviceSubscription.unsubscribe();
    }
  }

  public onSubmit() {
    this.msg = '';
    const subscriptionDoc: SubscriptionDoc = this.subscriptionForm.value;
    subscriptionDoc.active = this.active.value;
    subscriptionDoc.activity = this.activity.value;
    subscriptionDoc.landmarkId = this.landmarkId.value;
    subscriptionDoc.deviceIds = this.deviceIds.value;
    if (this.createSubscription) {
      this.confirmSetSubscription(subscriptionDoc);
    } else {
      this.confirmUpdateSubscription(subscriptionDoc);
    }
  }

  confirmSetSubscription(subscriptionDoc: SubscriptionDoc) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Add Subscription',
        msg: `Add Subscription for ${this.authService.currentUserAccountId} account?`,
        no: 'Cancel',
        yes: 'OK'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        subscriptionDoc.accountId = this.authService.currentUserAccountId;
        this.subscriptionService.setSubscription(subscriptionDoc, this.returnPath);
      }
    });
  }

  confirmUpdateSubscription(subscriptionDoc: SubscriptionDoc) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Update Subscription',
        msg: `Update Subscription for ${this.authService.currentUserAccountId} account?`,
        no: 'Cancel',
        yes: 'OK'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        subscriptionDoc.accountId = this.authService.currentUserAccountId;
        this.subscriptionService.updateSubscription(subscriptionDoc, this.returnPath);
      }
    });
  }

  public onClear() {
    this.subscriptionService.clearSubscription();
    this.active.setValue(true);
    this.landmarkId.setValue(null);
    this.deviceIds.setValue(null);
    this.activity.setValue('ENTRY');
    this.subscriptionForm.reset();
    this.msg = '';
  }

  public onCancel() {
    this.location.back();
  }

  onDelete() {
    this.confirmDeleteSubscription(this.subscriptionForm.value);
  }

  confirmDeleteSubscription(subscriptionDoc: SubscriptionDoc) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Delete Subscription',
        msg: `Delete Subscription for ${subscriptionDoc.subscriptionId}?`,
        no: 'Cancel',
        yes: 'OK'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        subscriptionDoc.accountId = this.authService.currentUserAccountId;
        this.subscriptionService.deleteSubscription(subscriptionDoc, this.returnPath);
      }
    });
  }

}
