# Thiết kế ngày - đêm cho sân chùa

Ngày cập nhật: 19/11/2026

## Ý đồ

Tạo cảm giác ghé chùa sau giờ làm: hoàng hôn dịu, không gian đêm yên tĩnh và bình minh nhẹ. Ánh sáng cảnh 3D đổi theo giờ Việt Nam; chữ, nút, thao tác nghi lễ và cấu trúc HUD giữ nguyên để người chơi không phải học lại điều khiển hoặc đọc thêm nhãn.

## Lịch ICT

| Giờ Việt Nam | Cảnh |
| --- | --- |
| 05:00-18:00 | Ban ngày hiện tại |
| 18:00-19:00 | Chạng vạng: màu ấm xuất hiện, ánh sáng ngày giảm dần, đèn lồng/trăng/sao tăng dần |
| 19:00-04:00 | Đêm đầy đủ: trời xanh chàm, sương xanh dịu, trăng và sao, ánh vàng ấm quanh chính điện |
| 04:00-05:00 | Bình minh: chạng vạng ấm trở lại rồi sáng dần về màu ban ngày |

Mốc 18:00, 19:00, 04:00 và 05:00 dùng `Asia/Ho_Chi_Minh`. Hàm chuyển tiếp smoothstep giảm giật tại đầu/cuối; cảnh lấy mẫu giờ mỗi giây. Ngoài giờ hoàng hôn/bình minh, blend giữ cố định ở ngày hoặc đêm.

## Hướng nghệ thuật và màu

- Hoàng hôn/bình minh: nền trời và sương hồng đất muted, ánh sáng chính vàng cam nhẹ.
- Đêm: nền xanh chàm thay vì đen tuyệt đối; sương xanh xám giúp phân lớp khoảng cách và giữ hình khối sân chùa.
- Trăng lưỡi liềm và 108 điểm sao nhỏ, độ hiện theo blend ban đêm; không thêm hiệu ứng bloom hoặc bóng đổ để giữ chi phí render thấp.
- Hai đèn vàng nhỏ dưới mái tạo điểm ấm gần chính điện, không phủ vàng toàn màn hình.
- Màu áo, gỗ, đá, giao diện và nút nghi lễ không đổi riêng theo theme. Không thêm chữ lên HUD; tương phản nút/text hiện có cần được xem lại trên browser và điện thoại trước nghiệm thu mỹ thuật.

## Tiêu chí nghiệm thu

- [x] Xác định giờ theo múi giờ Việt Nam, không phụ thuộc đồng hồ địa phương của thiết bị.
- [x] Cảnh đổi liên tục giữa các mốc, không chuyển đột ngột đúng 18:00 hoặc 05:00.
- [x] Hoàng hôn/bình minh có màu ấm; đêm giữ được chi tiết cảnh và có điểm sáng ấm tại chính điện.
- [x] Không thêm thành phần HUD hoặc thao tác mới.
- [x] Đã xem local trong browser ở 1280x720, mô phỏng mobile 390x844 và ngang 844x390; không có console error/warning. Đã hạ trăng khỏi mép khung và phân bố lại 108 sao sau khi review ảnh.
- [ ] Nghiệm thu độ dễ đọc, chuyển động giảm theo thiết lập trợ năng, FPS và Safari iOS/Android thật.
- [ ] Build production và kiểm tra trên deployment thử riêng; không suy diễn thành nghiệm thu thiết bị hoặc Cloudflare.

Ở local Vite có thể thêm `?clock=HH:mm` để xem lại một giờ ICT cố định, ví dụ `?clock=18%3A30` hoặc `?clock=23%3A00`. Công tắc này chỉ chạy trong dev build và bị loại khỏi bundle production.

Mã thực hiện trong `src/time-of-day.js` và `src/main.js`; lịch được bảo vệ bởi `tests/time-of-day.test.js`. Trăng và sao nằm trên bầu trời thế giới nên cần kéo góc camera lên để thấy; góc vào game mặc định vẫn ưu tiên sân và nghi lễ. Kiểm tra browser viewport không thay thế nghiệm thu iPhone/Android thật.
