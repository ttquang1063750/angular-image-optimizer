import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaqComponent } from './faq.component';

describe('FaqComponent', () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [FaqComponent] }).compileComponents();
    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('render 8 details có question + answer (semantic native HTML)', () => {
    const items = fixture.nativeElement.querySelectorAll('details.faq-item');
    expect(items.length).toBe(8);
    items.forEach((it: HTMLDetailsElement) => {
      expect(it.querySelector('summary .question')?.textContent?.trim().length).toBeGreaterThan(0);
      expect(it.querySelector('.answer p')?.textContent?.trim().length).toBeGreaterThan(0);
    });
  });
});
