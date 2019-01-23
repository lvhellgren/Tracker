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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AccountDto, AccountService } from '../account.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit, OnDestroy {

  accountFormGroup: FormGroup;
  active = new FormControl();
  createAccount = false;
  msg: string;
  returnPath: string;

  @Input() account: AccountDto;

  routeSubscription: Subscription;
  accountSubscription: Subscription;
  msgSubscription: Subscription;

  idValidators = [Validators.required];

  constructor(private fb: FormBuilder,
              private accountService: AccountService,
              private location: Location,
              private datePipe: DatePipe,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    let path: string;

    this.routeSubscription = this.route.url.subscribe(segment => {
      path = segment[0].path;
      if (path === 'create-hub-account') {
        this.createAccount = true;
        this.accountService.clearAccount();
        this.active.reset();
        this.returnPath = 'hub-accounts-list';
      } else if (path === 'hub-account-details') {
        this.returnPath = 'hub-accounts-list';
      } else {
        this.returnPath = 'user-accounts-list';
      }
    });

    this.accountFormGroup = this.fb.group({
      active: ['', []],
      id: ['', this.idValidators],
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
        this.accountSubscription = this.accountService.fetchAccount$(accountId).subscribe((accountDto: AccountDto) => {
          this.accountFormGroup.setValue(
            {
              active: accountDto.active,
              id: accountDto.id,
              address1: accountDto.address1 ? accountDto.address1 : '',
              address2: accountDto.address2 ? accountDto.address2 : '',
              city: accountDto.city ? accountDto.city : '',
              state: accountDto.state ? accountDto.state : '',
              postalCode: accountDto.postalCode ? accountDto.postalCode : '',
              modifiedAt: this.datePipe.transform(this.toDate(accountDto.modifiedAt), 'long'),
              createdAt: this.datePipe.transform(this.toDate(accountDto.createdAt), 'long'),
              description: accountDto.description ? accountDto.description : ''
            });

          this.active.setValue(accountDto.active);
        });
      } else if (path === 'account-details') {
        this.msg = 'No account selected';
      }

      this.createAccount = !accountId;
    });

    this.msgSubscription = this.accountService.msg$.subscribe(msg => {
      this.msg = msg;
    });
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
    const formGroup = this.accountFormGroup;
    const dto = <AccountDto>{
      active: this.active.value,
      id: formGroup.get('id').value,
      address1: formGroup.get('address1').value,
      address2: formGroup.get('address2').value,
      city: formGroup.get('city').value,
      state: formGroup.get('state').value,
      postalCode: formGroup.get('postalCode').value,
      description: formGroup.get('description').value
    };

    this.accountService.saveAccount(dto, this.returnPath, this.createAccount);
  }

  onClear(form: NgForm) {
    this.accountService.clearAccount();
    this.active.reset();
    form.resetForm();
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
