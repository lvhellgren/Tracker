import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActSubscriptionsComponent } from './act-subscriptions.component';

describe('ActSubscriptionsComponent', () => {
  let component: ActSubscriptionsComponent;
  let fixture: ComponentFixture<ActSubscriptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActSubscriptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActSubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
