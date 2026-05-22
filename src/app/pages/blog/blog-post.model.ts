import { Lang } from '../../translation.service';

export interface BlogPost {
  /**
   * Topic identifier — chia sẻ giữa các bản dịch của cùng 1 bài. Dùng để
   * pair hreflang alternates trong sitemap khi slug khác nhau giữa các
   * ngôn ngữ.
   */
  topicId: string;
  /** URL-safe slug, unique trong cùng lang (có thể khác giữa các lang). */
  slug: string;
  lang: Lang;
  title: string;
  /** Meta description + card excerpt. */
  description: string;
  /** ISO YYYY-MM-DD. */
  publishedAt: string;
  /** Optional ISO date — set khi post được update sau publish. */
  updatedAt?: string;
  author: string;
  tags: string[];
  /**
   * Pre-formatted HTML content. Trust source — chỉ viết tay từ TS modules,
   * không nhận user input.
   */
  contentHtml: string;
  /** Inline SVG markup hiển thị như hero image, fallback default nếu rỗng. */
  heroSvg?: string;
}

/** Standard reading rate 220 từ/phút (research industry average). */
const WORDS_PER_MINUTE = 220;

/** Strip HTML, đếm word count cho reading time (whole minutes, min 1). */
export function readingTimeMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
