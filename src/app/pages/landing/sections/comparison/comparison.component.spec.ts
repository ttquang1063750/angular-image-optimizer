import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComparisonComponent } from './comparison.component';

describe('ComparisonComponent', () => {
  let component: ComparisonComponent;
  let fixture: ComponentFixture<ComparisonComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [ComparisonComponent] }).compileComponents();
    fixture = TestBed.createComponent(ComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('render 8 rows × 3 competitor cells', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(8);
    rows.forEach((r: HTMLElement) => {
      expect(r.querySelectorAll('.cell').length).toBe(3);
    });
  });

  it('cột Ours mỗi row đều có cell--yes', () => {
    const oursCells = fixture.nativeElement.querySelectorAll('tbody .cell.ours');
    expect(oursCells.length).toBe(8);
    oursCells.forEach((c: HTMLElement) => {
      expect(c.classList.contains('cell--yes')).toBe(true);
    });
  });
});
