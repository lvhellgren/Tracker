import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccountConstraint, AccountService } from '../account.service';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ErrorDlgComponent } from '../../../core/error-dlg/error-dlg.component';

@Component({
  selector: 'app-account-constraints',
  templateUrl: './account-constraints.component.html',
  styleUrls: ['./account-constraints.component.css']
})
export class AccountConstraintsComponent implements OnInit, OnDestroy {
  accountForm: FormGroup;
  msg = '';
  accountId: string;

  constructor(private accountService: AccountService,
              private dialog: MatDialog,
              private datePipe: DatePipe,
              private location: Location,
              private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.accountForm = this.fb.group({
      maxDevices: ['', []],
      maxUsers: ['', []],
      maxLandmarks: ['', []],
      maxNotificationSubscriptions: ['', []],
      maxNotificationSubscribers: ['', []],
      maxMonthlyEvents: ['', []],
      maxMonthlyNotificationEmails: ['', []],
      maxMonthlyNotificationTexts: [''],
      serviceExpiration: [''],
      modifiedAt: [{value: '', disabled: true}],
      comment: ['']
    });

    // Get the account constraint document for the id passed in URL
    this.route.params.subscribe((params: Params) => {
      this.accountId = params['id'];
      if (!!this.accountId) {
        this.accountService.getAccountConstraint(this.accountId).then((constraint: AccountConstraint) => {
          if (constraint) {
            this.accountForm.setValue({
              maxDevices: constraint.maxDevices,
              maxUsers: constraint.maxUsers,
              maxLandmarks: constraint.maxLandmarks,
              maxNotificationSubscriptions: constraint.maxNotificationSubscriptions,
              maxNotificationSubscribers: constraint.maxNotificationSubscribers,
              maxMonthlyEvents: constraint.maxMonthlyEvents,
              maxMonthlyNotificationEmails: constraint.maxMonthlyNotificationEmails,
              maxMonthlyNotificationTexts: constraint.maxMonthlyNotificationTexts,
              serviceExpiration: constraint.serviceExpiration,
              modifiedAt: this.datePipe.transform(this.toDate(constraint.modifiedAt), 'long'),
              comment: constraint.comment
            });
          }
        });
      } else {
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: 'Missing account ID'}
        });
      }
    });
  }

  ngOnDestroy() {
  }

  onSubmit() {
    this.msg = '';
    const accountConstraint: AccountConstraint = this.accountForm.getRawValue();
    const parts = accountConstraint.serviceExpiration.split('/');
    if (accountConstraint.serviceExpiration.length === 7 && parts.length === 2 && parts[1].length === 4) {
      const date = new Date(`${parts[1]}-${parseInt(parts[0], 10) + 1}`);
      if (date < new Date()) {
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: 'Invalid expiration date'}
        });
      } else {
        accountConstraint.accountId = this.accountId;
        this.accountService.saveAccountConstraint(accountConstraint, 'principal-accounts-list');
      }
    } else {
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: 'Invalid expiration date'}
      });
    }
  }

  onCancel() {
    this.msg = '';
    this.location.back();
  }

  toDate(ts) {
    let date: Date;
    if (ts) {
      date = ts.toDate();
    }
    return date;
  }
}
