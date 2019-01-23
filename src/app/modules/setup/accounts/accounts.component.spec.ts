import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsComponent } from './accounts.component';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../../app-routing.module';
import { AppAngularMaterialModule } from '../../../app-angular-material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SetupComponent } from '../setup.component';
import { SignInComponent } from '../../core/sign-in/sign-in.component';
import { Page1Component } from '../../page1/page1.component';
import { Page2Component } from '../../page2/page2.component';
import { Page3Component } from '../../page3/page3.component';
import { UnknownComponent } from '../../core/unknown/unknown.component';
import { FormBuilder } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AccountService } from './account.service';
import { AuthService } from '../../core/auth/auth.service';
import { MatDialog } from '@angular/material';
import { By } from '@angular/platform-browser';

class MockAuthService {
}

class MockAccountService {
}

describe('AccountsComponent', () => {
  let component: AccountsComponent;
  let fixture: ComponentFixture<AccountsComponent>;
  let el: HTMLElement;
  const fb: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        AppAngularMaterialModule,
        BrowserAnimationsModule
      ],
      declarations: [
        AccountsComponent,
        SetupComponent,
        SignInComponent,
        Page1Component,
        Page2Component,
        Page3Component,
        UnknownComponent
      ],
      providers: [
        {provide: AuthService, useClass: MockAuthService},
        {provide: AccountService, useClass: MockAccountService},
        {provide: MatDialog, useValue: {}},
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsComponent);
    component = fixture.componentInstance;

    spyOn(component, 'ngOnInit');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a table to display the accounts', () => {
    const table = fixture.debugElement.query(By.css('.table-container'));
    el = table.nativeElement;
    expect(el.innerHTML).toContain('mat-table');
    expect(el.innerHTML).toContain('mat-header-row');
  });
});
