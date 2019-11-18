import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActSubscriberComponent } from './act-subscriber.component';

describe('ActSubscribersAddComponent', () => {
  let component: ActSubscriberComponent;
  let fixture: ComponentFixture<ActSubscriberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActSubscriberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActSubscriberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
