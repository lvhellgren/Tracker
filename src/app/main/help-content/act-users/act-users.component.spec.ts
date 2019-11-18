import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActUsersComponent } from './act-users.component';

describe('ActUsersComponent', () => {
  let component: ActUsersComponent;
  let fixture: ComponentFixture<ActUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
