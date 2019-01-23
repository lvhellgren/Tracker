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
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { UserDto, UserService } from '../user.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmationDlgComponent } from '../../../core/confirmation-dlg/confirmation-dlg-component';
import { MatDialog } from '@angular/material';
import { ErrorDlgComponent } from '../../../core/error-dlg/error-dlg.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
  createUser = false;
  msg: string;
  returnPath: string;

  @Input() user: UserDto;

  userIdValidators = [
    Validators.required,
    Validators.email
  ];

  nameValidators = [
    Validators.required
  ];

  roles = new FormControl();
  activeUser = new FormControl();
  activeAccountUser = new FormControl();
  allRoles;

  userFormGroup: FormGroup;

  routeSubscription: Subscription;
  userSubscription: Subscription;
  msgSubscription: Subscription;
  userAccountSubscription: Subscription;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private location: Location,
              public authService: AuthService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.routeSubscription = this.route.url.subscribe(segment => {
      const path = segment[0].path;
      if (path === 'hub-user-details') {
        this.returnPath = 'hub-users-list';
      } else if (path === 'account-user-add') {
        this.createUser = true;
        this.userService.clearUser();
        this.activeUser.reset();
        this.activeAccountUser.reset();
        this.returnPath = 'account-users-list';
      } else if (path === 'account-user-details') {
        this.returnPath = 'account-users-list';
      }
    });

    this.userFormGroup = this.fb.group({
      email: ['', this.userIdValidators],
      name: ['', this.nameValidators],
      phone: ['', []],
      signedInAt: [''],
      modifiedAt: [''],
      createdAt: [''],
      comment: [''],
      activeUser: ['', []],
      activeAccountUser: ['', []]
    });

    this.route.params.subscribe((params: Params) => {
      const userId = params['id'] ? params['id'] : this.userService.getUserId();

      this.userAccountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
        if (userId) {
          this.userService.fetchAccountUser(this.authService.currentUserAccountId, userId)
            .then((userDto: UserDto) => {
              this.userFormGroup.setValue(
                {
                  email: userDto.email,
                  name: userDto.name,
                  phone: userDto.phone ? userDto.phone : '',
                  signedInAt: this.datePipe.transform(this.toDate(userDto.signedInAt), 'long'),
                  modifiedAt: this.datePipe.transform(this.toDate(userDto.modifiedAt), 'long'),
                  createdAt: this.datePipe.transform(this.toDate(userDto.createdAt), 'long'),
                  comment: userDto.comment ? userDto.comment : '',
                  activeUser: userDto.activeUser,
                  activeAccountUser: userDto.activeAccountUser
                });

              this.roles.setValue(userDto.roles);
              this.activeUser.setValue(userDto.activeUser);
              this.activeAccountUser.setValue(userDto.activeAccountUser);
            })
            .catch(error => {
              console.error(error);
              const dlg = this.dialog.open(ErrorDlgComponent, {
                data: {msg: error}
              });
            });
        } else {
          this.activeUser.setValue(true);
          this.activeAccountUser.setValue(true);
        }

        if (!this.roles.value) {
          this.roles.setValue(this.authService.getDefaultRole());
        }
        this.allRoles = Array.from(this.authService.getRoles());
      });

      this.createUser = !userId;
    });

    this.msgSubscription = this.userService.msg$.subscribe(msg => {
      this.msg = msg;
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    if (this.userAccountSubscription) {
      this.userAccountSubscription.unsubscribe();
    }

    if (this.msgSubscription) {
      this.msgSubscription.unsubscribe();
    }
  }

  public onSubmit() {
    const formGroup = this.userFormGroup;
    const userDto = <UserDto>{
      email: formGroup.get('email').value,
      name: formGroup.get('name').value,
      phone: formGroup.get('phone').value,
      roles: this.roles.value,
      comment: formGroup.get('comment').value,
      activeUser: this.activeUser.value,
      activeAccountUser: this.activeAccountUser.value
    };

    if (this.createUser) {
      this.confirmAddUser(userDto);
    } else {
      this.userService.saveUser(userDto, this.returnPath, this.createUser);
    }
  }

  public onClear(form: NgForm) {
    this.userService.clearUser();
    this.roles.setValue([]);
    this.activeUser.setValue(true);
    this.activeAccountUser.setValue(true);
    form.resetForm();
    this.msg = '';
  }

  public onCancel() {
    this.location.back();
  }

  private toDate(ts) {
    let date: Date;
    if (ts) {
      date = ts.toDate();
    }
    return date;
  }

  confirmAddUser(userDto: UserDto) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Add User',
        msg: `Add user to ${this.authService.currentUserAccountId} account?`,
        no: 'Cancel',
        yes: 'Add'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((add: boolean) => {
      if (add) {
        this.userService.saveUser(userDto, this.returnPath, true);
      }
    });
  }
}
