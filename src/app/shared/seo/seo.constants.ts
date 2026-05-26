import { Lang } from '../../translation.service';

/**
 * Base URL dùng cho canonical + hreflang + OG URL.
 * Subdomain riêng cho app trong hệ thống js-tools.org.
 */
export const SEO_BASE_URL = 'https://image-optimizer.js-tools.org';

// PNG vì một số platform (LinkedIn, Slack, Facebook) không render OG image
// SVG. Source-of-truth vẫn là public/og-image.svg — re-export PNG bằng:
//   npx svgexport public/og-image.svg public/og-image.png 1200:630
export const SEO_DEFAULT_OG_IMAGE = `${SEO_BASE_URL}/og-image.png`;

export const SEO_SUPPORTED_LANGS: Lang[] = ['vi', 'en'];

/** Lang dùng cho hreflang="x-default". */
export const SEO_X_DEFAULT_LANG: Lang = 'vi';
