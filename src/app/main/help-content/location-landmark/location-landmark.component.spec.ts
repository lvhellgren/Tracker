import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationLandmarkComponent } from './location-landmark.component';

describe('LocationLandmarkComponent', () => {
  let component: LocationLandmarkComponent;
  let fixture: ComponentFixture<LocationLandmarkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationLandmarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationLandmarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
