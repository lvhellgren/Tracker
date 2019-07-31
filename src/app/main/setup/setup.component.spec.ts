import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupComponent } from './setup.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { routes } from '../../app-routing.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SignInComponent } from '../core/sign-in/sign-in.component';
import { UnitsComponent } from '../locations/units/units.component';
import { PlacesComponent } from '../locations/places/places.component';
import { NotificationsComponent } from '../notifications/notifications.component';
import { UnknownComponent } from '../core/unknown/unknown.component';
import { LocationsComponent } from '../locations/locations.component';
import { AppAngularMaterialModule } from '../../app-angular-material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class MockAuthService {
}

describe('SetupComponent', () => {
  let component: SetupComponent;
  let fixture: ComponentFixture<SetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
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
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupComponent);
    component = fixture.componentInstance;
    spyOn(component, 'ngOnInit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
