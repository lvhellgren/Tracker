import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDevicesComponent } from './account-devices.component';

describe('AccountDevicesComponent', () => {
  let component: AccountDevicesComponent;
  let fixture: ComponentFixture<AccountDevicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountDevicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
