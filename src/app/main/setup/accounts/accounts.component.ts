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
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Account, AccountService } from './account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';
import { AuthService } from '../../core/auth/auth.service';
import { ACT_DEVICES, ACT_USER_ACCOUNTS, HelpService, PRINC_ACCOUNTS } from '../../../drawers/help/help.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit, OnDestroy {
  private tapCount = 0;
  path: string;
  detailsPath: string;

  routeSubscription: Subscription;
  accountSubscription: Subscription;
  dataSource = new MatTableDataSource<Account>();

  displayedColumns = ['accountId', 'active'];

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private helpService: HelpService) {
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.routeSubscription = this.route.url.subscribe(segment => {
      this.path = segment[0].path;
      this.detailsPath = this.path === 'principal-accounts-list' ? 'principal-account-details' : 'account-details';
      if (this.path.includes('principal')) {
        this.displayedColumns.push('constraints');
        this.accountSubscription = this.accountService.allAccounts$.subscribe(accounts => {
          this.dataSource.data = accounts;
        });

        this.helpService.component$.next(PRINC_ACCOUNTS);
      } else {
        this.accountSubscription = this.accountService.accounts$.subscribe(accounts => {
          this.dataSource.data = accounts;
        });

        this.helpService.component$.next(ACT_USER_ACCOUNTS);
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
  onAccountClick(row: Account) {
    if (row.accountId) {
      this.router.navigate([`../${this.detailsPath}`, row.accountId], {relativeTo: this.route});
    } else {
      const msg = 'Invalid account data in table row';
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: msg}
      });
      console.error(msg);
    }
  }

  onRowTap(row: Account) {
    this.tapCount++;
    setTimeout(() => {
      if (this.tapCount === 1) {
        this.tapCount = 0;
        this.onRowClick(row);
      }
      if (this.tapCount > 1) {
        this.tapCount = 0;
        this.onRowDblclick(row);
      }
    }, 300);
  }

  onRowClick(account: Account) {
    this.accountService.accountId = account.accountId;
  }

  onRowDblclick(account: Account) {
    if (account.accountId) {
      this.router.navigate([`../${this.detailsPath}`, account.accountId], {relativeTo: this.route});
    } else {
      const msg = 'Invalid account data in table row';
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: msg}
      });
      console.error(msg);
    }
  }

  onConstraintsClick(row: Account) {
    this.router.navigate([`../principal-account-constraints`, row.accountId], {relativeTo: this.route});
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
  isSelected(row: Account): boolean {
    const id = this.accountService.accountId;
    return row && id && id === row.accountId;
  }
}
