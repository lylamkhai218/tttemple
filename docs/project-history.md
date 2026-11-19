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

## 19/11/2026 - Nối giao diện tràng hạt vào POC D1 local

- Chế độ `?phong-thu=1` gọi Worker local tại cổng 8797 cho lượt đọc và ghi hạt. Worker tự gắn danh tính giả `synthetic-local`, lấy giờ server để tính ngày Việt Nam, từ chối payload có trường thừa và dùng mã UUID làm khóa chống ghi trùng. Giao diện chỉ tăng tổng sau khi nhận kết quả từ D1; timeout thử tối đa ba lần với cùng mã và giữ mã đó trong bộ nhớ tab nếu vẫn chưa rõ kết quả.
- Bài thử scheduled hiện có xóa dữ liệu trước khi chạy; hướng dẫn dùng một vùng lưu riêng cho kịch bản đó để không xóa số hạt của phiên game local. Không tạo database Cloudflare, không dùng danh tính thật.
- `pnpm build` thành công, 27 module; bundle JavaScript 528,63 kB và còn cảnh báo trên 500 kB. Chưa chạy Worker, chưa kiểm tra request trình duyệt, hai tab, retry mạng, test suite hoặc thiết bị. P5 vẫn là POC chưa đạt; P2 chưa đạt, không đưa lên Cloudflare.

## 19/11/2026 - Review lien phong va kiem tra P4-P6

- Hai agent review doc lap theo vai tro senior tech va game artist. Day la review noi bo bang agent AI, khong phai danh gia cua chuyen gia nguoi that 30 nam hoac nghiem thu my thuat. Chi tiet o `specs/reviews/2026-11-19-cross-discipline.md`.
- Tech xac nhan P1 con can xac minh CI va cau hinh Workers cho Vite tren commit hien tai; loc quoc gia khong phai dang nhap. P2 chua chot xac thuc/quota. P3 cho P2 va dau vao tai khoan. Khong mo cac tinh nang production phu thuoc xac thuc.
- Artist giu dinh huong choi nhe sau cac cuoc tro chuyen kho voi khach hang. Uu tien silhouette mai chinh dien va khung anh Phat 2D co chu y; kiem tra khoang trong mobile, vuot trang hat va chat luong tren thiet bi truoc khi nghiem thu P6.
- Trang nhan vat mac dinh an khi loi chao dang mo; mo panel nhan vat tu dong dong loi chao. Tren viewport browser 390 x 844, loi chao nam sau cum nut tren cung, chat thu an khi loi chao mo va trang thai phong dat duoi logo thay vi chong joystick.
- P5 local: `renderBeadCount` chi danh dau/animate hat hien tai va hien tien trinh hoan thanh du 20 hat trong mot vong. Moi lan mo trang doc lai tong tu D1 local de dong bo so moi giua tab. Moi lan bam hoac mot lan vuot trong browser tao dung mot thao tac.
- Bang chung local: Wrangler 4.164.0 tren cong 8796 (Durable Object phong thu) va 8797 (D1), Vite tren 5173, vung luu `.wrangler/beads-review-2026-11-19` tach rieng. Hai tab Vite cung may ket noi phong; giao dien bao 2 nguoi. D1 local tang tu 1 len 2 sau bam, tab hai doc 2 roi vuot mot lan len 3, tab mot mo lai doc 3. Gui lai cung operation ID qua API khong tao dong thu hai. Khong phai hai thiet bi, Cloudflare D1 da deploy hay retry tren mang that.
- `pnpm test` dat 43 bai; `pnpm build` thanh cong voi 27 module. Bundle game chinh 529,44 kB, con canh bao Vite tren 500 kB. Build production khong chua `127.0.0.1:8797`, `beads-local` hoac `synthetic-local`. Day chua phai so do FPS hoac Lighthouse.
- Lighthouse CLI va MCP performance trace khong co san; khong tao score hay Core Web Vitals gia lap. Chua co nghiem thu iPhone/Android. Da dung toan bo server local; khong deploy, commit hoac push.

## 19/11/2026 - Dinh chinh cach trinh bay muc review

- Muc `Review lien phong va kiem tra P4-P6` ngay truoc bi thieu dau tieng Viet do loi nhap lieu. Giu nguyen muc do theo quy tac append-only. Ban doc co dau va cung bang chung review nam trong `specs/reviews/2026-11-19-cross-discipline.md`; trang thai phase duoc cap nhat trong `specs/tasks-and-gates.md` va `HANDOFF.md`.

## 19/11/2026 - Bổ sung xác minh P1 qua Cloudflare API

- Cloudflare API read-only lúc 03:06 UTC xác nhận Worker `tttemple-vite-test` có assets, `workers.dev` bật, Preview URLs tắt, không có custom route; phiên bản mới nhất `d31f763e-ccb5-42b0-95dd-e9736cc9de00` nhận 100% traffic và được deploy bằng Wrangler ngày 18/11. Cấu hình hiện nằm tại `poc/vite-preview/wrangler.jsonc`, Worker chỉ cho request có `request.cf.country === 'VN'`.
- Đính chính phạm vi review trước đó: cấu hình Workers cho Vite đã có và bản thử đang chạy; phần chưa xác minh là CI cho commit `d17ad53`, quy trình deploy/rollback từ GitHub và kiểm tra từ IP ngoài Việt Nam. Lọc quốc gia vẫn không phải đăng nhập.
- Yêu cầu đọc trạng thái CI commit hiện tại qua GitHub connector lỗi transport; không có bằng chứng CI mới. Không thay đổi Worker hay traffic.

## 19/11/2026 - Sửa ô tên mobile và bố cục landscape

- Tăng cỡ chữ tên/chọn nhân vật trên mobile lên 16px để tránh cơ chế tự phóng to khi focus trên Safari iOS, giữ viewport không khóa phóng to trợ năng và tăng chiều cao vùng chạm tối thiểu lên 44px. Thêm bố cục ngang màn hình thấp, tính safe area, thu gọn logo và nút, đặt panel nhân vật ở góc phải; điều khiển cảm ứng dùng joystick hiện có theo media query coarse pointer.
- Đã quan sát giao diện local ở viewport 390 x 844 và 844 x 390. Ô tên là 16px/cao 44px; cảnh game phủ khung ngang, logo và hành động không chồng lên nhau. Đây là kiểm tra browser desktop bằng viewport, không phải thiết bị thật hoặc kiểm chứng hành vi Safari.
- `pnpm build` đạt, 27 module; bundle game 529,51 kB (gzip 138,31 kB), còn cảnh báo Vite trên 500 kB. Chưa chạy `pnpm test`, không triển khai, commit hoặc push. Cần xác minh bàn phím, zoom focus, notch/safe area và joystick trên iPhone/Android thật trước khi đóng P6.

## 19/11/2026 - Điều tra báo lỗi không vào được game trên iPhone Safari

- Nguồn là ảnh người dùng ghi nhận 23:00 ngày 18/11/2026, tương ứng 16:00 UTC. Màn hình fallback là chuỗi riêng trong `src/boot.js`, được đặt khi `import('./main.js')` reject; điều này xác định lỗi ở tải hoặc khởi tạo module client, không xác định exception cụ thể. Game hiện chưa có join phòng production.
- Cloudflare API: deployment đang chạy `d31f763e-ccb5-42b0-95dd-e9736cc9de00` được tạo 14:38:59 ICT ngày 18/11, không có deployment quanh 23:00. Workers GraphQL metrics khung 22:55-23:05 ghi 139 request và 139 subrequest ASSETS, 0 lỗi runtime; riêng 23:00 có 54 request/subrequest và 0 lỗi. Đây là số tổng hợp cho Worker, không gắn với user và không cung cấp HTTP status.
- Settings của script trả `observability: null`, `logpush: false`; Workers Observability query không có event trong khung incident. Vì thế không lấy được console/error stack phía client. Worker chặn quốc gia trước khi gọi ASSETS; mọi invocation có subrequest trong thống kê đi tiếp tới ASSETS, nên không có bằng chứng bộ lọc quốc gia là nguyên nhân của các request được thống kê.
- Mã dựng `THREE.WebGLRenderer` ở đầu `src/main.js`; Three.js r180 chỉ hỗ trợ WebGL 2. Context không tạo được có thể làm dynamic import reject. Đây là giả thuyết phù hợp nhưng chưa được chứng minh; Safari/WebKit có hỗ trợ WebGL 2 từ Safari 15, còn iOS version và model của máy báo lỗi chưa biết. Thử bản live qua Chromium desktop thành công, không thay thế thiết bị iOS.
- Không thay đổi mã, không bật logging, không deploy. Cần model/iOS version, WebGL 2 check và console/network capture trên máy thật để chốt nguyên nhân; nếu tái hiện cần lấy HTTP status của JS chunk.

## Bằng chứng cục bộ 19/11/2026 - Thu gọn HUD màn chơi

- Rà mã giao diện thấy lời chào lớn tự hiện lần đầu; phần hướng dẫn, chỉ đường tới điểm tương tác, chú thích logo, nhãn phiên bản, tên mặc định và mô tả phụ của nút nghi lễ cùng chiếm màn hình hoặc lặp nội dung. Đã ẩn hướng dẫn mặc định và cho mở bằng nút `?`; rút gọn header thành nút biểu tượng 44px có aria-label/title; bỏ chỉ đường cố định, nhãn mặc định trên avatar, mô tả lặp và phụ đề logo; thu ngắn toast nghi lễ. Trạng thái phòng local vẫn có nội dung cho trình đọc màn hình nhưng không chiếm diện tích nhìn.
- Giữ nút hành động nghi lễ theo ngữ cảnh khi đến gần điểm tương tác; nội dung hướng dẫn ngắn còn trong panel trợ giúp. Không thay đổi màn intro.
- `pnpm build` đạt, 27 module; bundle game 529,78 kB (gzip 138,21 kB), tiếp tục cảnh báo Vite trên 500 kB. `git diff --check` không phát hiện lỗi whitespace; PowerShell báo chuyển đổi LF/CRLF dự kiến cho các file đã sửa.
- Không kiểm tra hình ảnh trong browser vì môi trường không cho mở socket localhost; không chạy test suite, không deploy, commit hoặc push. Bản build xác nhận cú pháp/đóng gói, không thay thế kiểm tra viewport hay iPhone/Android thật. P6 vẫn chưa đạt.

## Bằng chứng cục bộ 19/11/2026 - P1 CI/rollback và P6 mái chùa

- GitHub API read-only: Actions run `44264957288` hoàn tất thành công cho branch `progress/2026-11-18`, commit `d17ad530a750f1c654e9c6de07246b34baa01bc0`. Workflow `.github/workflows/ci.yml` chỉ chạy `pnpm test` và `pnpm build`; chưa deploy.
- Cloudflare API read-only cho Worker `tttemple-vite-test`: version `d31f763e-ccb5-42b0-95dd-e9736cc9de00` nhận 100% traffic; version trước là `b8bdbac0-119f-4c81-89fb-b00a1aedadf6`, có tổng cộng 8 versions trong danh sách. Không thay đổi cấu hình hoặc traffic.
- Wrangler local 4.164 `rollback --help` và tài liệu Cloudflare xác nhận rollback lập tức tạo deployment mới trỏ 100% traffic tới version chọn. Đã thêm runbook `poc/vite-preview/README.md`; không chạy lệnh rollback. P1 còn thiếu quy trình deploy qua GitHub và kiểm tra bằng IP ngoài Việt Nam thực tế. P6 vẫn độc lập để tiếp tục.
- P6: thay mái phẳng bằng custom low-poly roof mesh có mặt cong và góc mái vút lên; thêm các đường gờ thưa; thêm viền gỗ vàng nổi quanh ảnh Phật. Cụm mái giảm từ 47 mesh xuống 12 mesh theo mã nguồn; chưa đo FPS/draw calls.
- `pnpm build` đạt với 28 module; bundle game 530,81 kB (gzip 138,60 kB), còn cảnh báo Vite trên 500 kB. Không xem được bản local trong browser ở môi trường hiện tại; không chạy test suite, không deploy, rollback, commit hoặc push. P1 và P6 vẫn chưa nghiệm thu.

## 19/11/2026 - Bật Workers Observability và rà Logpush

- Lý do trước đó chưa bật: mục điều tra incident ngày 19/11 ghi nhận logging đã hoãn tới khi đánh giá chi phí và mức thu thập dữ liệu. Sau khi kiểm tra tài liệu Cloudflare, Workers Logs/Traces trên Free không tính phí trước 01/12/2026; từ ngày đó Free có 0,5 GB ingestion/ngày, lưu 7 ngày, không tính phí vượt mức mà dừng ingestion khi chạm hạn mức. Workers Logs hiện có hạn mức 200.000 event/ngày và lưu 3 ngày tới hết 30/11. Nguồn: https://developers.cloudflare.com/observability/pricing/ và https://developers.cloudflare.com/workers/observability/logs/workers-logs/.
- Ngày 19/11 bật Workers Observability qua Cloudflare API cho `tttemple-vite-test` và `tttemple-auth-poc`: Logs enabled, invocation logs enabled, persist, sampling 100%; Traces enabled, persist, sampling 10%; `redact_query_string: true`. GET xác minh lại cùng cấu hình trên cả hai script. Đây là cập nhật cấu hình account từ xa, không sửa mã hoặc deploy Worker.
- Truy vấn Workers Observability API khoảng 03:34-04:04 UTC ngày 19/11 chạy thành công nhưng không trả event; vì vậy chỉ xác nhận cài đặt đã bật, chưa xác minh ingestion bằng request mới. Các log cũ của incident Safari lúc 16:00 UTC ngày 18/11 không thể khôi phục hồi tố.
- Cloudflare API trả `logpush:false` cho cả hai Worker; account không có Logpush job hoặc Workers Observability destination. Workers Trace Events Logpush chỉ dùng được trên Workers Paid và tính theo request; không nâng cấp plan, tạo destination, bật dịch vụ lưu trữ trả phí hoặc thay đổi billing. Nguồn: https://developers.cloudflare.com/workers/platform/pricing/#workers-trace-events-logpush.
- Kết luận: Logs và Traces đã bật để hỗ trợ sự cố tiếp theo, P7 chưa đạt đến khi xác minh event sau request mới và chốt quy trình dashboard/owner. Logpush chưa bật do giới hạn Workers Free và chưa có destination; cần Workers Paid và nơi nhận log để triển khai loại Worker Trace Events Logpush.

## 19/11/2026 - P6 giảm payload texture cảnh game

- Đổi import texture trong `src/main.js` sang WebP cho ảnh Phật, logo TTPC và logo T&T Vina. Giữ nguyên các PNG nguồn. Kích thước lần lượt: PNG 980.823 / 346.111 / 21.069 byte; WebP 57.164 / 70.698 / 20.440 byte. Tổng giảm từ 1.348.003 xuống 148.302 byte, tiết kiệm 1.199.701 byte, xấp xỉ 89%.
- Mở trực quan các bản WebP sau chuyển đổi: bố cục, màu và chi tiết chính nhìn vẫn nguyên ở ảnh Phật và hai logo; không giảm độ phân giải (600x800, 1200x800, 1000x620). Vì intro đợi texture của cảnh, giảm payload này có thể rút ngắn thời gian tải ảnh trước khi mở cảnh; chưa đo độ trễ mạng hay LCP thực tế.
- `pnpm build` thành công, 28 module. Ba texture trong output là 148,30 kB tổng; JavaScript `main` còn 530,81 kB (gzip 138,60 kB) và Vite vẫn cảnh báo chunk trên 500 kB; âm thanh WAV còn 322,32 kB. Không có Lighthouse/Core Web Vitals tool trong môi trường; không chạy test suite, không xem browser/điện thoại, không deploy, commit hoặc push. P6 chưa nghiệm thu.

## 19/11/2026 - Chuẩn bị deploy P1 từ GitHub vào Worker thử

- Tài liệu Cloudflare xác nhận `wrangler preview` tạo branch Preview riêng, nhưng Preview URL công khai mặc định và thiết lập Workers.dev Preview URL cần được bật. Để không mở thêm hostname hoặc đổi thiết lập production trong lượt này, chọn workflow thủ công nhắm Worker thử đã có `tttemple-vite-test`; job buộc chạy trên nhánh `progress/2026-11-18`, mặc định `SKIP`, chỉ deploy khi chọn `DEPLOY_PREVIEW`.
- Tạo `.github/workflows/deploy-preview.yml`: setup pnpm 11.15.1/Node 24, cài theo lockfile, dùng test và build hiện có, chạy `wrangler deploy --dry-run` trước `wrangler deploy`; token và account ID lấy từ GitHub Actions secrets. Workflow chưa commit/push/chạy, secrets chưa xác minh. Khi chạy, `wrangler deploy` đặt version mới vào 100% traffic của Worker thử, không phải thao tác vô hại; rollback đổi traffic ngay.
- Thêm cấu hình Observability Logs/Traces vào `poc/vite-preview/wrangler.jsonc` với cùng sampling và che query string như settings đã xác minh qua API, để lần deploy qua Wrangler không làm lệch cấu hình khai báo.
- Wrangler 4.164.0 local `deploy --dry-run --config poc/vite-preview/wrangler.jsonc` đọc 16 asset trong `dist`, nhận binding `ASSETS`, tổng Worker upload 0,51 KiB và thoát ở chế độ dry-run. Công cụ báo không ghi được file log dưới AppData do sandbox quyền, nhưng vẫn hoàn tất gói; không gọi Cloudflare API, không deploy.
- Không chạy workflow/test suite, không đổi GitHub secrets, traffic hay Cloudflare resource, không commit/push. P1 vẫn chưa đạt đến khi workflow được push/chạy, secrets được cấp, kết quả Worker thử được kiểm tra và IP ngoài Việt Nam được xác minh. Nguồn cấu hình: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/ và https://developers.cloudflare.com/workers/previews/.

## 19/11/2026 - P2 đánh giá hướng xác thực trong giới hạn Free

- Đối chiếu POC hiện có với tài liệu Cloudflare và OWASP. Workers Free giới hạn 10 ms CPU mỗi HTTP request/Cron Trigger; mẫu scrypt tổng hợp đã ghi nhận 250 ms CPU, nên không phù hợp mức giới hạn này. PBKDF2-HMAC-SHA-256 600.000 vòng vẫn bị Workers Web Crypto từ chối. Không giảm mức băm hoặc đánh dấu P2 đạt từ một mẫu.
- API GET danh sách Access applications ngày 19/11 trả `access.api.error.not_enabled`. Không bật Zero Trust, thay billing, hay tạo cấu hình Access. Access/IdP cần định danh email/SSO và mapping tài khoản; không tương thích trực tiếp với luồng mật khẩu tạm hiện tại.
- Ghi ma trận và đề xuất trong `specs/p2-auth-assessment.md`: nếu giữ Workers Free và không thêm billing, thử passkey/WebAuthn bằng tài khoản giả là hướng đáng nghiên cứu; đây là đề xuất cần duyệt vì thay đổi AP. ECDSA fixture hiện có không phải WebAuthn và không chứng minh CPU/độ an toàn đầu-cuối.
- Không chạy benchmark/deploy hoặc test suite trong lượt đánh giá này; không sửa Worker từ xa. P2 vẫn chưa đạt; P1 không chặn P2, còn P3 và tích hợp tính năng chờ cổng P2.
- Nguồn: https://developers.cloudflare.com/workers/platform/limits/ ; https://developers.cloudflare.com/workers/configuration/cloudflare-access/ ; https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html ; https://www.w3.org/TR/webauthn-3/.

## 19/11/2026 - P2 POC WebAuthn và phép đo Cloudflare không có telemetry

- Nối tiếp đánh giá P2, tạo POC cô lập tại `poc/auth/webauthn/` bằng SimpleWebAuthn 14.1.0/14.0.0. Tài khoản, công ty, role và state đều giả; challenge/session ở bộ nhớ đơn tiến trình. `npm test --prefix poc/auth/webauthn` đạt 5 bài; Vite production build và Wrangler `deploy --dry-run` đạt. Chưa dùng authenticator thật, không nối vào game và không đổi AP.
- Deploy benchmark ECDSA với public key/challenge/signature tổng hợp lên `tttemple-auth-poc`, version `3fe65bba-0fd2-40bf-a4c2-ce4ba321cb51`, đặt cron mỗi phút trong khoảng thử. Truy vấn Workers Observability đã lọc chính xác `$metadata.service=tttemple-auth-poc` nhưng trả 0 event; không có bằng chứng về số trigger, CPU time, wall time hoặc outcome. Không chạy truy vấn account-wide.
- Xóa cron và deploy Worker idle version `44843bd1-b78d-4a09-814f-cd0a36e3b8b0`. GET xác nhận `schedules: []`, workers.dev/preview tắt, bindings rỗng; Logs/Traces vẫn bật với cấu hình hiện có. Không sửa Worker game, thêm billing hoặc bật Access.
- Kết luận P2 vẫn chưa đạt. Phép thử local chứng minh luồng POC và kiểm tra mã, không chứng minh xác thực production; phép đo ECDSA từ xa không có kết quả. Cần lấy được telemetry bằng truy vấn lọc, hoàn thiện state bền vững, thử authenticator/iOS, review bảo mật và được duyệt thay đổi AP trước khi triển khai.
- Nguồn kỹ thuật: https://simplewebauthn.dev/docs/packages/server ; https://simplewebauthn.dev/docs/packages/browser ; https://developers.cloudflare.com/workers/observability/ ; https://developers.cloudflare.com/workers/platform/limits/.

## 19/11/2026 - P6 giảm dung lượng tiếng mõ

- Giữ `src/assets/mokugyo.wav` làm bản nguồn CC0; tạo `src/assets/mokugyo.mp3` bằng FFmpeg/libmp3lame, stereo 44,1 kHz, 192 kbit/s. Cập nhật game dùng MP3 và ghi rõ nguồn/cách chuyển đổi trong `src/assets/SOUNDS.md`.
- `ffprobe` xác nhận MP3 dài 1,827 giây, 44,1 kHz, 2 kênh; kích thước 45.182 byte so với WAV 322.320 byte, giảm 277.138 byte (86,0%). `pnpm build` đạt, 28 module và đóng gói MP3 ở 45,18 kB. JavaScript game giữ nguyên 530,81 kB (gzip 138,60 kB), Vite vẫn cảnh báo chunk trên 500 kB.
- Chưa đo thời gian tải thực, Lighthouse, FPS hoặc nghe nghiệm thu trên Safari/iPhone/Android; môi trường không có MCP trace hiệu năng. Không chạy test suite, không deploy, commit hoặc push. P6 tiếp tục chưa đạt; tối ưu âm thanh chỉ xử lý một asset tải cùng game.

## 19/11/2026 - P7 xác minh Workers Logs ingestion

- Cloudflare API xác nhận `tttemple-vite-test` có workers.dev bật, route qua ASSETS, Logs persist/sample 100%, Traces persist/sample 10% và redaction query string. Không đổi cấu hình trong phép thử.
- Mở một lần trang bản thử bằng browser in-app. Query Workers Observability `view=invocations`, lọc chính xác `$metadata.service=tttemple-vite-test`, trả 10 log invocation mức `info` cho GET trang và asset tại thời điểm 07:29 UTC; không đọc hoặc đưa query string vào báo cáo. Bằng chứng xác nhận Logs ingestion. Worker đang phục vụ version `d31f763e-ccb5-42b0-95dd-e9736cc9de00`; log cho thấy bản triển khai này vẫn tải WAV và PNG cũ, nên thay đổi P6 mới ở checkout chưa được deploy.
- Truy vấn `view=traces` đã lọc theo đúng Worker nhưng không trả trace trong mẫu đã thu; với trace sampling 10%, chưa đủ cơ sở kết luận trace ingestion bị lỗi. `logpush:false`; tài liệu Cloudflare xác nhận Workers Trace Events Logpush chỉ có trên Workers Paid, account hiện Free. Không bật billing hoặc tạo destination.
- Kết luận P7 tiến triển một phần: Logs đã xác minh, Traces và quy trình dashboard/owner còn mở. Không truy vấn log account-wide, không đổi deployment hoặc traffic. Nguồn: https://developers.cloudflare.com/workers/observability/logs/logpush/ ; https://developers.cloudflare.com/workers/platform/pricing/.

## 19/11/2026 - P7 truy vết thêm mẫu Traces

- Mở thêm hai lượt trang thử bằng browser in-app, nâng mẫu lên 25 invocation log trong giờ gần nhất. Query đã lọc theo `$metadata.service=tttemple-vite-test`; 25 sự kiện `cf-worker-event` mức `info` có trace ID.
- Truy vấn Traces lọc đúng Worker, sau đó đối chiếu trực tiếp các trace ID trong phạm vi dữ liệu đó, đều trả 0 trace. Đây là bằng chứng Logs ingestion hoạt động và Traces chưa quan sát được trong mẫu; sample rate cấu hình 10%, nên chưa thể kết luận hệ thống Traces lỗi.
- GET xác nhận cấu hình vẫn nguyên trạng: Logs enabled/persist/sample 100%, Traces enabled/persist/sample 10%, redaction query string bật; workers.dev bật, preview URL tắt, lịch rỗng, `logpush:false`. Không sửa cấu hình, deployment hoặc traffic.
- P7 chưa đạt nghiệm thu Traces và quy trình dashboard/owner. Logpush cho Workers Trace Events vẫn không khả dụng trên Workers Free theo tài liệu Cloudflare; không nâng cấp billing hoặc tạo nơi nhận log. Nguồn: https://developers.cloudflare.com/workers/observability/traces/ ; https://developers.cloudflare.com/workers/observability/logs/logpush/.

## 19/11/2026 - P7 soạn runbook quan sát

- Tạo `docs/observability-runbook.md` với trạng thái cấu hình đã xác minh, cách truy vấn đúng Worker, cách xử lý khi thiếu event, quy tắc không log dữ liệu nhạy cảm và giới hạn Logpush hiện tại.
- Runbook ghi owner vận hành và incident response đang chờ chỉ định; đây là tài liệu dự thảo, chưa phải quyết định phân công. P7 vẫn chưa đạt vì chưa thấy trace trong các mẫu và chưa có owner. Không đổi cấu hình Cloudflare.

## 19/11/2026 - P6 thiết kế và lịch night mode

- Thêm `src/time-of-day.js` để tính chuyển ngày - đêm theo múi giờ `Asia/Ho_Chi_Minh`: hoàng hôn 18:00-19:00, đêm 19:00-04:00, bình minh 04:00-05:00. Smoothstep làm chậm chuyển màu ở đầu/cuối; cảnh lấy mẫu mỗi giây.
- Cập nhật `src/main.js`: màu trời/sương và ánh sáng chuyển giữa ngày, chạng vạng ấm, đêm xanh chàm; trăng lưỡi liềm và 108 sao mờ theo thời gian; hai đèn vàng nhỏ gần chính điện. Giữ nguyên HUD và thao tác chơi. Đặc tả và checklist nghiệm thu ở `specs/night-mode-design.md`.
- `pnpm build` đạt ngày 19/11/2026 với 29 module. JavaScript game 535,58 kB (gzip 140,12 kB), tăng 4,77 kB raw so với build 530,81 kB trước đó; Vite tiếp tục cảnh báo chunk trên 500 kB. Build chỉ xác nhận biên dịch/đóng gói, không phải kiểm tra hình ảnh hoặc FPS.
- Chưa xem browser local, chưa chạy Lighthouse, chưa nghiệm thu Safari iOS/Android, chưa deploy hay kiểm tra giờ biên trên thiết bị. P6 tiếp tục chưa đạt; nguồn bằng chứng là mã nguồn và output build cục bộ.

## 19/11/2026 - P6 kiểm tra night mode và chỉnh bầu trời

- Thêm `tests/time-of-day.test.js` cho giờ ngày/đêm ICT, bốn mốc chuyển tiếp, tiến trình hoàng hôn/bình minh và ngày không hợp lệ. `pnpm test` đạt 52/52; `pnpm build` đạt 29 module, JavaScript game 535,66 kB (gzip 140,19 kB), cảnh báo chunk trên 500 kB vẫn còn.
- Dùng query dev-only `?clock=HH:mm` để dựng lại giờ 12:00, 18:30, 23:00 và 04:30 trong preview. Search output `dist/assets` không thấy `previewClock` hoặc `?clock`, xác nhận điều khiển preview bị loại khỏi production build.
- Browser in-app đã hiển thị local game ở desktop 1280x720, viewport giả lập dọc 390x844 và ngang 844x390. Dusk/dawn chuyển ấm; ban đêm còn đọc được sân và HUD. Console không có error/warning trong mẫu đã thu. Khi camera ngẩng, ảnh đầu cho thấy trăng bị cắt ở mép trên và sao dồn thành dải; hạ trăng xuống, phân bố lại 108 sao bằng seed xác định. Ảnh sau sửa thấy trăng/sao gọn trong phần trời.
- Góc camera mặc định hướng xuống sân nên thiên thể chỉ thấy khi kéo góc nhìn lên; đây là giới hạn bố cục hiện tại cần cân nhắc trong review, không thay góc vào game trong lượt này. Viewport browser không phải iPhone/Android thật. Chưa đo FPS/Lighthouse, chưa deploy; P6 vẫn chưa đạt.

## 19/11/2026 - P7 xác nhận Traces ingestion trên Worker thử

- Cloudflare API read-only ngày 19/11 xác nhận cấu hình `tttemple-vite-test`: Workers Observability, Logs và Traces bật; Logs lưu bền vững và lấy mẫu 100%; Traces lưu bền vững và lấy mẫu 10%; query-string redaction bật; `logpush:false`. Không thay đổi cấu hình, deployment hoặc traffic.
- Query Observability API `view=traces`, lọc chính xác `$metadata.service=tttemple-vite-test` trong 24 giờ gần nhất, trả 2 trace summaries. Không lưu trace ID hoặc dữ liệu thô vào repo; chưa đối chiếu từng trace với request log nên chưa xác nhận được quan hệ từng request.
- Usage API cho service trong bucket hiện hành trả 30 event và 183.093 byte. Truy vấn traces đã đọc 19.066.540 rows / 158.187.746 bytes, vì vậy runbook yêu cầu giới hạn timeframe và service, tránh truy vấn rộng lặp lại.
- Tài liệu Cloudflare Workers Traces ghi retention 7 ngày và cho biết từ 01/12/2026 traces lưu trữ được tính vào usage ingestion/storage cấp account: https://developers.cloudflare.com/workers/observability/traces/. Giữ sampling 10%; không bật Logpush hoặc đổi billing.
- P7 tiến triển: Logs và Traces ingestion đã được quan sát. P7 vẫn chưa đạt vì chưa chỉ định owner vận hành/xử lý sự cố và chưa có đối chiếu trace-request; Logpush tiếp tục tắt, chưa có destination được duyệt. Nguồn bằng chứng là Cloudflare API GET settings, GET usage, POST telemetry query và tài liệu Cloudflare tại thời điểm kiểm tra.

## 19/11/2026 - P6 giảm draw call ở cụm trúc

- Rà mã phát hiện 23 cụm trúc ở viền sân tạo 184 `Mesh` riêng (mỗi cụm 4 thân và 4 lá) nhưng chuyển động chung theo cụm. Đổi mỗi cụm thành 2 `InstancedMesh`, giữ 4 thân và 4 lá trong cùng cụm chuyển động; cấu trúc mã giảm phần này từ 184 xuống 46 đối tượng render, tức 138 draw call ít hơn theo ước lượng từ scene graph.
- `pnpm build` đạt với 29 module. JavaScript game tăng từ build trước 535.660 byte (gzip 140.190 byte) lên 539.300 byte (gzip 141.290 byte), tăng 3.640 byte raw và 1.100 byte gzip do mã instancing; cảnh báo bundle trên 500 kB vẫn còn. Cần đo renderer.info/FPS trên thiết bị để xác nhận lợi ích thực tế và kiểm tra hình ảnh cụm trúc.
- Không có Lighthouse CLI hoặc browser performance tracing MCP trong môi trường này. Browser in-app không kết nối được preview local `127.0.0.1:4173`, nên chưa có kiểm tra hình ảnh. Không chạy test suite, không deploy/commit/push; build chỉ xác nhận đóng gói.
- P6 vẫn đang thực hiện. Nguồn bằng chứng: `src/garden.js`, output `pnpm build` và kết quả thử mở local preview ngày 19/11/2026.
## 19/11/2026 - P7 thử đối chiếu trong timeframe hẹp

- Query Cloudflare Observability API từ 06:30 đến 08:30 UTC, lọc chính xác `tttemple-vite-test`, trả 6 invocation groups với trace ID; truy vấn `view=traces` cùng timeframe trả 0 trace summaries. Chỉ đếm ID trong bộ nhớ để đối chiếu, không đưa ID vào output hoặc repo. Kết quả chưa đủ để kết luận Traces lỗi vì sampling cấu hình 10%.
- Query invocations đọc 1.357.445 rows / 36.976.978 byte; query traces đọc 1.338.640 rows / 11.506.960 byte. Không lặp truy vấn nếu chưa có request mới để đối chiếu; ưu tiên timeframe ngắn quanh thời điểm request đã biết.
- Nguồn: Cloudflare Observability API POST telemetry query lúc 08:30 UTC ngày 19/11/2026. Không đổi cấu hình, sampling, deployment hoặc traffic.
## 19/11/2026 - P1 xác minh cục bộ workflow preview

- `pnpm test` đạt 52/52; `pnpm build` đạt với 29 module. Wrangler 4.164.0 `deploy --dry-run --config poc/vite-preview/wrangler.jsonc` thoát mã 0, đọc 16 file asset từ `dist` và nhận binding `ASSETS`; không deploy Worker.
- Lượt dry-run đầu cảnh báo Wrangler không ghi được log vào thư mục user profile ngoài workspace (`EPERM`) nhưng vẫn đóng gói. Đọc tài liệu Wrangler xác nhận có biến `WRANGLER_LOG_PATH`; chạy lại với log trong thư mục tạm thì dry-run sạch. Nguồn: https://developers.cloudflare.com/workers/wrangler/system-environment-variables/.
- Workflow deploy thủ công vẫn chưa push hoặc chạy trên GitHub; Actions secrets chưa xác minh, chưa kiểm tra IP ngoài Việt Nam. Không đổi cấu hình Cloudflare hoặc traffic. P1 vẫn chưa đạt.