import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';

describe('LogoComponent', () => {
  let fixture: ComponentFixture<LogoComponent>;
  let component: LogoComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LogoComponent] }).compileComponents();
    fixture = TestBed.createComponent(LogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('render SVG với viewBox 320×320', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('viewBox')).toBe('0 0 320 320');
  });

  it('gradient IDs unique mỗi instance để tránh conflict đa logo cùng page', () => {
    const fixture2 = TestBed.createComponent(LogoComponent);
    fixture2.detectChanges();
    const c2 = fixture2.componentInstance;

    expect(c2.id).not.toBe(component.id);
    expect(c2.gradAId).not.toBe(component.gradAId);
    expect(c2.gradBId).not.toBe(component.gradBId);
  });

  it('gradAFill/gradBFill trả url(#id) syntax đúng', () => {
    expect(component.gradAFill).toBe(`url(#${component.gradAId})`);
    expect(component.gradBFill).toBe(`url(#${component.gradBId})`);
  });

  it('SVG có aria-hidden để screen reader skip (logo là decorative)', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });
});
