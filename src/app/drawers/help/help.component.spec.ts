import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpComponent } from './help.component';
import { AppAngularMaterialModule } from '../../app-angular-material.module';

describe('HelpComponent', () => {
  let component: HelpComponent;
  let fixture: ComponentFixture<HelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HelpComponent
      ],
      imports: [
        AppAngularMaterialModule
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpComponent);
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
