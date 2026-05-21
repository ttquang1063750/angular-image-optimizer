# Project Backlog & Roadmap 🚀

Dưới đây là danh sách các tính năng và cải tiến được lên kế hoạch để biến **Angular Image Optimizer** thành một sản phẩm thương mại hoàn chỉnh.

## 🔴 Ưu tiên cao (Sắp thực hiện)
1.  **Chuyển đổi sang WebP/AVIF:**
    *   ✅ JPEG + WebP đã có. AVIF chưa do hỗ trợ trình duyệt + compressorjs hạn chế — chờ thư viện trưởng thành.
2.  **Tính năng Resize hàng loạt (Bulk Resize) (Hoàn thành ✅):**
    *   Cho phép người dùng thiết lập chiều rộng/chiều cao cố định cho tất cả ảnh.
    *   Tùy chọn: Resize theo % hoặc giữ nguyên tỷ lệ (Aspect Ratio).
3.  **Đổi tên file hàng loạt (Bulk Rename) (Hoàn thành ✅):**
    *   Thêm tiền tố (prefix), hậu tố (suffix) hoặc số thứ tự vào tên file sau khi nén.

## 🟡 Ưu tiên trung bình (Nâng cao trải nghiệm)
1.  **Công cụ so sánh (Side-by-Side Compare) (Hoàn thành ✅):**
    *   Sử dụng thanh trượt (slider) để so sánh trực quan chất lượng ảnh Gốc vs Ảnh nén.
2.  **Đóng dấu ảnh (Watermark) (Hoàn thành ✅):**
    *   Cho phép chèn text hoặc logo đè lên ảnh để bảo vệ bản quyền.
    *   Hỗ trợ cả 2 chế độ: text watermark + image (logo) watermark với position/size/opacity.
3.  **Hỗ trợ đa ngôn ngữ (i18n) (Hoàn thành ✅):**
    *   Tiếng Việt + tiếng Anh, lưu trong localStorage, default theo `navigator.language`.
4.  **Chế độ tối (Dark Mode) (Hoàn thành ✅):**
    *   Override theme qua CSS variables + `data-theme` attribute. Default theo `prefers-color-scheme`.
5.  **Input validation (Hoàn thành ✅):**
    *   Mọi ô số có range hợp lệ + thông báo lỗi inline khi vượt range.

## 🟢 Ưu tiên thấp (Mở rộng & Marketing)
1.  **PWA (Progressive Web App):**
    *   Cho phép cài đặt ứng dụng vào máy tính và sử dụng offline.
2.  **SEO Landing Page:**
    *   Xây dựng nội dung blog về tối ưu hình ảnh để kéo traffic tự nhiên.
3.  **Hệ thống quyên góp/Kiếm tiền:**
    *   Tích hợp nút "Buy me a coffee".
    *   Đặt quảng cáo AdSense (khi traffic đủ lớn).

## 💡 Ý tưởng tiềm năng (chưa lên lịch)
*   **Keyboard shortcuts:** `Cmd/Ctrl+O` mở file, `Cmd/Ctrl+S` download all, `Esc` đóng modal.
*   **Drag-to-reorder:** Cho phép kéo thay đổi thứ tự file (ảnh hưởng numbering).
*   **Multi-watermark:** Cho phép nhiều watermark đồng thời (vd. text + logo).
*   **EXIF preservation toggle:** Cho phép giữ/xóa metadata EXIF.
*   **History/Undo:** Lưu lịch sử các batch đã xử lý gần đây trong phiên.

---

## 📐 Đã hoàn thành — Refactor lớn (Phase 4)
- ✅ Tách `ImageUploaderComponent` God Component → 8 sub-components + 2 state services.
- ✅ Signal store pattern (`UploaderStateService`, `SettingsStateService`).
- ✅ SCSS modular: mixins (`_mixins.scss`), global utility classes, shadow tokens.
- ✅ Type-safe DOM helpers (`utils/dom-event.ts`).
- ✅ Test coverage: **100 tests / 17 spec files**.
- ✅ Memory leak fix: tất cả `URL.createObjectURL` đã được revoke đúng chỗ.
- ✅ **Preset save/load:** Lưu và tải cấu hình settings tùy chỉnh trực tiếp tại trình duyệt (hỗ trợ Import/Export và Reset cấu hình).

---
*Cập nhật lần cuối: 21-05-2026*
