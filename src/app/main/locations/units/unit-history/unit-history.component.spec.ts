import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitHistoryComponent } from './unit-history.component';

describe('UnitHistoryComponent', () => {
  let component: UnitHistoryComponent;
  let fixture: ComponentFixture<UnitHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnitHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
