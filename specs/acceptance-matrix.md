# P0 — kế hoạch nghiệm thu và nguồn bằng chứng

Các ca dưới đây là kế hoạch, không phải kết quả kiểm thử. Nguồn tài khoản thật do anh Khải cung cấp và duyệt; dữ liệu này không lưu trong repo, log hay dữ liệu thử.

| Ca / luồng | Điều kiện và thao tác | Kết quả cần xác minh | Nguồn bằng chứng / phase |
|---|---|---|---|
| TC01 / UF01 | Tài khoản hợp lệ; lần lượt thử sai, khóa, vượt giới hạn, lỗi dịch vụ | Chỉ tài khoản hợp lệ được xác thực; lỗi không lộ bí mật | login_result, test bảo mật / P3, KR01, KR08 |
| TC02 / UF02 | Đăng nhập bằng mật khẩu tạm, thử mật khẩu không hợp lệ và lỗi lưu | Phải đổi thành công trước khi vào; từ chối trường hợp lỗi | password_change_result / P3, KR08 |
| TC03 / UF03 | Vào phòng; kết nối 20 người và thêm người thứ 21 | Thấy đúng khu; người thứ 21 bị từ chối rõ ràng | world_joined, room_join_rejected, báo cáo tải / P4, P8, KR01–02 |
| TC04 / UF04 | Hai thiết bị di chuyển; ngắt mạng và quay lại từ nền | Trạng thái được thông báo, đồng bộ lại khi kết nối phục hồi | connection_state_changed, test hai thiết bị / P4 |
| TC05 / UF05 | Hai thiết bị thử hương, chuông, mõ; thử xa điểm hoặc quá nhanh | Yêu cầu hợp lệ được đồng bộ; yêu cầu sai bị từ chối | ritual_result, test hai thiết bị / P5, KR04 |
| TC06 / UF06 | Ghi hạt; gửi trùng mã, timeout trước/sau xác nhận, lỗi ghi | Chỉ báo thành công sau ghi bền; retry không cộng trùng | bead_recorded, bead_record_failed, đối chiếu dữ liệu / P5, KR03, KR06 |
| TC07 / UF07 | Mở bảng, qua 00:00 giờ Việt Nam; mô phỏng lỗi tải | Tổng/ngày chính xác, không xếp hạng; dữ liệu cũ không giả là mới | bead_board_opened, đối chiếu DB / P5, KR03 |
| TC08 / UF08 | Bật/tắt âm thanh; trình duyệt chặn phát | Thiết lập được áp dụng; có hướng dẫn bật lại | audio_setting_changed, test thiết bị / P5, KR04 |
| TC09 / UF09 | Đăng nhập cùng tài khoản trên thiết bị thứ hai, thử lệnh ở phiên cũ | Phiên cũ bị thu hồi, được thông báo, không gửi lệnh tiếp | session_replaced, test phiên / P3, KR08 |
| TC10 / UF10 | Tạo lỗi có mã, tra lỗi; thử mã không tồn tại | Có mã tra cứu và log được phân quyền; hướng dẫn khi không tìm thấy | client_error, log / P7, KR06 |
| TC11 / UF11 | Quản trị tạo/khóa/gán công ty/đặt lại; thử thiếu quyền hoặc tên trùng | Chỉ người có quyền thực hiện, thất bại an toàn, có audit | admin_action, test phân quyền / P3, KR08 |
| TC12 / UF12 | Xem thống kê rỗng, bình thường và khi log gián đoạn; thử truy cập log chi tiết | Quản trị chỉ thấy tổng hợp, trạng thái nguồn rõ ràng | admin_action, test phân quyền và nguồn log / P7, KR06 |

KR05 cần đo FPS trên iPhone/Android đại diện; KR07 cần biên bản khôi phục và rollback; KR09 cần số liệu quota và chi phí sau bài tải. Các ngưỡng và quyền truy cập log vẫn cần kiểm chứng ở P7–P8. Cột nguồn là bằng chứng dự kiến, không ngụ ý hệ thống telemetry đã hoạt động.

P0 đóng phần chuẩn bị cho P1 khi đã có phạm vi, luồng, tiêu chí và phụ thuộc. Danh sách nhân viên, ánh xạ công ty và kênh cấp mật khẩu là đầu vào bắt buộc trước P3, không phải lý do chặn kiểm tra nền tảng P1.
