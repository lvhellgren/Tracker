import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountComponent } from './account.component';
import { AppAngularMaterialModule } from '../../../../app-angular-material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../../../app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SetupComponent } from '../../setup.component';
import { SignInComponent } from '../../../core/sign-in/sign-in.component';
import { Page1Component } from '../../../page1/page1.component';
import { Page2Component } from '../../../page2/page2.component';
import { Page3Component } from '../../../page3/page3.component';
import { UnknownComponent } from '../../../core/unknown/unknown.component';
import { FormBuilder } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AccountService } from '../account.service';

class MockAccountService {
}

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;
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
        AccountComponent,
        SetupComponent,
        SignInComponent,
        Page1Component,
        Page2Component,
        Page3Component,
        UnknownComponent
      ],
      providers: [
        {provide: FormBuilder, useValue: fb},
        {provide: AccountService, useClass: MockAccountService},
        {provide: DatePipe, useValue: datePipe},
        {provide: Location, useValue: {}}
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;

    component.accountFormGroup = fb.group({
      id: ['', component.idValidators],
      address1: [''],
      address2: [''],
      city: [''],
      state: [''],
      postalCode: [''],
      modifiedAt: [''],
      createdAt: [''],
      description: ['']
    });

    spyOn(component, 'ngOnInit');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require Name field', () => {
    const control = component.accountFormGroup.get('id');
    control.setValue('');
    expect(control.valid).toBeFalsy();
  });
});
