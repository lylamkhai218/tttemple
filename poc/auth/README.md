# POC xác thực — chỉ dữ liệu giả

Chạy `node poc/auth/run-local.mjs` để đo thử PBKDF2-HMAC-SHA-256 với 600.000 vòng và salt ngẫu nhiên. Các số đo là **thời gian thực trên máy**, không phải CPU time hoặc kết quả trên Cloudflare. Không nhập mật khẩu hay dữ liệu nhân viên; mã không có đăng nhập, lưu mật khẩu, API hoặc endpoint.

OWASP ưu tiên Argon2id khi có thể; PBKDF2 là một ứng viên tương thích Web Crypto để kiểm tra, chưa phải lựa chọn cuối cùng. OWASP nêu 600.000 vòng cho PBKDF2-HMAC-SHA-256; [Cloudflare hỗ trợ PBKDF2 qua Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/), nhưng khả năng chạy trong giới hạn của tài khoản phải được đo riêng. [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

Trước P2: kiểm tra quyền triển khai, tạo môi trường thử riêng; đánh giá Argon2id/scrypt và PBKDF2, lập kịch bản đo có giới hạn, chỉ dùng dữ liệu giả, kiểm tra CPU time, lỗi 1102 và độ trễ trong dashboard. Không công khai endpoint benchmark và không thay đổi Worker production đang hoạt động. Không giảm số vòng để vượt kiểm thử; nếu không đáp ứng, chọn giải pháp xác thực khác sau khi đánh giá.

## Worker thử nghiệm chuẩn bị sẵn

`worker.mjs` chỉ chạy một mẫu tổng hợp trong sự kiện `scheduled`; HTTP luôn trả 404. `wrangler.jsonc` không cấu hình route hay workers.dev và đặt lịch rỗng. Đây chưa phải dịch vụ xác thực. Worker thử đã được tạo riêng; khi thử lại phải xác minh quota, giới hạn thời gian chạy và xóa lịch sau phép đo. Không cấu hình trên Worker production.

Với mỗi lần chạy, ghi phiên bản Worker, gói/quota, thời điểm, số vòng, wall time trong log, CPU time và lỗi từ dashboard. Wall time trong log không thay thế CPU time; nếu gặp lỗi hoặc thiếu số liệu thì ghi nhận chưa đạt, không giảm số vòng. Mẫu này chỉ kiểm tra PBKDF2; đánh giá Argon2id/scrypt, phiên, log và giới hạn vận hành vẫn còn cần thực hiện trước cổng P2.

## Kết quả Cloudflare ngày 18/11/2026

Worker riêng `tttemple-auth-poc`, Wrangler 4.164.0, phiên bản `5aedec5f-3767-48ee-af95-66b7aa6f0053`, dữ liệu giả và PBKDF2-HMAC-SHA-256 600.000 vòng: sự kiện lịch thất bại với `NotSupportedError`, runtime cho biết giới hạn là 100.000 vòng. Tail ghi `cpuTime: 0`, `wallTime: 0` cho sự kiện lỗi; đây không phải số đo cho phép băm hoàn chỉnh. Gói tài khoản và hiệu năng của phương án thay thế chưa được xác minh. P2 chưa đạt.

Lịch đã được xóa bằng `triggers.crons: []`, và API Cloudflare trả `schedules: []`. Lần trước chỉ bỏ trường triggers nên chưa đủ cơ sở kết luận lịch đã tắt; Cloudflare có thể áp dụng thay đổi lịch với độ trễ. Không đưa endpoint benchmark ra công khai.

## Thử scrypt ngày 18/11/2026

Thử dữ liệu giả với `node:crypto` scrypt, N=32768, r=8, p=3, tương ứng phương án 32 MiB trong [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). Mẫu local trong runtime Wrangler trả thành công; trên Worker `tttemple-auth-poc`, phiên bản `acc8f905-9c9e-43f6-8926-88e636d0c7e1`, một sự kiện có outcome `ok`, CPU 250 ms và wall 251 ms theo tail của Cloudflare. `performance.now()` trong code ghi 0 ms ở lần chạy này, nên không dùng giá trị đó; chỉ dùng số liệu nền tảng.

Đây là một mẫu, chưa xác định gói tài khoản, chưa đo tính ổn định, tải đồng thời, giới hạn quota, thiết kế phiên và bảo mật đăng nhập. [Cloudflare công bố](https://developers.cloudflare.com/workers/platform/limits/) giới hạn CPU cho Free là 10 ms mỗi cron hoặc HTTP request; một lần thành công 250 ms không chứng minh đáp ứng Free. Không đưa POC này vào đăng nhập thật hoặc coi P2 đã đạt.

Sau thử đã triển khai `worker-idle.mjs` với `triggers.crons: []`, xác nhận API trả lịch rỗng. Một sự kiện đến muộn sau khi xóa lịch đã chạy phiên bản idle, không thực hiện phép băm. Để đo lại phải quản lý lịch tạm và chuyển về cấu hình idle sau khi đo.

## POC phiên cục bộ

`session-poc.mjs` thử một phiên mỗi tài khoản với SQLite trong bộ nhớ, token ngẫu nhiên và chỉ lưu bản băm token. `tests/session-poc.test.js` kiểm tra thay phiên, hết hạn, thu hồi và khóa tài khoản bằng dữ liệu giả. Không có HTTP, cookie, xác thực mật khẩu hay lưu trữ bền. Kết quả này không chứng minh tính đồng thời giữa các Worker, khả năng thu hồi WebSocket, bảo mật triển khai hoặc quota; cần kiểm chứng các phần đó trong môi trường Cloudflare trước khi thông qua P2.

Ca bổ sung dùng hai luồng Node cùng ghi một tệp SQLite tạm: sau hai lần tạo phiên đồng thời chỉ một token còn hợp lệ. Đây chỉ là bằng chứng cho SQLite cục bộ dùng giao dịch `BEGIN IMMEDIATE`, không chứng minh hành vi đồng thời của D1, Durable Objects hoặc WebSocket. Tệp thử được xóa sau test.

## POC D1 giả lập

`wrangler.d1-local.jsonc` sử dụng ID placeholder và D1 local, chỉ dành cho dữ liệu giả, không triển khai. Chạy `pnpm exec wrangler dev --config poc/auth/wrangler.d1-local.jsonc --test-scheduled`, sau đó gọi `/cdn-cgi/local/scheduled?format=json` từ máy local. Ngày 18/11/2026, Wrangler 4.164.0 xác nhận D1 ở chế độ local; sự kiện trả `outcome: ok`, log ghi ba điều kiện đạt: chỉ một phiên hợp lệ sau hai lệnh tạo đồng thời, từ chối phiên hết hạn và tài khoản khóa. Đóng server sau khi thử.

Thử nghiệm dùng giá trị token giả cố định, không có mật khẩu, HTTP login, cookie hoặc dữ liệu nhân viên; chưa thử sự cố, WebSocket hay tính nhất quán trong D1 triển khai. Không dùng kết quả để tuyên bố P2 đạt.

### Kiểm tra bổ sung trên D1 từ xa

Ngày 18/11/2026, tạo D1 riêng `tttemple-session-synthetic-20261118` tại APAC, chỉ dữ liệu giả. Worker chạy trên máy bằng Wrangler 4.164.0 với binding D1 `remote: true`; bốn lượt chạy tuần tự đều báo thành công cho hai lệnh cấp phiên đồng thời, kiểm tra hết hạn bằng thời gian giả và khóa tài khoản. Truy vấn riêng qua `wrangler d1 execute --remote` xác nhận hai bảng thử tồn tại trên chính D1 từ xa, được trả lời từ primary vùng APAC. Nhãn log `d1-local-session` là tên trong mã dùng lại, không phải chỉ chế độ database của lần này.

Sau đó đã xóa D1 tổng hợp vừa tạo và kiểm tra danh sách không còn database thử. Đây là kiểm tra chức năng với hai lệnh trong từng lượt, không phải kiểm thử đăng nhập thật, nhiều Worker triển khai, phân tán quy mô lớn, phục hồi hay phép đo CPU Worker trên Cloudflare. [Hướng dẫn remote bindings](https://developers.cloudflare.com/workers/local-development/#remote-bindings) nêu mã Worker vẫn chạy local trong cấu hình này; không coi kết quả là toàn bộ P2 đã đạt.

## Khảo sát chữ ký khóa công khai, dữ liệu giả

`public-key-experiment.mjs` tạo khóa ECDSA P-256 tạm, ký một chuỗi thử ngẫu nhiên và xác minh chữ ký hợp lệ; thử sửa chuỗi hoặc chữ ký đều phải bị từ chối. Chạy Worker giả lập với `pnpm exec wrangler dev --config poc/auth/wrangler.public-key-local.jsonc --test-scheduled --port 8799`, rồi gọi `/cdn-cgi/local/scheduled?format=json`. Worker không có endpoint xác thực, không lưu khóa, không có cron từ xa. Ngày 18/11/2026, Wrangler 4.164.0 local trả `outcome: ok`, xác nhận ba điều kiện. Đây không phải phép đo CPU trên Cloudflare; chưa kết luận phù hợp quota.

`challenge-fixture.mjs` là thử nghiệm bộ nhớ đơn tiến trình, dùng tài khoản giả; test kiểm tra sai tài khoản, hết hạn và hai yêu cầu cùng thử dùng một challenge. Không có bảo đảm đồng thời giữa nhiều tiến trình hoặc lưu bền và không dùng cho sản phẩm.

Đây không phải passkey hoặc WebAuthn. WebAuthn còn yêu cầu kiểm tra đầy đủ `origin`, RP ID, dữ liệu xác thực và chính sách xác minh người dùng, quản lý đăng ký, thu hồi và phục hồi thiết bị. [Tài liệu Web Crypto của Cloudflare](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/) liệt kê hỗ trợ ECDSA; [chuẩn WebAuthn](https://www.w3.org/TR/webauthn-3/) mô tả các ràng buộc của giao thức. Nếu theo hướng passkey, cần phương án đăng ký ban đầu an toàn, thiết bị không tương thích và phục hồi, đo CPU trên hạ tầng thật, cùng quyết định thay đổi yêu cầu mật khẩu đã duyệt. Chưa chọn hoặc thay thế cơ chế hiện tại.

### Thử đo từ xa ngày 18/11/2026

`wrangler dev --remote --test-scheduled` khởi động phiên xem trước nhưng yêu cầu thử trả Cloudflare 1042, không thu được kết quả. Sau đó triển khai phiên bản thử tổng hợp `8856c978-afc4-408b-93bb-f4ba37d8124a` tới Worker riêng `tttemple-auth-poc` với lịch tạm. Kết nối tail bị `ECONNRESET`; kết nối lại không nhận được sự kiện trong thời gian chờ. Dashboard hiển thị không có sự kiện trong một giờ tại lúc xem, lưu ý sự kiện có thể đến trễ; không có cơ sở kết luận rằng phép thử đã chạy hoặc đạt. Truy vấn API quan sát qua token Wrangler bị 403.

Đã triển khai lại `wrangler.idle.jsonc`, phiên bản `3a00527a-39eb-4867-b40e-db2ba1100b04`, và API lịch trả `schedules: []`. Dashboard cũng xác nhận Worker không có URL hoặc route hoạt động; cấu hình POC trong repo đã để lịch rỗng. Tại lần kiểm tra này dashboard cho biết tài khoản dùng Workers Free. Chưa có số CPU hoặc wall time cho phép thử ECDSA, và không xem phép thử từ xa là thành công. Xem thêm [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) về độ trễ áp dụng lịch.

## POC passkey/WebAuthn cục bộ

Thư mục `webauthn/` là POC riêng, dùng `@simplewebauthn/server` 14.1.0 và `@simplewebauthn/browser` 14.0.0. Chạy trong hai terminal:

```powershell
$env:XDG_CONFIG_HOME = "$PWD\poc\auth\webauthn\.wrangler"
pnpm exec wrangler dev --config poc/auth/webauthn/wrangler.local.jsonc --ip 127.0.0.1 --port 8787
```

```powershell
pnpm exec vite --config poc/auth/webauthn/vite.config.mjs
```

Mở `http://localhost:5178`. POC chỉ có tài khoản `synthetic-user` cùng company/role giả. Worker local chuyển request tới một Durable Object SQLite riêng cho tài khoản tổng hợp; challenge, credential công khai, bộ đếm thử sai, trạng thái khóa và hash phiên nằm trong storage của object thay vì biến bộ nhớ của Worker. Mã đăng ký và mã admin `local-demo-only` vẫn chỉ là giá trị demo, không có bảo vệ thật. `wrangler.local.jsonc` chỉ dành cho `wrangler dev`; tuyệt đối không deploy hoặc nối POC này vào game.

Trình duyệt giữ user gesture khi gọi WebAuthn, nên thao tác tách làm hai nút: chuẩn bị options rồi bấm đăng ký/đăng nhập. Bấm “Tạo passkey trên thiết bị” sẽ tạo một credential thật trên authenticator của thiết bị, gắn với RP `localhost`; chỉ bấm khi chủ máy chủ động muốn thử. Không tạo passkey hoặc dùng tài khoản thật khi kiểm tra tự động.

`npm test --prefix poc/auth/webauthn` chạy các test state, storage transactional giả lập, challenge dùng một lần, origin, replay, giới hạn thử sai, thu hồi/thay phiên, bộ đọc body giới hạn và vector chữ ký ECDSA tổng hợp. Bộ đọc JSON streaming giới hạn 64 KiB cho API xác thực và 1 KiB cho endpoint smoke local, đếm byte thực, hủy stream khi vượt trần, từ chối UTF-8 sai và không dựa riêng vào `Content-Length`. State adapter đặt chỗ lượt verify trước khi kiểm tra chữ ký, đồng thời chỉ cấp session khi tài khoản chưa khóa; test 20 lượt đồng thời xác nhận chỉ 5 lượt được phép. Checkout này thiếu package WebAuthn do npm registry trả `ECONNRESET`, nên test tích hợp cục bộ chưa chạy được. GitHub Actions run [44551885489](https://github.com/lylamkhai218/tttemple/actions/runs/44551885489) cài package từ lockfile và đạt 60/60 test, build, Wrangler dry-run cùng smoke runtime local. Smoke dùng `SMOKE_MODE=1`: challenge dùng một lần qua restart, session mới thu hồi session cũ, session và revoke còn hiệu lực sau restart, khóa tài khoản còn sau restart. Các endpoint smoke chỉ có trong local config và cần mã demo tổng hợp. Đây vẫn không phải Cloudflare remote hoặc WebAuthn đầu-cuối bằng authenticator thật.

`worker-ecdsa-benchmark.mjs` dùng một public key/challenge/signature tổng hợp để đo phần xác minh chữ ký P-256 trên Worker. Nó chỉ đo primitive chữ ký, không đại diện toàn bộ xác minh WebAuthn, lưu credential, D1 hay chi phí request thực.

### Thử telemetry Worker tổng hợp ngày 19/11/2026

Đã deploy mã benchmark lên Worker riêng `tttemple-auth-poc`, version `3fe65bba-0fd2-40bf-a4c2-ce4ba321cb51`, và đặt cron `* * * * *` tạm thời. Truy vấn Workers Observability đã lọc theo đúng service `tttemple-auth-poc` nhưng không trả event trong cửa sổ kiểm tra; do đó không có bằng chứng để báo CPU time, wall time, số lần chạy hoặc kết quả chữ ký trên Cloudflare. Không suy diễn rằng trigger đã chạy hay chưa chạy.

Ngay sau đó đã xóa cron, deploy lại Worker idle version `44843bd1-b78d-4a09-814f-cd0a36e3b8b0`, rồi GET xác nhận `schedules: []`, workers.dev và preview URL tắt, không có route/binding. Workers Logs/Traces vẫn bật. Nếu telemetry trễ, handler idle hiện tại không thực hiện benchmark. Không dùng truy vấn account-wide vì ngoài phạm vi POC.

Đây là một lần thử đo không thu được số liệu, không phải kết quả CPU. P2 vẫn chưa đạt; có thể tiếp tục bằng cách cấu hình query telemetry đã giới hạn theo Worker hoặc dùng tail có lọc, sau đó kiểm tra nhiều mẫu và vẫn khôi phục idle sau đo.
