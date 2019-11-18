import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActSubscriptionComponent } from './act-subscription.component';

describe('ActSubscriptionsAddComponent', () => {
  let component: ActSubscriptionComponent;
  let fixture: ComponentFixture<ActSubscriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActSubscriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
