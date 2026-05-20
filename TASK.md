# Current Task: Phase 4 — Tách `ImageUploaderComponent`

Mục tiêu: Sau khi đã hoàn thành Phase 1 (quick wins) + Phase 2 (CSS variables / Dark Mode) + Phase 3 (refactor service), `ImageUploaderComponent` (369 LOC TS + 437 LOC HTML + 940 LOC SCSS) vẫn là God Component. Cần tách nhỏ để dễ bảo trì và sẵn sàng cho các tính năng tương lai (PWA, AVIF, SEO landing…).

## 📋 Danh sách công việc

### Bước 1 — State store ✅
- [x] Tạo `UploaderStateService` (signal store) chứa state shared:
  - `processedFiles`, `isCompressing`, `settingsChanged`, `comparingFile`, `comparisonSliderValue`, `completedCount`
  - Helper actions: `addFiles()`, `removeFile()`, `clearAll()`, `recompressAll()`, `markSettingsChanged()`, `openComparison()`, `closeComparison()`, `setComparisonSlider()`, `createBlobUrl()`, `generateZip()`
- [x] Di chuyển blob URL cache + revoke logic vào state service.
- [x] Component delegate qua `this.state.xxx`, signals re-expose để template không đổi.
- [x] Spec mới `uploader-state.service.spec.ts` (8 tests) cho state service.
- [x] Update spec component để spy `compressImagesWithProgress` (public) thay vì private `runCompressionTask`.

### Bước 2 — Tách sub-components
- [ ] `<app-lang-switcher>` — chuyển ngôn ngữ VI/EN (đã có sẵn UI nhỏ, tách ra trước cho dễ).
- [ ] `<app-theme-toggle>` — nút 🌙/☀️ (tương tự lang-switcher).
- [ ] `<app-settings-panel>` — toàn bộ `control-group` (preset, format, resize, naming, watermark). Có thể chia tiếp:
  - `<app-watermark-config>` — config watermark (chỉ render khi enabled)
  - `<app-naming-config>` — config tên file
- [ ] `<app-drop-zone>` — drop zone + file input.
- [ ] `<app-file-list>` — list of files + empty state.
- [ ] `<app-file-item>` — render từng file (thumbnail, progress, result actions).
- [ ] `<app-comparison-modal>` — modal so sánh ảnh.

### Bước 3 — SCSS modular
- [ ] Tách `image-uploader.component.scss` theo từng sub-component.
- [ ] File chung (`_variables.scss`, `_mixins.scss`) nếu cần share.

### Bước 4 — Helper type-safe
- [ ] Thay `$any($event.target).value` (template) bằng helper `getSelectValue(event: Event): string` hoặc dùng `(change)="setWatermarkPosition($event)"` với event handler nhận `Event` rồi cast bên trong TS.

### Bước 5 — Test coverage
- [ ] Mỗi sub-component có spec file riêng (smoke test + main interactions).
- [ ] Test cho `UploaderStateService` riêng (signals, actions).
- [ ] Test memory leak: assert `URL.revokeObjectURL` được gọi khi clear/remove.

### Bước 6 — Verify
- [ ] `npm run lint`, `npm test`, `npm run build` xanh.
- [ ] Manual test: thử upload, compress, compare, download, switch theme, switch lang — đảm bảo regression không xảy ra.

---

## 📝 Ghi chú quan trọng

### Đã hoàn thành (không làm lại)
- ✅ Phase 1: fix lint error, blob URL memory leak, `crypto.randomUUID()`, bỏ inline `import()` types, extract constants
- ✅ Phase 2: CSS custom properties + Dark Mode (`ThemeService`, toggle UI, `data-theme` attr)
- ✅ Phase 3: refactor `compressSingleImage` thành pure steps (`prepareSource`, `resolveResizeDimensions`, `runCompressor`, `applyWatermarkIfNeeded`, `buildFileName`, `buildResult`)
- ✅ Tách i18n thành `src/app/i18n/{vi,en,types,index}.ts`

### Convention bắt buộc khi refactor
Xem `GEMINI.md` section "Conventions & Best Practices" — đặc biệt:
- Signal-first state, không `BehaviorSubject`
- Mọi color qua CSS variables (`var(--color-*)`)
- Không dùng `any` / `$any()` — type-safe helpers
- Cleanup `URL.createObjectURL` ở mọi nhánh code
- Constants trong `image-processing.constants.ts`

### Lý do chia thành Phase 4 riêng
Refactor này lớn (động vào 3 file 1500+ LOC). Làm chung với Dark Mode hoặc các quick wins sẽ:
- Khó review (diff quá lớn)
- Khó rollback nếu sai
- Pha trộn nhiều mục đích trong một commit

→ Tách riêng để có thể commit từng sub-component một cách độc lập.

---
*Trạng thái: Đang chờ (Pending) — bắt đầu khi sẵn sàng.*
