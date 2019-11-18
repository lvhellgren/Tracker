import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulatorMoveEventComponent } from './simulator-move-event.component';

describe('SimulatorMoveEventComponent', () => {
  let component: SimulatorMoveEventComponent;
  let fixture: ComponentFixture<SimulatorMoveEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimulatorMoveEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulatorMoveEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
