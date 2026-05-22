import { Lang } from '../../translation.service';

/**
 * Base URL dùng cho canonical + hreflang + OG URL.
 * Subdomain riêng cho app trong hệ thống js-tools.org.
 */
export const SEO_BASE_URL = 'https://image-optimizer.js-tools.org';

// SVG vì source-of-truth nằm trong public/og-image.svg. Trước khi deploy có
// thể export PNG cùng tên (LinkedIn/Slack thích PNG hơn) — xem comment đầu
// public/og-image.svg.
export const SEO_DEFAULT_OG_IMAGE = `${SEO_BASE_URL}/og-image.svg`;

export const SEO_SUPPORTED_LANGS: Lang[] = ['vi', 'en'];

/** Lang dùng cho hreflang="x-default". */
export const SEO_X_DEFAULT_LANG: Lang = 'vi';
