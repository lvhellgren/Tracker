import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveEventComponent } from './move-event.component';

describe('MoveEventComponent', () => {
  let component: MoveEventComponent;
  let fixture: ComponentFixture<MoveEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoveEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
