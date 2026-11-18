# Phòng WebSocket thử nghiệm cục bộ

POC P4 dùng Durable Objects mô phỏng trong Wrangler và danh tính ngẫu nhiên. Không liên kết game công khai, không dùng tài khoản hoặc dữ liệu thật, không triển khai Worker này lên Internet. Server thử kiểm tra tần suất, tốc độ và va chạm cơ bản; client thử tự kết nối lại. Chưa có xác thực, chống gian lận đầy đủ hoặc quan sát và khôi phục production.

Phòng ghi event hợp lệ ra console Wrangler local khi vào phòng, phòng đầy hoặc ngắt kết nối. Chỉ ghi số kết nối hoặc mã trạng thái cố định; không ghi ID người chơi, tọa độ hoặc nội dung từ client. ID event ngẫu nhiên mới cho từng event, không dùng để theo dõi phiên. Không có lưu trữ bền vững, dashboard hay chính sách lưu log; log này chưa phải hệ thống quan sát production.

Chạy `pnpm exec wrangler dev --config poc/multiplayer/wrangler.local.jsonc --port 8796` trong một cửa sổ. Chạy `node poc/multiplayer/check-local.mjs` trong cửa sổ khác. Chương trình kiểm tra hai kết nối, thay đổi vị trí, dữ liệu sai, ngắt và kết nối lại, cùng giới hạn 20 kết nối trên máy. Dừng Wrangler sau khi thử.

Điều kiện P4 vẫn cần xác thực P2, tích hợp game thực tế, thử hai thiết bị, đồng bộ trở lại và kiểm tra Cloudflare; P8 mới nghiệm thu tải, an toàn và quota.

Để nhìn POC trong game trên cùng máy: chạy thêm `pnpm dev` và mở URL Vite bằng hai tab với hậu tố `?phong-thu=1`. Nhân vật thứ hai là mô hình giả. Phòng quyết định và lưu trạng thái cửa; chỉ người ở gần được đổi trạng thái, không cho đóng khi có người ở ngưỡng cửa. Cửa được đồng bộ sang các tab và snapshot kết nối mới; khi kết nối lại, nhân vật trở về vị trí xuất phát. Chế độ này chỉ khởi tạo trên Vite development tại `127.0.0.1`, không bật trên bản build công khai.

Chạy `node poc/multiplayer/check-door-local.mjs` với vùng lưu local mới và cửa ban đầu đóng để kiểm tra đồng bộ, khoảng cách, va chạm và chặn đóng đè. Tùy chọn `--leave-open` để lại cửa mở phục vụ kiểm tra khởi động lại. Đây là thử nghiệm một máy, không phải xác thực hay kiểm thử server Cloudflare.

Vị trí nhân vật khác được nội suy theo thời gian giữa các bản tin để giảm giật hình. Đây không phải bù trễ mạng hoặc dự đoán chuyển động; cần kiểm tra cảm giác khi chơi thực tế.

Chế độ local có nút Chat thử. Tin nhắn chỉ chuyển qua các kết nối đang mở, không lưu server, hiển thị như văn bản thuần; người gửi được server gắn ID ngẫu nhiên, không phải tài khoản. Mỗi kết nối gửi cách nhau ít nhất 1,5 giây, mỗi tin tối đa 120 ký tự, tab giữ tối đa 30 dòng. Chỉ dùng dữ liệu giả; khi chạy phòng trên cổng 8796 có thể kiểm thử bằng `node poc/multiplayer/check-chat-local.mjs`. Không bật hoặc triển khai POC này cho người dùng thật.

### Nghi lễ đồng bộ trong phòng local

Khi game chạy với `?phong-thu=1`, ba thao tác thắp hương, gõ chuông và gõ mõ chỉ phát hiệu ứng sau khi Durable Object local xác nhận. Worker kiểm tra đúng loại nghi lễ, vị trí nhân vật gần điểm tương ứng, tối thiểu 1 giây giữa hai yêu cầu của cùng người và 250 ms giữa các yêu cầu trong cả phòng. Yêu cầu bị từ chối không tạo hiệu ứng. Các client nhận hiệu ứng khói/pulse; trình duyệt có thể chặn tự phát âm thanh ở người chỉ nhận sự kiện.

Chạy Worker bằng lệnh ở trên, chạy `pnpm dev` trong cửa sổ khác, rồi mở hai tab `http://127.0.0.1:5173/?phong-thu=1`. Đi tới cùng điểm hành lễ ở mỗi tab và bấm nút tương tác. Hai cửa sổ này chỉ là cùng một máy và cùng Worker local. Không có đăng nhập, lưu tràng hạt, quyền, dữ liệu bền, kiểm tra thay đổi mới, thử Cloudflare hoặc thử thiết bị thật. Không deploy Worker phòng thử.

## Kiểm tra tải giới hạn local

Chạy `pnpm exec wrangler dev --config poc/multiplayer/wrangler.local.jsonc --port 8798`, rồi chạy `node poc/multiplayer/load-local.mjs`. Kịch bản cố định localhost, mở 20 client giả, từ chối client thứ 21 và gửi 5 lượt di chuyển cho mỗi client, mỗi lượt cách nhau ít nhất 250 ms. Mỗi bản tin được chờ đến khi 19 client còn lại nhận đủ hoặc timeout; đo từ khi client gửi đến khi từng client nhận trên cùng máy. Đây là kiểm thử ngắn theo lượt, không mô phỏng 20 người thật, mạng Internet, tải kéo dài hay quota Cloudflare. Dừng Wrangler sau khi thử.

Với cùng server ở cổng 8798, `node poc/multiplayer/abuse-local.mjs` thử 8 đầu vào bất thường, kiểm tra snapshot không thay đổi và phòng vẫn xử lý di chuyển hợp lệ. Đây không phải kiểm thử xâm nhập hoặc bằng chứng xác thực.
