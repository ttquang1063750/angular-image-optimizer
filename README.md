# 🖼️ Angular Image Optimizer

**Angular Image Optimizer** là một ứng dụng web hiện đại, hiệu năng cao được xây dựng để tối ưu hóa, nén, thay đổi kích thước và chèn dấu bản quyền (watermark) vào hình ảnh trực tiếp trên trình duyệt của người dùng. 

Dự án chú trọng vào **hiệu suất cực hạn**, **tính riêng tư tuyệt đối** (không tải ảnh lên server) và **trải nghiệm người dùng mượt mà** với thiết kế sang trọng, tối giản hỗ trợ cả Dark Mode và đa ngôn ngữ.

👉 **Trải nghiệm trực tuyến:** [image-optimizer.js-tools.org](https://image-optimizer.js-tools.org/)

---

## ✨ Tính năng nổi bật (Key Features)

- **⚡ Xử lý hoàn toàn tại Client-Side:** Xử lý 100% tại trình duyệt bằng Web Workers/RxJS và Canvas. Không tải ảnh lên máy chủ, đảm bảo an toàn bảo mật thông tin và quyền riêng tư tối đa.
- **🎯 Kéo thả vị trí Watermark trực quan (Visual Watermark Dragging):** Hỗ trợ kéo thả chèn chữ hoặc logo đè lên ảnh. Cho phép bấm vào xem trước và điều chỉnh vị trí trực tiếp trên Canvas.
- **🏷️ Multi-Watermark:** Hỗ trợ chèn tối đa 5 watermark đồng thời (Text hoặc Image tùy chọn) với khả năng sắp xếp thứ tự đè lớp (layer ordering), điều chỉnh opacity, font size, và scale tương đối.
- **⚙️ Cấu hình nén nâng cao (Compression Settings):**
  - **Presets:** 3 mức độ nén định sẵn (Nén nhẹ, Nén vừa, Nén tối đa).
  - **Format:** Xuất định dạng JPEG hoặc WebP.
  - **Resize:** Giữ nguyên tỷ lệ, điều chỉnh theo Width/Height cố định hoặc theo tỷ lệ phần trăm (%).
- **🔄 Đổi tên file hàng loạt (Bulk Naming):** Tự động thêm tiền tố (Prefix), hậu tố (Suffix), số thứ tự tăng dần (Numbering) giúp quản lý file đầu ra hiệu quả.
- **🖼️ So sánh chất lượng trực quan (Comparison Slider):** Tích hợp thanh trượt so sánh ảnh Gốc và ảnh Nén trực quan (Side-by-Side) ngay trên giao diện để đánh giá chất lượng.
- **🗂️ Đóng gói Zip thông minh:** Hỗ trợ tải xuống từng ảnh riêng lẻ hoặc đóng gói toàn bộ dưới dạng file `.zip` (JSZip) với cơ chế tự động tránh trùng lặp tên file.
- **🚀 Quản lý bất đồng bộ & concurrency (RxJS):** Giới hạn tối đa 3 ảnh xử lý đồng thời (`mergeMap`) tránh gây treo/lag trình duyệt khi tải lên hàng loạt ảnh dung lượng lớn.
- **💾 Lưu trữ Preset cá nhân:** Cho phép xuất (Export), nhập (Import) hoặc reset cấu hình yêu thích của bạn trực tiếp trên trình duyệt.
- **💾 Giữ lại EXIF Metadata:** Hỗ trợ giữ nguyên thông tin máy ảnh, GPS, ngày chụp (JPEG APP1 metadata) bằng thuật toán cắt ghép nhị phân độc lập.
- **🌐 Đa ngôn ngữ & Chế độ tối:** Hỗ trợ Tiếng Việt & Tiếng Anh, tự động chuyển đổi theo ngôn ngữ trình duyệt. Dark Mode đồng bộ tự động với hệ điều hành (`prefers-color-scheme`) hoặc tùy chọn ghi đè.
- **⌨️ Phím tắt tiện lợi (Keyboard Shortcuts):**
  - `Ctrl/Cmd + O`: Mở hộp thoại chọn ảnh.
  - `Ctrl/Cmd + S`: Tải về toàn bộ ảnh dưới dạng Zip.
  - `Esc`: Đóng các modal/dialog đang mở.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Framework:** [Angular v21.2.x](https://angular.dev/) (Standalone Components, Signals & Modern Control Flow `@if`/`@for`).
- **State Management:** Angular Signals (Signal-driven UI).
- **Thư viện lõi xử lý ảnh:**
  - **Canvas API (native):** Nén/Resize/Vẽ watermark trực tiếp trên Canvas, không phụ thuộc lib bên ngoài cho compression core.
  - `jszip`: Nén và đóng gói ZIP hàng loạt file tại client (lazy-loaded).
  - `cropperjs`: Cắt và thu phóng hình ảnh (lazy-loaded).
  - `heic-to`: Chuyển đổi HEIC/HEIF từ iPhone sang JPEG (lazy-loaded, dùng libheif WASM).
- **Styling:** SCSS, CSS Variables, Responsive Grid/Flexbox, Keyframe Animations.
- **Testing:** [Vitest](https://vitest.dev/) (Unit testing framework thay thế Karma/Jasmine cho tốc độ cực nhanh).
- **SEO & Prerender:** Angular static prerendering, SEO Service động hỗ trợ SEO Schema và hreflang.

---

## 🚀 Cài đặt & Chạy ứng dụng dưới Local

### Yêu cầu hệ thống
- **Node.js:** v18.x trở lên (khuyên dùng v20.x+)
- **NPM:** v9.x trở lên

### Các bước cài đặt
1. **Clone repository:**
   ```bash
   git clone https://github.com/ttquang1063750/angular-image-optimizer.git
   cd angular-image-optimizer
   ```

2. **Cài đặt các gói phụ thuộc (dependencies):**
   ```bash
   npm install
   ```

3. **Chạy server phát triển (Development server):**
   ```bash
   npm start
   ```
   Sau khi server chạy, truy cập đường dẫn: `http://localhost:4200/`

---

## 📋 Lệnh phát triển thường dùng (Scripts)

| Lệnh | Chức năng |
| :--- | :--- |
| `npm start` | Chạy dev server tại `http://localhost:4200/` |
| `npm run build` | Build ứng dụng Angular ra thư mục `dist/` |
| `npm run build:full` | Build đầy đủ, tự động sinh Sitemap và chạy kiểm tra SEO tự động |
| `npm test` | Chạy bộ kiểm thử (Unit tests) với Vitest |
| `npm run lint` | Chạy công cụ kiểm tra chất lượng code ESLint |
| `npm run build:sitemap` | Tạo file sitemap XML tự động cho SEO |
| `npm run verify:seo` | Chạy script kiểm tra SEO cho toàn bộ trang tĩnh đã build |

---

## 📐 Kiến trúc mã nguồn (Architecture)

Ứng dụng tuân thủ kiến trúc chia nhỏ và quản lý trạng thái bằng Signal (Service-Oriented):
- **`UploaderStateService`:** Quản lý trạng thái hàng đợi tệp tin tải lên, tiến trình nén và kết quả đầu ra.
- **`SettingsStateService`:** Quản lý cấu hình nén, watermark, đổi tên và các tùy chọn lưu trữ.
- **`ImageCompressionService`:** Chứa logic nghiệp vụ lõi (Nén ảnh, Vẽ watermark lên Canvas, Đóng gói Zip, Ghép metadata EXIF).
- **Component Hierarchy:**
  - `ImageUploaderComponent`: Orchestrator điều phối chung.
  - Sub-components: `DropZoneComponent`, `FileListComponent`, `FileItemComponent`, `SettingsPanelComponent` (chứa `NamingConfigComponent`, `WatermarkConfigComponent`), `ComparisonModalComponent`, `WatermarkPreviewDialogComponent`.

---

## 📄 Bản quyền (License)

Dự án này được phân phối dưới giấy phép MIT License. Xem chi tiết tại tệp [LICENSE](./LICENSE) (nếu có).
