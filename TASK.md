# Current Task: Không có task đang chạy

Tất cả mục trong Phase 4 + các tính năng đã lên kế hoạch trong `BACKLOG.md` mức 🔴/🟡 đã hoàn thành. Hai mục từ 💡 ideas (Keyboard shortcuts + EXIF) cũng đã ship.

## 📐 Lịch sử hoàn thành gần đây

### EXIF preservation toggle ✅ (feature/exif-toggle)
- Inline JPEG APP1 splicer ở `utils/exif.ts` — không thêm dependency
- `extractJpegExifSegment` + `injectExifSegment` + `preserveJpegExif` (convenience)
- Pipeline: thêm step `preserveExifIfEligible` sau watermark
- Scope: JPEG input + JPEG output (silent skip nếu khác)
- UI: checkbox trong settings panel, disabled khi output không phải JPEG
- 12 unit tests cho splicer + 1 spec settings panel + 1 spec settings-state roundtrip

### Keyboard shortcuts ✅ (feature/keyboard-shortcuts)
- `Cmd/Ctrl+O` mở file picker, `Cmd/Ctrl+S` download all, `Esc` đóng modal/popover
- `aria-keyshortcuts` + visible `<kbd>` hint
- 11 tests mới

### Preset save/load + UI refactor ✅ (feature/save-preset)
- `SettingsStateService` save/load/delete/import/export custom presets
- UI: FAB + accordion + popover
- Sanitize/whitelist khi import, re-issue UUID
- Constants tập trung (`DEFAULT_SETTINGS`, `PRESET_STORAGE_KEY`)

### Phase 4 — Component refactor + state stores ✅
- 8 sub-components, signal store pattern, SCSS modular.

---

## 🚀 Gợi ý task tiếp theo

Theo `BACKLOG.md`, các mục còn lại:
1.  **PWA** — `@angular/service-worker`, manifest, install prompt.
2.  **Drag-to-reorder** — Sắp xếp lại thứ tự file (ảnh hưởng numbering).
3.  **Multi-watermark** — Cho phép nhiều watermark đồng thời (text + logo).
4.  **History/Undo** — Lưu lịch sử các batch trong phiên.
5.  **SEO Landing Page** — route `/about` hoặc blog tách biệt với app `/optimize`.

---
*Trạng thái: Sẵn sàng nhận task mới.*
