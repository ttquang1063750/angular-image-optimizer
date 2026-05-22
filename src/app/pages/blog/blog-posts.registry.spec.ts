import { BLOG_POSTS, findPost, postsByLang, relatedPosts } from './blog-posts.registry';

describe('blog registry', () => {
  it('registry không rỗng', () => {
    expect(BLOG_POSTS.length).toBeGreaterThan(0);
  });

  it('mỗi post có slug + lang + title + contentHtml hợp lệ', () => {
    for (const p of BLOG_POSTS) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(['vi', 'en']).toContain(p.lang);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(20);
      expect(p.contentHtml.length).toBeGreaterThan(500);
      expect(p.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.author.length).toBeGreaterThan(0);
      expect(p.tags.length).toBeGreaterThan(0);
    }
  });

  it('slug + lang unique', () => {
    const keys = BLOG_POSTS.map((p) => `${p.lang}/${p.slug}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('findPost match đúng slug + lang', () => {
    const first = BLOG_POSTS[0];
    expect(findPost(first.slug, first.lang)?.title).toBe(first.title);
    expect(findPost('non-existent-slug', 'vi')).toBeUndefined();
  });

  it('postsByLang chỉ trả posts của lang đó, sort date desc', () => {
    const vi = postsByLang('vi');
    expect(vi.every((p) => p.lang === 'vi')).toBe(true);
    const dates = vi.map((p) => p.publishedAt);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
  });

  it('relatedPosts loại bỏ current + giới hạn limit', () => {
    const post = BLOG_POSTS[0];
    const related = relatedPosts(post, 2);
    expect(related.length).toBeLessThanOrEqual(2);
    expect(related.every((p) => p.slug !== post.slug)).toBe(true);
    expect(related.every((p) => p.lang === post.lang)).toBe(true);
  });
});
