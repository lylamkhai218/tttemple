# POC ghi hạt D1 cục bộ

Đây là phép thử P5 chỉ dùng dữ liệu giả, không có endpoint đăng nhập và không triển khai. Mỗi thao tác có khóa duy nhất theo tài khoản, dữ liệu ngày tính theo `Asia/Ho_Chi_Minh`, và tổng được tính từ các thao tác đã ghi. Trong POC, D1 `batch` ghi và đọc trong cùng một giao dịch; việc gửi lại cùng mã không tạo thêm dòng.

Kịch bản local còn gây lỗi ràng buộc ở bước ghi thứ hai và kiểm tra bước ghi thứ nhất đã được hoàn tác. Đây là kiểm tra tính nguyên tử của giao dịch giả lập, chưa phải kiểm tra sao lưu và phục hồi dữ liệu.

`retry-local.mjs` là bộ điều phối giả lập riêng: tối đa ba lần, chỉ thử lại lỗi timeout tổng hợp và giữ nguyên mã thao tác. Kịch bản giả lập timeout trước khi gọi ghi và sau khi ghi thành công nhưng trước khi nhận kết quả; cả hai đều kết thúc với một dòng. Nếu hết lần thử, kết quả có thể chưa rõ và không được coi là thất bại ghi chắc chắn. Đây không có mạng thật, lưu hàng đợi, delay/backoff, khôi phục khi đóng tab hay giao diện; không dùng trực tiếp làm chính sách retry production.

Ngày 18/11/2026, chạy các ca trên bằng Worker local và D1 remote binding tới một cơ sở thử riêng tại APAC. Kịch bản báo đạt, và truy vấn trực tiếp D1 primary thấy đúng một dòng cho mỗi ca timeout giả. D1 chỉ chứa dữ liệu tổng hợp đã được xóa và danh sách D1 được xác nhận sau thử. Đây kiểm tra hành vi D1 từ xa dưới lỗi do code mô phỏng, không phải đo timeout mạng, Worker triển khai hay đăng nhập thật.

Chạy `pnpm exec wrangler dev --config poc/beads/wrangler.local.jsonc --test-scheduled --port 8797`, sau đó gọi `http://127.0.0.1:8797/cdn-cgi/local/scheduled?format=json`. Xem log, rồi dừng Wrangler. Chỉ dùng D1 local với ID placeholder, không dùng database thật.

Đây chưa phải hệ thống sản phẩm. Cần xác thực và phiên P2, vị trí nghi lễ, giới hạn tần suất, timeout và retry trên mạng, lưu bền và đối chiếu trên D1 triển khai, backup/restore, bảng chung và telemetry trước khi nghiệm thu. Mã thao tác không tự chứng minh thao tác hợp lệ, và client không được chọn thời gian server.
