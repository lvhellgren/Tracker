import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';
import { AuthService } from '../modules/core/auth/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UserService } from '../modules/setup/users/user.service';
import { SignInComponent } from '../modules/core/sign-in/sign-in.component';
import { By } from '@angular/platform-browser';

class MockAuthService {
  getUserId() {
    return 'jasmine';
  }
}

class MockUserService {
}

class MockMatDialog {
}

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        NavbarComponent,
        SignInComponent
      ],
      providers: [
        {provide: AuthService, useClass: MockAuthService},
        {provide: UserService, useClass: MockUserService},
        {provide: MatDialog, useClass: MockMatDialog}
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    spyOn(component, 'ngOnInit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show current user', () => {
    const button = fixture.debugElement.query(By.css('#userDropdown'));
    expect(button.nativeElement.textContent.trim()).toBe(MockAuthService.prototype.getUserId());
  });

  it('should show application name', () => {
    const txt = fixture.debugElement.query(By.css('.txt-logo'));
    expect(txt.nativeElement.textContent.trim()).toContain('Leapfire');
  });
});
