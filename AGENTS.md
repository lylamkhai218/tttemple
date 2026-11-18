# Hướng dẫn cho agent trong TTTemple

## Cách viết

- Trong văn xuôi và câu trả lời, dùng dấu gạch nối đơn `-` khi cần dấu gạch ngang; không dùng dấu gạch ngang đôi hoặc dấu gạch dài. Không thay đổi cú pháp cần thiết của mã, lệnh, URL hoặc văn bản trích dẫn.

## Giữ ngữ cảnh và bài học

- Trước khi làm việc, đọc `HANDOFF.md`, `specs/tasks-and-gates.md` và phần liên quan trong `docs/project-history.md`; kiểm tra `git status` và giữ mọi thay đổi đang có.
- `docs/project-history.md` là nhật ký chỉ nối thêm: thêm mục mới có ngày, nguồn/bằng chứng và trạng thái; không xóa, sửa hay viết lại mục cũ. Khi thông tin cũ sai hoặc đã thay đổi, thêm mục đính chính dẫn tới mục cũ. Không đưa bí mật, dữ liệu nhân viên hoặc thông tin thẻ vào nhật ký.
- Tài liệu trạng thái, đặc tả và mã là tài liệu làm việc, được phép sửa chính xác theo yêu cầu. Trước khi thay đổi hoặc rút gọn nội dung có giá trị lịch sử, ghi lại quyết định, lý do và thông tin thay thế vào nhật ký; không coi append-only là cấm sửa lỗi trong mã hoặc xóa dữ liệu nhạy cảm theo yêu cầu.
- Cập nhật bàn giao hoặc nhật ký khi có quyết định quan trọng, thay đổi cổng phase, bài học, giới hạn chưa được chứng minh, hoặc triển khai có tác động. Không tự nhận hoàn tất dựa trên dự kiến.
- Phân biệt kiểm thử cục bộ, giả lập, triển khai thực tế và nghiệm thu thiết bị. Giữ rõ bằng chứng và các cổng chặn phase.
