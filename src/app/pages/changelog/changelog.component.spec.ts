import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangelogComponent } from './changelog.component';
import { TranslationService } from '../../translation.service';

describe('ChangelogComponent', () => {
  let component: ChangelogComponent;
  let fixture: ComponentFixture<ChangelogComponent>;
  let translation: TranslationService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [ChangelogComponent] }).compileComponents();
    fixture = TestBed.createComponent(ChangelogComponent);
    component = fixture.componentInstance;
    translation = TestBed.inject(TranslationService);
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('content() switch theo lang signal', () => {
    translation.setLang('vi');
    expect(component.content().kindLabels.added).toBe('Thêm mới');
    translation.setLang('en');
    expect(component.content().kindLabels.added).toBe('Added');
  });

  it('mỗi entry có version hợp lệ + date ISO + ít nhất 1 group', () => {
    for (const e of component.content().entries) {
      expect(e.version).toMatch(/^v\d+\.\d+\.\d+/);
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.groups.length).toBeGreaterThan(0);
      for (const g of e.groups) {
        expect(['added', 'changed', 'fixed']).toContain(g.kind);
        expect(g.items.length).toBeGreaterThan(0);
      }
    }
  });

  it('entries sắp xếp giảm dần theo date (mới nhất trên đầu)', () => {
    const dates = component.content().entries.map((e) => e.date);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
  });

  it('render đúng số entries trong template', () => {
    const items = fixture.nativeElement.querySelectorAll('.timeline .entry');
    expect(items.length).toBe(component.content().entries.length);
  });

  it('mỗi group có pill heading + bullet list', () => {
    const groups = fixture.nativeElement.querySelectorAll('.group');
    expect(groups.length).toBeGreaterThan(0);
    groups.forEach((g: HTMLElement) => {
      expect(g.querySelector('h3')?.textContent?.trim().length).toBeGreaterThan(0);
      expect(g.querySelectorAll('ul li').length).toBeGreaterThan(0);
    });
  });
});
