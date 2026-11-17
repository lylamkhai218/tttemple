# Nguyên tắc và đặc tả TTTemple

## Nguyên tắc

Không gian chung trang nghiêm, không xếp hạng hạt; tài khoản riêng, một phiên hoạt động; hạt được máy chủ xác nhận và chống cộng trùng; quyền quản trị phân biệt với quyền xem log kỹ thuật; dữ liệu thu thập tối thiểu. Không sử dụng bảng chấm công làm dữ liệu game hoặc đưa vào mã nguồn và log.

## Yêu cầu đã xác nhận

- FR01: Một chùa, hai khu TTPC và T&T Vina, được đi lại tự do; logo tại cổng khu và giao diện.
- FR02: Một bộ nghi lễ dùng chung: hương, chuông, mõ, tràng hạt; tối đa 20 người đồng thời.
- FR03: Tài khoản được quản trị viên gán công ty; đổi mật khẩu tạm lần đầu; phiên mới thay phiên cũ; tài khoản bị khóa không sử dụng được.
- FR04: Nghi lễ được xác thực phía máy chủ; người trong phòng thấy hiệu ứng và nghe âm thanh theo thiết lập.
- FR05: Tổng hạt và số theo ngày giờ Việt Nam được lưu theo người; tổng hiển thị cạnh nhân vật; bảng chung cho người đăng nhập, không xếp hạng.
- FR06: Event có schema, ID chống trùng và dữ liệu tối thiểu; event phân tích không quyết định số hạt.
- FR07: Lỗi quan trọng có mã tra cứu; kỹ thuật xem log chi tiết; quản trị viên xem tổng hợp. Mục tiêu lưu log 7 ngày cần xác minh.
- FR08: Quản trị viên tạo, khóa, gán công ty và đặt lại mật khẩu; mọi thao tác quản trị có audit.

## Tiêu chí chặn phát hành

Không có dữ liệu nhân viên thật trước khi danh sách, tên đăng nhập và công ty được anh Khải duyệt. Không phát hành khi xác thực bảo mật, khả năng chống cộng trùng, phân quyền, kiểm thử hai thiết bị, test 20 người, logging, sao lưu và khôi phục chưa được chứng minh. Mục tiêu 30 FPS và 95% vào chùa là ngưỡng đề xuất, chưa được đo hay nghiệm thu.

## Phạm vi loại trừ

Không đăng ký công khai, chat, nhiều phòng, thanh toán, vật phẩm trả phí, phần thưởng hoặc bảng thi đua. Không cam kết hỗ trợ hơn 20 người hoặc chi phí 0 đồng dài hạn.
