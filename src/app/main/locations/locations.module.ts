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
import { MapComponent } from './map/map.component';

@NgModule({
  declarations: [
    LocationsComponent,
    MapComponent,
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
    LocationsRoutingModule
  ],
  exports: [
    LocationsComponent
  ]
})
export class LocationsModule {
}
