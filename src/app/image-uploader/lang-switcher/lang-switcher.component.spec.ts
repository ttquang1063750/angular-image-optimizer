import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LangSwitcherComponent } from './lang-switcher.component';
import { TranslationService } from '../../translation.service';

describe('LangSwitcherComponent', () => {
  let component: LangSwitcherComponent;
  let fixture: ComponentFixture<LangSwitcherComponent>;
  let translation: TranslationService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LangSwitcherComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LangSwitcherComponent);
    component = fixture.componentInstance;
    translation = TestBed.inject(TranslationService);
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('setLang delegate vào TranslationService', () => {
    component.setLang('en');
    expect(translation.currentLang()).toBe('en');

    component.setLang('vi');
    expect(translation.currentLang()).toBe('vi');
  });
});
