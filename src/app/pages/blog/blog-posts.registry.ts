import { Lang } from '../../translation.service';
import { BlogPost } from './blog-post.model';
import { whyWebpVi } from './posts/why-webp.vi';
import { whyWebpEn } from './posts/why-webp.en';
import { clientSidePrivacyVi } from './posts/client-side-privacy.vi';
import { clientSidePrivacyEn } from './posts/client-side-privacy.en';
import { bulkWatermarkGuideVi } from './posts/bulk-watermark-guide.vi';
import { bulkWatermarkGuideEn } from './posts/bulk-watermark-guide.en';

/**
 * Source-of-truth cho mọi blog post. Khi thêm post mới: import + push vào
 * mảng này, server prerender + UI tự pick up.
 */
export const BLOG_POSTS: readonly BlogPost[] = [
  whyWebpVi,
  whyWebpEn,
  clientSidePrivacyVi,
  clientSidePrivacyEn,
  bulkWatermarkGuideVi,
  bulkWatermarkGuideEn,
];

export function findPost(slug: string, lang: Lang): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug && p.lang === lang);
}

/** Posts của 1 ngôn ngữ, mới nhất trước. */
export function postsByLang(lang: Lang): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.lang === lang).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

/** 2 post khác cùng lang, mới nhất trước (loại bỏ post hiện tại). */
export function relatedPosts(current: BlogPost, limit = 2): BlogPost[] {
  return postsByLang(current.lang)
    .filter((p) => p.slug !== current.slug)
    .slice(0, limit);
}

/**
 * Map từ topicId → tất cả translation của topic đó. Dùng cho sitemap
 * hreflang alternates khi slug khác nhau giữa các lang.
 */
export function postsByTopic(): Map<string, BlogPost[]> {
  const map = new Map<string, BlogPost[]>();
  for (const p of BLOG_POSTS) {
    const list = map.get(p.topicId);
    if (list) list.push(p);
    else map.set(p.topicId, [p]);
  }
  return map;
}
