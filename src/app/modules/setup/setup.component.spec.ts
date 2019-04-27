import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupComponent } from './setup.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { routes } from '../../app-routing.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SignInComponent } from '../core/sign-in/sign-in.component';
import { AssetsComponent } from '../assets/assets.component';
import { LandmarksComponent } from '../landmarks/landmarks.component';
import { AlertsComponent } from '../alerts/alerts.component';
import { UnknownComponent } from '../core/unknown/unknown.component';

class MockAuthService {
}

describe('SetupComponent', () => {
  let component: SetupComponent;
  let fixture: ComponentFixture<SetupComponent>;

  beforeEach(async(() => {
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
