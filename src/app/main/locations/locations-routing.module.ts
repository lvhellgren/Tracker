import { NgModule } from '@angular/core';
import { LocationsComponent } from './locations.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/auth/auth.guard';
import { UnitHistoryComponent } from './units/unit-history/unit-history.component';
import { UnitsComponent } from './units/units.component';
import { PlacesComponent } from './places/places.component';
import { UnknownComponent } from '../core/unknown/unknown.component';
import { SmallViewComponent } from './small-view/small-view.component';
import { FullViewComponent } from './full-view/full-view.component';
import { PlaceComponent } from './places/place/place.component';
import { UnitDetailsComponent } from './units/unit-details/unit-details.component';
import { UnitsMapComponent } from './units-map/units-map.component';
import { PlacesMapComponent } from './places-map/places-map.component';
import { PlaceMapComponent } from './places/place/place-map/place-map.component';

const routes: Routes = [
  {
    path: 'locations',
    component: LocationsComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'lg',
        component: FullViewComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            redirectTo: '/locations/lg/units',
            pathMatch: 'full'
          },
          {
            path: '',
            component: UnitsMapComponent,
            outlet: 'map'
          },
          {
            path: 'units',
            component: UnitsComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'units-map',
            component: UnitsMapComponent,
            outlet: 'map'
          },
          {
            path: 'unit-history',
            component: UnitHistoryComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'unit-history/:id',
            component: UnitHistoryComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'unit-details',
            component: UnitDetailsComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'unit-details/:id',
            component: UnitDetailsComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'places',
            component: PlacesComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'places-map',
            component: PlacesMapComponent,
            outlet: 'map'
          },
          {
            path: 'place',
            component: PlaceComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'place/:id',
            component: PlaceComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'place-map',
            component: PlaceMapComponent,
            outlet: 'map'
          },
          {
            path: '**',
            component: UnknownComponent
          }
        ]
      },
      {
        path: 'sm',
        component: SmallViewComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            redirectTo: '/locations/sm/units',
            pathMatch: 'full'
          },
          {
            path: '',
            component: UnitsMapComponent,
            outlet: 'map'
          },
          {
            path: 'units',
            component: UnitsComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'units-map',
            component: UnitsMapComponent,
            outlet: 'map'
          },
          {
            path: 'unit-history',
            component: UnitHistoryComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'unit-history/:id',
            component: UnitHistoryComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'unit-details',
            component: UnitDetailsComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'unit-details/:id',
            component: UnitDetailsComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'places',
            component: PlacesComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'places-map',
            component: PlacesMapComponent,
            outlet: 'map'
          },
          {
            path: 'place',
            component: PlaceComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'place/:id',
            component: PlaceComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'place-map',
            component: PlaceMapComponent,
            outlet: 'map'
          },
          {
            path: '**',
            component: UnknownComponent
          }
        ]
      }
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
export class LocationsRoutingModule {
}
