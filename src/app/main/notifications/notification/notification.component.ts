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
import { Location } from '@angular/common';
import { NotificationDoc, NotificationService } from '../notification.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfirmationDlgComponent } from '../../core/confirmation-dlg/confirmation-dlg-component';
import { MatDialog } from '@angular/material/dialog';
import { LANDMARK_ACTIVITIES } from '../../setup/subscriptions/subscription.service';
import { HelpService, NOTIFICATION } from '../../../drawers/help/help.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  private routeSubscription: Subscription;
  private msgSubscription: Subscription;

  msg: string;

  constructor(private notificationService: NotificationService,
              private location: Location,
              private router: Router,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private helpService: HelpService) {
  }

  ngOnInit() {

    this.routeSubscription = this.route.params.subscribe((params: Params) => {
      let docId = params['id'];
      if (!docId && this.notificationService.currentNotification) {
        docId = this.notificationService.currentNotification.documentId;
      }
      if (docId) {
        this.notificationService.loadNotificationDoc(docId);
      }
    });

    this.msgSubscription = this.notificationService.msg$.subscribe(msg => {
      this.msg = msg;
    });

    this.helpService.component$.next(NOTIFICATION);
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.msgSubscription) {
      this.msgSubscription.unsubscribe();
    }
  }

  get notificationDoc(): NotificationDoc {
    return this.notificationService.currentNotification;
  }

  onCancel() {
    this.location.back();
  }

  onDelete(doc: NotificationDoc) {
    this.msg = null;
    this.confirmDeleteNotification(doc);
  }

  confirmDeleteNotification(doc: NotificationDoc) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Delete',
        msg: `Delete current notification?`,
        no: 'Cancel',
        yes: 'OK'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        this.notificationService.deleteNotification(doc, 'notifications');
      }
    });
  }

  getActivityName(code) {
    return LANDMARK_ACTIVITIES.get(code);
  }

}
