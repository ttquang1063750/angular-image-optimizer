import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HowItWorksComponent } from './how-it-works.component';

describe('HowItWorksComponent', () => {
  let component: HowItWorksComponent;
  let fixture: ComponentFixture<HowItWorksComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [HowItWorksComponent] }).compileComponents();
    fixture = TestBed.createComponent(HowItWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('render đúng 3 steps có numbering 1-2-3', () => {
    const steps = fixture.nativeElement.querySelectorAll('.step');
    expect(steps.length).toBe(3);
    const numbers = Array.from(steps).map((s) =>
      (s as HTMLElement).querySelector('.step-number')?.textContent?.trim(),
    );
    expect(numbers).toEqual(['1', '2', '3']);
  });
});
