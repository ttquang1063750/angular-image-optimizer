# Angular Image Optimizer - Project Instructions

## Project Overview
**Angular Image Optimizer** là một ứng dụng web hiện đại được xây dựng để tối ưu hóa và nén hình ảnh trực tiếp trên trình duyệt của người dùng. Ứng dụng tập trung vào hiệu suất, tính riêng tư và trải nghiệm người dùng mượt mà.

**Chi tiết lộ trình phát triển:** Xem tại [BACKLOG.md](./BACKLOG.md)

### Key Features
- **Client-Side Processing:** Xử lý 100% tại trình duyệt, không upload file lên server, đảm bảo tính riêng tư tuyệt đối và chi phí vận hành thấp.
- **Drag & Drop Zone:** Giao diện kéo thả file hiện đại, trực quan.
- **Compression Presets:** Ba mức độ nén (Nén nhẹ, Nén vừa, Nén tối đa) phù hợp với nhiều nhu cầu.
- **Concurrent Processing Control:** Sử dụng RxJS `mergeMap` để giới hạn tối đa 3 ảnh xử lý đồng thời, tránh treo trình duyệt khi upload hàng loạt.
- **Individual & Batch Download:** Hỗ trợ tải về từng file riêng lẻ hoặc đóng gói tất cả vào một file `.zip` (JSZip). Tự động xử lý trùng tên file khi đóng gói Zip.
- **Real-time Progress:** Theo dõi tiến trình nén từng file thông qua Angular Signals và thanh progress mượt mà.
- **Smart Result List:** Hiển thị thumbnail preview, so sánh dung lượng (hệ SI - cơ số 1000) và phần trăm tiết kiệm. Hỗ trợ tooltip để xem kích thước chính xác đến từng byte.

## Tech Stack
- **Framework:** Angular 21.2.x
- **State Management:** Angular Signals
- **Asynchronous Logic:** RxJS (Pipeable operators)
- **Key Libraries:** 
  - `compressorjs`: Thư viện lõi để nén ảnh (Nhẹ, ổn định, phổ biến).
  - `jszip`: Đóng gói file Zip để tải về hàng loạt.
- **Testing:** Vitest
- **Styles:** SCSS (Tách biệt file `.scss`)

## Architecture
- **Service-Oriented:** Mọi logic xử lý ảnh và tạo Zip nằm trong `ImageCompressionService`.
- **Signal-Driven UI:** Component sử dụng `signal`, `computed` và `WritableSignal` để quản lý trạng thái hiển thị.
- **Unique ID Management:** Mỗi file được cấp một ID duy nhất khi upload để đảm bảo quản lý trạng thái độc lập, ngay cả khi upload cùng một file nhiều lần.
- **Concurrency Control:** Luồng nén ảnh được điều phối qua RxJS để tối ưu hóa tài nguyên CPU/RAM.
- **Model Separation:** Tất cả interface và type định nghĩa trong `src/app/image-processing.model.ts`.

## Conventions & Best Practices
- **Standalone Architecture:** Mọi component, directive, và pipe PHẢI là `standalone: true`.
- **Modern Control Flow:** Sử dụng `@if`, `@for`, `@switch` trong templates thay vì `*ngIf`, `*ngFor`.
- **Strong Typing:** Tuyệt đối không dùng `any`. Sử dụng `interface` hoặc `type` rõ ràng. Dùng `unknown` nếu cần thiết.
- **File Separation:** Logic (.ts), Template (.html), và Styles (.scss) PHẢI nằm ở các file riêng biệt.
- **Naming:** Tuân thủ Angular Style Guide (e.g., `feature-name.component.ts`).
- **Clean Code:** Không để lại `console.log` hoặc code dư thừa trong bản final.

## Workflows
- **Development:** `npm start`
- **Testing:** `npm test`
- **Building:** `npm run build`
