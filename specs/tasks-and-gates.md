# Cổng kiểm và tình trạng triển khai

Trạng thái được kiểm chứng tại thời điểm viết, không phải kế hoạch hoàn thành giả định.

| Phase | Trạng thái | Bằng chứng / phụ thuộc |
|---|---|---|
| P0 — AP và quyết định | Hoàn tất phạm vi chuẩn bị P1 | AP, đặc tả, ma trận truy vết và ma trận 12 ca nghiệm thu đã có; đầu vào tài khoản và các quyết định vận hành còn mở, được gắn với P3 hoặc P7–P8. Đây là hoàn tất đặc tả chuẩn bị, không phải nghiệm thu chức năng. |
| P1 — nền tảng | Đang thực hiện | Build và CI GitHub thành công cho commit `11bf86b`; Worker thử `tttemple-vite-test` được mở theo yêu cầu, chỉ cho IP được Cloudflare nhận diện tại Việt Nam. Bản thử được cập nhật trực tiếp ngày 18/11/2026, thấy game và logo từ kết nối hiện tại; test giả lập chặn quốc gia khác, chưa thử từ IP nước ngoài thực tế. Zero Trust/Access chưa kích hoạt; lọc IP không phải xác thực người dùng. Spec Kit chạy được qua uvx. |
| P2 — POC bảo mật | Chưa đạt | PBKDF2 600.000 vòng bị Web Crypto từ chối; một mẫu scrypt N=32768, r=8, p=3 thành công, CPU 250 ms và wall 251 ms trên Cloudflare. Thử ECDSA và challenge giả local, chưa phải WebAuthn. Bốn lượt thử phiên giả với Worker local và D1 từ xa đạt các ca đồng thời, hết hạn, khóa. Chưa chọn phương án xác thực, đo quota đầy đủ hoặc xác minh bảo mật thực tế; Worker thử từ xa đã chuyển idle và lịch rỗng. |
| P3 — tài khoản | Chưa bắt đầu | Phụ thuộc P2, danh sách username và công ty được duyệt, kênh cấp mật khẩu tạm. |
| P4 — hai người | POC cục bộ, chưa đạt | Durable Object/WebSocket local kiểm tra hai kết nối, tốc độ, va chạm, đồng bộ cửa, nghi lễ và từ chối kết nối thứ 21. Thay đổi nghi lễ mới chưa chạy kiểm tra; chưa xác thực, chống gian lận đầy đủ hay thử hai thiết bị/Cloudflare. Phụ thuộc P1 và P2. |
| P5 — nghi lễ và hạt | POC dữ liệu giả, chưa đạt | Phòng game local mới kiểm tra ở server loại nghi lễ, khoảng cách tới ba điểm, nhịp gửi và mới phát hiệu ứng sau xác nhận; log `ritual_result` chỉ ở console local. Tràng hạt vẫn lưu trên trình duyệt; POC D1 riêng kiểm tra gửi lặp, timeout giả trước/sau khi ghi và ngày Việt Nam. Chưa kiểm tra thay đổi mới, tài khoản, nối D1 vào game, mất mạng thật hoặc khôi phục. |
| P6 — mỹ thuật | Đang thực hiện | Tích hợp logo TTTemple và favicon do người dùng cung cấp, tạo WebP và kiểm tra trên bản thử Cloudflare. Có hai logo công ty, chùa, chính điện, sân và ao; hình Phật là ảnh 2D. Chưa nghiệm thu mỹ thuật, hiệu năng hoặc thiết bị thật. |
| P7 — quan sát | POC cục bộ, chưa đạt | Phòng thử ghi event vào console local khi vào phòng, phòng đầy, ngắt kết nối hoặc có kết quả nghi lễ; không ghi ID người chơi, tọa độ hay dữ liệu chat. Chưa có lưu bền vững, dashboard, thời gian lưu hoặc log đầy đủ cho P2 - P5 trên hệ thống thật. |
| P8 — tải và an toàn | Thử nghiệm cục bộ, chưa đạt | Hai lượt thử ngắn 20 client giả, mỗi lượt nhận đủ 1.900 bản tin và từ chối client thứ 21. Chưa thử tải kéo dài, mạng thật, an ninh, quota Cloudflare, sao lưu/khôi phục hoặc rollback triển khai. Phụ thuộc P1 - P7. |
| P9 — UAT | Chuẩn bị, chưa mở | Đã có ma trận ca và hướng dẫn chạy, thu bằng chứng. Chỉ mời người dùng sau khi giải quyết các cổng kỹ thuật, danh sách và cách cấp tài khoản được duyệt. Chưa thử hoặc nghiệm thu người dùng. |
| P10 — vận hành | Chưa bắt đầu | Dashboard, owner và runbook được xác nhận. |

## Checklist truy vết

- Mỗi thay đổi liên kết FR, UF, task, test và event tương ứng trong AP.
- POC phải ghi môi trường, phiên bản, phép đo, dữ liệu thử và kết luận; số đo local không thay thế số đo trên Cloudflare.
- Chỉ ghi đạt khi có bằng chứng. Khi phụ thuộc ngoài chưa sẵn sàng, tiếp tục việc độc lập nhưng không vượt cổng liên quan.

## Có thể làm song song

- P3: chuẩn bị thiết kế, test và dữ liệu giả; chưa cấp tài khoản hoặc triển khai đăng nhập thật trước khi P2 đạt và danh sách, kênh mật khẩu được duyệt.
- P4 - P5: thử nghiệm độc lập với dữ liệu giả, chuẩn bị giao thức và kiểm thử; không nghiệm thu đồng bộ hay lưu hạt thật trước nền tảng và xác thực.
- P6 - P7: cải thiện mỹ thuật, giao diện và chuẩn bị log, event không chứa dữ liệu thật. P8, P9 và P10 phụ thuộc kết quả hệ thống và bằng chứng thiết bị, tải, an toàn, vận hành.

## Bằng chứng cục bộ 18/11/2026

- P4: phòng local kiểm tra đồng bộ cửa, từ chối người ở xa và đóng khi có người ở ngưỡng, đi qua cửa mở và khôi phục trạng thái sau restart; hai tab nhận thông báo cửa đóng/mở. Hồi quy phòng và 20 kết nối đạt, `pnpm test` đạt 42 bài, build thành công. Chưa phải thử nghiệm hai thiết bị hay Cloudflare.
- P5: giả lập timeout trước và sau khi ghi; retry tối đa ba lần với cùng mã thao tác. Worker local nối D1 thử remote: truy vấn D1 primary xác nhận mỗi ca chỉ có một dòng hạt giả. D1 thử đã được xóa. Đây không phải timeout mạng thật, không kiểm thử khôi phục khi đóng tab. `pnpm test` đạt 41 bài.
- P1/P6: thêm cảnh báo trình duyệt nhúng trước khi tải game; các UA thử cho Zalo, Facebook, Android WebView và trình duyệt thông thường đạt unit test. Thử mô phỏng giao diện Zalo/iPhone trên desktop, sao chép thành công; trình duyệt desktop tải được game local và bản thử Cloudflare phiên bản `d31f763e-ccb5-42b0-95dd-e9736cc9de00`. `pnpm test` đạt 39 bài, build và dry-run thành công. Chưa kiểm tra Zalo/Facebook và mở trình duyệt ngoài trên iPhone/Android thật.
- P2 - D1 từ xa: bốn lượt kiểm tra dữ liệu giả đều đạt hai lệnh cấp phiên đồng thời, hết hạn và khóa; Worker thực thi local qua remote binding tới D1 APAC thật. Đã truy vấn xác nhận bảng trên D1, sau đó xóa D1 thử riêng. Không đại diện xác thực hoặc CPU Worker trên Cloudflare. `pnpm test` đạt 34 bài.
- P2 thử đo từ xa: preview trả lỗi 1042; Worker tổng hợp có lịch tạm nhưng không thu được event hay CPU, tail bị gián đoạn và API quan sát trả 403. Đã đưa Worker về idle `3a00527a-39eb-4867-b40e-db2ba1100b04`, API xác nhận lịch rỗng. Dashboard cho biết Workers Free; P2 vẫn chưa đạt.
- P2: chữ ký ECDSA P-256 thử bằng dữ liệu giả trên Wrangler 4.164.0 local được xác minh; chuỗi và chữ ký sửa đổi bị từ chối. Unit test challenge bộ nhớ trong một tiến trình kiểm tra sai tài khoản, hết hạn, yêu cầu đồng thời và dùng lại. `pnpm test` đạt 34 bài. Không phải WebAuthn, không đo CPU Cloudflare, không làm thay đổi yêu cầu mật khẩu.
- P1/P6: Worker thử `tttemple-vite-test` phiên bản `b8bdbac0-119f-4c81-89fb-b00a1aedadf6` cập nhật trực tiếp sau `pnpm test` 31 bài và `pnpm build`. Trang, logo WebP 21.740 byte và favicon WebP 22.580 byte trả 200 từ kết nối hiện tại; logo được quan sát trong trình duyệt. Không chứng minh IP nước ngoài, CI cho mã hiện tại hoặc thiết bị thật. Gói JS vẫn cảnh báo lớn hơn 500 kB.
- P4: chat thử cục bộ trao đổi được giữa hai tab cùng máy; script riêng kiểm tra danh tính server tự gắn, giới hạn tần suất và độ dài. Chưa xác thực, kiểm duyệt hoặc lưu lịch sử; không có chat trong bản build production. P3: role fixture với tài khoản giả chỉ kiểm thử logic, chưa nối game hay cấp vai trò thật. Camera khởi đầu được đặt trước khung hình đầu; lời nhắc chuông được cập nhật. 31 bài test và build đạt, chưa kiểm tra điện thoại thật.
- P8: thử 8 bản tin bất thường với phòng giả lập local, snapshot vị trí không đổi, không phát chuyển động sai, và di chuyển hợp lệ sau đó vẫn hoạt động. Đây chỉ là kiểm tra đầu vào hữu hạn, không phải đánh giá bảo mật toàn diện. P9 có hướng dẫn chuẩn bị UAT, chưa mở nghiệm thu.
- P8: Wrangler 4.164.0 và Node local, 20 client giả, 5 lượt di chuyển mỗi client, khoảng nghỉ tối thiểu 250 ms; hai lần chạy đều nhận 1.900/1.900 bản tin, client thứ 21 bị từ chối. Độ trễ gửi đến nhận p50/p95/max lần lượt 20,23/30,80/34,82 ms và 18,59/38,25/47,23 ms. Đây là độ trễ trên cùng máy và thử ngắn, không đại diện 20 người hay Cloudflare; chưa đủ nghiệm thu tải.
- Tối ưu tiếp P4 - P7: bổ sung nội suy nhân vật phòng local; D1 giả lập hoàn tác giao dịch khi bước thứ hai lỗi; log phòng kiểm tra loại, số trường và giá trị cụ thể. Cảnh vườn chia sẻ hình học và vật liệu: số mesh 373 không đổi, hình học riêng 165 xuống 90, vật liệu 29 xuống 21. Đây không phải phép đo FPS, draw call hay điện thoại thật. `pnpm test` đạt 29 bài và build thành công, còn cảnh báo bundle.
- POC quan sát phòng: Wrangler 4.164.0 ghi event vào phòng và ngắt kết nối khi thử cục bộ; 20 kết nối thành công, kết nối thứ 21 bị từ chối. `pnpm test` đạt 29 kiểm thử, bao gồm kiểm tra từ chối trường lạ và lỗi sink; `pnpm build` thành công, vẫn cảnh báo bundle lớn hơn 500 kB.
- Lần kiểm tra tiếp theo: `pnpm test` đạt 27 kiểm thử, `pnpm build` thành công nhưng vẫn cảnh báo bundle JavaScript lớn hơn 500 kB. POC phòng và D1 chỉ chạy cục bộ; không đại diện kết quả trên Cloudflare hay thiết bị thật.
- `pnpm test`: 24 kiểm thử thành công, tập trung vào AP, telemetry, benchmark giả, phiên local, lọc quốc gia, điều khiển và va chạm. Kiểm thử phòng multiplayer chạy riêng theo `poc/multiplayer/README.md`; chưa phải kiểm thử bảo mật triển khai.
- `node poc/auth/run-local.mjs`: Node v24.22.1; ba lần PBKDF2-HMAC-SHA-256, 600.000 vòng, lần lượt 247,24 / 235,25 / 219,94 ms thời gian thực. Máy cục bộ không đại diện CPU time của Cloudflare; không dùng kết quả này để duyệt P2.
- `pnpm test` và `pnpm build` chạy lại thành công; build cảnh báo bundle JavaScript lớn hơn 500 kB, chưa phải phép đo hiệu năng thiết bị.
- [GitHub Actions run 44140684245](https://github.com/lylamkhai218/tttemple/actions/runs/44140684245) thành công trên nhánh `progress/2026-11-18`, commit `11bf86b`; runner có cảnh báo về phiên bản runtime của các action.
- Repo GitHub có mã game trên nhánh tiến độ. Cloudflare đang nối với repo và có trang kiểm tra, nhưng chưa xác minh cấu hình triển khai bản game; không coi đó là sản phẩm đã triển khai.
