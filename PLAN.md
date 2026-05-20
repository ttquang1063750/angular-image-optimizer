# Skill Plan: Quy trình phát triển lặp (Iterative Workflow) 🔄

Tài liệu này định nghĩa quy trình làm việc giữa AI và người dùng để phát triển ứng dụng **Angular Image Optimizer** một cách chuyên nghiệp và bền vững.

## 🔄 Chu trình làm việc
1.  **Lập kế hoạch (Planning):** Lấy từng mục mục tiêu từ `BACKLOG.md` theo thứ tự ưu tiên để đưa vào `TASK.md`.
2.  **Thực hiện (Execution):** AI thực hiện các bước trong `TASK.md`.
3.  **Kiểm chứng (Verification):** Sau mỗi tính năng quan trọng hoặc khi hoàn tất `TASK.md`, AI phải chạy:
    *   `npm run lint`: Đảm bảo chất lượng code.
    *   `npm test`: Đảm bảo không có lỗi logic.
    *   `npm run build`: Đảm bảo ứng dụng có thể build thành công.
4.  **Cam kết (Commit):** Sau khi vượt qua kiểm chứng, AI sẽ đề xuất commit code.
5.  **Lặp lại (Repeat):** Khi xong một `TASK.md`, AI sẽ hỏi người dùng để lập kế hoạch cho mục tiếp theo trong Backlog.

## 🛠 Quản lý file
*   `BACKLOG.md`: Danh sách tính năng tổng quát và lộ trình dài hạn.
*   `TASK.md`: Danh sách công việc cụ thể đang thực hiện trong lượt này.
*   `PLAN.md`: (File này) Định nghĩa quy trình và tiêu chuẩn làm việc.

---
*Mục tiêu cuối cùng: Tạo ra một sản phẩm thương mại chất lượng cao, an toàn và sạch sẽ.*
