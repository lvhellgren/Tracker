import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountConstraintsComponent } from './account-constraints.component';

describe('AccountConstraintsComponent', () => {
  let component: AccountConstraintsComponent;
  let fixture: ComponentFixture<AccountConstraintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountConstraintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountConstraintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
