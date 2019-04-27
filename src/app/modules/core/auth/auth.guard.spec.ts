import { inject, TestBed } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../../app-routing.module';
import { SignInComponent } from '../sign-in/sign-in.component';
import { SetupComponent } from '../../setup/setup.component';
import { AssetsComponent } from '../../assets/assets.component';
import { LandmarksComponent } from '../../landmarks/landmarks.component';
import { AlertsComponent } from '../../alerts/alerts.component';
import { UnknownComponent } from '../unknown/unknown.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

class MockAuthService {
}

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes)
      ],
      declarations: [
        SetupComponent,
        SignInComponent,
        AssetsComponent,
        LandmarksComponent,
        AlertsComponent,
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
