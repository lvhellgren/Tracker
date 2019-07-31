import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map.component';
import { AgmCoreModule } from '@agm/core';
import { AppAngularMaterialModule } from '../../../app-angular-material.module';

@NgModule({
  declarations: [MapComponent],
  exports: [
    MapComponent
  ],
  imports: [
    CommonModule,
    AgmCoreModule.forRoot({apiKey: 'AIzaSyD-LFpn2il_UILZqIXVDpU0M6gQjS_RYUQ'}),
    AppAngularMaterialModule,
  ]
})
export class MapModule { }
