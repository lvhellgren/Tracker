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
import { SubscriberDoc, SubscriberService } from '../subscriber.service';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDlgComponent } from '../../../core/confirmation-dlg/confirmation-dlg-component';
import { ErrorDlgComponent } from '../../../core/error-dlg/error-dlg.component';
import { ACT_NOTIFICATION_SUBSCRIBER, HelpService } from '../../../../drawers/help/help.service';

@Component({
  selector: 'app-subscriber',
  templateUrl: './subscriber.component.html',
  styleUrls: ['./subscriber.component.css']
})
export class SubscriberComponent implements OnInit, OnDestroy {

  msg: string;
  returnPath: string;
  createSubscriber: boolean;
  accountId: string;

  accountSubscription: Subscription;
  routeSubscription: Subscription;
  msgSubscription: Subscription;
  userSubscription: Subscription;
  subscriptionSubscription: Subscription;

  nameValidators = [
    Validators.required
  ];

  subscriberForm: FormGroup;
  active = new FormControl();
  emailNotification = new FormControl({value: true});
  textNotification = new FormControl({value: false, disabled: true});
  user = new FormControl();
  allUsers: string[];
  subscription = new FormControl();
  allSubscriptions: string[];

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
              private subscriberService: SubscriberService,
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
      if (path === 'account-subscriber-add') {

        this.subscriberService.clearSubscriber();
        this.active.setValue(true);
        this.createSubscriber = true;
      }
      this.returnPath = 'account-subscribers-list';
    });

    this.subscriberForm = this.fb.group({
      active: ['', []],
      subscriptionId: ['', []],
      subscriber: ['', []],
      emailNotification: ['', []],
      textNotification: ['', []],
      documentId: ['', []],
      modifiedAt: [''],
      createdAt: [''],
      comment: ['']
    });

    // Get the subscription for the id passed in URL
    this.route.params.subscribe((params: Params) => {
      const key = params['id'];
      if (key) {
        this.subscriberService.getSubscriber(key).then((doc: SubscriberDoc) => {
          if (doc) {
            this.subscriberForm.setValue({
              active: doc.active,
              subscriptionId: doc.subscriptionId,
              subscriber: doc.subscriber,
              emailNotification: doc.emailNotification,
              textNotification: doc.textNotification,
              documentId: doc.documentId,
              modifiedAt: this.datePipe.transform(SubscriberComponent.toDate(doc.modifiedAt), 'long'),
              createdAt: this.datePipe.transform(SubscriberComponent.toDate(doc.createdAt), 'long'),
              comment: doc.comment
            });
            this.active.setValue(doc.active);
            this.user.setValue(doc.subscriber);
            this.subscription.setValue(doc.subscriptionId);
            this.emailNotification.setValue(doc.emailNotification);
            this.textNotification.setValue(doc.textNotification);
          }
        });
      }
    });

    // Issue a fetch request for all users for the account
    this.subscriberService.fetchAccountUsers();

    // Subscribe to the users fetch response
    this.userSubscription = this.subscriberService.allUsers$.subscribe(allUsers => {
      this.allUsers = allUsers;
    });

    // Issue a fetch request for all subscriptions for the account
    this.subscriberService.fetchAccountSubscriptions();

    // Subscribe to the subscriptions fetch response
    this.subscriptionSubscription = this.subscriberService.allSubscriptions$.subscribe(allSubscriptions => {
      this.allSubscriptions = allSubscriptions;
    });

    this.msgSubscription = this.subscriberService.msg$.subscribe(msg => {
      this.msg = msg;
    });

    this.helpService.component$.next(ACT_NOTIFICATION_SUBSCRIBER);
  }

  ngOnDestroy(): void {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.msgSubscription) {
      this.msgSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.subscriptionSubscription) {
      this.subscriptionSubscription.unsubscribe();
    }
  }

  public onSubmit() {
    this.msg = '';
    if (!this.user.value || !this.subscription.value) {
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: 'Please enter required selections'}
      });
    } else if (!this.emailNotification.value && !this.textNotification.value) {
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: 'At least one Notification type must be checked'}
      });
    } else {
      const subscriberDoc: SubscriberDoc = this.subscriberForm.value;
      subscriberDoc.subscriber = this.user.value;
      subscriberDoc.subscriptionId = this.subscription.value;
      subscriberDoc.emailNotification = this.emailNotification.value;
      subscriberDoc.textNotification = this.textNotification.value;
      subscriberDoc.active = this.active.value;

      if (this.createSubscriber) {
        this.confirmSetSubscriber(subscriberDoc);
      } else {
        this.confirmUpdateSubscriber(subscriberDoc);
      }
    }
  }

  confirmSetSubscriber(subscriberDoc: SubscriberDoc) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Add Subscriber',
        msg: `Add Subscriber for ${this.authService.currentUserAccountId} account?`,
        no: 'Cancel',
        yes: 'OK'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        subscriberDoc.accountId = this.authService.currentUserAccountId;
        this.subscriberService.setSubscriber(subscriberDoc, this.returnPath);
      }
    });
  }

  confirmUpdateSubscriber(subscriberDoc: SubscriberDoc) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Update Subscriber',
        msg: `Update Subscriber for ${this.authService.currentUserAccountId} account?`,
        no: 'Cancel',
        yes: 'OK'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        subscriberDoc.accountId = this.authService.currentUserAccountId;
        this.subscriberService.updateSubscriber(subscriberDoc, this.returnPath);
      }
    });
  }

  public onClear() {
    this.subscriberService.clearSubscriber();
    this.active.setValue(true);
    this.user.setValue(null);
    this.subscription.setValue(null);
    this.emailNotification.setValue(null);
    this.textNotification.setValue(null);
    this.subscriberForm.reset();
    this.msg = '';
  }

  public onCancel() {
    this.location.back();
  }

  onDelete() {
    const id = this.subscriberForm.value.documentId;
    this.confirmDeleteSubscriber(id);
  }


  confirmDeleteSubscriber(documentId: string) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Delete Subscriber',
        msg: `Delete Subscriber?`,
        no: 'Cancel',
        yes: 'OK'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        this.subscriberService.deleteSubscriber(documentId, this.returnPath);
      }
    });
  }
}
