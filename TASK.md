# Current Task: Đóng dấu ảnh (Watermark) (Ưu tiên 🟡)

Mục tiêu: Cho phép người dùng chèn một đoạn văn bản (Text Watermark) lên ảnh sau khi nén để bảo vệ bản quyền.

## 📋 Danh sách công việc
- [x] **Giao diện (Controls):** Thêm bảng điều khiển cấu hình Watermark (Text, Vị trí, Độ mờ, Màu sắc).
- [x] **Model:** Cập nhật `CompressionOptions` để bao gồm cấu hình `watermark`.
- [x] **Logic Service:** Triển khai phương thức vẽ text watermark lên Canvas trong `ImageCompressionService`.
- [x] **Tích hợp:** Kết nối logic đóng dấu vào quy trình nén ảnh hiện tại.
- [x] **Kiểm thử:** Viết unit test đảm bảo cấu hình watermark được truyền và xử lý đúng.
- [x] **Xác nhận:** Chạy `npm run lint`, `npm test` và `npm run build`.
- [x] **Hoàn tất:** Commit code và cập nhật `BACKLOG.md`.

---
*Trạng thái: Hoàn thành ✅*
