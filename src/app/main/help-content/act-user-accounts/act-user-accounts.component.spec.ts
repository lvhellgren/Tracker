import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActUserAccountsComponent } from './act-user-accounts.component';

describe('ActUserAccountsComponent', () => {
  let component: ActUserAccountsComponent;
  let fixture: ComponentFixture<ActUserAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActUserAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActUserAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
