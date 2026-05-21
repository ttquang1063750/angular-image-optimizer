import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../../theme.service';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let theme: ThemeService;

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('theme', 'light');
    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    theme = TestBed.inject(ThemeService);
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('toggle() đảo theme qua ThemeService', () => {
    expect(theme.currentTheme()).toBe('light');
    component.toggle();
    expect(theme.currentTheme()).toBe('dark');
    component.toggle();
    expect(theme.currentTheme()).toBe('light');
  });
});
