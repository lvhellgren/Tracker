import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalUsersComponent } from './principal-users.component';

describe('PrincipalUsersComponent', () => {
  let component: PrincipalUsersComponent;
  let fixture: ComponentFixture<PrincipalUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrincipalUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrincipalUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
