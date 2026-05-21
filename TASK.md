# Current Task: Không có task đang chạy

Tất cả mục trong Phase 4 + các tính năng đã lên kế hoạch trong `BACKLOG.md` mức 🔴/🟡 đã hoàn thành. Các mục từ 💡 ideas đã ship: Keyboard shortcuts, EXIF preservation, Multi-watermark, Drag-to-reorder file.

## 📐 Lịch sử hoàn thành gần đây

### Drag-to-reorder file ✅ (develop)
- `UploaderStateService.reorderFiles(from, to)` — splice + replace; guard range; mark `settingsChanged` chỉ khi numbering bật
- `FileListComponent` — drag state qua signals (`draggedIndex`, `dragOverIndex`); handlers `onDragStart/Over/Leave/Drop/End`
- Grip handle SVG + visual cue: `.dragging` (opacity 0.5), `.drag-over` (primary-soft bg + ring)
- i18n: `file_drag_handle_title` (VI/EN)
- 10 unit tests mới (4 service + 6 component)

### Multi-watermark + code quality refactor ✅ (feature/multi-watermark, merged)
- Up to 5 watermark đồng thời (text + image), drag-reorder, accordion UI
- `MAX_WATERMARKS = 5` enforce ở 3 entry points (addWatermark, sanitizePresetData, applyPresetData)
- `replaceWatermark` ngăn URL leak khi đổi type image↔text
- Dropped unused fields (`id`/`imageName` khỏi `WatermarkConfig`, shim `options.watermark`)
- Move `@keyframes slideDown` lên global styles

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
2.  **History/Undo** — Lưu lịch sử các batch trong phiên.
3.  **SEO Landing Page** — route `/about` hoặc blog tách biệt với app `/optimize`.
4.  **Donation/Monetization** — "Buy me a coffee" + chỗ chừa AdSense (hoãn cho tới khi có traffic).

### Tech debt
- `image-compression.service.spec.ts` chưa tồn tại — core service không có unit test trực tiếp (watermark canvas loop, resize logic, pipeline orchestration). Cần bổ sung trước v1.0.

---
*Trạng thái: Sẵn sàng nhận task mới.*
