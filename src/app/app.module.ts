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
import { CoreModule } from './main/core/core.module';
import { AppAngularMaterialModule } from './app-angular-material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HelpComponent } from './drawers/help/help.component';
import { UserPreferencesComponent } from './drawers/user-preferences/user-preferences.component';
import { MainComponent } from './drawers/main/main.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SetupModule } from './main/setup/setup.module';
import { UnitsModule } from './main/locations/units/units.module';
import { PlacesModule } from './main/locations/places/places.module';
import { NotificationsModule } from './main/notifications/notifications.module';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppKendoModule } from './app-kendo.module';
import { LocationsModule } from './main/locations/locations.module';
import { GlobalService } from './sevices/global';
import { MatNativeDateModule } from '@angular/material';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    MainComponent,
    HelpComponent,
    UserPreferencesComponent
  ],
  imports: [
    CoreModule,
    SetupModule,
    LocationsModule,
    UnitsModule,
    PlacesModule,
    NotificationsModule,
    AppRoutingModule,  // Should be last import of application modules
    BrowserAnimationsModule,
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    AppAngularFireModule,
    AppAngularMaterialModule,
    AppKendoModule,
    MatNativeDateModule
  ],
  providers: [
    DatePipe,
    GlobalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
