# Review liên phòng TTTemple - 19/11/2026

## Phạm vi

Hai agent review riêng theo vai trò senior tech và game artist. Phần kỹ thuật đọc mã, cổng phase và bằng chứng. Phần mỹ thuật xem luồng story, HTML/CSS và ảnh chụp browser local. Đây là review nội bộ bằng agent AI, không phải ý kiến của chuyên gia con người có 30 năm kinh nghiệm. Không sửa mã trong lúc review và không có nghiệm thu trên điện thoại thật.

## Tình trạng các phase

- P0: hoàn tất phạm vi chuẩn bị, chưa phải nghiệm thu tính năng.
- P1: đang thực hiện. CI có workflow test/build nhưng kết quả chỉ được xác nhận ở commit `11bf86b`, chưa phải commit hiện tại `d17ad53`. Cloudflare API xác nhận Worker thử `tttemple-vite-test` bật `workers.dev`, tắt Preview URLs và phiên bản mới nhất `d31f763e-ccb5-42b0-95dd-e9736cc9de00` đang nhận 100% traffic sau deploy bằng Wrangler ngày 18/11. Cấu hình Vite nằm trong `poc/vite-preview/wrangler.jsonc`, Worker chặn request không có `request.cf.country === 'VN'`. Chưa xác minh CI/deploy hiện tại, rollback hoặc IP ngoài Việt Nam. Lọc IP Việt Nam không xác thực tài khoản.
- P2: chưa đạt. Chưa chốt phương án đăng nhập, quota và bảo mật. PBKDF2 bị Web Crypto từ chối trong lần thử; một mẫu scrypt có CPU 250 ms chưa đủ là bằng chứng quota. ECDSA và challenge mới là POC, không phải WebAuthn.
- P3: chưa bắt đầu; cần P2, danh sách tài khoản và kênh cấp mật khẩu được duyệt.
- P4: POC local; chưa có đăng nhập, hai thiết bị, mạng thật hoặc xác minh Cloudflare.
- P5: POC dữ liệu giả; UI và D1 local đã nối trong lượt này, nhưng chưa có tài khoản, D1 production, phục hồi hoặc retry trên mạng thật.
- P6: đang thực hiện; logo và phong cách low-poly đã có, chưa duyệt hình ảnh, FPS, Lighthouse hoặc thiết bị thật.
- P7-P8: mới có log và thử nghiệm giả lập local; chưa có quan sát, quota, an toàn hay khôi phục production.
- P9: mới chuẩn bị tài liệu UAT; chưa mở UAT.
- P10: chưa bắt đầu.

## Kết luận của phòng kỹ thuật

1. Giữ P1 và P2 làm cổng trước khi cấp tài khoản hoặc bật multiplayer và lưu trữ thật. Cần xác minh CI cho commit hiện tại, đường deploy/rollback từ GitHub, và kiểm tra bộ lọc quốc gia từ IP ngoài Việt Nam trong môi trường thử.
2. Không dùng kết quả local để tuyên bố an toàn, CPU Cloudflare, khả năng chịu tải hay khả năng phục hồi.
3. P4-P6 có thể tiếp tục bằng dữ liệu tổng hợp. P7 cần tránh ghi ID, tọa độ, nội dung chat hoặc danh tính thật vào log mặc định.
4. Bundle JavaScript chính là 529.44 kB sau minify, gzip còn 138.29 kB; Vite cảnh báo vì kích thước minify vượt 500 kB. Chưa có Lighthouse trace để xác định tác động thực tế.
5. Dữ liệu P5 có giới hạn: thao tác retry trong bộ nhớ tab có thể mất nếu đóng tab. Cần thiết kế hàng đợi và khôi phục riêng trước production.

## Kết luận của phòng mỹ thuật

1. Dùng mục tiêu game nhẹ để giảm căng thẳng sau khi nói chuyện với khách hàng làm trục chính cho lời chào; không hứa hẹn điều trị sức khỏe.
2. Cảnh hiện tại có nhận diện chùa, ao, sân và các điểm nghi lễ; phong cách low-poly hợp với game nhẹ. Nhà chùa và ảnh Phật đang chưa tạo đủ điểm nhấn. Ưu tiên silhouette mái chính điện và tầm nhìn bàn thờ trước khi thêm props nhỏ; nếu giữ ảnh Phật 2D, hãy đặt vào khung/tranh có chủ ý.
3. Trên portrait, nhóm nút top-actions và lời chào có nguy cơ chen nhau. Panel nhân vật không nên tự mở cùng lời chào. Chat thử và trạng thái phòng cũng cần tránh cần điều khiển.
4. Tràng hạt cần thể hiện một hạt đang được lần mỗi thao tác; không nên làm cả vòng hạt chạy đồng loạt. Kiểm tra vùng an toàn, cỡ chữ và thao tác vuốt trên điện thoại thật.
5. Chưa có dữ liệu để duyệt chất lượng âm thanh trên loa, độ mượt/FPS, Lighthouse hoặc cảm nhận của người chơi.

## Việc đã làm sau review

- Trang nhân vật mặc định đóng khi lời chào hiện. Mở nhân vật sẽ đóng lời chào; mở lời chào sẽ đóng panel nhân vật.
- Trên mobile 390 x 844 trong viewport trình duyệt, lời chào nằm dưới nhóm nút top-actions; chat local ẩn khi lời chào mở; trạng thái phòng chuyển lên dưới logo, không đè lên joystick.
- Tràng hạt cập nhật tổng từ D1 mỗi khi mở lại. Sau mỗi thao tác chỉ một hạt được đánh dấu và animate; tổng 20 hiển thị đủ 20 hạt hoàn thành trước khi bắt đầu vòng kế tiếp.
- Build production không chứa endpoint `127.0.0.1:8797`, module `beads-local` hoặc danh tính `synthetic-local`.

## Bằng chứng và giới hạn

- `pnpm test`: 43/43 bài đạt.
- `pnpm build`: thành công, 27 module; bundle chính 529.44 kB và vẫn cảnh báo lớn hơn 500 kB.
- Cloudflare API read-only: Worker `tttemple-vite-test` có assets, `workers.dev` bật, Preview URLs tắt, custom routes rỗng; phiên bản mới nhất `d31f763e-ccb5-42b0-95dd-e9736cc9de00` nhận 100% traffic và được deploy từ Wrangler. Đây không phải CI cho commit `d17ad53` hay triển khai mã local mới.
- Wrangler 4.164.0 chạy local trên các cổng 8796 và 8797 với vùng lưu tách riêng. Hai tab Vite cùng máy kết nối vào phòng local và hiện 2 người.
- D1 local bắt đầu ở tổng 1 sau kiểm tra idempotency API. Tab một bấm nút tăng lên 2; tab hai mở tràng đọc thấy 2 và vuốt một lần tăng lên 3; tab một đóng/mở lại thấy 3. Đây là giao diện browser thật trên máy tính, không phải hai điện thoại.
- Một thao tác API với cùng operation ID được gửi lặp lại chỉ tạo một dòng. Không kiểm thử timeout mạng thật, đóng tab, khôi phục sau restart hoặc Cloudflare D1 đã deploy.
- Viewport 390 x 844 là mô phỏng responsive trong browser; không thay thế iPhone/Android. Lighthouse CLI và MCP trace không có sẵn, vì vậy không có điểm Lighthouse hay Core Web Vitals.
- Các server local đã được dừng sau khi thử. Không deploy, commit hoặc push thay đổi trong lượt review.

## Thứ tự tiếp theo

1. Xác minh CI và Workers deploy trong preview riêng; không đưa POC D1 hoặc multiplayer không đăng nhập lên production.
2. Chốt và chứng minh P2 bằng phương án đăng nhập được review bảo mật, kiểm tra quota Cloudflare đầy đủ.
3. Tiếp tục P6 bằng một vòng phác thảo silhouette mái chùa và bố cục bàn thờ, sau đó xem trên thiết bị thực.
4. Chỉ sau P1-P2 mới mở P3, nối tài khoản vào P4-P5 và tiến tới P8-P9.
