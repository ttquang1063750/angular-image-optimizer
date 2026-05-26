import { BlogPost } from '../blog-post.model';

const heroSvg = `
<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="webp-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c3002f" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#1890ff" stop-opacity="0.18"/>
    </linearGradient>
  </defs>
  <rect width="800" height="360" fill="url(#webp-bg)" rx="16"/>
  <g font-family="-apple-system, Segoe UI, sans-serif" font-weight="800" text-anchor="middle">
    <text x="240" y="180" font-size="84" fill="var(--color-danger)">JPEG</text>
    <text x="560" y="180" font-size="84" fill="var(--color-success)">WebP</text>
    <text x="240" y="230" font-size="22" fill="var(--color-text-muted)" font-weight="500">2.4 MB</text>
    <text x="560" y="230" font-size="22" fill="var(--color-text-muted)" font-weight="500">1.6 MB</text>
  </g>
  <g transform="translate(370 160)" stroke="var(--color-text-muted)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0 20 L60 20 M48 8 L60 20 L48 32"/>
  </g>
</svg>
`.trim();

const contentHtml = `
<p>WebP ra đời từ năm 2010 do Google phát triển, nhưng phải đến cuối 2020 — khi Safari trên iOS 14 cuối cùng cũng support — thì mới đủ phổ cập để dùng đại trà. Hiện nay <strong>97%+ browser hỗ trợ WebP</strong>, bao gồm cả Edge, Firefox, Chrome, Safari trên tất cả nền tảng.</p>

<p>Vậy tại sao vẫn còn người dùng JPEG? Câu trả lời ngắn: tương thích phần mềm cũ, công cụ chỉnh sửa offline, và thói quen. Bài này phân tích khi nào nên chuyển sang WebP và khi nào giữ JPEG.</p>

<h2>Tại sao WebP nhỏ hơn JPEG?</h2>

<p>JPEG dùng DCT (Discrete Cosine Transform) — kỹ thuật từ 1992. WebP dùng VP8 prediction (cùng codec với video YouTube WebM) cộng với entropy coding cải tiến. Cụ thể:</p>

<ul>
  <li><strong>Predictive coding</strong>: WebP predict pixel value từ các pixel lân cận, chỉ lưu sai số. Region đồng màu (bầu trời, tường trắng) gần như zero-cost.</li>
  <li><strong>Block-based với chroma subsampling tốt hơn</strong>: WebP YUV420 mặc định nhưng chia khối thông minh hơn — ít artifact ở chỗ contrast cao.</li>
  <li><strong>Lossless + alpha channel</strong>: WebP có cả lossless mode (như PNG nhưng nhỏ hơn ~26%) và transparency — JPEG không có alpha.</li>
</ul>

<p>Kết quả thực tế: <strong>WebP giảm 25-35% dung lượng</strong> so với JPEG ở cùng chất lượng cảm quan. Với ảnh có nhiều vùng đồng màu (UI screenshot, illustration), tỷ lệ tiết kiệm có thể lên 50%+.</p>

<h2>Khi nào nên chuyển sang WebP</h2>

<p>Mọi use case web — gần như luôn luôn:</p>

<ul>
  <li><strong>Ảnh trên website</strong>: page speed score cao hơn, LCP nhanh hơn, Core Web Vitals tốt hơn → SEO ranking cải thiện. Google specifically rewards WebP.</li>
  <li><strong>Email marketing</strong>: hầu hết email client hiện đại render WebP. Gmail, Outlook.com, Apple Mail all support.</li>
  <li><strong>Mobile app assets</strong>: iOS 14+ và Android 4+ đều decode WebP native, app bundle nhỏ hơn.</li>
  <li><strong>Image-heavy blogs / portfolios</strong>: load nhanh hơn 30% trung bình, đặc biệt với connection chậm.</li>
</ul>

<h2>Khi nào giữ JPEG</h2>

<p>Có những trường hợp JPEG vẫn là lựa chọn an toàn hơn:</p>

<ul>
  <li><strong>Gửi cho khách hàng dùng phần mềm chỉnh sửa cũ</strong>: Photoshop CS6 (2012) không mở WebP native. Lightroom Classic < 11.4 cũng không.</li>
  <li><strong>Print workflow</strong>: máy in chuyên nghiệp dùng RIP cũ có thể không hỗ trợ WebP.</li>
  <li><strong>Camera RAW pipeline</strong>: nếu workflow là RAW → JPEG cho khách thì giữ JPEG để khách dễ dùng.</li>
  <li><strong>Internal explorer < IE11</strong>: hiếm gặp, nhưng nếu user base có corporate Windows cũ thì cần JPEG fallback.</li>
</ul>

<h2>Quy trình chuyển hàng loạt</h2>

<p>Cách nhanh nhất để chuyển nhiều ảnh JPEG sang WebP mà không cài đặt thêm gì:</p>

<ol>
  <li>Mở <a href="/vi/optimize/">Image Optimizer</a> trong trình duyệt.</li>
  <li>Drag-drop folder ảnh JPEG vào.</li>
  <li>Trong Settings → "Định dạng đầu ra" chọn <strong>WebP</strong>.</li>
  <li>Chọn preset "Nén vừa" cho cân bằng chất lượng/dung lượng.</li>
  <li>Tải về .zip — tất cả file đã là .webp.</li>
</ol>

<p>App xử lý song song 3 ảnh một lúc qua RxJS, không treo trình duyệt với batch lớn. Toàn bộ chạy client-side — ảnh không lên server.</p>

<h2>Còn AVIF thì sao?</h2>

<p>AVIF (AV1 Image File Format) là next-gen — giảm thêm ~20% so với WebP. Nhưng browser support hiện chỉ ~92% (Edge và một số phiên bản Safari cũ chưa). Encode AVIF cũng chậm hơn 5-10× so với WebP. Lời khuyên: dùng WebP cho production năm 2026, theo dõi AVIF cho 1-2 năm nữa.</p>

<h2>Tóm lại</h2>

<p>Với 97%+ browser support và 25-35% tiết kiệm dung lượng, WebP nên là default cho mọi ảnh web mới. JPEG chỉ giữ khi cần tương thích phần mềm cũ. Bulk convert chỉ mất vài giây trong trình duyệt — không lý do gì để trì hoãn.</p>

<p><a href="/vi/optimize/"><strong>Thử bulk convert sang WebP →</strong></a></p>
`.trim();

export const whyWebpVi: BlogPost = {
  topicId: 'why-webp',
  slug: 'webp-vs-jpeg',
  lang: 'vi',
  title: 'WebP vs JPEG: khi nào nên chuyển?',
  description:
    'WebP giảm 25-35% dung lượng so với JPEG ở cùng chất lượng và được 97%+ browser hỗ trợ. Bài này phân tích khi nào nên chuyển và khi nào giữ JPEG.',
  publishedAt: '2026-04-12',
  author: 'Tang Thanh Quang',
  tags: ['webp', 'jpeg', 'optimization', 'performance'],
  contentHtml,
  heroSvg,
};
