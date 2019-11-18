import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActLandmarksComponent } from './act-landmarks.component';

describe('ActLandmarksComponent', () => {
  let component: ActLandmarksComponent;
  let fixture: ComponentFixture<ActLandmarksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActLandmarksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActLandmarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
