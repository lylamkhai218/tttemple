# P9 - Hướng dẫn chuẩn bị UAT

Tài liệu chuẩn bị, chưa phải biên bản nghiệm thu. Các ca chức năng chính và mã truy vết nằm trong [ma trận nghiệm thu](acceptance-matrix.md); trạng thái cổng nằm tại [tasks-and-gates.md](tasks-and-gates.md).

## Điều kiện trước khi mời người dùng

- P1 - P8 đã được đánh giá và các tồn tại chặn nghiệm thu được xử lý hoặc có quyết định chấp nhận bằng văn bản. Đặc biệt P2 phải xác minh xác thực, phiên và quota trước khi cấp tài khoản thật.
- Bản thử và cấu hình truy cập được xác định; có đường lui, đầu mối hỗ trợ và quy trình xử lý lỗi. Không coi lọc IP Việt Nam là đăng nhập.
- Chủ dự án duyệt người tham gia, tài khoản và cách cấp mật khẩu; không lưu danh sách nhân viên, mật khẩu, token hay dữ liệu cá nhân trong repo.
- Chuẩn bị ít nhất một iPhone và một Android đại diện, ghi phiên bản hệ điều hành, trình duyệt, mạng và phiên bản bản thử. Chuẩn bị hai thiết bị cho ca đồng bộ; các ngưỡng hiệu năng phải được thống nhất trước khi kết luận đạt.

## Cách chạy từng ca

1. Ghi thời điểm, mã ca TC01 - TC12, phiên bản bản thử và môi trường; xác định dữ liệu thử đã được duyệt.
2. Thực hiện điều kiện và thao tác trong ma trận; ghi kết quả quan sát và tham chiếu bằng chứng phù hợp, không đưa bí mật hoặc dữ liệu cá nhân vào repo.
3. Đánh dấu **đạt**, **không đạt** hoặc **chưa thử**, kèm lỗi và mức ảnh hưởng. Không suy kết quả thiết bị khác từ một thiết bị.
4. Chạy lại ca thất bại sau khi sửa trên bản xác định; giữ lịch sử bằng chứng và quyết định, không sửa kết quả cũ thành đạt.
5. Kiểm tra riêng điều khiển chạm, vuốt một hạt một lần, âm thanh, camera, khôi phục kết nối, ranh giới ngày Việt Nam và khả năng sử dụng khi mất mạng theo các ca tương ứng.

## Điều kiện kết luận

Chỉ người được chủ dự án phân công kết luận UAT sau khi tổng hợp đủ kết quả, tồn tại còn mở và quyết định xử lý. Bài test local, build, Lighthouse hoặc mô phỏng thiết bị không tự thay thế kiểm tra trên thiết bị và người dùng thật. UAT chưa mở tại thời điểm lập tài liệu này.
