# Angular Image Optimizer — Agent Instructions

> Hướng dẫn cho mọi AI coding agent (Claude, Gemini, Cursor, …) làm việc với
> codebase này. Đọc trước khi sửa code.

## Project Overview
**Angular Image Optimizer** là một ứng dụng web hiện đại được xây dựng để tối ưu hóa và nén hình ảnh trực tiếp trên trình duyệt của người dùng. Ứng dụng tập trung vào hiệu suất, tính riêng tư và trải nghiệm người dùng mượt mà.

**Lộ trình phát triển:** Xem phần [Roadmap](#roadmap) ở cuối tài liệu.

### Key Features
- **Client-Side Processing:** Xử lý 100% tại trình duyệt, không upload file lên server, đảm bảo tính riêng tư tuyệt đối và chi phí vận hành thấp.
- **Drag & Drop Zone:** Giao diện kéo thả file hiện đại, trực quan.
- **Compression Presets:** Ba mức độ nén (Nén nhẹ, Nén vừa, Nén tối đa) phù hợp với nhiều nhu cầu.
- **Output Format:** JPEG hoặc WebP.
- **Resize:** Auto (theo preset), Width/Height cố định, hoặc Percent.
- **Bulk Naming:** Prefix, Suffix, Numbering với start index.
- **Watermark:** Hai chế độ — Text (chữ + màu + font-size %) hoặc Image (logo PNG). Có vị trí, độ trong suốt, kích thước % theo chiều rộng ảnh.
- **Comparison Slider:** Modal so sánh ảnh gốc vs nén bằng thanh trượt.
- **i18n:** Việt Nam + English, lưu lựa chọn vào localStorage, default theo `navigator.language`.
- **Dark Mode:** Theme override qua CSS variables + `data-theme` attribute. Mặc định theo `prefers-color-scheme`.
- **Concurrent Processing Control:** Sử dụng RxJS `mergeMap` để giới hạn tối đa 3 ảnh xử lý đồng thời, tránh treo trình duyệt khi upload hàng loạt.
- **Individual & Batch Download:** Hỗ trợ tải về từng file riêng lẻ hoặc đóng gói tất cả vào một file `.zip` (JSZip). Tự động xử lý trùng tên file khi đóng gói Zip.
- **Real-time Progress:** Theo dõi tiến trình nén từng file thông qua Angular Signals và thanh progress mượt mà.
- **Smart Result List:** Hiển thị thumbnail preview, so sánh dung lượng (hệ SI - cơ số 1000) và phần trăm tiết kiệm. Hỗ trợ tooltip để xem kích thước chính xác đến từng byte.
- **Input Validation:** Mọi ô số có range hợp lệ + thông báo lỗi inline khi vượt range hoặc nhập sai.

## Tech Stack
- **Framework:** Angular 21.2.x
- **State Management:** Angular Signals
- **Asynchronous Logic:** RxJS (Pipeable operators)
- **Compression Core:** Canvas API native (`drawImage` + `toBlob`), không phụ thuộc lib bên ngoài.
- **Key Libraries (lazy-loaded):**
  - `heic-to`: Decode HEIC/HEIF từ iPhone (libheif WASM).
  - `jszip`: Đóng gói file Zip để tải về hàng loạt.
  - `cropperjs`: Cắt và thu phóng ảnh trong modal.
- **Testing:** Vitest
- **Styles:** SCSS (Tách biệt file `.scss`)

## Architecture
- **Service-Oriented:** Mọi logic xử lý ảnh và tạo Zip nằm trong `ImageCompressionService`. State chung của uploader nằm trong `UploaderStateService`. Settings (preset/format/resize/naming/watermark) nằm trong `SettingsStateService` với `currentOptions` computed signal.
- **Signal-Driven UI:** Component sử dụng `signal`, `computed` và `WritableSignal` để quản lý trạng thái hiển thị. Sub-components inject state services và re-expose signals cho template.
- **Component Hierarchy:** `<app-image-uploader>` là orchestrator mỏng. Các sub-components: `<app-settings-panel>` (chia tiếp thành `<app-naming-config>` + `<app-watermark-config>`), `<app-drop-zone>`, `<app-file-list>` + `<app-file-item>`, `<app-comparison-modal>`, `<app-lang-switcher>`, `<app-theme-toggle>`.
- **Unique ID Management:** Mỗi file được cấp một ID duy nhất (`crypto.randomUUID()`) khi upload để đảm bảo quản lý trạng thái độc lập, ngay cả khi upload cùng một file nhiều lần.
- **Concurrency Control:** Luồng nén ảnh được điều phối qua RxJS để tối ưu hóa tài nguyên CPU/RAM.
- **Model Separation:** Tất cả interface và type định nghĩa trong `src/app/image-processing.model.ts`.
- **Discriminated Unions:** Khi một entity có nhiều mode/biến thể (vd. `WatermarkConfig = TextWatermarkConfig | ImageWatermarkConfig`), dùng discriminated union với field `type` thay vì một interface với nhiều field optional. TypeScript narrow tự động trong nhánh `if (config.type === 'image')`.

## Conventions & Best Practices

### Angular & TypeScript
- **Standalone Architecture:** Mọi component, directive, và pipe PHẢI là `standalone: true`.
- **Modern Control Flow:** Sử dụng `@if`, `@for`, `@switch` trong templates thay vì `*ngIf`, `*ngFor`.
- **Strong Typing:** Tuyệt đối không dùng `any`. Sử dụng `interface` hoặc `type` rõ ràng. Dùng `unknown` nếu cần thiết. Tránh `$any($event.target)` — viết helper method type-safe.
- **Imports:** Luôn dùng `import { X } from '...'` ở đầu file. KHÔNG dùng inline `import('...').X` ở giữa code (vi phạm consistency và khó refactor).
- **File Separation:** Logic (.ts), Template (.html), và Styles (.scss) PHẢI nằm ở các file riêng biệt.
- **Naming:** Tuân thủ Angular Style Guide (e.g., `feature-name.component.ts`).
- **Clean Code:** Không để lại `console.log` hoặc code dư thừa trong bản final. Không thêm field/property nếu chưa có ai dùng.

### State & Services
- **Signal-First:** State quản lý qua `signal()` / `computed()`. Tránh `BehaviorSubject` trừ khi cần multicast Observable.
- **Pure Steps:** Service methods dài quá ~40 dòng nên tách thành các private helper "pure step" (input rõ → output rõ), dễ test và dễ thay thế.
- **Resource Cleanup:** Mọi `URL.createObjectURL` PHẢI có `URL.revokeObjectURL` tương ứng. Khi state có `compressedUrl` hoặc tương tự, revoke trong các action `remove`/`clear`/`recompress`.
- **Unique IDs:** Dùng `crypto.randomUUID()` cho file/entity IDs. Không dùng `Math.random()` hay timestamps.

### Constants & Magic Numbers
- **No Magic Numbers:** Mọi giá trị cấu hình (quality preset, concurrency, default size, threshold…) nằm trong `src/app/image-processing.constants.ts`. Component và service chỉ import constants.
- **One Source of Truth:** Default values cho UI signal phải đến từ cùng file constants với logic xử lý.
- **Input Ranges:** Min/max của mọi ô số nhập trong `INPUT_RANGES`. Template bind `[min]`/`[max]` từ constants, handler dùng cùng range qua `validateNumberInput()` — tránh inconsistency giữa hiển thị và validation.

### Form Validation
- **Helper:** `validateNumberInput(event, min, max)` trả về `{ value, valid, reason }`. KHÔNG validate inline trong handler.
- **Error Signal:** Mỗi component có `errors = signal<Record<string, string>>({})`. Khi không hợp lệ → set message; khi hợp lệ → clear. Không update state signal nếu invalid (giữ giá trị cũ).
- **Visual:** Dùng global utility classes (`.field`, `.field-error`, `.has-error`) — đã định nghĩa ở `styles.scss` để áp dụng đồng nhất cho mọi wrapper input (`.input-with-label`, `.numbering-input`, `.resize-input`, …).
- **i18n:** Thông báo lỗi qua `error_value_range` (template `{min}`/`{max}` placeholder) và `error_value_nan`.

### i18n
- **File-per-Language:** Dictionary mỗi ngôn ngữ nằm trong file riêng tại `src/app/i18n/{lang}.ts` (vd. `vi.ts`, `en.ts`). `TranslationService` chỉ giữ logic, KHÔNG chứa nội dung.
- **Type Re-exports:** Khi re-export `type` qua barrel file, dùng `export type { ... }` (do `isolatedModules`).
- **Placeholder Substitution:** Khi message có biến (vd. range error), dùng template literal `{key}` rồi `.replace('{key}', String(value))` trong handler. Không build i18n string trong template.

### Styles & Theming
- **CSS Variables:** Tất cả màu sắc, shadows, spacing tokens định nghĩa trong `:root` ở `src/styles.scss`. Component SCSS chỉ dùng `var(--token-name)`, KHÔNG hardcode hex/rgba.
- **Theme Override:** Dark Mode override qua `:root[data-theme='dark'] { ... }`. Mọi token cần có giá trị tương ứng ở cả light và dark.
- **Intentional Hardcoding:** Chỉ hardcode màu khi trên brand-fixed background (vd. text đen trên FAB vàng, text trắng trên PayPal blue, slider handle trên dark image viewer). Có comment ngắn giải thích lý do.
- **`--color-text-on-primary`:** Dùng cho text ngồi trên brand-color button (`primary`, `success`, `info`, `warning`, `danger`) — token này luôn là white ở cả hai theme.
- **SCSS Mixins:** Pattern lặp lại (focus-ring, input-wrapper, embedded-input) ở `src/styles/_mixins.scss`. Component dùng `@use '../../../styles/mixins' as m;` rồi `@include m.<name>`.
- **Global Utility Classes:** Pattern dùng cross-component (form validation: `.field`, `.field-error`, `.has-error`; keyframes: `spin`, `fadeIn`, `fadeInDown`, `slideUp`) đặt ở `src/styles.scss`. Bypass Angular view encapsulation nên template trong mọi component dùng được trực tiếp.
- **`:host { display: block }`:** Bắt buộc cho sub-component khi parent là flex/grid, để `<app-foo>` không bị `display: inline` mặc định làm hỏng layout.

### Memory & Performance
- **Blob URL Cache:** Cache blob URLs theo `File` reference để không tạo URL trùng lặp, và cleanup khi clear state.
- **No URL Leaks:** Bất kỳ helper nào tạo `URL.createObjectURL` cục bộ (đọc kích thước ảnh, tạo Image element, v.v.) phải `revokeObjectURL` ngay sau khi xong.
- **Watermark URL Revocation:** Khi cập nhật danh sách watermark (sắp xếp lại/reordering), chỉ revoke các preview URL của watermark thực sự bị xóa khỏi danh sách. Tuyệt đối không revoke các watermark đang được giữ lại để tránh lỗi hiển thị.
- **Watermark Safeguard Limit:** Giới hạn tối đa 5 watermark (`MAX_WATERMARKS = 5`) vẽ trên Canvas cùng lúc. Phải áp dụng kiểm soát độ dài mảng tại cả hàm `sanitizePresetData` và `applyPresetData` khi tải/nhập preset để phòng chống Client-Side DoS.

### Testing
- **Coverage Target:** Mỗi service + sub-component có spec riêng. Smoke test tối thiểu + main interactions.
- **Mock heic2any:** Mọi spec import (trực tiếp/gián tiếp) `image-compression.service.ts` phải có `vi.mock('heic2any', () => ({ default: vi.fn() }))` ở đầu file — nếu không jsdom sẽ crash khi load library.
- **Delegate Spies:** Khi test orchestrator/parent delegate xuống service, dùng `.mockImplementation(() => undefined)` để swallow side-effects (vd. service nội bộ subscribe Observable).
- **Discriminated Union Tests:** Khi test `currentOptions().watermarks`, narrow từng item bằng `if (item.type === 'text')` trước khi truy cập field — TypeScript sẽ báo lỗi nếu access trực tiếp `.text` hay `.image`.

## Workflows
- **Development:** `npm start`
- **Testing:** `npm test`
- **Building:** `npm run build`

## Roadmap

Lộ trình tính năng và cải tiến cho **Angular Image Optimizer**. Các mục đã ✅ là đã hoàn thành và release; các mục ❌ đã bị loại bỏ hoặc hủy bỏ để tập trung tối đa vào trang xử lý hình ảnh duy nhất.

### 🔴 Ưu tiên cao (Sắp thực hiện)
- [x] **Chuyển đổi sang WebP/AVIF (Hoàn thành ✅):** Hỗ trợ xuất tệp ảnh định dạng AVIF/WebP/JPEG nén trực tiếp tại client-side.
- [x] **Tính năng Resize hàng loạt (Bulk Resize) (Hoàn thành ✅):** Cho phép người dùng thiết lập chiều rộng/chiều cao cố định cho tất cả ảnh. Tùy chọn: Resize theo % hoặc giữ nguyên tỷ lệ (Aspect Ratio).
- [x] **Đổi tên file hàng loạt (Bulk Rename) (Hoàn thành ✅):** Thêm tiền tố (prefix), hậu tố (suffix) hoặc số thứ tự vào tên file sau khi nén.

### 🟡 Ưu tiên trung bình (Nâng cao trải nghiệm)
- [x] **Công cụ so sánh (Side-by-Side Compare) (Hoàn thành ✅):** Sử dụng thanh trượt (slider) để so sánh trực quan chất lượng ảnh Gốc vs Ảnh nén.
- [x] **Đóng dấu ảnh (Watermark) (Hoàn thành ✅):** Cho phép chèn text hoặc logo đè lên ảnh để bảo vệ bản quyền. Hỗ trợ cả 2 chế độ: text watermark + image (logo) watermark với position/size/opacity.
- [x] **Hỗ trợ đa ngôn ngữ (i18n) (Hoàn thành ✅):** Tiếng Việt + tiếng Anh, lưu trong localStorage, default theo `navigator.language`.
- [x] **Chế độ tối (Dark Mode) (Hoàn thành ✅):** Override theme qua CSS variables + `data-theme` attribute. Default theo `prefers-color-scheme`.
- [x] **Input validation (Hoàn thành ✅):** Mọi ô số có range hợp lệ + thông báo lỗi inline khi vượt range.

### 🟢 Ưu tiên thấp (Mở rộng & Marketing)
- [x] **PWA (Progressive Web App) (Hoàn thành ✅):** Cho phép cài đặt ứng dụng vào máy tính và sử dụng offline.
- [x] **Hệ thống quyên góp/Kiếm tiền (Hoàn thành ✅):** Tích hợp nút và dialog "Buy me a coffee" hỗ trợ Momo, Paypal, Bank transfer.
- [ ] **SEO Landing Page (Đã loại bỏ ❌):** Đã xóa các trang Blog, About, Changelog để ứng dụng tập trung 100% vào việc xử lý ảnh tối giản trên một trang duy nhất.
- [ ] **Đặt quảng cáo AdSense (Đã loại bỏ ❌):** Đã loại bỏ hoàn toàn mã AdSense và các vị trí quảng cáo để đảm bảo giao diện sạch và hiệu suất cao nhất.

### 💡 Ý tưởng tiềm năng (chưa lên lịch)
- [x] **Keyboard shortcuts (Hoàn thành ✅):** `Cmd/Ctrl+O` mở file picker, `Cmd/Ctrl+S` download all, `Esc` đóng modal/popover. Có aria-keyshortcuts + visible kbd hint.
- [x] **Drag-to-reorder (Hoàn thành ✅):** Kéo thả file trong danh sách qua HTML5 Drag API, có grip handle + drop indicator. Chỉ mark `settingsChanged` khi numbering bật.
- [x] **Multi-watermark (Hoàn thành ✅):** Tối đa 5 watermark đồng thời (text + image trộn lẫn), drag-reorder, accordion expand/collapse, sanitize/MAX_WATERMARKS chống DoS ở cả import + load.
- [x] **EXIF preservation toggle (Hoàn thành ✅):** Giữ metadata EXIF (camera info, GPS, timestamps). Inline JPEG APP1 splicer, không cần dependency. Chỉ áp dụng JPEG → JPEG.

---

### 📐 Đã hoàn thành — Refactor lớn (Phase 4)
- ✅ Tách `ImageUploaderComponent` God Component → 8 sub-components + 2 state services.
- ✅ Signal store pattern (`UploaderStateService`, `SettingsStateService`).
- ✅ SCSS modular: mixins (`_mixins.scss`), global utility classes, shadow tokens.
- ✅ Type-safe DOM helpers (`utils/dom-event.ts`).
- ✅ Test coverage: **135 tests / 18 spec files**.
- ✅ Memory leak fix: tất cả `URL.createObjectURL` đã được revoke đúng chỗ.
- ✅ **Preset save/load:** Lưu và tải cấu hình settings tùy chỉnh trực tiếp tại trình duyệt (hỗ trợ Import/Export và Reset cấu hình) — kèm sanitize/whitelist khi import để chặn JSON ngoại lai.
- ✅ **Keyboard shortcuts:** Cmd/Ctrl+O, Cmd/Ctrl+S, Esc + aria-keyshortcuts.
- ✅ **EXIF preservation toggle:** Inline JPEG APP1 splicer (~100 dòng) — extract EXIF từ source, inject vào output sau pipeline. Toggle disabled khi format ≠ JPEG.
- ✅ **Multi-watermark:** Up to 5 watermark (text + image), drag-reorder, accordion UI, `MAX_WATERMARKS` enforce ở `addWatermark`, `sanitizePresetData`, `applyPresetData`.
- ✅ **Drag-to-reorder file:** HTML5 Drag API trong file list, grip handle, drop indicator. Mark `settingsChanged` khi numbering bật để gợi ý recompress.

