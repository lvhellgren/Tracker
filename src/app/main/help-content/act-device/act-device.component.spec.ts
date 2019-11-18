import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActDeviceComponent } from './act-device.component';

describe('ActDeviceAddComponent', () => {
  let component: ActDeviceComponent;
  let fixture: ComponentFixture<ActDeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActDeviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
