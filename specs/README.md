# TTTemple — hồ sơ đặc tả

Đây là hồ sơ thủ công theo quy trình Spec Kit cho dự án hiện có. Trên máy, `specify --help` thất bại với lỗi `uv trampoline failed to canonicalize script path`; chưa khởi tạo Spec Kit và không coi các lệnh của nó đã chạy.

- [AP sản phẩm và kỹ thuật](../docs/AP-TTTemple.html): user flow, KR, event, logging, phase và phụ thuộc.
- [Nguyên tắc và đặc tả](constitution-and-spec.md): các nguyên tắc, yêu cầu và tiêu chí chặn phát hành.
- [Cổng kiểm và task](tasks-and-gates.md): trạng thái, phụ thuộc và bằng chứng thực tế.
- [Ma trận truy vết](traceability.md): liên kết yêu cầu, luồng, KR, event, phase và kiểm thử dự kiến.
- [POC xác thực bằng dữ liệu giả](../poc/auth/README.md): thử nghiệm local và điều kiện đo trên Cloudflare.

Trạng thái triển khai mới nhất được cập nhật ở `tasks-and-gates.md`; AP HTML là bản kế hoạch ban đầu và một số ghi chú hiện trạng trong đó có thể chưa được cập nhật.

Quy trình cho từng thay đổi: constitution → specify → clarify → plan → checklist → tasks → analyze → implement → converge. Chưa triển khai phase tiếp theo chỉ vì một tài liệu đã được viết: phải hoàn thành cổng và giữ bằng chứng.
