import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('render H1 + primary CTA + secondary CTA anchor to #features', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent?.length).toBeGreaterThan(20);
    expect(el.querySelector('.cta-primary')?.getAttribute('href')).toContain('/optimize');
    expect(el.querySelector('.cta-secondary')?.getAttribute('href')).toBe('#features');
  });

  it('render 3 trust badges', () => {
    expect(fixture.nativeElement.querySelectorAll('.badge').length).toBe(3);
  });
});
