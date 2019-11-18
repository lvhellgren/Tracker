import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalAccountComponent } from './principal-account.component';

describe('PrincipalAccountComponent', () => {
  let component: PrincipalAccountComponent;
  let fixture: ComponentFixture<PrincipalAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrincipalAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrincipalAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
