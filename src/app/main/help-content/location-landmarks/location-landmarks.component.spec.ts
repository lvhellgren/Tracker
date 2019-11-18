import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationLandmarksComponent } from './location-landmarks.component';

describe('LocationLandmarksComponent', () => {
  let component: LocationLandmarksComponent;
  let fixture: ComponentFixture<LocationLandmarksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationLandmarksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationLandmarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
