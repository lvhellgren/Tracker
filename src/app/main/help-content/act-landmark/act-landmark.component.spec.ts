import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActLandmarkComponent } from './act-landmark.component';

describe('ActLandmarkAddComponent', () => {
  let component: ActLandmarkComponent;
  let fixture: ComponentFixture<ActLandmarkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActLandmarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActLandmarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
