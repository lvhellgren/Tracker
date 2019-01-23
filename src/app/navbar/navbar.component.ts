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

import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { AuthService } from '../modules/core/auth/auth.service';
import { ConfirmationDlgComponent } from '../modules/core/confirmation-dlg/confirmation-dlg-component';
import { UserService } from '../modules/setup/users/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  public isSignedIn = true;
  private authSubscription: Subscription;

  @Output() navDrawerToggle = new EventEmitter();
  @Output() helpDrawerToggle = new EventEmitter();
  @Output() preferencesDrawerToggle = new EventEmitter();

  constructor(public authService: AuthService,
              public userService: UserService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.authSubscription = this.authService.authChange.subscribe(authStatus => {
      this.isSignedIn = authStatus;
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  public set selectedUserAccountId(accountId) {
    console.log('accountId', accountId);
    this.authService.userAccountSelect.next(accountId);
    this.userService.fetchAccountUsers(accountId);
  }

  onDrawerBtnClick() {
    this.navDrawerToggle.emit();
  }

  onHelpBtnClick() {
    this.helpDrawerToggle.emit();
  }


  onSignOutClick() {
    // Uncomment for signout confirmation dialog:
    // confirmSignOut();
    this.authService.signOut();
  }

  confirmSignOut() {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Log Out',
        msg: 'Are you sure you want to log out?',
        no: 'Cancel',
        yes: 'Log Out'
      }
    });

    dlg.afterClosed().subscribe((signOut: boolean) => {
      if (signOut) {
        this.authService.signOut();
      }
    });
  }

  onPreferencesClick() {
    this.preferencesDrawerToggle.emit();
  }

}
