// Copyright (c) 2019 Lars Hellgren.
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupComponent } from './setup.component';
import { AccountsComponent } from './accounts/accounts.component';
import { CoreModule } from '../core/core.module';
import { AppAngularMaterialModule } from '../../app-angular-material.module';
import { UserService } from './users/user.service';
import { UserComponent } from './users/user/user.component';
import { AccountComponent } from './accounts/account/account.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AccountService } from './accounts/account.service';
import { SetupRoutingModule } from './setup-routing.module';
import { BlankComponent } from './blank/blank.component';
import { AllUsersComponent } from './users/all-users/all-users.component';
import { AccountUsersComponent } from './users/account-users/account-users.component';

@NgModule({
  imports: [
    FlexLayoutModule,
    CommonModule,
    CoreModule,
    SetupRoutingModule,
    AppAngularMaterialModule
  ],
  declarations: [
    SetupComponent,
    AccountsComponent,
    UserComponent,
    AccountComponent,
    BlankComponent,
    AllUsersComponent,
    AccountUsersComponent
  ],
  providers: [
    UserService,
    AccountService
  ]
})
export class SetupModule {
}
