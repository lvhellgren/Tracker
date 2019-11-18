import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalAccountsComponent } from './principal-accounts.component';

describe('PrincipalAccountsComponent', () => {
  let component: PrincipalAccountsComponent;
  let fixture: ComponentFixture<PrincipalAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrincipalAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrincipalAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
