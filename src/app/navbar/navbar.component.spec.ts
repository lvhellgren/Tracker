import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';
import { AuthService } from '../main/core/auth/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { UserService } from '../main/setup/users/user.service';
import { By } from '@angular/platform-browser';
import { BreakPointRegistry, FlexLayoutModule } from '@angular/flex-layout';
// import { BreakPointRegistry, FlexLayoutModule, eMatchMedia, MockMatchMedia } from '@angular/flex-layout';

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

  /**
   * For responsive UI testing
   */
  const activateMediaQuery = (alias) => {
    const injector = fixture.debugElement.injector;
    // const matchMedia: MockMatchMedia = <MockMatchMedia>injector.get(MatchMedia);

    // Simulate mediaQuery change and trigger fxLayout changes
    // matchMedia.activate(alias);
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        FlexLayoutModule
      ],
      declarations: [
        NavbarComponent
      ],
      providers: [
        BreakPointRegistry,
        // {provide: MatchMedia, useClass: MockMatchMedia},
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

  it('should show application name', () => {
    const txt = fixture.debugElement.query(By.css('.txt-logo'));
    expect(txt.nativeElement.textContent.trim()).toContain('Tracker');
  });

  it('should show application logo', () => {
    const txt = fixture.debugElement.query(By.css('.logo'));
    // console.dir(txt.nativeNode);
    expect(txt.nativeNode.currentSrc).toContain('tracker_white.png');
  });

  it('should have page selections', () => {
    const list = fixture.debugElement.query(By.css('.page-row'));
    expect(list.childNodes[0].nativeNode.textContent.trim()).toBe('LOCATIONS');
    expect(list.childNodes[1].nativeNode.textContent.trim()).toBe('NOTIFICATIONS');
    expect(list.childNodes[2].nativeNode.textContent.trim()).toBe('SETUP');
  });

  it('should show current user', () => {
    const button = fixture.debugElement.query(By.css('#user-dropdown'));
    expect(button.childNodes[0].nativeNode.textContent.trim()).toBe(MockAuthService.prototype.getUserId());
  });

  it('should show help markerIconForm', () => {
    const button = fixture.debugElement.query(By.css('#user-dropdown'));
    // console.dir(button.childNodes[1].nativeNode);
    expect(button.childNodes[1].nativeNode.localName).toBe('mat-markerIconForm');
  });

  it('should contain the drawer button', () => {
    pending();
    activateMediaQuery('sm');
    const injector = fixture.debugElement.injector;
    // const matchMedia: MockMatchMedia = <MockMatchMedia>injector.get(MatchMedia);
    // matchMedia.activate('sm');

    const button = fixture.debugElement.query(By.css('#drawer-button'));
    expect(button.childNodes[1].nativeNode.localName).toBe('menu');
  });
});
