import { BlogPost } from '../blog-post.model';

const heroSvg = `
<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bulk-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#faad14" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#c3002f" stop-opacity="0.16"/>
    </linearGradient>
  </defs>
  <rect width="800" height="360" fill="url(#bulk-bg)" rx="16"/>
  <g transform="translate(80 80)">
    <rect width="180" height="120" rx="10" fill="var(--color-surface)" stroke="var(--color-border)" stroke-width="2" transform="rotate(-5)"/>
    <rect width="180" height="120" rx="10" fill="var(--color-surface)" stroke="var(--color-border)" stroke-width="2" transform="translate(40 30) rotate(2)"/>
    <rect width="180" height="120" rx="10" fill="var(--color-surface)" stroke="var(--color-border)" stroke-width="2" transform="translate(80 60)"/>
    <text x="170" y="135" font-family="-apple-system, Segoe UI, sans-serif" font-size="22" font-weight="700" fill="var(--color-primary)" opacity="0.6" transform="rotate(-15 170 135)">© BRAND</text>
  </g>
  <g transform="translate(440 100)" fill="var(--color-text-muted)" font-family="-apple-system, Segoe UI, sans-serif">
    <text x="0" y="40" font-size="32" font-weight="800">100 ảnh</text>
    <text x="0" y="80" font-size="20">→ resize 1920px</text>
    <text x="0" y="110" font-size="20">→ logo góc dưới</text>
    <text x="0" y="140" font-size="20">→ tên IMG_001 → IMG_100</text>
    <text x="0" y="180" font-size="22" font-weight="700" fill="var(--color-success)">~30 giây</text>
  </g>
</svg>
`.trim();

const contentHtml = `
<p>Use case quen thuộc: vừa chụp xong 100 ảnh sản phẩm cho shop online, hoặc 150 ảnh sự kiện cho khách. Cần: resize về 1920px chiều ngang, thêm watermark logo nhỏ góc dưới phải, đặt tên thống nhất <code>IMG_001.jpg</code> → <code>IMG_100.jpg</code>. Bằng tay với Photoshop mất 1-2 giờ. Bằng <a href="/vi/optimize/">Image Optimizer</a> mất ~30 giây.</p>

<p>Bài này hướng dẫn workflow chuẩn cho ai làm việc với batch ảnh thường xuyên: e-commerce, blogger, photographer, marketing team.</p>

<h2>Step 1: Upload batch</h2>

<p>Có 3 cách bỏ file vào:</p>

<ul>
  <li><strong>Drag-drop</strong>: chọn folder trong Finder/Explorer, kéo trực tiếp vào drop zone của app.</li>
  <li><strong>Click chọn</strong>: nhấn vào drop zone hoặc nút "Chọn file" → file picker hiện ra → multi-select bằng Cmd/Ctrl+Click.</li>
  <li><strong>Phím tắt</strong>: nhấn <code>Cmd + O</code> (Mac) hoặc <code>Ctrl + O</code> (Windows) để mở file picker từ bất kỳ đâu trên trang.</li>
</ul>

<p>App nhận JPG, PNG, HEIC (iPhone), WebP. Không có giới hạn số file — thực tế batch 200 file × 5MB chạy ổn trên máy 8GB RAM.</p>

<h2>Step 2: Setup preset 1 lần dùng mãi</h2>

<p>Đây là tip quan trọng nhất — đừng cấu hình lại mỗi lần. Mở Settings (icon bánh răng góc phải), config workflow chuẩn của bạn:</p>

<ul>
  <li><strong>Mức nén</strong>: "Nén vừa" cho web, "Nén tối đa" cho thumbnail.</li>
  <li><strong>Định dạng</strong>: WebP để dung lượng nhỏ nhất, JPEG để khách dễ mở.</li>
  <li><strong>Kích thước</strong>: chọn "Chiều ngang" → nhập 1920 (cho web full-width) hoặc 800 (cho thumbnail).</li>
  <li><strong>Đặt tên</strong>: prefix <code>IMG_</code>, bật "Đánh số thứ tự", start index từ 1.</li>
  <li><strong>Watermark</strong>: xem step 3.</li>
</ul>

<p>Lưu preset bằng nút "Lưu cấu hình" → đặt tên (vd. "E-commerce 1920px + logo"). Lần sau chỉ cần dropdown chọn lại preset đó. Export preset thành file JSON để chia sẻ với team hoặc dùng trên máy khác.</p>

<h2>Step 3: Watermark — text vs PNG logo</h2>

<p>Có 2 lựa chọn watermark:</p>

<h3>Text watermark</h3>

<p>Nhanh và linh hoạt. Phù hợp khi:</p>

<ul>
  <li>Chưa có file logo PNG.</li>
  <li>Cần thay đổi nội dung thường xuyên (vd. <code>© 2026 - John Doe Photography</code>).</li>
  <li>Brand name là điểm chính (không cần logo nhận diện).</li>
</ul>

<p>Có thể chỉnh: font size theo % chiều rộng ảnh, màu, opacity, vị trí (4 góc + giữa).</p>

<h3>Image watermark (PNG logo)</h3>

<p>Chuyên nghiệp hơn. Upload file PNG logo (nên có background trong suốt). Có thể chỉnh:</p>

<ul>
  <li><strong>Vị trí</strong>: 4 góc + giữa.</li>
  <li><strong>Kích thước</strong>: % chiều rộng ảnh (5-30% là phổ biến).</li>
  <li><strong>Opacity</strong>: 0-100% (40-70% cho subtle, 80-100% cho prominent).</li>
</ul>

<h3>Multi-watermark</h3>

<p>App cho phép tối đa 5 watermark trên 1 ảnh. Use case: logo brand chính ở góc dưới phải + ngày chụp ở góc trên trái + copyright text ở dưới. Mỗi watermark độc lập về vị trí, kích thước, opacity.</p>

<p>Kéo-thả để đổi thứ tự layer — watermark sau ghi đè lên trước.</p>

<h2>Step 4: Naming convention</h2>

<p>Đặt tên file thống nhất quan trọng cho SEO + tổ chức folder. App support:</p>

<ul>
  <li><strong>Prefix</strong>: <code>IMG_</code>, <code>2026-summer_</code>, <code>brand-name_</code></li>
  <li><strong>Suffix</strong>: <code>_compressed</code>, <code>_web</code>, <code>_thumb</code></li>
  <li><strong>Numbering</strong>: padding tự động đảm bảo sort đúng (<code>001, 002, ..., 100</code> chứ không phải <code>1, 10, 100, 2</code>).</li>
  <li><strong>Start index</strong>: tiếp tục từ số bất kỳ, hữu ích khi append vào batch cũ.</li>
</ul>

<p>Output có thể là <code>IMG_001.webp</code> → <code>IMG_100.webp</code>, sort đúng trong mọi file manager.</p>

<h2>Step 5: Download + organize</h2>

<p>Khi batch xử lý xong, có 2 lựa chọn:</p>

<ul>
  <li><strong>Tải từng file</strong>: phù hợp khi cần chỉ vài ảnh.</li>
  <li><strong>Tải zip</strong>: phím tắt <code>Cmd/Ctrl + S</code>. App tự xử lý trùng tên (nếu có) bằng cách append <code>(1)</code>, <code>(2)</code>...</li>
</ul>

<p>Folder trong zip giữ đúng thứ tự upload. Extract ra là đủ.</p>

<h2>Workflow cho photographer wedding/event</h2>

<p>Ví dụ thực tế từ một photographer:</p>

<ol>
  <li>Xuất từ Lightroom 500 ảnh JPEG full-resolution (2-3 GB).</li>
  <li>Mở Image Optimizer, load preset "Client preview" (resize 2048px + watermark logo + naming <code>EVENT_NAME_001</code>).</li>
  <li>Drag-drop folder vào — app báo "500 file đã thêm".</li>
  <li>Đợi ~3 phút (3 ảnh song song, ~3s mỗi ảnh).</li>
  <li>Download zip ~300MB. Gửi cho khách qua WeTransfer.</li>
</ol>

<p>Tổng thời gian thao tác: ~30 giây. Phần còn lại là máy chạy.</p>

<h2>Kết luận</h2>

<p>Bulk processing quan trọng nhất là setup preset chuẩn 1 lần, dùng lâu dài. Đầu tư 10 phút config preset → tiết kiệm hàng giờ cho mỗi shoot/batch.</p>

<p><a href="/vi/optimize/"><strong>Setup workflow bulk của bạn ngay →</strong></a></p>
`.trim();

export const bulkWatermarkGuideVi: BlogPost = {
  topicId: 'bulk-watermark',
  slug: 'huong-dan-bulk-resize-watermark',
  lang: 'vi',
  title: 'Hướng dẫn bulk resize + watermark hàng loạt',
  description:
    'Workflow chuẩn để resize, đặt watermark, và đặt tên hàng loạt cho 100+ ảnh trong 30 giây. Áp dụng cho e-commerce, photographer, blogger.',
  publishedAt: '2026-02-08',
  author: 'Tang Thanh Quang',
  tags: ['bulk', 'watermark', 'resize', 'workflow'],
  contentHtml,
  heroSvg,
};
