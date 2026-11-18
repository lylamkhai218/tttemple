# Định hướng trải nghiệm và chức năng chung

Ngày 18/11/2026. Đây là yêu cầu và hướng thiết kế được ghi nhận, chưa phải xác nhận tính năng đã vận hành.

## Tinh thần trải nghiệm

TTTemple là sân chùa chung của TTPC và T&T Vina. Thí chủ có thể ghé lại, đi dạo, thắp hương, gõ mõ, nghe chuông hoặc lần hạt để thư giãn, kể cả sau những cuộc trao đổi căng thẳng với khách hàng. Giọng điệu vui nhẹ, không chế giễu khách hàng, không bắt buộc tham gia hoặc hứa hẹn hiệu quả trị liệu. Hướng dẫn có thể bỏ qua và mở lại.

## Trụ trì

Người dùng yêu cầu tài khoản `khaill` hiển thị vai trò trụ trì. Đây là vai trò hiển thị trong game; quyền quản trị phải được xác định và kiểm tra riêng ở máy chủ. Chỉ gắn vai trò sau khi có tài khoản đã được xác thực, dùng định danh tài khoản phía máy chủ; không suy vai trò từ tên nhân vật tự nhập. Không tạo hay gán tài khoản thật trước khi P2 và điều kiện P3 được đáp ứng. Các client phải nhận thông tin vai trò từ dữ liệu đã kiểm chứng của server.

Đã có hàm thử với ID tổng hợp và unit test tại `poc/auth/role-fixture.mjs`. Hàm này không được nối vào đăng nhập hoặc game và không cấp quyền cho tài khoản thật.

## Chat phòng chung

Người dùng đề nghị bổ sung chat, cập nhật định hướng trước đó là không thêm chat. Đề xuất phiên bản đầu: khung chat văn bản trong phòng chung, đóng/mở được trên điện thoại, nội dung văn bản thuần, không chat riêng, không tệp đính kèm hoặc đường dẫn tự động mở. Phương án chi tiết và phạm vi lưu trữ chưa được quyết định.

Điều kiện triển khai cho người dùng thật: P2 - P4 có xác thực phiên và phòng; kiểm tra phiên và giới hạn độ dài, tần suất ở server; tránh thực thi HTML; có cơ chế báo cáo và xử lý lạm dụng, quyền quản lý và thời gian lưu được duyệt. Không đưa nội dung chat vào log kỹ thuật mặc định. Cần kiểm thử giả mạo, session bị thu hồi, nhiều thiết bị, mạng và giao diện trước khi mở. Thiết kế này chưa phải hệ thống chat đã triển khai.

Đã có POC chat cục bộ trong phòng `?phong-thu=1`: văn bản thuần, tối đa 120 ký tự, khoảng cách gửi 1,5 giây trên mỗi kết nối, tối đa 30 dòng trên mỗi tab. Không lưu lịch sử trên server; mất lịch sử khi tải lại tab. Chỉ dùng thông điệp giả vì phòng chưa xác thực; các giới hạn này không thay thế cơ chế chống lạm dụng hoặc kiểm duyệt production.
