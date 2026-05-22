import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturesComponent } from './features.component';

describe('FeaturesComponent', () => {
  let component: FeaturesComponent;
  let fixture: ComponentFixture<FeaturesComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [FeaturesComponent] }).compileComponents();
    fixture = TestBed.createComponent(FeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('render 8 feature cards với title + desc + icon', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card');
    expect(cards.length).toBe(8);
    cards.forEach((c: HTMLElement) => {
      expect(c.querySelector('h3')?.textContent?.trim().length).toBeGreaterThan(0);
      expect(c.querySelector('p')?.textContent?.trim().length).toBeGreaterThan(0);
      expect(c.querySelector('.icon svg')).not.toBeNull();
    });
  });

  it('section có id="features" cho hero CTA scroll anchor', () => {
    expect(fixture.nativeElement.querySelector('section#features')).not.toBeNull();
  });
});
