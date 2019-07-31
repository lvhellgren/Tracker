import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsComponent } from './units.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppAngularMaterialModule } from '../../../app-angular-material.module';

describe('UnitsComponent', () => {
  let component: UnitsComponent;
  let fixture: ComponentFixture<UnitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UnitsComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        AppAngularMaterialModule,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    pending();
    expect(component).toBeTruthy();
  });
});
