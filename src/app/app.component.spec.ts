import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { SignInComponent } from './modules/core/sign-in/sign-in.component';
import { SetupComponent } from './modules/setup/setup.component';
import { Page2Component } from './modules/page2/page2.component';
import { Page3Component } from './modules/page3/page3.component';
import { Page1Component } from './modules/page1/page1.component';
import { UnknownComponent } from './modules/core/unknown/unknown.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './navbar/navbar.component';
import { MessagesComponent } from './modules/core/messages/messages.component';
import { PagesComponent } from './drawers/pages/pages.component';
import { HelpComponent } from './drawers/help/help.component';
import { UserPreferencesComponent } from './drawers/user-preferences/user-preferences.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthService } from './modules/core/auth/auth.service';
import { UserService } from './modules/setup/users/user.service';
import { MatDialog } from '@angular/material';

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
        RouterTestingModule.withRoutes([]),
        ReactiveFormsModule
      ],
      declarations: [
        AppComponent,
        SignInComponent,
        SetupComponent,
        Page1Component,
        Page2Component,
        Page3Component,
        UnknownComponent,
        NavbarComponent,
        MessagesComponent,
        PagesComponent,
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
    router.initialNavigation();
  }));

  it('navigate to "" should redirect to /', fakeAsync(() => {
    router.navigate(['']);
    tick();
    expect(location.path()).toBe('/');
  }));

  xit('navigate to "page1" should redirect to /page1', fakeAsync(() => {
    router.navigate(['page1']);
    tick();
    console.dir(location);
    expect(location.path()).toBe('/page1');
  }));
});
