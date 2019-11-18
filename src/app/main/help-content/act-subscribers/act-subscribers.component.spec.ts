import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActSubscribersComponent } from './act-subscribers.component';

describe('ActSubscribersComponent', () => {
  let component: ActSubscribersComponent;
  let fixture: ComponentFixture<ActSubscribersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActSubscribersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActSubscribersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
