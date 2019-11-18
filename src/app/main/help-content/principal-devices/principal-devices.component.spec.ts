import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalDevicesComponent } from './principal-devices.component';

describe('PrincipalDevicesComponent', () => {
  let component: PrincipalDevicesComponent;
  let fixture: ComponentFixture<PrincipalDevicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrincipalDevicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrincipalDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
