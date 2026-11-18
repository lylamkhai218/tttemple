# Nhật ký dự án TTTemple

Chỉ bổ sung mục mới. Ngày theo múi giờ Việt Nam. Thông tin đã thay đổi được đính chính ở mục sau, không viết lại lịch sử.

## 18/11/2026 - Thiết lập nhật ký

- Người dùng yêu cầu dùng dấu gạch nối đơn trong văn xuôi và bảo toàn ngữ cảnh, bài học dự án. Quy tắc cho agent được đặt tại `AGENTS.md`.
- Tại thời điểm lập nhật ký, repo chưa có `AGENTS.md`; `HANDOFF.md` và bảng trạng thái có thể được sửa trực tiếp. Lịch sử Git cục bộ chỉ chứng minh các bản đã commit, không chứng minh mọi chi tiết trong các phiên trước được bảo toàn.
- Nguồn hiện trạng: `HANDOFF.md`, `specs/tasks-and-gates.md`, `specs/game-review.md`, `poc/auth/README.md`, Git và các phiên làm việc trước. Không coi các tài liệu hoặc trao đổi không còn truy cập được là đã kiểm chứng.
- Bản game thử riêng đã mở theo yêu cầu cho IP được Cloudflare nhận diện tại Việt Nam; đây chưa phải xác thực người dùng. Tài khoản, nhiều người và số hạt đồng bộ chưa triển khai.
- Người dùng không muốn thêm thẻ để kích hoạt Cloudflare Zero Trust. Không kích hoạt gói yêu cầu thẻ hoặc mở rộng thanh toán khi chưa có chỉ dẫn mới.
- POC: Web Crypto từ chối PBKDF2 600.000 vòng; một mẫu scrypt trên Cloudflare ghi 250 ms CPU, chưa chứng minh phù hợp Free. Phiên SQLite cục bộ chưa chứng minh tính an toàn trên Cloudflare. Xem `poc/auth/README.md` để biết giới hạn phép đo.
- Bài học: xóa trường cấu hình cron không đủ để kết luận lịch đã tắt; dùng `triggers.crons: []`, đưa Worker thử về trạng thái không xử lý và kiểm tra lịch thực tế qua API.

## 18/11/2026 - Kiểm tra cổng P1 và P2

- Bổ sung POC D1 giả lập tại `poc/auth/d1-local-experiment.mjs`; Wrangler 4.164.0 hiển thị D1 ở chế độ local. Sự kiện thử cục bộ trả `outcome: ok`, log xác nhận chỉ còn một phiên hợp lệ sau hai yêu cầu đồng thời, kiểm tra hết hạn và khóa tài khoản đạt. Dữ liệu và mã token đều giả. Đây chưa phải phép đo D1 hoặc kiểm thử bảo mật trên Cloudflare.
- Giữ nguyên lựa chọn không thêm thẻ. Zero Trust/Access chưa được kích hoạt; bản thử công khai theo IP Việt Nam không bảo vệ danh tính. P2 còn thiếu phương án xác thực an toàn phù hợp quota, kiểm chứng phiên trên hạ tầng thật và log cơ bản.
- Có thể phát triển nguyên mẫu mỹ thuật, UX, quan sát và thử nghiệm phòng nhiều người bằng dữ liệu giả song song; không công bố P3 - P5 đã đạt, không đưa tài khoản hoặc dữ liệu thật vào trước khi qua cổng liên quan. P8 - P10 và UAT cần bằng chứng kỹ thuật theo kế hoạch.

## 18/11/2026 - Mở cảnh bằng mây và kiểm tra Lighthouse

- Người dùng yêu cầu mở đầu bằng mây tách sang hai bên, kiểm tra Lighthouse và clean code. Màn chờ có trạng thái tải, tùy chọn tải lại, hỗ trợ giảm chuyển động; game mở sau khi tài nguyên do Three.js quản lý và khung hình đầu sẵn sàng. Chi tiết thực hiện tại `index.html`, `src/intro.js`, `src/intro.css` và `src/intro-clouds.svg`.
- Lighthouse 13.6.0 đo bản build local ở chế độ giả lập di động, Edge headless và CPU chậm giả lập 4 lần. Một lượt sau chỉnh sửa: performance 62, accessibility 100, best practices 100, SEO 91; FCP 0,8 giây, LCP 4,4 giây, TBT 980 ms, CLS 0. Đây là phép đo phòng thí nghiệm một lần, không phải số đo điện thoại thật hoặc mạng Cloudflare thực tế.
- Vẫn còn công việc: `src/main.js` gộp nhiều hệ thống game và khó bảo trì; bundle JavaScript còn cảnh báo lớn hơn 500 kB, LCP và công việc main thread cần phân tích thêm trên thiết bị thật. Không coi các điểm Lighthouse hoặc unit test là nghiệm thu hiệu năng game.

## 18/11/2026 - POC phòng nhiều người cục bộ

- Dựng thử phòng WebSocket tại `poc/multiplayer` bằng Durable Object giả lập của Wrangler 4.164.0, chỉ dùng localhost và ID ngẫu nhiên. Không đưa POC lên Internet hoặc nối vào bản game công khai.
- Chạy `node poc/multiplayer/check-local.mjs` khi Wrangler local đang mở: hai kết nối nhận thông tin nhau, di chuyển được gửi sang phía còn lại, tọa độ vượt phạm vi bị bỏ qua, ngắt và kết nối lại nhận danh sách mới, 20 kết nối được mở và kết nối thứ 21 bị từ chối. Đây là test chức năng cục bộ, không phải test tải 20 người thật hay đo Cloudflare.
- Chưa có xác thực, kiểm tra tốc độ/va chạm, phân quyền, rate limit, kết nối vào game, đồng bộ WebSocket sau lỗi mạng, telemetry và quan sát. P1 - P2 vẫn chưa đạt; P4 chưa nghiệm thu.

## 18/11/2026 - Kết nối POC vào game local

- Đính chính mục ngay trước: game ở chế độ Vite local với `?phong-thu=1` đã nối được phòng giả lập. Hai tab trên cùng máy hiển thị hai người; khi một tab di chuyển, tab còn lại thấy nhân vật giả ở vị trí mới; đóng một tab làm số người còn lại về một.
- Build production không chứa mã kết nối tới `127.0.0.1:8796`; bản công khai không có tính năng nhiều người. Các giới hạn về xác thực, tốc độ/va chạm, WebSocket, quan sát và nghiệm thu tại mục trước vẫn còn hiệu lực.
- 24 kiểm thử tự động và build đạt; test phòng WebSocket riêng cũng đạt trên Wrangler local. Chưa thử hai thiết bị độc lập hoặc triển khai Cloudflare.

## 18/11/2026 - Phòng thử kết nối lại và POC hạt D1

- P4: Durable Object cục bộ kiểm tra tọa độ, tần suất, tốc độ và va chạm theo từng đoạn; từ chối dịch chuyển bất thường. Thử hai tab cùng máy, ngắt và khởi động lại server thì hai tab kết nối lại; nhân vật trở về vị trí xuất phát. Cửa phía server luôn được coi là đóng trong POC. Kịch bản tự động kiểm tra 20 kết nối và từ chối kết nối thứ 21. Chưa kiểm thử hai thiết bị, xác thực hoặc triển khai Cloudflare.
- P5: POC D1 giả lập chỉ dùng danh tính synthetic, chưa nối vào game. Kiểm tra 10 lần gửi đồng thời cùng mã thao tác chỉ ghi một lần, gửi lại qua ngày, ranh giới 00:00 giờ Việt Nam và cách ly hai tài khoản giả đều thành công. Không dùng dữ liệu thật hoặc tạo D1 trên Cloudflare.
- Kiểm tra: `pnpm test` đạt 27 bài; `pnpm build` thành công, còn cảnh báo bundle lớn hơn 500 kB. P1 và P2 chưa qua cổng; P4 và P5 vẫn là thử nghiệm độc lập, chưa nghiệm thu hoặc phát hành.

## 18/11/2026 - POC quan sát phòng local

- P7: phòng WebSocket giả lập phát event theo hợp đồng khi vào phòng, phòng đầy và ngắt kết nối. Log ứng dụng chỉ có trạng thái hoặc số kết nối; không có ID người chơi, tọa độ hoặc nội dung client. Mỗi event có ID ngẫu nhiên riêng, không theo dõi phiên. Lỗi sink không làm gián đoạn phòng; unit test từ chối trường ngoài hợp đồng.
- Bằng chứng: Wrangler 4.164.0 local ghi event vào phòng và ngắt; kiểm tra mở 20 kết nối và từ chối kết nối thứ 21. `pnpm test` đạt 29 bài, `pnpm build` thành công với cảnh báo bundle lớn hơn 500 kB. Đây không phải đo tải người thật, không có dashboard, lưu bền vững hoặc triển khai Cloudflare. P1, P2 và P7 chưa đạt cổng.

## 18/11/2026 - Tối ưu P4 - P7 và giới hạn P2

- P2 chưa đạt ảnh hưởng đến tài khoản và phiên thật, đồng thời chặn nghiệm thu phòng nhiều người và số hạt gắn tài khoản. Có thể tiếp tục UX, đồ họa và POC giả lập độc lập, không kết luận an toàn hoặc đưa dữ liệu thật vào.
- P4: nhân vật khác trong phòng Vite local được nội suy giữa vị trí nhận được. Chưa kiểm tra cảm giác trên hai thiết bị hay mạng thật.
- P5: Wrangler D1 giả lập 4.164.0 báo `transaction_rollback: ok` khi một câu ghi lỗi; gửi lặp, ranh giới ngày và cách ly tài khoản giả vẫn đạt. Đây không phải phục hồi backup hay xác minh D1 triển khai.
- P6: chia sẻ hình học và vật liệu trong cảnh vườn. Đếm trên cùng mã Node/Three.js: 373 mesh không đổi; hình học riêng 165 xuống 90, vật liệu 29 xuống 21. Chưa đo draw call, FPS, điện thoại thật hoặc Lighthouse sau thay đổi; không khẳng định mức tăng tốc.
- P7: adapter log phòng thử ràng buộc số trường, trạng thái và số người trong phạm vi phòng; dữ liệu ngoài hợp đồng bị từ chối. `pnpm test` đạt 29 bài, build thành công với cảnh báo bundle > 500 kB. Không triển khai công khai, không thay đổi trạng thái các cổng.

## 18/11/2026 - P8 thử tải giới hạn cục bộ

- Bổ sung `poc/multiplayer/load-local.mjs` chỉ kết nối localhost: 20 client giả, 5 lượt gửi vị trí/client, chờ đủ bản tin mỗi lượt, khoảng nghỉ ít nhất 250 ms, thử từ chối client thứ 21. Mỗi lượt dự kiến 1.900 bản tin nhận, đo từ lúc client gửi đến lúc client khác nhận trên cùng máy.
- Wrangler 4.164.0, Node local: hai lần đều nhận 1.900/1.900, từ chối client thứ 21, không correction hoặc ngắt ngoài dự kiến. p50/p95/max lần một 20,23/30,80/34,82 ms; lần hai 18,59/38,25/47,23 ms. `pnpm test` đạt 29 bài và build thành công; vẫn có cảnh báo bundle > 500 kB.
- Đây chỉ là thử ngắn theo lượt, không phải đo 20 người thật, mạng hoặc Cloudflare, kiểm thử tải kéo dài, xác thực hay an ninh. Còn quota, backup/restore và rollback triển khai; P8 chưa đạt và P1 - P2 vẫn là phụ thuộc. Đã dừng Wrangler local sau thử, không triển khai hoặc tạo tài nguyên Cloudflare.

## 18/11/2026 - Chuẩn bị P9 và kiểm tra đầu vào phòng local

- P9 chưa mở nghiệm thu vì P1 - P8 và các điều kiện tài khoản, thiết bị chưa hoàn tất. Bổ sung `specs/uat-runbook.md` liên kết ma trận TC01 - TC12, điều kiện mở, cách ghi kết quả và yêu cầu không ghi dữ liệu nhạy cảm. Không coi tài liệu hoặc thử nghiệm local là UAT.
- P8: `poc/multiplayer/abuse-local.mjs` gửi 8 trường hợp giả gồm JSON lỗi, kiểu sai, tọa độ ngoài phạm vi, bản tin quá dài, loại sai và dữ liệu nhị phân đến phòng Wrangler 4.164.0 local. Snapshot không đổi, không phát chuyển động sai; di chuyển hợp lệ sau đó thành công. Đây chỉ là số trường hợp hữu hạn, chưa phải đánh giá xâm nhập, chống lạm dụng hay xác thực.
- `pnpm test` đạt 29 bài. Đã dừng server local; không triển khai hay dùng dữ liệu thật.

## 18/11/2026 - Lời chào, định hướng vui nhẹ và yêu cầu chat

- Người dùng đồng ý cập nhật lời chào và hướng dẫn, chọn cách xưng hô thí chủ; mục đích là ghé chùa thư giãn, gõ mõ hoặc thắp hương sau khi căng thẳng với khách hàng. Không xem đây là cam kết sức khỏe hay điều trị.
- Người dùng yêu cầu tài khoản `khaill` hiển thị là trụ trì; yêu cầu này phụ thuộc tài khoản xác thực P2 - P3, không gán vai trò theo tên tự nhập ở bản thử. Quyền quản trị cần được kiểm tra riêng ở server.
- Người dùng đề nghị có chat, thay đổi chủ trương không thêm chat trong `specs/constitution-and-spec.md` và AP ban đầu. Ghi đề xuất, phụ thuộc và điều kiện trong `specs/story-and-social.md`; chưa triển khai chat, chưa quyết định thời gian lưu hay quyền quản lý. Không ghi nội dung chat vào log kỹ thuật mặc định.
- Đã cập nhật lời chào, hướng dẫn và nút mở lại trên bản local; 29 test và build thành công, còn cảnh báo bundle. Đã xem lời chào và thao tác ẩn/mở hướng dẫn trên trình duyệt desktop; chưa kiểm thử điện thoại thật, chưa triển khai bản công khai.

## 18/11/2026 - POC chat và vai trò, góc nhìn mở đầu

- Đã thêm chat văn bản thử trong phòng WebSocket local, chỉ dùng dữ liệu giả. Server gắn ID ngẫu nhiên, từ chối tin dài hơn 120 ký tự hoặc gửi trong vòng 1,5 giây; client dùng textContent, không tạo liên kết, giữ tối đa 30 dòng trên tab. Không lưu lịch sử server, chưa có xác thực, quản lý lạm dụng hay chính sách lưu production. Game build production không chứa kết nối phòng thử; không triển khai chat công khai.
- Hai tab Vite cùng máy đã trao đổi tin giả; script `check-chat-local.mjs` kiểm tra gắn ID phía server, giới hạn tần suất, độ dài. Script phòng cũ đạt di chuyển, từ chối dịch chuyển, ngắt/kết nối lại, 20 người và từ chối người thứ 21. Không coi đó là kiểm tra hai thiết bị hay bảo mật hoàn chỉnh.
- Thêm role fixture chỉ dùng ID tổng hợp đáng tin cậy giả lập và kiểm thử không gán trụ trì theo tên `khaill` do người dùng nhập. Chưa có tài khoản, quyền hoặc vai trò trụ trì thật; cần P2 - P3 trước khi nối vào game.
- Đặt camera ở góc nhìn sân chùa ngay khung hình đầu và bổ sung lời nhắc ngắn khi gõ chuông. Chưa nghe kiểm tra trên loa hoặc đo trên điện thoại thật. `pnpm test` đạt 31 bài; build thành công, cảnh báo bundle lớn hơn 500 kB. Wrangler và Vite thử đã dừng.

## 18/11/2026 - Logo và favicon cho bản chơi thử

- Người dùng cung cấp `public/Logo_TTTemple.png` và `public/favicon.png`. Giữ nguyên PNG gốc; cắt khoảng trống và chuyển sang WebP: logo 1.718.137 xuống 21.740 byte, favicon 802.910 xuống 22.580 byte. Bản favicon giữ kênh trong suốt. Giao diện mở đầu và góc game dùng logo, favicon dùng WebP. `public/.assetsignore` loại hai ảnh gốc khỏi upload Worker, không xóa file gốc.
- `pnpm test` đạt 31 bài; `pnpm build` và `wrangler deploy --dry-run` thành công, còn cảnh báo JS > 500 kB. Đã triển khai Worker thử `tttemple-vite-test`, phiên bản `b8bdbac0-119f-4c81-89fb-b00a1aedadf6`; trang, logo và favicon trả HTTP 200 từ kết nối hiện tại; quan sát logo trong game. Worker vẫn có kiểm tra country VN, nhưng chưa thử từ IP nước ngoài thực tế. Không triển khai Worker chat local hay tạo tài khoản thật.
- Đây là tiến triển P1/P6, chưa phải nghiệm thu mỹ thuật trên thiết bị thật; P2 chưa đạt và vẫn chặn xác thực, tài khoản, dữ liệu đồng bộ thật. Build hiện tại được triển khai trực tiếp từ máy, không đại diện CI cho commit mới.

## 18/11/2026 - Khảo sát chữ ký khóa công khai cho P2

- Thêm thử nghiệm ECDSA P-256 với dữ liệu giả, không endpoint xác thực, không lưu khóa và không triển khai từ xa. Wrangler 4.164.0 local cho kết quả chữ ký hợp lệ được chấp nhận, challenge hoặc chữ ký bị sửa bị từ chối. Đây là kiểm tra chức năng, chưa có số đo CPU hay quota Cloudflare.
- Thêm fixture challenge chỉ trong bộ nhớ một tiến trình; unit test kiểm tra sai tài khoản, hết hạn, hai lần xác minh đồng thời và replay. `pnpm test` đạt 34 bài. Giới hạn: không có lưu trữ phân tán, đăng ký, khôi phục hay hệ thống phiên thật.
- Đây không phải WebAuthn/passkey, không chọn phương án thay thế mật khẩu và không thay đổi yêu cầu đổi mật khẩu. Nếu xét passkey thật cần kiểm tra origin, RP ID, dữ liệu xác thực, user verification, đăng ký và khôi phục, kiểm tra Cloudflare và có quyết định sản phẩm. P2 chưa đạt. Nguồn: tài liệu Cloudflare Web Crypto và W3C WebAuthn liên kết trong `poc/auth/README.md`.

## 18/11/2026 - Thử đo chữ ký trên Worker Cloudflare riêng

- `wrangler dev --remote --test-scheduled` khởi tạo preview nhưng lệnh kích hoạt nhận lỗi Cloudflare 1042, không có kết quả xác thực hoặc CPU. Preview đã dừng.
- Triển khai Worker thử riêng `tttemple-auth-poc` với mã chữ ký giả, phiên bản `8856c978-afc4-408b-93bb-f4ba37d8124a`, tạm đặt cron mỗi phút; tail lần đầu bị ECONNRESET, nối lại không thấy sự kiện trong thời gian chờ. Dashboard không có event một giờ tại lúc xem và ghi sự kiện có thể trễ; API truy vấn log qua token Wrangler trả 403. Không khẳng định phép thử đã chạy, thành công hay có số CPU.
- Đã khôi phục Worker idle phiên bản `3a00527a-39eb-4867-b40e-db2ba1100b04`, API lịch trả `schedules: []`; dashboard cho thấy workers.dev bị tắt, không có route, và gói Workers Free. File cấu hình thử cũng đã đưa về cron rỗng. Thay đổi chỉ ở Worker thử, không thay đổi bản game và không dùng dữ liệu thật. P2 chưa đạt.

## 18/11/2026 - Kiểm thử phiên giả trên D1 từ xa

- Kiểm tra dashboard sau độ trễ vẫn không thấy event ECDSA của lần trước; không suy kết luận về CPU hoặc việc cron đã chạy. Đã tiếp tục bằng thử nghiệm độc lập D1 remote binding.
- Tạo D1 riêng `tttemple-session-synthetic-20261118`, ID `c24d52d2-dbd8-4f1f-8999-410cf05c614e`, tại APAC. Wrangler 4.164.0 hiển thị D1 `remote`, trong khi Worker thực thi local. Bốn lượt tuần tự với dữ liệu giả đều báo một phiên hợp lệ sau hai lệnh cấp đồng thời, kiểm tra hết hạn và khóa tài khoản đạt. Tên `d1-local-session` trong log là nhãn mã cũ, không thể dùng để xác định chế độ binding của lượt này.
- Truy vấn `wrangler d1 execute --remote` đối chiếu ID, thấy hai bảng `poc_accounts` và `poc_sessions`, kết quả từ D1 primary vùng APAC. D1 thử riêng đã xóa thành công; `wrangler d1 list` sau đó không còn database thử. Không đụng dữ liệu thật, không tạo tài khoản thật, không thay đổi game.
- `pnpm test` đạt 34 bài. Kết quả không chứng minh đăng nhập an toàn, tính nhất quán nhiều Worker, hệ thống phiên production, phục hồi, chi phí ở quy mô thật hoặc CPU Worker Cloudflare; P2 vẫn chưa đạt.

## 18/11/2026 - Tối ưu và tách vòng lặp game

- Tách tính toán camera sang `src/camera-controller.js`, tái sử dụng vector; tách chọn điểm nghi lễ sang `src/stations.js`, dùng một lượt tính và so sánh bình phương khoảng cách. Vòng render dễ đọc hơn, tránh truy vấn `.card`, tạo mảng phím và cập nhật nhãn nghi lễ mỗi khung hình. Giữ cấu trúc va chạm và hành vi cũ.
- Test so sánh công thức camera cho góc nhìn thứ nhất/thứ ba, trong/ngoài chính điện và cửa mở/đóng; test bán kính và trường hợp bằng nhau. Tổng `pnpm test` 37 bài đạt; build đạt, JS 529,51 kB và còn cảnh báo > 500 kB.
- Trên trình duyệt desktop local đã thử đổi góc nhìn, di chuyển tới tràng hạt và bấm tăng một hạt. Microbenchmark Node một lần, 500.000 lượt và 100 vị trí giả, kiểm tra đầu ra tương đương: cách cũ 155,80 ms, cách mới 18,41 ms. Đây không phải FPS, Lighthouse, đo điện thoại hoặc cam kết tốc độ thực tế. Chưa triển khai thay đổi lên Cloudflare.

## 18/11/2026 - Cảnh báo trình duyệt trong ứng dụng

- Theo yêu cầu, game nhận diện một số dấu hiệu trình duyệt nhúng Zalo, Facebook/Messenger, Instagram, LINE, TikTok, Google/Twitter và Android WebView; các trường hợp nhận diện được thấy hướng dẫn mở ngoài trước khi tải game. Android có nút thử mở trình duyệt qua intent; iPhone được hướng dẫn dùng menu ứng dụng hoặc sao chép liên kết vào Safari. Sao chép bỏ query và fragment để không mang theo dữ liệu nhạy cảm có thể xuất hiện về sau. Không đảm bảo nhận diện mọi ứng dụng hoặc ép iOS mở Safari.
- `pnpm test` đạt 39 bài; build và Wrangler dry-run thành công. Mô phỏng giao diện Zalo/iPhone trong trình duyệt desktop, xác nhận nút sao chép; game bình thường tải được trên desktop local và bản thử Cloudflare. Chưa kiểm tra bằng Zalo/Facebook trên iPhone/Android thật; nút Android phụ thuộc ứng dụng và hệ điều hành.
- Triển khai Worker thử `tttemple-vite-test` phiên bản `d31f763e-ccb5-42b0-95dd-e9736cc9de00`, vẫn dùng lọc quốc gia của Worker. Bản build này cũng đưa lên các thay đổi tối ưu camera và vòng lặp ghi ở mục trước. Không thay đổi P2 hoặc triển khai chat thử.

## 18/11/2026 - P5 thử lại thao tác hạt khi timeout

- Thêm `poc/beads/retry-local.mjs` chỉ dùng trong POC, thử lại tối đa ba lần đối với lỗi timeout tổng hợp và giữ nguyên operation ID; lỗi khác không retry. Khi hết lần thử, trạng thái ghi có thể chưa rõ, không được suy đoán kết quả.
- Kịch bản tạo timeout giả trước khi ghi và sau khi ghi nhưng trước phản hồi, xác minh mỗi thao tác chỉ ghi một lần. D1 giả lập local và Worker local nối remote binding tới D1 thử APAC đều báo thành công; truy vấn trực tiếp primary từ xa xác nhận mỗi tài khoản giả có đúng một dòng. Không mô phỏng timeout mạng thực hoặc đóng tab, chưa nối game.
- D1 `tttemple-beads-synthetic-20261118`, ID `75fafcd2-c426-409a-aba9-7bff3108471f`, chỉ chứa dữ liệu giả, đã xóa sau phép thử; `wrangler d1 list` xác nhận không còn D1 thử. `pnpm test` đạt 41 bài. P2 và P5 chưa đạt, không tạo tài khoản hoặc triển khai chức năng hạt thật.

## 18/11/2026 - P4 đồng bộ cửa phòng local

- Đính chính giới hạn cửa luôn đóng ghi tại mục `Phòng thử kết nối lại và POC hạt D1`: phòng thử hiện lưu và phát trạng thái cửa, kiểm tra yêu cầu ở gần cửa và từ chối đóng khi có người trong vùng ngưỡng mở rộng theo bán kính va chạm. Di chuyển phía server dùng trạng thái cửa; khi mất kết nối, game local không tự đổi cửa.
- Wrangler 4.164.0 local với vùng lưu thử riêng: kịch bản giả kiểm tra từ chối điều khiển từ xa, phát trạng thái tới hai kết nối, snapshot kết nối mới, đi qua cửa mở, không đóng đè người, mở/đóng; khởi động lại Wrangler vẫn nhận trạng thái cửa mở. Hai tab Vite cùng máy nhận thông báo cửa đóng rồi mở. Hồi quy 20 kết nối và client thứ 21 đạt.
- `pnpm test` đạt 42 bài, build thành công với cảnh báo bundle lớn hơn 500 kB. POC chưa xác thực, chưa thử mạng/thiết bị thực hoặc Cloudflare, vị trí người kết nối lại về điểm xuất phát; P2 và P4 chưa đạt. Không đưa phòng thử lên game công khai.

## 18/11/2026 - Thêm nghi lễ được server local xác nhận

- Trong POC P4/P5 bật riêng bằng `?phong-thu=1` ở Vite localhost, Worker Durable Object kiểm tra ba nghi lễ `incense`, `bell`, `fish`, vị trí server hiện biết và giới hạn nhịp 1 giây/người, 250 ms/phòng. Chỉ sau xác nhận Worker mới phát event cho cả phòng. Event `ritual_result` dùng trường đã có trong hợp đồng và không ghi actor ID, nội dung chat hay tọa độ; lỗi vị trí được ghi bằng mã `forbidden`.
- Game phát khói thắp hương tại cùng vị trí giữa các tab; chuông/mõ phát pulse và thử phát âm thanh khi nhận event. Âm thanh phía người nhận vẫn phụ thuộc chính sách autoplay của trình duyệt. Bản chơi thường và build production không khởi tạo kết nối phòng thử. Số tràng hạt vẫn chỉ lưu trong localStorage; POC D1 chưa nối vào game.
- Thay đổi mã trong `poc/multiplayer/ritual-rules.mjs`, `poc/multiplayer/worker.mjs`, `poc/multiplayer/telemetry.mjs`, `src/multiplayer-dev.js` và `src/main.js`. Chỉ đọc lại mã và hợp đồng trong lượt này; chưa chạy test, build hoặc hai tab sau thay đổi. P2 chưa đạt; P4/P5 vẫn là POC chưa nghiệm thu, không triển khai Cloudflare.

## 18/11/2026 - Kiểm tra quy tắc nghi lễ local

- Bổ sung kiểm tra quy tắc cho ba điểm nghi lễ, từ chối loại không hợp lệ, vị trí xa và giới hạn nhịp của người chơi và phòng. `pnpm test` đạt 43 bài; `pnpm build` thành công, cảnh báo gói JavaScript 528,57 kB. Các kiểm tra này chưa xác minh WebSocket, hiệu ứng hai tab hoặc âm thanh thiết bị.
- P2 và P4/P5 vẫn chưa đạt; chưa triển khai thay đổi lên Cloudflare. Cần thử luồng phòng và thiết bị thật trước nghiệm thu.
