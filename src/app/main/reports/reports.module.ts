import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { BlankComponent } from './blank/blank.component';
import { AppAngularMaterialModule } from '../../app-angular-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CoreModule } from '../core/core.module';
import { ActivityComponent } from './activity/activity.component';
import { AccountActivityComponent } from './activity/account-activity/account-activity.component';



@NgModule({
  declarations: [
    ReportsComponent,
    BlankComponent,
    ActivityComponent,
    AccountActivityComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    FlexLayoutModule,
    ReportsRoutingModule,
    AppAngularMaterialModule
  ]
})
export class ReportsModule { }
