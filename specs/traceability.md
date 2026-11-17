# Truy vết yêu cầu — P0

Đây là ma trận kế hoạch, không phải kết quả nghiệm thu. `Đề xuất` nghĩa là test hoặc tính năng chưa được triển khai; chỉ các test được nêu trong cột bằng chứng đã chạy mới được coi là có kiểm chứng.

| Yêu cầu | Luồng | KR | Event liên quan | Phase | Kiểm thử cần có | Trạng thái |
|---|---|---|---|---|---|---|
| FR01 — hai khu và logo | UF03, UF04 | KR05 | world_joined, connection_state_changed, performance_summary | P4, P6 | Hai thiết bị di chuyển, logo đúng, đo FPS trên máy thật | Đề xuất |
| FR02 — bốn nghi lễ, 20 người | UF03, UF05, UF06 | KR02, KR04 | world_joined, room_join_rejected, ritual_result, bead_recorded | P4, P5, P8 | Đồng bộ nghi lễ, 20 kết nối và người thứ 21 | Đề xuất |
| FR03 — xác thực và phiên | UF01, UF02, UF09, UF11 | KR01, KR08 | login_result, password_change_result, session_replaced, admin_action | P2, P3 | Mật khẩu sai, đổi mật khẩu, thay/thu hồi phiên, khóa tài khoản | Đề xuất |
| FR04 — xác thực nghi lễ, âm thanh | UF05, UF08 | KR04 | ritual_result, audio_setting_changed | P5 | Kiểm tra vị trí, tần suất và hai người thấy/nghe | Đề xuất |
| FR05 — lưu và hiển thị số hạt | UF06, UF07 | KR03 | bead_recorded, bead_record_failed, bead_board_opened | P5 | Ghi bền, retry không trùng, đổi ngày Việt Nam, bảng chung | Đề xuất |
| FR06 — hợp đồng event | UF01–UF12 | KR06 | 15 event trong AP | P2–P7 | Schema, từ chối trường không được phép, đối chiếu event và hành động | Kiểm tra hợp đồng local; chưa truyền hoặc lưu |
| FR07 — log và tra lỗi | UF10, UF12 | KR06 | client_error, admin_action | P2–P7 | Tạo lỗi, tra mã, kiểm tra quyền và thời gian lưu | Đề xuất |
| FR08 — quản trị | UF11 | KR08 | admin_action | P3 | Phân quyền, audit, tạo/khóa/gán hệ/đặt lại mật khẩu | Đề xuất |

`tests/ap.test.js` kiểm tra số lượng và liên kết AP cùng danh mục event so với mã. `tests/telemetry.test.js` kiểm tra hợp đồng event. Hai kiểm tra này không chứng minh các chức năng game, backend hoặc log đã hoạt động. KR07 và KR09 thuộc vận hành hệ thống: kiểm tra khôi phục, rollback, hạn mức và chi phí ở P8; không coi là yêu cầu tính năng FR riêng.
