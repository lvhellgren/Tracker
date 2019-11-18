import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActDevicesComponent } from './act-devices.component';

describe('ActDevicesComponent', () => {
  let component: ActDevicesComponent;
  let fixture: ComponentFixture<ActDevicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActDevicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
