import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPreferencesComponent } from './user-preferences.component';
import { AppAngularMaterialModule } from '../../app-angular-material.module';

describe('UserPreferencesComponent', () => {
  let component: UserPreferencesComponent;
  let fixture: ComponentFixture<UserPreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UserPreferencesComponent
      ],
      imports: [
        AppAngularMaterialModule
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call close() when clicked', async(() => {
    spyOn(component, 'close');

    const button = fixture.debugElement.nativeElement.querySelector('.close-icon');
    button.click();

    fixture.whenStable().then(() => {
      expect(component.close).toHaveBeenCalled();
    });
  }));
});
