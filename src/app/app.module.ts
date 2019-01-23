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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppAngularFireModule } from './app-angular-fire.module';
import { CoreModule } from './modules/core/core.module';
import { AppAngularMaterialModule } from './app-angular-material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HelpComponent } from './drawers/help/help.component';
import { UserPreferencesComponent } from './drawers/user-preferences/user-preferences.component';
import { PagesComponent } from './drawers/pages/pages.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SetupModule } from './modules/setup/setup.module';
import { Page1Module } from './modules/page1/page1.module';
import { Page2Module } from './modules/page2/page2.module';
import { Page3Module } from './modules/page3/page3.module';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    PagesComponent,
    HelpComponent,
    UserPreferencesComponent
  ],
  imports: [
    CoreModule,
    SetupModule,
    Page1Module,
    Page2Module,
    Page3Module,
    AppRoutingModule,  // Should be last import of application modules
    BrowserAnimationsModule,
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    AppAngularFireModule,
    AppAngularMaterialModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule {
}
