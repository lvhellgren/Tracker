import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllUsersComponent } from './all-users.component';
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
import { TimestampToDatePipe } from '../../../core/timestamp-to-date.pipe';
import { AuthService } from '../../../core/auth/auth.service';
import { UserDoc, UserService } from '../user.service';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { By } from '@angular/platform-browser';

class MockAuthService {
}

class MockUserService {
}

describe('AllUsersComponent', () => {
  let component: AllUsersComponent;
  let fixture: ComponentFixture<AllUsersComponent>;
  let el: HTMLElement;
  const dataSource = new MatTableDataSource<UserDoc>();

  const users: UserDoc[] = [
    {
      email: 'xxx@xxx.com',
      name: 'test-name',
      active: true,
      signedInAt: ''
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        AppAngularMaterialModule,
        BrowserAnimationsModule
      ],
      declarations: [
        AllUsersComponent,
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
    fixture = TestBed.createComponent(AllUsersComponent);
    component = fixture.componentInstance;

    spyOn(component, 'ngOnInit');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a table to display the users', () => {
    const dEl = fixture.debugElement.query(By.css('.table-container'));
    el = dEl.nativeElement;
    expect(el.innerHTML).toContain('mat-table');
    expect(el.innerHTML).toContain('mat-header-row');
  });

  it('should have a table row', () => {
    component.dataSource.data = users;

    const dEl = fixture.debugElement.query(By.css('.mat-cell'));
    el = dEl.nativeElement;

    expect(el).toBeTruthy();
  });

  it('should have a table column email', () => {
    component.dataSource.data = users;
    // fixture.detectChanges(); // TODO: Throws exeption

    const dEl = fixture.debugElement.query(By.css('.mat-column-email'));
    el = dEl.nativeElement;
    expect(el).toBeTruthy();

    // expect(el.innerText).toContain('xxx@xxx.com');
  });

  it('should have a table column name', () => {
    component.dataSource.data = users;
    const dEl = fixture.debugElement.query(By.css('.mat-column-name'));
    el = dEl.nativeElement;
    expect(el).toBeTruthy();
  });

  it('should have a table column activeUser', () => {
    component.dataSource.data = users;
    const dEl = fixture.debugElement.query(By.css('.mat-column-activeUser'));
    el = dEl.nativeElement;
    expect(el).toBeTruthy();
  });

  it('should have a table column signedInAt', () => {
    component.dataSource.data = users;
    const dEl = fixture.debugElement.query(By.css('.mat-column-signedInAt'));
    el = dEl.nativeElement;
    expect(el).toBeTruthy();
  });

  // xit('should have a table to display the users', () => {
  //   const table = fixture.debugElement.query(By.css('.table-container'));
  //   el = table.nativeElement;
  //   expect(el.innerHTML).toContain('mat-table');
  //   expect(el.innerHTML).toContain('mat-header-row');
  // });
});
