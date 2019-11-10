import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/auth/auth.guard';
import { ReportsComponent } from './reports.component';
import { BlankComponent } from '../simulator/blank/blank.component';
import { ActivityComponent } from './activity/activity.component';
import { AccountActivityComponent } from './activity/account-activity/account-activity.component';


const routes: Routes = [
  {
    path: 'reports',
    component: ReportsComponent,
    children: [
      {
        path: '',
        redirectTo: '/reports/blank',
        pathMatch: 'full',
        canActivate: [AuthGuard]
      },
      {
        path: 'blank',
        component: BlankComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'activity',
        component: ActivityComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'account-activity',
        component: AccountActivityComponent,
        canActivate: [AuthGuard]
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})

export class ReportsRoutingModule {
}
