import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { AppComponent } from './app.component';
import { Router, Routes } from '@angular/router';
import { SignInComponent } from './main/core/sign-in/sign-in.component';
import { SetupComponent } from './main/setup/setup.component';
import { PlacesComponent } from './main/locations/places/places.component';
import { NotificationsComponent } from './main/notifications/notifications.component';
import { UnitsComponent } from './main/locations/units/units.component';
import { UnknownComponent } from './main/core/unknown/unknown.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './navbar/navbar.component';
import { MessagesComponent } from './main/core/messages/messages.component';
import { MainComponent } from './drawers/main/main.component';
import { HelpComponent } from './drawers/help/help.component';
import { UserPreferencesComponent } from './drawers/user-preferences/user-preferences.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthService } from './main/core/auth/auth.service';
import { UserService } from './main/setup/users/user.service';
import { MatDialog, MatMenuModule, MatTableModule } from '@angular/material';
import { SetupModule } from './main/setup/setup.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'locations',
    pathMatch: 'full',
  },
  {
    path: 'sign-in',
    component: SignInComponent
  },
  {
    path: 'setup',
    loadChildren: './main/setup/setup.module#SetupModule'
  },
  {
    path: 'locations',
    loadChildren: './main/setup/setup.module#LocationsModule'
  },
  {
    path: 'notifications',
    component: NotificationsComponent
  }
];

class MockAuthService {
}

class MockUserService {
}

class MockMatDialog {
}

describe('AppComponent', () => {
  let component: AppComponent;
  let location: Location;
  let router: Router;
  let fixture;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        ReactiveFormsModule,
        FormsModule,
        MatMenuModule,
        MatTableModule,
        SetupModule,
      ],
      declarations: [
        AppComponent,
        SignInComponent,
        SetupComponent,
        UnitsComponent,
        PlacesComponent,
        NotificationsComponent,
        UnknownComponent,
        NavbarComponent,
        MessagesComponent,
        MainComponent,
        HelpComponent,
        UserPreferencesComponent
      ],
      providers: [
        {provide: AuthService, useClass: MockAuthService},
        {provide: UserService, useClass: MockUserService},
        {provide: MatDialog, useClass: MockMatDialog}
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();

    router = TestBed.get(Router);
    location = TestBed.get(Location);

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router.initialNavigation();
  }));

  it('navigate to "sign-in" should redirect to /sign-in', fakeAsync(() => {
    pending();
    router.navigate(['sign-in']);
    tick();
    expect(location.path()).toBe('/sign-in');
  }));

  it('navigate to "" should redirect to /locations', fakeAsync(() => {
    pending();
    router.navigate(['']);
    tick();
    expect(location.path()).toBe('/locations', 'Testing default URL');
  }));

  it('navigate to "locations" should redirect to /locations', fakeAsync(() => {
    pending();
    router.navigate(['locations']);
    tick();
    expect(location.path()).toBe('/locations');
  }));

  it('navigate to "notifications" should redirect to /notifications', fakeAsync(() => {
    pending();
    router.navigate(['notifications']);
    tick();
    expect(location.path()).toBe('/notifications');
  }));

  xit('navigate to "setup" should redirect to /setup', fakeAsync(() => {
    router.navigate(['setup']);
    tick();
    console.dir(location);
    expect(location.path()).toBe('/setup');
  }));
});
