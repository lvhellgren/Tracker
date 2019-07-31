import { inject, TestBed } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../../app-routing.module';
import { SignInComponent } from '../sign-in/sign-in.component';
import { SetupComponent } from '../../setup/setup.component';
import { UnitsComponent } from '../../locations/units/units.component';
import { PlacesComponent } from '../../locations/places/places.component';
import { NotificationsComponent } from '../../notifications/notifications.component';
import { UnknownComponent } from '../unknown/unknown.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { LocationsComponent } from '../../locations/locations.component';
import { AppAngularMaterialModule } from '../../../app-angular-material.module';

class MockAuthService {
}

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        AppAngularMaterialModule
      ],
      declarations: [
        SetupComponent,
        SignInComponent,
        LocationsComponent,
        UnitsComponent,
        PlacesComponent,
        NotificationsComponent,
        UnknownComponent],
      providers: [
        {provide: AuthService, useClass: MockAuthService}
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    });
  });

  it('should create', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
