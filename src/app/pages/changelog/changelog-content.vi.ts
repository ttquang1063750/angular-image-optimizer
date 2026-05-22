import { ChangelogContent } from './changelog-content';

export const changelogContentVi: ChangelogContent = {
  intro:
    'Mọi thay đổi đáng kể của Image Optimizer được ghi lại tại đây. Định dạng theo Keep a Changelog.',

  noteTitle: 'Ghi chú',
  noteBody:
    'Các phiên bản dưới đây phản ánh mốc tính năng, chưa phải release chính thức. Versioning chuẩn semver sẽ bắt đầu từ v1.0.0 khi domain js-tools.org đi vào hoạt động công khai.',

  kindLabels: {
    added: 'Thêm mới',
    changed: 'Cải tiến',
    fixed: 'Sửa lỗi',
  },

  entries: [
    {
      version: 'v0.4.0',
      date: '2026-05-22',
      codename: 'Landing & SEO',
      groups: [
        {
          kind: 'added',
          items: [
            'Static Site Generation (SSG) với @angular/ssr — 9 routes prerendered.',
            'Routing đa ngôn ngữ path-based: /vi/, /en/, /vi/optimize, /vi/about, /vi/changelog, /vi/blog.',
            'Landing page hoàn chỉnh với 6 sections: Hero, Features (8 cards), How-it-works (3 bước), Comparison (vs TinyPNG/Squoosh), FAQ (8 câu), CTA.',
            'Marketing chrome: sticky header với nav + theme/lang switcher + CTA "Mở app"; footer với liên kết + copyright.',
            'About page: project story, tech stack, cam kết quyền riêng tư, open source, Support CTA, contact.',
            'Changelog page (trang này) với timeline theo phiên bản.',
            'SeoService trung tâm: title, description, OG/Twitter cards, canonical, hreflang × 3 (vi/en/x-default), JSON-LD.',
            'JSON-LD: SoftwareApplication, FAQPage, BreadcrumbList, AboutPage.',
            'OG image SVG 1200×630 với branding.',
            'Theme-color meta tags cho mobile chrome (light + dark).',
            'Script `npm run verify:seo` validate prerendered HTML.',
          ],
        },
        {
          kind: 'changed',
          items: [
            'Nút Settings (bánh răng) chuyển từ FAB nổi trong app sang inline button trong header — chỉ hiện ở /optimize.',
            'Theme toggle + Lang switcher dời từ image-uploader sang shared/ui — dùng chung header marketing + app shell.',
            'Lang switcher giờ navigate qua Router (giữ path hiện tại) thay vì chỉ update signal.',
            'Support modal chuyển sang CDK Dialog — accessible focus trap + Esc đóng + outside click đóng.',
            'AppShellLayout lazy-load qua loadComponent — marketing routes không bundle CDK Dialog/PresetManager.',
          ],
        },
      ],
    },
    {
      version: 'v0.3.0',
      date: '2026-03-15',
      codename: 'Presets & Watermarks',
      groups: [
        {
          kind: 'added',
          items: [
            'Lưu nhiều bộ cấu hình (preset name + format + resize + watermark + naming).',
            'Export / Import preset qua file JSON — dùng lại trên máy khác.',
            'Tối đa 5 watermark cho mỗi ảnh (text hoặc PNG logo).',
            'Watermark có vị trí, opacity, kích thước % theo chiều rộng ảnh.',
            'Drag-reorder watermark + drag-reorder file trước khi xuất zip.',
            'Bulk naming: prefix, suffix, đánh số tự động với start index tuỳ chọn.',
          ],
        },
        {
          kind: 'changed',
          items: [
            'Watermark refactor sang discriminated union (TextWatermarkConfig | ImageWatermarkConfig) — type-safe hơn.',
            'MAX_WATERMARKS = 5 áp dụng cả khi import preset để phòng DoS client-side.',
          ],
        },
      ],
    },
    {
      version: 'v0.2.0',
      date: '2025-11-08',
      codename: 'Polish & Locale',
      groups: [
        {
          kind: 'added',
          items: [
            'i18n: Tiếng Việt + English. Default theo navigator.language, lưu localStorage.',
            'Dark mode với CSS variables — auto theo prefers-color-scheme, có thể toggle thủ công.',
            'Hỗ trợ đọc HEIC (ảnh từ iPhone) qua heic2any.',
            'Tuỳ chọn giữ metadata EXIF (GPS, ngày chụp) khi nén JPEG → JPEG.',
            'Phím tắt: Ctrl/⌘ + O mở file picker, Ctrl/⌘ + S tải zip, Esc đóng modal.',
            'Tooltip xem kích thước file chính xác đến từng byte.',
          ],
        },
        {
          kind: 'fixed',
          items: [
            'Memory leak: revoke ObjectURL khi clear list hoặc remove file.',
            'Trùng tên file khi xuất zip — auto append (1), (2), ...',
          ],
        },
      ],
    },
    {
      version: 'v0.1.0',
      date: '2025-08-20',
      codename: 'Initial release',
      groups: [
        {
          kind: 'added',
          items: [
            'Drag-drop nhiều ảnh hoặc click chọn từ file picker.',
            '3 preset nén: Nén nhẹ (chất lượng cao), Nén vừa (cân bằng), Nén tối đa (tiết kiệm).',
            'Format đầu ra: JPEG hoặc WebP.',
            'Resize: Auto (theo preset), Chiều ngang, Chiều cao, hoặc Phần trăm.',
            'Xử lý đồng thời tối đa 3 ảnh qua RxJS mergeMap — không treo trình duyệt.',
            'Modal so sánh chất lượng gốc vs nén bằng slider.',
            'Real-time progress mỗi file qua Angular Signals.',
            'Tải từng ảnh hoặc đóng gói toàn bộ thành .zip qua JSZip.',
          ],
        },
      ],
    },
  ],
};
