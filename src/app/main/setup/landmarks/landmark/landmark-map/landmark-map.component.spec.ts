import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandmarkMapComponent } from './landmark-map.component';

describe('LandmarkMapComponent', () => {
  let component: LandmarkMapComponent;
  let fixture: ComponentFixture<LandmarkMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandmarkMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandmarkMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
