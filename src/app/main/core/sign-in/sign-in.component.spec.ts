import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormBuilder } from '@angular/forms';
import { SignInComponent } from './sign-in.component';
import { AppAngularMaterialModule } from '../../../app-angular-material.module';
import { AuthService } from '../auth/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class MockAuthService {
  getUserId() {
    return 'jasmine';
  }
}

describe('SignInComponent', () => {
  beforeEach(function () {
  });
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SignInComponent
      ],
      imports: [
        AppAngularMaterialModule,
        BrowserAnimationsModule
      ],
      providers: [
        {provide: AuthService, useClass: MockAuthService},
        {provide: FormBuilder, useClass: formBuilder}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    spyOn(component, 'ngOnInit');

    component.signInForm = formBuilder.group({
      userId: ['', component.userIdValidators],
      password: ['', component.passwordValidators]
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should conatain user ID field', () => {
    expect(component.signInForm.contains('userId')).toBeTruthy();
  });

  it('should require user ID', () => {
    const control = component.signInForm.get('userId');
    control.setValue('');
    expect(control.valid).toBeFalsy();
  });

  it('should require user ID to have email format', () => {
    const control = component.signInForm.get('userId');
    control.setValue('xxx@xxx,com');
    expect(control.valid).toBeFalsy();

    control.setValue('xxx&xxx.com');
    expect(control.valid).toBeFalsy();

    control.setValue('xxx@xxx.com');
    expect(control.valid).toBeTruthy();
  });

  it('should conatain password field', () => {
    expect(component.signInForm.contains('password')).toBeTruthy();
  });

  it('should have password length between 6 and 25', () => {
    const control = component.signInForm.get('password');
    control.setValue('1234x');
    expect(control.valid).toBeFalsy();

    control.setValue('12345x');
    expect(control.valid).toBeTruthy();

    control.setValue('1234567890123456789012345x');
    expect(control.valid).toBeFalsy();

    control.setValue('123456789012345678901234x');
    expect(control.valid).toBeTruthy();
  });

  it('should allow number and apper/lower case alphabetic characters in password', () => {
    const control = component.signInForm.get('password');
    control.setValue('0aA12bcBC%');
    expect(control.valid).toBeTruthy();
  });

  it('should not allow space in password', () => {
    const control = component.signInForm.get('password');
    control.setValue('0aA12 bcBC%');
    expect(control.valid).toBeTruthy();
  });
});
