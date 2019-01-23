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
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { AccountDto, AccountService } from './account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit, OnDestroy {

  path: string;
  detailsPath: string;

  routeSubscription: Subscription;
  accountSubscription: Subscription;
  dataSource = new MatTableDataSource<AccountDto>();

  displayedColumns = ['id', 'active'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router) {
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.routeSubscription = this.route.url.subscribe(segment => {
      this.path = segment[0].path;
      this.detailsPath = this.path === 'hub-accounts-list' ? 'hub-account-details' : 'account-details';
      if (this.path.includes('hub')) {
        this.accountSubscription = this.accountService.allAccounts$.subscribe(accounts => {
          this.dataSource.data = accounts;
        });
      } else {
        this.accountSubscription = this.accountService.accounts$.subscribe(accounts => {
          this.dataSource.data = accounts;
        });
      }
    });

    this.accountService.fetchUserAccounts(this.authService.getUserId());
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }

    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
  }

  /** UI table filter */
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** Display account details */
  onAccountClick(row) {
    if (row.id) {
      this.router.navigate([`../${this.detailsPath}`, row.id], {relativeTo: this.route});
    } else {
      const msg = 'Invalid account data in table row';
      const dlg = this.dialog.open(ErrorDlgComponent, {
        data: {msg: msg}
      });
      console.error(msg);
    }
  }

  /** Currently selected row highlight */
  rowBackground(row) {
    return this.isSelected(row) ? '#3f51b5' : '';
  }

  /** Currently selected row highlight */
  rowColor(row) {
    return this.isSelected(row) ? 'white' : '';
  }

  /** Determine if an account table row is currently selected */
  isSelected(row): boolean {
    const id = this.accountService.accountId;
    return row && id && id === row.id;
  }
}
