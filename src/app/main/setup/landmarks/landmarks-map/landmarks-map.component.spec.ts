import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandmarksMapComponent } from './landmarks-map.component';

describe('LandmarksMapComponent', () => {
  let component: LandmarksMapComponent;
  let fixture: ComponentFixture<LandmarksMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandmarksMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandmarksMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
