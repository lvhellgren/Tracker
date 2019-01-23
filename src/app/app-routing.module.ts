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
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './modules/core/sign-in/sign-in.component';
import { UnknownComponent } from './modules/core/unknown/unknown.component';
import { AuthGuard } from './modules/core/auth/auth.guard';
import { SetupComponent } from './modules/setup/setup.component';
import { Page1Component } from './modules/page1/page1.component';
import { Page2Component } from './modules/page2/page2.component';
import { Page3Component } from './modules/page3/page3.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'page1',
    pathMatch: 'full',
  },
  {
    path: 'sign-in',
    component: SignInComponent
  },
  {
    path: 'setup',
    component: SetupComponent,
    loadChildren: './modules/setup/setup.module#SetupModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'page1',
    component: Page1Component,
    canActivate: [AuthGuard]
  },
  {
    path: 'page2',
    component: Page2Component,
    canActivate: [AuthGuard]
  },
  {
    path: 'page3',
    component: Page3Component,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    component: UnknownComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
