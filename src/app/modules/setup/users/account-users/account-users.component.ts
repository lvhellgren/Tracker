
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
import { Subscription } from 'rxjs';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { UserDto, UserService } from '../user.service';
import { ACCOUNT_USER_ROLES, AuthService, HUB_USER_ROLES } from '../../../core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

import { ErrorDlgComponent } from '../../../core/error-dlg/error-dlg.component';

@Component({
  selector: 'app-account-users',
  templateUrl: './account-users.component.html',
  styleUrls: ['./account-users.component.css']
})
export class AccountUsersComponent implements OnInit, OnDestroy {

  roleMap = ACCOUNT_USER_ROLES;
  userSubscription: Subscription;
  userAccountSubscription: Subscription;
  dataSource = new MatTableDataSource<UserDto>();

  displayedColumns = ['email', 'name', 'phone', 'roles', 'activeUser', 'signedInAt'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router) {
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.userAccountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      this.userService.fetchAccountUsers(accountId);
    });

    this.userSubscription = this.userService.accountUsers$.subscribe(users => {
      this.dataSource.data = users;
    });
  }

  ngOnDestroy(): void {
    if (this.userAccountSubscription) {
      this.userAccountSubscription.unsubscribe();
    }

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onUserClick(row) {
    if (row.email) {
      this.router.navigate([`../account-user-details`, row.email], {relativeTo: this.route});
    } else {
      const msg = 'Invalid user data in table row';
      const dlg = this.dialog.open(ErrorDlgComponent, {
        data: {msg: msg}
      });
      console.error(msg);
    }
  }

  rowBackground(row) {
    return this.isSelected(row) ? '#3f51b5' : '';
  }

  rowColor(row) {
    return this.isSelected(row) ? 'white' : '';
  }

  isSelected(row): boolean {
    const id = this.userService.getUserId();
    return row && id && id === row.email;
  }

  getUserRoleName(role): string {
    return HUB_USER_ROLES.get(role);
  }
}
