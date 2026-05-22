import { BlogPost } from '../blog-post.model';

const heroSvg = `
<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="priv-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#52c41a" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#1890ff" stop-opacity="0.18"/>
    </linearGradient>
  </defs>
  <rect width="800" height="360" fill="url(#priv-bg)" rx="16"/>
  <g transform="translate(280 60)" fill="none" stroke="var(--color-text-muted)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M120 0 L0 60 V160 C0 220 50 260 120 280 C190 260 240 220 240 160 V60 Z" fill="var(--color-surface)" stroke="var(--color-success)" stroke-width="8"/>
    <path d="M70 150 L110 190 L180 110" stroke="var(--color-success)" stroke-width="10"/>
  </g>
</svg>
`.trim();

const contentHtml = `
<p>Phần lớn các "online image compressor" hoạt động kiểu này: bạn upload ảnh lên server của họ, server chạy ImageMagick hoặc tương tự, trả file đã nén về. Đơn giản. Nhưng đặt câu hỏi: server đó <em>thực sự</em> làm gì với ảnh của bạn?</p>

<p>Câu trả lời theo Privacy Policy của các tool phổ biến:</p>

<ul>
  <li>"Files are deleted within 1 hour" — nghĩa là trong 1 giờ đó họ có thể đọc, copy, hoặc log metadata.</li>
  <li>"We may analyze uploaded content to improve our service" — bạn vừa cho họ training data.</li>
  <li>"We use third-party CDN for processing" — file có thể đi qua 3-4 server khác nhau.</li>
</ul>

<p>Với ảnh sản phẩm e-commerce thì OK. Với ảnh khách hàng, ảnh nội bộ công ty, hoặc ảnh có EXIF GPS — không OK chút nào.</p>

<h2>Giải pháp: nén ngay trong trình duyệt</h2>

<p>Trình duyệt hiện đại (2020+) có Canvas API đủ mạnh để thực hiện toàn bộ quá trình nén ảnh client-side. Không có upload, không có server, không có server log. File ở lại máy bạn từ đầu tới cuối.</p>

<p>Workflow nén client-side standard:</p>

<ol>
  <li>User drop file vào browser → file thành <code>Blob</code> trong memory.</li>
  <li>Tạo <code>&lt;canvas&gt;</code> ảo, vẽ Blob lên với target dimensions (resize).</li>
  <li>Gọi <code>canvas.toBlob(callback, 'image/webp', 0.8)</code> — browser encode WebP/JPEG ở quality 0.8.</li>
  <li>Trả Blob mới về cho download (createObjectURL).</li>
</ol>

<p>Toàn bộ chạy local. <a href="/vi/optimize">Image Optimizer</a> mã nguồn mở implement đúng pattern này — bạn có thể audit code trên GitHub để xác nhận không có endpoint upload nào.</p>

<h2>Performance: client-side có chậm hơn không?</h2>

<p>Câu trả lời ngắn: <strong>không</strong>, thường nhanh hơn. Lý do:</p>

<ul>
  <li><strong>Loại bỏ network latency</strong>: upload 50MB lên server qua connection trung bình mất ~30s. Nén local mất ~2s mỗi ảnh.</li>
  <li><strong>Parallel processing</strong>: dùng <code>RxJS mergeMap(concurrent: 3)</code> để xử lý 3 ảnh cùng lúc, tận dụng CPU multi-core.</li>
  <li><strong>Không bị giới hạn quota</strong>: tool server-side phải giới hạn số file / dung lượng để giảm chi phí. Client-side không có concept này.</li>
</ul>

<p>Bottleneck duy nhất là RAM browser. Thực tế Chrome 64-bit handle batch 200 ảnh × 5MB không vấn đề trên máy 8GB RAM.</p>

<h2>Khi nào client-side KHÔNG phù hợp</h2>

<p>Để fair, có vài case server-side vẫn vượt trội:</p>

<ul>
  <li><strong>Mobile cũ / low-end</strong>: máy 2GB RAM xử lý batch lớn có thể chậm. Single image thì OK.</li>
  <li><strong>Format đặc biệt</strong>: ảnh RAW chuyên nghiệp (CR3, NEF, ARW) cần decoder lớn (~50MB+) — không thực tế ship trong browser bundle.</li>
  <li><strong>Pipeline tự động</strong>: nếu cần API call programmatic (CI/CD pipeline upload), server-side service như Cloudinary phù hợp hơn.</li>
  <li><strong>AI processing</strong>: deep learning upscale (Topaz, ESRGAN) cần GPU server.</li>
</ul>

<p>Nhưng cho 95% use case (compress, resize, watermark, format convert) client-side là lựa chọn tốt hơn về privacy + tốc độ + chi phí.</p>

<h2>Cách verify một tool có thực sự client-side</h2>

<p>Đừng tin marketing copy. Tự kiểm tra:</p>

<ol>
  <li>Mở DevTools → tab Network.</li>
  <li>Clear log, upload ảnh.</li>
  <li>Xem có request POST nào với payload lớn không. Nếu chỉ thấy GET CSS/JS thì OK — không có upload.</li>
  <li>Tắt mạng (DevTools → Network → Offline) sau khi trang load xong. Nén ảnh. Nếu vẫn chạy được thì 100% là client-side.</li>
</ol>

<p><a href="/vi/optimize">Image Optimizer</a> pass cả hai test. Source code MIT trên GitHub — bạn có thể self-host trên domain riêng.</p>

<h2>Kết luận</h2>

<p>Client-side image processing không còn là experimental. Năm 2026, mọi browser hiện đại đủ năng lực để xử lý batch ảnh nhanh hơn upload lên server. Kết hợp lợi ích privacy + bandwidth + không cần backend, đây nên là default cho ứng dụng web mới.</p>

<p><a href="/vi/optimize"><strong>Thử Image Optimizer chạy 100% trong browser →</strong></a></p>
`.trim();

export const clientSidePrivacyVi: BlogPost = {
  topicId: 'client-side-privacy',
  slug: 'nen-anh-client-side',
  lang: 'vi',
  title: 'Nén ảnh client-side: privacy + tốc độ',
  description:
    'Tại sao nén ảnh trong trình duyệt vừa nhanh hơn vừa riêng tư hơn so với upload lên server. Phân tích kỹ thuật + cách verify một tool có thực sự client-side.',
  publishedAt: '2026-03-20',
  author: 'Tang Thanh Quang',
  tags: ['privacy', 'client-side', 'canvas', 'performance'],
  contentHtml,
  heroSvg,
};
