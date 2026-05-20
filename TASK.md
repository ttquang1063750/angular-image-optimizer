# Current Task: Đổi tên file hàng loạt (Ưu tiên 🔴)

Mục tiêu: Cho phép người dùng tùy chỉnh tên file đầu ra bằng cách thêm tiền tố, hậu tố hoặc đánh số thứ tự.

## 📋 Danh sách công việc
- [x] **Model:** Cập nhật `CompressionOptions` để hỗ trợ `fileNamePattern` (prefix, suffix, startingIndex).
- [x] **Giao diện:** Thêm bảng điều khiển "Đặt tên file" với các ô nhập Prefix, Suffix và tùy chọn đánh số.
- [x] **Logic Component:** Cập nhật phương thức `processFiles` để áp dụng tên mới cho từng file trong danh sách.
- [x] **Logic Service:** Đảm bảo `generateZip` và `downloadSingle` sử dụng tên đã được tùy chỉnh.
- [x] **Kiểm thử:** Viết unit test đảm bảo tên file được tạo ra đúng theo pattern yêu cầu.
- [x] **Xác nhận:** Chạy `npm run lint`, `npm test` và `npm run build`.
- [x] **Hoàn tất:** Commit code và cập nhật `BACKLOG.md`.

---
*Trạng thái: Hoàn thành ✅*
