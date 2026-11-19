# P2 - kiểm thử passkey trên thiết bị

Ngày cập nhật: 19/11/2026. Đây là checklist cho tài khoản tổng hợp, không phải nghiệm thu production.

## Cấu hình

- Mặc định không đổi: RP ID `localhost`, origin `http://localhost:5178`, Vite chỉ bind `localhost`.
- POC hỗ trợ cấu hình RP ID và origin qua Wrangler vars `RP_ID`, `RP_ORIGIN`; với hostname khác localhost, chỉ nhận HTTPS và RP ID phải trùng hostname. Origin phải là origin chuẩn, gồm scheme và port nếu có, không kèm path.
- Để thử iPhone, cần hostname do anh kiểm soát phân giải tới máy Windows và chứng thư có hostname đó trong SAN, được iPhone tin cậy. Hướng dẫn PowerShell nằm trong `poc/auth/README.md`. Chưa có hostname hoặc chứng thư nào được thiết lập.
- Vite chỉ bind mọi giao diện mạng khi được bật rõ bằng `TTTEMPLE_POC_BIND_HOST=0.0.0.0`; chỉ khai báo một hostname cụ thể qua `TTTEMPLE_POC_ALLOWED_HOST`. Cert/key được đọc từ đường dẫn local `TTTEMPLE_POC_TLS_CERT` và `TTTEMPLE_POC_TLS_KEY`; không đưa private key vào repo. Giữ Worker ở `127.0.0.1` và không deploy cấu hình POC.
- Không dùng IP làm RP ID, không dùng tài khoản thật. iPhone truy cập `localhost` sẽ trỏ vào chính iPhone chứ không phải máy Windows.

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

Chỉ thực hiện sau khi DNS, HTTPS cert và RP ID/origin được cấu hình nhất quán theo `poc/auth/README.md`. Lặp lại các bước đăng ký, restart với cùng persistence, đăng nhập, kiểm tra phiên và thu hồi phiên. Ghi model iPhone, phiên bản iOS/Safari, loại passkey (thiết bị hoặc iCloud Keychain), bước thất bại và tên lỗi WebAuthn. Không đưa token hoặc dữ liệu xác thực vào báo cáo.

## Phân loại bằng chứng

- CI run [44559409512](https://github.com/lylamkhai218/tttemple/actions/runs/44559409512) đạt 67/67, build, Wrangler dry-run và smoke Durable Object local; đây là test tự động, chưa chứng minh authenticator vật lý.
- Desktop cùng máy: chỉ nghiệm thu thao tác passkey trên browser/authenticator của máy đó.
- iPhone Safari: chưa chạy cho tới khi có HTTPS hostname/RP ID phù hợp và thiết bị thực hiện thao tác.
- Cloudflare remote CPU, khôi phục tài khoản và review bảo mật: là cổng riêng, checklist này không thay thế.
