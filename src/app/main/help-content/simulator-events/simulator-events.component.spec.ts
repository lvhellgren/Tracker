import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulatorEventsComponent } from './simulator-events.component';

describe('SimulatorEventsComponent', () => {
  let component: SimulatorEventsComponent;
  let fixture: ComponentFixture<SimulatorEventsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimulatorEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulatorEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
