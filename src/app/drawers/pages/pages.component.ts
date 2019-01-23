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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from '../../modules/core/auth/auth.service';
import { UserService } from '../../modules/setup/users/user.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css']
})
export class PagesComponent implements OnInit {
  @Input() appdrawer;
  @Output() preferencesClick: EventEmitter<any> = new EventEmitter();

  constructor(public authService: AuthService,
              public userService: UserService) {
  }

  ngOnInit() {
  }

  public set selectedUserAccountId(accountId) {
    console.log('accountId', accountId);
    this.authService.userAccountSelect.next(accountId);
    this.userService.fetchAccountUsers(accountId);
    this.appdrawer.close();
  }

  onSignOutClick() {
    this.authService.signOut();
    this.appdrawer.close();
  }

  onPreferencesClick() {
    this.preferencesClick.emit();
  }
}
