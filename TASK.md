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

### Bước 2 — Tách sub-components ✅
- [x] `<app-lang-switcher>` — chuyển ngôn ngữ VI/EN
- [x] `<app-theme-toggle>` — nút 🌙/☀️
- [x] `<app-settings-panel>` — toàn bộ `control-group` (preset, format, resize, naming, watermark). Tách thêm `SettingsStateService` chứa settings signals + `currentOptions` computed.
- [x] `<app-drop-zone>` — drop zone + file input (emit `filesSelected` output)
- [x] `<app-file-list>` — list iterator + empty state
- [x] `<app-file-item>` — render từng file (thumbnail, progress, result actions, gọi state service)
- [x] `<app-comparison-modal>` — modal so sánh ảnh

**Kết quả:** Parent ImageUploaderComponent từ 392 → **74 LOC** (-81%). HTML 437 → **50 LOC**. SCSS 940 → **150 LOC**.

### Bước 3 — SCSS modular ✅
- [x] Tách `image-uploader.component.scss` theo từng sub-component (đã làm cùng Bước 2).
- [x] Pull global `@keyframes` (spin, fadeIn, fadeInDown, slideUp) lên `src/styles.scss` (keyframes là global scope).
- [x] Tạo `src/styles/_mixins.scss` với `focus-ring`, `input-wrapper`, `embedded-input` mixins.
- [x] Apply mixins vào `settings-panel.scss` (đã dedupe `.resize-input` + `.input-with-label`) và `theme-toggle.scss` (focus-ring).
- [x] Replace ad-hoc box-shadows bằng shadow tokens (`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`).

### Bước 4 — Helper type-safe ✅
- [x] Loại bỏ `$any($event.target).value` trong template (đã làm cùng Bước 2 khi tách settings-panel).
- [x] Tạo `src/app/utils/dom-event.ts` với `getInputValue`, `getNumberValue`, `getSelectValue<T>`, `getInputFiles` — type-safe wrappers.
- [x] Apply vào `drop-zone`, `comparison-modal`, `settings-panel` — loại bỏ ~10 chỗ cast `(event.target as HTMLInputElement)`.
- [x] Spec `dom-event.spec.ts` (5 tests) cho utility.

### Bước 5 — Test coverage ✅
- [x] Spec cho từng sub-component: lang-switcher, theme-toggle, drop-zone (7 tests), file-list, file-item (7 tests), comparison-modal, settings-panel (10 tests).
- [x] Spec cho services: `ThemeService` (5 tests), `TranslationService` (4 tests), `SettingsStateService` (6 tests), `UploaderStateService` (9 tests đã có từ Bước 1).
- [x] Spec cho utility `dom-event` (5 tests).
- [x] Test memory leak: `removeFile` và `clearAll` revoke `compressedUrl` được verify trong `uploader-state.service.spec.ts`.

**Kết quả:** **69/69 tests pass** (tăng từ 22). 14 spec files total.

### Bước 6 — Verify ✅
- [x] `npm run lint` xanh.
- [x] `npm test` 69/69 tests pass.
- [x] `npm run build` thành công (chỉ warning ESM cho compressorjs/jszip/heic2any — không phải lỗi).
- [x] Dev server lên ở http://localhost:4200, HTTP 200.
- [ ] Manual test trong browser: upload, compress, compare, download, switch theme, switch lang — chờ user xác nhận.

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
