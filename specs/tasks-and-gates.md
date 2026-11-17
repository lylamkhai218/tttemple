# Cổng kiểm và tình trạng triển khai

Trạng thái được kiểm chứng tại thời điểm viết, không phải kế hoạch hoàn thành giả định.

| Phase | Trạng thái | Bằng chứng / phụ thuộc |
|---|---|---|
| P0 — AP và quyết định | Đang thực hiện | AP và hồ sơ đặc tả đã có; test local kiểm tra 12 flow, 9 KR, 15 event, 11 phase, 10 phụ thuộc và liên kết nội bộ. Chưa hoàn tất kiểm tra đầy đủ từng acceptance, test case, nguồn dữ liệu và liên kết task/KR. |
| P1 — nền tảng | Chưa đạt | Build và test local thành công; workflow CI chưa chạy trên GitHub. Repo public đã nối Cloudflare và trang kiểm tra triển khai thành công, nhưng thư mục chưa có Git; CLI token không hợp lệ và app GitHub chưa có quyền ghi. Spec Kit CLI lỗi. |
| P2 — POC bảo mật | Chuẩn bị, chưa đạt | Có benchmark PBKDF2 chạy local với dữ liệu giả; chưa đo CPU hay độ trễ trên Cloudflare. Cần đánh giá các phương án theo POC, không giảm độ mạnh để vừa quota. |
| P3 — tài khoản | Chưa bắt đầu | Phụ thuộc P2, danh sách username và công ty được duyệt, kênh cấp mật khẩu tạm. |
| P4 — hai người | Chưa bắt đầu | Phụ thuộc nền tảng và xác thực. |
| P5 — nghi lễ và hạt | Nguyên mẫu cục bộ | Có bốn tương tác cho một người, số hạt chỉ lưu trình duyệt. Chưa có xử lý server, đồng bộ hay xác minh chống ghi trùng và khôi phục. |
| P6 — mỹ thuật | Nguyên mẫu cục bộ | Có hai logo, chùa, chính điện, sân và ao; hình Phật là ảnh 2D. Chưa nghiệm thu mỹ thuật, hiệu năng hoặc thiết bị thật. |
| P7 — quan sát | Đang chuẩn bị | Có hợp đồng kiểm tra event và unit test local; chưa có truyền/ghi event, log, dashboard hoặc kiểm chứng thời gian lưu. Event/log cơ bản phải xuất hiện từ P2–P5. |
| P8 — tải và an toàn | Chưa bắt đầu | 20 kết nối, người thứ 21, an ninh, quota, sao lưu/khôi phục/rollback. |
| P9 — UAT | Chưa bắt đầu | Chỉ mở sau nghiệm thu kỹ thuật và danh sách người dùng. |
| P10 — vận hành | Chưa bắt đầu | Dashboard, owner và runbook được xác nhận. |

## Checklist truy vết

- Mỗi thay đổi liên kết FR, UF, task, test và event tương ứng trong AP.
- POC phải ghi môi trường, phiên bản, phép đo, dữ liệu thử và kết luận; số đo local không thay thế số đo trên Cloudflare.
- Chỉ ghi đạt khi có bằng chứng. Khi phụ thuộc ngoài chưa sẵn sàng, tiếp tục việc độc lập nhưng không vượt cổng liên quan.

## Bằng chứng cục bộ 18/11/2026

- `pnpm test`: 12 kiểm thử thành công, tập trung vào AP, hợp đồng telemetry, benchmark giả và va chạm. Không phải kiểm thử multiplayer hay bảo mật triển khai.
- `node poc/auth/run-local.mjs`: Node v24.22.1; ba lần PBKDF2-HMAC-SHA-256, 600.000 vòng, lần lượt 247,24 / 235,25 / 219,94 ms thời gian thực. Máy cục bộ không đại diện CPU time của Cloudflare; không dùng kết quả này để duyệt P2.
- `pnpm build`: xem kết quả build mới nhất trong phiên phát triển; CI GitHub chưa được xác minh chạy.
- Repo GitHub đang liên kết với Cloudflare và có trang kiểm tra, nhưng không chứa mã game hiện tại. Không có căn cứ để gọi đó là triển khai sản phẩm.
