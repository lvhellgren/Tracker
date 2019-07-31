import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallViewComponent } from './small-view.component';

describe('SmallViewComponent', () => {
  let component: SmallViewComponent;
  let fixture: ComponentFixture<SmallViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmallViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmallViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
