import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalAccountConstraintsComponent } from './principal-account-constraints.component';

describe('PrincipalAccountConstraintsComponentComponent', () => {
  let component: PrincipalAccountConstraintsComponent;
  let fixture: ComponentFixture<PrincipalAccountConstraintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrincipalAccountConstraintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrincipalAccountConstraintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
