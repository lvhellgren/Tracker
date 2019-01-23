import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountUsersComponent } from './account-users.component';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../../../app-routing.module';
import { AppAngularMaterialModule } from '../../../../app-angular-material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SetupComponent } from '../../setup.component';
import { SignInComponent } from '../../../core/sign-in/sign-in.component';
import { Page1Component } from '../../../page1/page1.component';
import { Page2Component } from '../../../page2/page2.component';
import { Page3Component } from '../../../page3/page3.component';
import { UnknownComponent } from '../../../core/unknown/unknown.component';
import { AuthService } from '../../../core/auth/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TimestampToDatePipe } from '../../../core/timestamp-to-date.pipe';
import { UserService } from '../user.service';
import { By } from '@angular/platform-browser';

class MockAuthService {
}

class MockUserService {
}

describe('AccountUsersComponent', () => {
  let component: AccountUsersComponent;
  let fixture: ComponentFixture<AccountUsersComponent>;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        AppAngularMaterialModule,
        BrowserAnimationsModule
      ],
      declarations: [
        AccountUsersComponent,
        SetupComponent,
        SignInComponent,
        Page1Component,
        Page2Component,
        Page3Component,
        UnknownComponent,
        TimestampToDatePipe
      ],
      providers: [
        {provide: AuthService, useClass: MockAuthService},
        {provide: UserService, useClass: MockUserService},
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountUsersComponent);
    component = fixture.componentInstance;

    spyOn(component, 'ngOnInit');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a table to display the users', () => {
    const table = fixture.debugElement.query(By.css('.table-container'));
    el = table.nativeElement;
    expect(el.innerHTML).toContain('mat-table');
    expect(el.innerHTML).toContain('mat-header-row');
  });
});
