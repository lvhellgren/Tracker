// Copyright (c) 2020 Lars Hellgren.
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

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './main/core/sign-in/sign-in.component';
import { UnknownComponent } from './main/core/unknown/unknown.component';
import { AuthGuard } from './main/core/auth/auth.guard';
import { NotificationsComponent } from './main/notifications/notifications.component';
import { NotificationComponent } from './main/notifications/notification/notification.component';
import { DevEnvGuard } from './main/core/env/dev-env-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'locations',
    pathMatch: 'full',
  },
  {
    path: 'sign-in',
    component: SignInComponent
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'notification/:id',
    component: NotificationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reports',
    loadChildren: './main/reports/reports.module#ReportsModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'setup',
    loadChildren: './main/setup/setup.module#SetupModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'simulator',
    loadChildren: './main/simulator/simulator.module#SimulatorModule',
    canActivate: [AuthGuard],
    canLoad: [DevEnvGuard]
  },
  {
    path: '**',
    component: UnknownComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  // imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
