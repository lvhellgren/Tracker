import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActServiceStatusComponent } from './act-service-status.component';

describe('ActServiceStatusComponent', () => {
  let component: ActServiceStatusComponent;
  let fixture: ComponentFixture<ActServiceStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActServiceStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActServiceStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
