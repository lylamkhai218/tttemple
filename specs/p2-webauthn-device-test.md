# P2 - kiểm thử passkey trên thiết bị

Ngày cập nhật: 19/11/2026. Đây là checklist cho tài khoản tổng hợp, không phải nghiệm thu production.

## Giới hạn hiện tại

- Worker chỉ chấp nhận RP ID `localhost` và origin `http://localhost:5178`; Vite hiện chỉ bind `localhost`.
- Vì vậy có thể thử passkey khả dụng trên chính máy Windows đang chạy POC. Trên iPhone, `localhost` trỏ về iPhone, không phải máy Windows.
- Chưa cấu hình HTTPS hostname cho iPhone. Trước khi thử Safari iOS, cần một hostname HTTPS có chứng thư được thiết bị tin cậy và cấu hình RP ID trùng với hostname. Không dùng IP làm RP ID, không dùng tài khoản thật và không deploy config POC này.
- Từ checkout này chưa chạy được browser test vì package WebAuthn thiếu: `npm ci --offline` báo `ENOTCACHED`; thử online bị treo và đã dừng. CI run [44553204486](https://github.com/lylamkhai218/tttemple/actions/runs/44553204486) vẫn đạt 61/61 test và smoke Wrangler local.

## Kiểm tra desktop trên cùng máy

1. Cài dependencies theo `poc/auth/README.md`; mở Worker local và Vite theo hai terminal. Giữ nguyên thư mục Durable Object local khi khởi động lại Worker.
2. Mở `http://localhost:5178`; xác nhận trang báo tài khoản `synthetic-user` và chưa có passkey.
3. Bấm `Chuẩn bị đăng ký`, rồi trong hai phút bấm `Tạo passkey trên thiết bị`. Hoàn tất prompt của authenticator có sẵn trên máy. Kết quả mong đợi: `Passkey tổng hợp đã đăng ký` và trạng thái báo đã đăng ký.
4. Khởi động lại Worker với cùng thư mục persistence. Tải lại trang và xác nhận trạng thái passkey vẫn đã đăng ký.
5. Bấm `Chuẩn bị đăng nhập`, rồi trong hai phút bấm `Đăng nhập bằng passkey`. Kết quả mong đợi: đăng nhập thành công; `Kiểm tra phiên` trả tài khoản và role tổng hợp.
6. Bấm `Thu hồi phiên`, rồi `Kiểm tra phiên`. Kết quả mong đợi: phiên không hợp lệ.
7. Ghi nhận model thiết bị, phiên bản Windows/browser, loại authenticator, bước thành công/thất bại và thông báo lỗi. Không chụp hoặc gửi token, credential, mã nhân viên hay thông tin cá nhân.

Nút khóa tài khoản là thao tác một chiều trong POC, chỉ dùng ở state tổng hợp riêng. Không dùng nó trong lượt kiểm tra đăng ký/đăng nhập chính.

## Cổng thử trên iPhone Safari

Chỉ thực hiện sau khi có hostname HTTPS thử riêng và RP ID/origin đã được cấu hình nhất quán cho local POC. Lặp lại các bước đăng ký, restart với cùng persistence, đăng nhập, kiểm tra phiên và thu hồi phiên. Ghi model iPhone, phiên bản iOS/Safari, loại passkey (thiết bị hoặc iCloud Keychain), bước thất bại và tên lỗi WebAuthn. Không đưa token hoặc dữ liệu xác thực vào báo cáo.

## Phân loại bằng chứng

- CI 61/61 và Wrangler local smoke: test tự động trên runner, chưa chứng minh authenticator vật lý.
- Desktop cùng máy: chỉ nghiệm thu thao tác passkey trên browser/authenticator của máy đó.
- iPhone Safari: chưa chạy cho tới khi có HTTPS hostname/RP ID phù hợp và thiết bị thực hiện thao tác.
- Cloudflare remote CPU, khôi phục tài khoản và review bảo mật: là cổng riêng, checklist này không thay thế.
