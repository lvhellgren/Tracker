import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { UserComponent } from './user.component';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../user.service';

import { DatePipe, Location } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material';
import { routes } from '../../../../app-routing.module';
import { SignInComponent } from '../../../core/sign-in/sign-in.component';
import { AppAngularMaterialModule } from '../../../../app-angular-material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Page1Component } from '../../../page1/page1.component';
import { Page2Component } from '../../../page2/page2.component';
import { Page3Component } from '../../../page3/page3.component';
import { UnknownComponent } from '../../../core/unknown/unknown.component';
import { SetupComponent } from '../../setup.component';
import { By } from '@angular/platform-browser';

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
        Page1Component,
        Page2Component,
        Page3Component,
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

    component.userFormGroup = fb.group({
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
    expect(component.userFormGroup.contains('email')).toBeTruthy();
    expect(component.userFormGroup.contains('roles')).toBeTruthy();
    expect(component.userFormGroup.contains('name')).toBeTruthy();
    expect(component.userFormGroup.contains('phone')).toBeTruthy();
    expect(component.userFormGroup.contains('signedInAt')).toBeTruthy();
    expect(component.userFormGroup.contains('modifiedAt')).toBeTruthy();
    expect(component.userFormGroup.contains('createdAt')).toBeTruthy();
    expect(component.userFormGroup.contains('comment')).toBeTruthy();
    expect(component.userFormGroup.contains('activeUser')).toBeTruthy();
  });

  it('should require User ID field', () => {
    const control = component.userFormGroup.get('email');
    control.setValue('');
    expect(control.valid).toBeFalsy();
  });

  it('should require User ID field to have email format', () => {
    const control = component.userFormGroup.get('email');
    control.setValue('xxx@xxx,com');
    expect(control.valid).toBeFalsy();

    control.setValue('xxx&xxx.com');
    expect(control.valid).toBeFalsy();

    control.setValue('xxx@xxx.com');
    expect(control.valid).toBeTruthy();
  });

  it('should require Name field', () => {
    const control = component.userFormGroup.get('name');
    control.setValue('');
    expect(control.valid).toBeFalsy();
  });

  xit('should clear the form on Clear button clicks', () => {
    const dEl = fixture.debugElement.query(By.css('.clear-button'));
    dEl.triggerEventHandler('click', null);

    const control = component.userFormGroup.get('name');
    expect(control.valid).toBeFalsy();
  });
});
