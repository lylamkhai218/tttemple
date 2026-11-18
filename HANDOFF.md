# TTTemple — bàn giao tiếp tục phát triển

Ngày cập nhật: 18/11/2026. Đây là nguyên mẫu một người chơi; không dùng cho nhân viên như sản phẩm hoàn thiện.

## Chạy và kiểm tra

- Cài Node.js 24 và pnpm 11.15.1, chạy `pnpm install --frozen-lockfile`.
- `pnpm dev` để chạy local; `pnpm test` kiểm tra tự động; `pnpm build` tạo bản build trong `dist/`.
- AP và cổng kiểm: `docs/AP-TTTemple.html`, `specs/tasks-and-gates.md` và `specs/traceability.md`.

## Hiện trạng

- Có sân chung với hai khu công ty, chùa, cảnh quan, các nghi lễ cục bộ, tên và nhân vật mẫu, hai góc nhìn, va chạm và lối vào chính điện. Chỉ có POC phòng local bật thủ công trên Vite localhost; không có multiplayer production.
- Phòng local có chat tổng hợp, đồng bộ cửa và handler kiểm tra phía server cho gõ chuông, gõ mõ, thắp hương. Các thay đổi nghi lễ mới chưa được chạy kiểm tra. Hình Phật hiện là ảnh 2D; số hạt chỉ lưu trên trình duyệt; âm thanh chuông là tổng hợp. Chưa có tài khoản thật, lưu hạt trên server hoặc hệ thống log production.
- Có hợp đồng event và POC PBKDF2 với dữ liệu giả; POC chỉ đo thời gian trên máy, không phải kết quả Cloudflare hoặc giải pháp đăng nhập hoàn chỉnh.
- Repo GitHub được kết nối Cloudflare production, nhưng cấu hình triển khai cần được kiểm tra lại trước khi đưa mã game lên nhánh production: build hiện có thể không phù hợp với dự án Vite. Không đưa bản một người này lên làm sản phẩm nội bộ hoàn chỉnh.
- Repo công khai: không commit bảng chấm công, danh sách nhân viên, mật khẩu, token, `.env`, `.dev.vars` hoặc dữ liệu riêng tư. Hai logo và ảnh Phật do người dùng cung cấp đã có trong tài nguyên nguyên mẫu.

## Việc tiếp theo

1. Xác minh quyền repo, CI và cấu hình Cloudflare trong môi trường thử riêng; không thay đổi production khi chưa xác minh build và quyền.
2. Hoàn thiện POC xác thực theo `poc/auth/README.md`: so sánh phương án an toàn và đo CPU/độ trễ thực tế trên Cloudflare bằng dữ liệu giả; không hạ độ mạnh để vượt quota.
3. Sau cổng P2, triển khai tài khoản và quản trị với danh sách username và ánh xạ công ty đã được anh Khải duyệt.
4. Tiếp tục P4–P5: kiểm tra POC local mới cho nghi lễ, rồi hoàn thiện luồng hạt và event với dữ liệu giả. Chỉ nối xác thực, multiplayer hoặc tràng hạt vào tài khoản sau khi P2 đạt.
5. Kiểm thử trên iPhone/Android, kiểm tra hiệu năng, âm thanh, va chạm, 20 kết nối và khôi phục trước UAT.

Các con số và giai đoạn nghiệm thu phải gắn với bằng chứng thực tế; không coi kiểm thử hình thức trên máy là kiểm thử 20 người hoặc kết quả Cloudflare.
