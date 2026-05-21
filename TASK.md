# Current Task: Không có task đang chạy

Tất cả mục trong Phase 4 + các tính năng đã lên kế hoạch trong `BACKLOG.md` mức 🔴/🟡 đã hoàn thành. Keyboard shortcuts (💡 idea) cũng đã ship.

## 📐 Lịch sử hoàn thành gần đây

### Keyboard shortcuts ✅ (feature/keyboard-shortcuts)
- `Cmd/Ctrl+O` → mở file picker (trigger drop zone)
- `Cmd/Ctrl+S` → download all (chỉ khi `completedCount > 0` và không đang nén)
- `Esc` → đóng comparison modal (priority cao hơn), sau đó đóng settings popover
- Guard: bỏ qua khi có `altKey`/`shiftKey` không liên quan
- `aria-keyshortcuts` trên drop zone + download button
- Visible `<kbd>` hint trên drop zone
- 11 tests mới (1 drop-zone `openFilePicker`, 10 keyboard handler)

### Preset save/load + UI refactor ✅ (feature/save-preset)
- `SettingsStateService`: save/load/delete/import/export custom presets vào localStorage
- UI: FAB toggle + collapsible accordion + popover layout
- Sanitize/whitelist khi import (chặn JSON ngoại lai), re-issue UUID
- Constants tập trung (`DEFAULT_SETTINGS`, `PRESET_STORAGE_KEY`, v.v.) — one source of truth
- i18n đầy đủ vi/en cho preset feature + error messages

### Phase 4 — Component refactor + state stores ✅
- 8 sub-components, signal store pattern, SCSS modular, type-safe DOM helpers.

---

## 🚀 Gợi ý task tiếp theo

Theo `BACKLOG.md`, các mục còn lại:
1.  **EXIF preservation toggle** — Cho phép giữ/xóa siêu dữ liệu EXIF. Nhỏ gọn, mở rộng `SettingsStateService` + wire vào `image-compression.service.ts`.
2.  **PWA** — `@angular/service-worker`, manifest, install prompt.
3.  **Drag-to-reorder** — Sắp xếp lại thứ tự file (ảnh hưởng numbering).
4.  **Multi-watermark** — Cho phép nhiều watermark đồng thời (text + logo).
5.  **SEO Landing Page** — route `/about` hoặc blog tách biệt với app `/optimize`.

---
*Trạng thái: Sẵn sàng nhận task mới.*
