import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActUserComponent } from './act-user.component';

describe('ActUserAddComponent', () => {
  let component: ActUserComponent;
  let fixture: ComponentFixture<ActUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
