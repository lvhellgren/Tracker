// Copyright (c) 2020 Lars Hellgren (lars@exelor.com).
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
import { CommonModule } from '@angular/common';
import { LocationsComponent } from './locations.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppKendoModule } from '../../app-kendo.module';
import { AppAngularMaterialModule } from '../../app-angular-material.module';
import { UnitsModule } from './units/units.module';
import { PlacesModule } from './places/places.module';
import { LocationsRoutingModule } from './locations-routing.module';
import { FullViewComponent } from './full-view/full-view.component';
import { SmallViewComponent } from './small-view/small-view.component';
import { LayoutModule } from '@angular/cdk/layout';
import { AppMapModule } from '../../app-map.module';
import { UnitsMapComponent } from './units-map/units-map.component';
import { PlacesMapComponent } from './places-map/places-map.component';
import { PlaceMapComponent } from './places/place/place-map/place-map.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [
    LocationsComponent,
    UnitsMapComponent,
    PlacesMapComponent,
    PlaceMapComponent,
    FullViewComponent,
    SmallViewComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    LayoutModule,
    AppKendoModule,
    AppAngularMaterialModule,
    UnitsModule,
    PlacesModule,
    AppMapModule,
    LocationsRoutingModule,
    CoreModule
  ],
  exports: [
    LocationsComponent
  ]
})
export class LocationsModule {
}
