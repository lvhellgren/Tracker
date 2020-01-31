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
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Account, AccountService } from '../account.service';
import { Subscription } from 'rxjs';
import { HelpService, PRINC_ACCOUNT } from '../../../../drawers/help/help.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit, OnDestroy {

  accountForm: FormGroup;
  active = new FormControl();
  createAccount = false;
  msg: string;
  returnPath: string;

  routeSubscription: Subscription;
  accountSubscription: Subscription;
  msgSubscription: Subscription;

  idValidators = [Validators.required];

  constructor(private fb: FormBuilder,
              private accountService: AccountService,
              private location: Location,
              private datePipe: DatePipe,
              private router: Router,
              private route: ActivatedRoute,
              private helpService: HelpService) {
  }

  ngOnInit() {
    let path: string;

    this.routeSubscription = this.route.url.subscribe(segment => {
      path = segment[0].path;
      if (path === 'create-principal-account') {
        this.createAccount = true;
        this.accountService.clearAccount();
        this.active.reset();
        this.returnPath = 'principal-accounts-list';
      } else if (path === 'principal-account-details') {
        this.returnPath = 'principal-accounts-list';
      } else {
        this.returnPath = 'user-accounts-list';
      }
    });

    this.accountForm = this.fb.group({
      active: ['', []],
      accountId: ['', this.idValidators],
      address1: ['', []],
      address2: ['', []],
      city: ['', []],
      state: ['', []],
      postalCode: [''],
      modifiedAt: [''],
      createdAt: [''],
      description: ['']
    });

    this.route.params.subscribe((params: Params) => {
      const accountId = params['id'] ? params['id'] : this.accountService.accountId;

      if (accountId) {
        this.accountSubscription = this.accountService.fetchAccount$(accountId).subscribe((account: Account) => {
          this.accountForm.setValue(
            {
              active: account.active,
              accountId: account.accountId,
              address1: account.address1 ? account.address1 : '',
              address2: account.address2 ? account.address2 : '',
              city: account.city ? account.city : '',
              state: account.state ? account.state : '',
              postalCode: account.postalCode ? account.postalCode : '',
              modifiedAt: this.datePipe.transform(this.toDate(account.modifiedAt), 'long'),
              createdAt: this.datePipe.transform(this.toDate(account.createdAt), 'long'),
              description: account.description ? account.description : ''
            });

          this.active.setValue(account.active);
        });
      } else if (path === 'account-details') {
        this.msg = 'No account selected';
      }

      this.createAccount = !accountId;
    });

    this.msgSubscription = this.accountService.msg$.subscribe(msg => {
      this.msg = msg;
    });

    this.helpService.component$.next(PRINC_ACCOUNT);
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }

    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }

    if (this.msgSubscription) {
      this.msgSubscription.unsubscribe();
    }
  }

  onSubmit() {
    const form = this.accountForm;
    const account = <Account>{
      active: this.active.value,
      accountId: form.get('accountId').value,
      address1: form.get('address1').value,
      address2: form.get('address2').value,
      city: form.get('city').value,
      state: form.get('state').value,
      postalCode: form.get('postalCode').value,
      description: form.get('description').value
    };

    this.accountService.saveAccount(account, this.returnPath, this.createAccount);
  }

  onClear() {
    this.accountService.clearAccount();
    this.active.reset();
    this.accountForm.reset();
  }

  onCancel() {
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
