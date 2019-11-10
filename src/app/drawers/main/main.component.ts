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

import { Component, EventEmitter, Input, isDevMode, OnInit, Output } from '@angular/core';
import { AuthService } from '../../main/core/auth/auth.service';
import { UserService } from '../../main/setup/users/user.service';

@Component({
  selector: 'app-pages',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  @Input() appdrawer;
  @Output() preferencesClick: EventEmitter<any> = new EventEmitter();

  isDevMode: boolean;

  constructor(public authService: AuthService,
              public userService: UserService) {
  }

  public set selectedUserAccountId(accountId) {
    console.log('accountId', accountId);
    this.authService.userAccountSelect.next(accountId);
    this.userService.fetchAccountUsers(accountId);
    this.appdrawer.close();
  }

  ngOnInit() {
    this.isDevMode = isDevMode();
  }

  onSignOutClick() {
    this.authService.signOut();
    this.appdrawer.close();
  }

  onPreferencesClick() {
    this.preferencesClick.emit();
  }
}
