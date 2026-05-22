import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BlogListComponent } from './blog-list.component';
import { TranslationService } from '../../translation.service';
import { postsByLang } from './blog-posts.registry';

describe('BlogListComponent', () => {
  let component: BlogListComponent;
  let fixture: ComponentFixture<BlogListComponent>;
  let translation: TranslationService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [BlogListComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(BlogListComponent);
    component = fixture.componentInstance;
    translation = TestBed.inject(TranslationService);
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('cards() trả posts của lang hiện tại với readingMinutes computed', () => {
    translation.setLang('vi');
    const cards = component.cards();
    expect(cards.length).toBe(postsByLang('vi').length);
    cards.forEach((c) => {
      expect(c.post.lang).toBe('vi');
      expect(c.readingMinutes).toBeGreaterThan(0);
    });
  });

  it('switch lang re-compute cards', () => {
    translation.setLang('vi');
    const viCount = component.cards().length;
    translation.setLang('en');
    fixture.detectChanges();
    expect(component.cards().every((c) => c.post.lang === 'en')).toBe(true);
    expect(component.cards().length).toBe(viCount); // same count if balanced
  });

  it('render đúng số card trong template', () => {
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.card');
    expect(items.length).toBe(component.cards().length);
  });
});
