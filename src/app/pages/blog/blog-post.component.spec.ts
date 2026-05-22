import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BlogPostComponent } from './blog-post.component';
import { TranslationService } from '../../translation.service';
import { BLOG_POSTS } from './blog-posts.registry';

function setupWithSlug(slug: string) {
  const paramMap = convertToParamMap({ slug });
  return TestBed.configureTestingModule({
    imports: [BlogPostComponent],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap },
          paramMap: of(paramMap),
        },
      },
    ],
  });
}

describe('BlogPostComponent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('smoke khi có post hợp lệ', async () => {
    const firstVi = BLOG_POSTS.find((p) => p.lang === 'vi')!;
    await setupWithSlug(firstVi.slug).compileComponents();
    const fixture = TestBed.createComponent(BlogPostComponent);
    const c = fixture.componentInstance;
    fixture.detectChanges();
    expect(c.post()?.slug).toBe(firstVi.slug);
    expect(c.readingMinutes()).toBeGreaterThan(0);
  });

  it('related() loại bỏ current post', async () => {
    const firstVi = BLOG_POSTS.find((p) => p.lang === 'vi')!;
    await setupWithSlug(firstVi.slug).compileComponents();
    const fixture = TestBed.createComponent(BlogPostComponent);
    const c = fixture.componentInstance;
    fixture.detectChanges();
    expect(c.related().every((r) => r.post.slug !== firstVi.slug)).toBe(true);
  });

  it('slug không tồn tại → post() undefined, render 404 layout', async () => {
    await setupWithSlug('this-slug-definitely-does-not-exist').compileComponents();
    const fixture = TestBed.createComponent(BlogPostComponent);
    const c = fixture.componentInstance;
    fixture.detectChanges();
    expect(c.post()).toBeUndefined();
    expect(fixture.nativeElement.querySelector('.post-not-found')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.blog-post')).toBeNull();
  });

  it('render hero SVG + content HTML + tags', async () => {
    const firstVi = BLOG_POSTS.find((p) => p.lang === 'vi')!;
    await setupWithSlug(firstVi.slug).compileComponents();
    const fixture = TestBed.createComponent(BlogPostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.hero svg')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.prose p').length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelectorAll('.post-tags .tag').length).toBe(
      firstVi.tags.length,
    );
  });

  it('switch lang sang en → khi slug en tồn tại thì pick lên post EN', async () => {
    const firstVi = BLOG_POSTS.find((p) => p.lang === 'vi')!;
    const sameSlugEn = BLOG_POSTS.find((p) => p.lang === 'en' && p.slug === firstVi.slug);
    if (!sameSlugEn) return; // slug VI ≠ slug EN — skip
    await setupWithSlug(firstVi.slug).compileComponents();
    const fixture = TestBed.createComponent(BlogPostComponent);
    const c = fixture.componentInstance;
    const translation = TestBed.inject(TranslationService);
    translation.setLang('en');
    fixture.detectChanges();
    expect(c.post()?.lang).toBe('en');
  });
});
