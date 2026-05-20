# Current Task: Tính năng Resize hàng loạt (Ưu tiên 🔴)

Mục tiêu: Cho phép người dùng điều chỉnh kích thước ảnh (chiều rộng/cao) đồng loạt trước khi nén.

## 📋 Danh sách công việc
- [x] **Model:** Cập nhật `CompressionOptions` để hỗ trợ `width`, `height` và `resizeMode`.
- [x] **Giao diện:** Thêm bảng điều khiển "Kích thước đầu ra" (Auto, Fixed Width, Percentage).
- [x] **Logic Component:** Xử lý việc bật/tắt các ô nhập liệu và tính toán kích thước dựa trên chế độ chọn.
- [x] **Service:** Truyền các thông số resize vào `Compressor.js`.
- [x] **Kiểm thử:** Viết unit test đảm bảo các thông số resize được gửi đúng đến service.
- [x] **Xác nhận:** Chạy `npm run lint`, `npm test` và `npm run build`.
- [x] **Hoàn tất:** Commit code và cập nhật `BACKLOG.md`.

---
*Trạng thái: Hoàn thành ✅*
