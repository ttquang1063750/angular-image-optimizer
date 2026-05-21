# Current Task: Không có task đang chạy

Tất cả mục trong Phase 4 + các tính năng đã lên kế hoạch trong `BACKLOG.md` mức 🔴/🟡 đã hoàn thành.

## 📐 Lịch sử hoàn thành gần đây

### Phase 4 — Component refactor + state stores ✅
- **Bước 1:** `UploaderStateService` (signal store) + component delegate.
- **Bước 2:** Tách 8 sub-components: `lang-switcher`, `theme-toggle`, `drop-zone`, `comparison-modal`, `file-list`, `file-item`, `settings-panel`, `naming-config`, `watermark-config`.
- **Bước 3:** SCSS modular — global keyframes, mixins (`_mixins.scss`), shadow tokens.
- **Bước 4:** Type-safe DOM helpers (`utils/dom-event.ts`).
- **Bước 5:** Test coverage 22 → 89 tests (17 spec files).
- **Bước 6:** Lint + tests + build xanh, dev server verify.

### Tính năng + chất lượng ✅
- **Preset save/load:** Lưu và tải cấu hình settings tùy chỉnh trực tiếp tại trình duyệt (hỗ trợ Import/Export và Reset cấu hình).
- **Image Watermark:** Discriminated union `WatermarkConfig`, `<app-watermark-config>` với tab Text/Image, file picker + preview, drawImage logic trong service.
- **Input validation:** `validateNumberInput()` helper, `INPUT_RANGES` constants, error UI inline với global `.field`/`.field-error`/`.has-error` classes.
- **Form validation utility classes:** Gộp `.field`, `.field-error`, `.has-error` về `styles.scss` global để mọi component dùng chung.

---

## 🚀 Gợi ý task tiếp theo

Theo `BACKLOG.md`, các mục còn lại:
1.  **PWA** — `@angular/service-worker`, manifest, install prompt.
2.  **SEO Landing Page** — route `/about` hoặc blog tách biệt với app /optimize.
3.  **Keyboard shortcuts** — `Cmd/Ctrl+O` mở file, `Cmd/Ctrl+S` download all, `Esc` đóng modal.
4.  **EXIF preservation toggle** — Cho phép giữ/xóa siêu dữ liệu EXIF.

---
*Trạng thái: Sẵn sàng nhận task mới.*
