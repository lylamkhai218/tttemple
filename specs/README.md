# TTTemple — hồ sơ đặc tả

Đây là hồ sơ thủ công theo quy trình Spec Kit cho dự án hiện có. Trên máy, `specify --help` thất bại với lỗi `uv trampoline failed to canonicalize script path`; lệnh thay thế `uvx --from git+https://github.com/github/spec-kit.git specify --help` đã chạy thành công ở commit `59d61c59630c3bd5a294f4c23e43a60d8ab98d02`. Chưa khởi tạo Spec Kit trong repo.

- [AP sản phẩm và kỹ thuật](../docs/AP-TTTemple.html): user flow, KR, event, logging, phase và phụ thuộc.
- [Nguyên tắc và đặc tả](constitution-and-spec.md): các nguyên tắc, yêu cầu và tiêu chí chặn phát hành.
- [Cổng kiểm và task](tasks-and-gates.md): trạng thái, phụ thuộc và bằng chứng thực tế.
- [Ma trận truy vết](traceability.md): liên kết yêu cầu, luồng, KR, event, phase và kiểm thử dự kiến.
- [Ma trận nghiệm thu](acceptance-matrix.md): ca kiểm thử và nguồn bằng chứng dự kiến cho từng luồng.
- [Chuẩn bị UAT](uat-runbook.md): điều kiện mở, cách thu bằng chứng và kết luận P9.
- [Review game và phạm vi dùng skill](game-review.md): ưu tiên điều khiển, camera, âm thanh, HUD, mỹ thuật và hiệu năng.
- [Định hướng trải nghiệm và chat](story-and-social.md): lời chào, yêu cầu trụ trì và đề xuất chat có điều kiện.
- [Đánh giá intro và Lighthouse](intro-audit.md): điều kiện đo, kết quả và vấn đề mã còn lại.
- [POC xác thực bằng dữ liệu giả](../poc/auth/README.md): thử nghiệm local và điều kiện đo trên Cloudflare.
- [POC phòng WebSocket cục bộ](../poc/multiplayer/README.md): dữ liệu giả, kiểm tra kết nối và giới hạn phòng.
- [POC lưu hạt D1 cục bộ](../poc/beads/README.md): dữ liệu giả, kiểm tra gửi lặp và ngày Việt Nam.

Trạng thái triển khai mới nhất được cập nhật ở `tasks-and-gates.md`; AP HTML là bản kế hoạch ban đầu và một số ghi chú hiện trạng trong đó có thể chưa được cập nhật.

Quy trình cho từng thay đổi: constitution → specify → clarify → plan → checklist → tasks → analyze → implement → converge. Chưa triển khai phase tiếp theo chỉ vì một tài liệu đã được viết: phải hoàn thành cổng và giữ bằng chứng.
