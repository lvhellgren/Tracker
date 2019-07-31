import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountComponent } from './account.component';
import { AppAngularMaterialModule } from '../../../../app-angular-material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../../../app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SetupComponent } from '../../setup.component';
import { SignInComponent } from '../../../core/sign-in/sign-in.component';
import { UnitsComponent } from '../../../locations/units/units.component';
import { PlacesComponent } from '../../../locations/places/places.component';
import { NotificationsComponent } from '../../../notifications/notifications.component';
import { UnknownComponent } from '../../../core/unknown/unknown.component';
import { FormBuilder } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AccountService } from '../account.service';
import { LocationsComponent } from '../../../locations/locations.component';

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
        LocationsComponent,
        UnitsComponent,
        PlacesComponent,
        NotificationsComponent,
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
    const control = component.accountFormGroup.get('documentId');
    control.setValue('');
    expect(control.valid).toBeFalsy();
  });
});
