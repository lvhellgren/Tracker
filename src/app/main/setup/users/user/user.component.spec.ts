import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { UserComponent } from './user.component';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../user.service';

import { DatePipe, Location } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { routes } from '../../../../app-routing.module';
import { SignInComponent } from '../../../core/sign-in/sign-in.component';
import { AppAngularMaterialModule } from '../../../../app-angular-material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UnitsComponent } from '../../../locations/units/units.component';
import { PlacesComponent } from '../../../locations/places/places.component';
import { NotificationsComponent } from '../../../notifications/notifications.component';
import { UnknownComponent } from '../../../core/unknown/unknown.component';
import { SetupComponent } from '../../setup.component';
import { By } from '@angular/platform-browser';
import { LocationsComponent } from '../../../locations/locations.component';

class MockUserService {
}

class MockAuthService {
}

class MockMatDialog {
}

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  const fb: FormBuilder = new FormBuilder();
  const datePipe: DatePipe = new DatePipe(null);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        AppAngularMaterialModule,
        BrowserAnimationsModule
      ],
      declarations: [
        UserComponent,
        SetupComponent,
        SignInComponent,
        LocationsComponent,
        UnitsComponent,
        PlacesComponent,
        NotificationsComponent,
        UnknownComponent],
      providers: [
        {provide: FormBuilder, useValue: fb},
        {provide: UserService, useClass: MockUserService},
        {provide: DatePipe, useValue: datePipe},
        {provide: Location, useValue: {}},
        {provide: AuthService, useClass: MockAuthService},
        {provide: MatDialog, useClass: MockMatDialog},
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;

    component.userForm = fb.group({
      email: ['', component.userIdValidators],
      roles: [''],
      name: ['', component.nameValidators],
      phone: [''],
      signedInAt: [''],
      modifiedAt: [''],
      createdAt: [''],
      comment: [''],
      activeUser: ['']
    });

    spyOn(component, 'ngOnInit');

    fixture.detectChanges();
  });

  it('should create form with all controls', () => {
    expect(component).toBeTruthy();
    expect(component.userForm.contains('email')).toBeTruthy();
    expect(component.userForm.contains('roles')).toBeTruthy();
    expect(component.userForm.contains('name')).toBeTruthy();
    expect(component.userForm.contains('phone')).toBeTruthy();
    expect(component.userForm.contains('signedInAt')).toBeTruthy();
    expect(component.userForm.contains('modifiedAt')).toBeTruthy();
    expect(component.userForm.contains('createdAt')).toBeTruthy();
    expect(component.userForm.contains('comment')).toBeTruthy();
    expect(component.userForm.contains('activeUser')).toBeTruthy();
  });

  it('should require User ID field', () => {
    const control = component.userForm.get('email');
    control.setValue('');
    expect(control.valid).toBeFalsy();
  });

  it('should require User ID field to have email format', () => {
    const control = component.userForm.get('email');
    control.setValue('xxx@xxx,com');
    expect(control.valid).toBeFalsy();

    control.setValue('xxx&xxx.com');
    expect(control.valid).toBeFalsy();

    control.setValue('xxx@xxx.com');
    expect(control.valid).toBeTruthy();
  });

  it('should require Name field', () => {
    const control = component.userForm.get('name');
    control.setValue('');
    expect(control.valid).toBeFalsy();
  });

  xit('should clear the form on Clear button clicks', () => {
    const dEl = fixture.debugElement.query(By.css('.clear-button'));
    dEl.triggerEventHandler('click', null);

    const control = component.userForm.get('name');
    expect(control.valid).toBeFalsy();
  });
});
