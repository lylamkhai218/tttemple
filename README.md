# TTTemple

Nguyên mẫu một người chơi của game đi chùa nội bộ. Đây là bước đầu để kiểm tra bố cục, điều khiển, cảm giác tương tác và hiệu năng trên điện thoại; chưa có tài khoản, multiplayer, backend hay cơ sở dữ liệu.

## Chạy trên máy

Cần Node.js 20.19+ hoặc 22.12+ và pnpm. Chạy `pnpm install`, sau đó `pnpm dev` và mở địa chỉ Vite hiển thị. `pnpm build` tạo bản build.

Chạy `pnpm test` để kiểm tra hợp đồng event. Hợp đồng này chưa gửi hoặc lưu dữ liệu, chưa phải hệ thống theo dõi hay log hoàn chỉnh.

Di chuyển bằng WASD/phím mũi tên hoặc nút điều hướng trên màn hình; kéo để xoay góc nhìn. Đến gần một điểm nghi lễ và chọn nút tương ứng. Chuỗi hạt lưu trên trình duyệt hiện tại, không đồng bộ và có thể mất nếu xóa dữ liệu trình duyệt.

Hai sân TTPC và T&T Vina nằm hai bên sân chùa chung. Biển khu dùng logo được cung cấp; bản thử hiện chưa có tài khoản hay người chơi khác.

Dùng nút **Góc nhìn** để chuyển giữa thứ ba và thứ nhất; kéo nền cảnh để xoay hướng nhìn. Khi ở trong chùa, có thể đi lùi bằng phím mũi tên xuống hoặc xoay hướng nhìn để đi ra. Mở cửa trước khi đi qua; đứng tránh ngưỡng cửa để đóng.

Gợi ý trên màn hình cho biết điểm nghi lễ gần nhất. Chuông và mõ có âm thanh tổng hợp khi tương tác; cần bật âm thanh trên thiết bị. Nếu trình duyệt chặn lưu trữ, số hạt chỉ được giữ trong phiên hiện tại.

## Các bước tiếp theo

Kế hoạch triển khai và cổng kiểm chi tiết: [AP TTTemple](docs/AP-TTTemple.html) và [hồ sơ đặc tả](specs/README.md). Trạng thái trong AP phân biệt mục tiêu với kết quả đã kiểm chứng.

1. Kiểm thử thực tế trên iPhone và Android, thay cảnh mẫu bằng tài nguyên có giấy phép phù hợp.
2. Xây dựng Worker, xác thực và quản lý tài khoản; không đưa khóa hay mật khẩu vào repository.
3. Triển khai Durable Objects/WebSocket, kiểm thử 20 người và đo hạn mức trước khi cam kết chi phí.
4. Kết nối GitHub và Cloudflare sau khi xác minh quyền truy cập, môi trường và cấu hình.

Không đưa bản nguyên mẫu này lên sử dụng nội bộ như sản phẩm hoàn thiện: hiện không có xác thực hoặc đồng bộ dữ liệu.
