# P2 - đánh giá phương án xác thực

Ngày đánh giá: 19/11/2026. Dữ liệu sử dụng trong POC phải là dữ liệu tổng hợp. Tài liệu này chưa thay đổi luồng đăng nhập trong game hoặc yêu cầu sản phẩm ở AP.

## Yêu cầu và ràng buộc hiện có

- AP yêu cầu người dùng đăng nhập, đổi mật khẩu tạm lần đầu, một phiên trên mỗi tài khoản; quản trị có thể tạo, khóa và đặt lại tài khoản. Server phải gắn công ty và quyền, không tin tên tự nhập.
- Tài khoản Cloudflare hiện được xác nhận là Workers Free; theo giới hạn Cloudflare, CPU tối đa là 10 ms cho mỗi HTTP request hoặc Cron Trigger. Tài liệu giới hạn có thể thay đổi theo plan.
- Người dùng đã yêu cầu bỏ qua thao tác thêm thẻ/billing trong lúc tiếp tục phase. Không nâng cấp plan, kích hoạt Zero Trust hoặc sửa cấu hình xác thực từ xa trong lần đánh giá này.
- P1 là cổng triển khai và kiểm tra vùng IP. P1 không chặn đánh giá/POC bảo mật P2 trên tài nguyên riêng; P3 vẫn phải chờ P2 và đầu vào tài khoản được duyệt.

## Bằng chứng kỹ thuật

- PBKDF2-HMAC-SHA-256 ở 600.000 vòng bị Web Crypto trong Workers từ chối với `NotSupportedError`; không phải phép đo thời gian hoàn tất.
- Một mẫu scrypt `N=32768, r=8, p=3` trên Worker riêng thành công với CPU 250 ms và wall 251 ms. Đây là một trong các cấu hình scrypt OWASP liệt kê, nhưng CPU của nó cao gấp 25 lần mức 10 ms của Workers Free. Một mẫu không chứng minh độ ổn định hoặc quota.
- OWASP khuyến nghị Argon2id; nếu không dùng được thì scrypt với cấu hình tối thiểu tương đương các bộ thông số nêu trong cheat sheet. Không hạ cấu hình để vừa giới hạn Free.
- POC passkey/WebAuthn cục bộ có luồng thử đăng ký/đăng nhập với dữ liệu giả, challenge một lần, kiểm tra origin, giới hạn thử sai và session. State adapter nhận storage transactional; config local riêng nối Worker tới một Durable Object SQLite theo tài khoản tổng hợp. Challenge, credential công khai, counter, giới hạn thử sai, khóa và hash phiên được lưu trong storage. GitHub Actions run [44553204486](https://github.com/lylamkhai218/tttemple/actions/runs/44553204486), commit `469161b`, đạt 61/61 test, build, Wrangler dry-run và smoke test Wrangler local: challenge tồn tại qua restart, replay bị từ chối, session mới thay session cũ, session còn sau restart rồi bị thu hồi và trạng thái khóa còn sau restart tiếp theo. Bộ đọc JSON streaming giới hạn 64 KiB ở endpoint xác thực và 1 KiB ở endpoint smoke local; MIME type được so sánh chính xác; lượt xác minh được đặt chỗ nguyên tử trước khi kiểm tra chữ ký. Transaction cấp session từ chối khi tài khoản đã khóa. Test race dùng 20 yêu cầu, chỉ 5 lượt được phép trong cửa sổ. Đây là runtime Wrangler local trên runner, không phải Cloudflare remote. Checkout này vẫn thiếu package WebAuthn vì npm registry `ECONNRESET`; CI cài từ lockfile thành công. Chưa dùng authenticator thật hoặc kiểm tra trên iOS.
- Phép đo Cloudflare ngày 19/11 chỉ chạy benchmark chữ ký ECDSA tổng hợp trên Worker riêng, không phải WebAuthn đầu-cuối. Query telemetry lọc theo service không trả event; CPU time, wall time và số lần trigger chưa xác định. Cron đã xóa; API xác nhận Worker trở lại idle, không URL/route/binding, Observability vẫn bật.
- Cloudflare Access hiện chưa được bật cho account: API GET danh sách Access applications ngày 19/11 trả `access.api.error.not_enabled`. Chưa bật Access hoặc cấu hình Zero Trust. Access có thể cung cấp identity email/groups qua `ctx.access`, nhưng cần danh tính email/IdP và mapping tới tài khoản/công ty đã duyệt.

## So sánh các hướng

| Hướng | Tương thích yêu cầu | Hợp Workers Free | Việc cần xác minh |
|---|---|---|---|
| Username + mật khẩu, tự băm bằng PBKDF2/scrypt | Giữ nguyên yêu cầu AP | Không đạt theo bằng chứng hiện tại | Chọn runtime/quota có CPU phù hợp, đo thêm, chấp nhận chi phí. Không giảm độ mạnh. |
| Cloudflare Access hoặc IdP tổ chức | Cần đổi từ mật khẩu riêng sang email/SSO; vẫn map identity sang username/công ty | Có khả năng phù hợp vì danh tính được quản lý ngoài Worker | Zero Trust chưa bật; cần xác nhận IdP/email, onboarding và tác động tới đường chơi thử công khai theo IP VN. |
| Passkey/WebAuthn | Username vẫn có thể là mã tài khoản; phải thay mật khẩu tạm/đổi mật khẩu bằng quy trình đăng ký và khôi phục passkey | Có khả năng phù hợp vì server xác minh chữ ký thay vì băm mật khẩu chậm | Durable Object SQLite đã qua smoke test local về persistence/restart, challenge một lần, session rotation và revoke; cần enrollment an toàn, khôi phục/thu hồi passkey, authenticator thật, iOS Safari, CPU Cloudflare và review bảo mật. |

## Đề xuất CTO

Trong giới hạn hiện tại - không thêm billing và giữ Workers Free - không triển khai đăng nhập mật khẩu riêng trên Worker. Hướng đáng thử tiếp là passkey/WebAuthn với tài khoản do quản trị tạo trước; username tiếp tục làm định danh, còn mật khẩu tạm được thay bằng liên kết/mã đăng ký ngắn hạn cấp qua kênh được duyệt. Đây là đề xuất kỹ thuật, chưa phải quyết định thay đổi AP.

Cloudflare Access/IdP là hướng thay thế tốt nếu người dùng có email hoặc tài khoản tổ chức phù hợp, nhưng hiện Access chưa bật và yêu cầu danh tính email; không thể coi đây là cài đặt sẵn hoặc tự bật trong POC.

## Cổng P2 còn lại

1. Chốt một trong hai thay đổi luồng: passkey/WebAuthn hoặc Access/IdP. Nếu giữ nguyên username + mật khẩu tạm, cần quyết định về runtime/plan và chi phí trước khi đo tiếp.
2. Với hướng được chọn, tiếp tục POC chỉ bằng tài khoản giả: chạy Worker/DO local và kiểm tra tạo/đăng nhập/khóa/thu hồi/thay phiên/challenge dùng lại/giới hạn thử qua lúc DO được tái tạo. Sau đó mới kiểm tra authenticator thật theo user gesture; bổ sung phương án phục hồi và thu hồi passkey.
3. Đo CPU, wall, lỗi runtime và quota bằng request HTTP hoặc trigger có telemetry truy xuất được trên Cloudflare; lần thử 19/11 không trả event nên không có số đo. Báo nhiều mẫu và cấu hình. Worker thử nghiệm phải được đưa về idle sau phép đo.
4. P2 chỉ đạt khi có review bảo mật, bằng chứng thực thi Cloudflare và phương án vận hành/khôi phục. Khi chưa có, không tạo tài khoản thật hoặc nối vào P4/P5.

Checklist chạy authenticator cùng máy và cổng HTTPS hostname cho iPhone nằm ở `specs/p2-webauthn-device-test.md`. Test thiết bị chưa được thực hiện.

## Nguồn kỹ thuật

- [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare Access trong Workers và `ctx.access`](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/)
