# Đánh giá mở cảnh TTTemple

Ngày 18/11/2026. Đo bản build Vite cục bộ với Lighthouse 13.6.0, Edge headless, giả lập điện thoại 412 x 823, CPU chậm 4 lần và mạng giả lập. Các giá trị là một lượt kiểm thử trong phòng thí nghiệm, không phải Core Web Vitals thu thập từ người dùng thật.

| Chỉ số | Trước chỉnh favicon và font | Sau chỉnh |
|---|---:|---:|
| Performance | 60 | 62 |
| Accessibility | 100 | 100 |
| Best practices | 96 | 100 |
| SEO | 82 | 91 |
| FCP | 2,5 giây | 0,8 giây |
| LCP | 4,8 giây | 4,4 giây |
| Total Blocking Time | 750 ms | 980 ms |
| CLS | 0 | 0 |

Hai lượt không đủ để chứng minh mức cải thiện ổn định. Favicon 404 đã được sửa; Google Fonts không còn chặn hiển thị ban đầu theo cấu hình mới. TBT vẫn cao và thay đổi giữa hai lượt, cần profile trên thiết bị thật trước khi kết luận nguyên nhân và ưu tiên tối ưu.

## Review mã trong phạm vi thay đổi

- Intro có module riêng với kiểm thử điều kiện mở, lỗi tải và khôi phục; mây dùng SVG/CSS, không cần thư viện animation mới.
- Có thông báo tải lâu và nút tải lại, hỗ trợ `prefers-reduced-motion`, không nhận thao tác game trong lúc mây đang mở.
- Tồn tại ngoài phạm vi intro: `src/main.js` tập trung khởi tạo cảnh, camera, đầu vào, nghi lễ và âm thanh trong một tệp; cần tách dần theo chức năng, giữ các kiểm thử hồi quy. JavaScript build vẫn hơn 500 kB trước gzip và Lighthouse ước tính 49 KiB JavaScript chưa dùng trong lượt này. Không xóa code chỉ theo ước tính một lượt đo.
- Chưa thử iPhone/Android thật, đa chạm thực tế, âm thanh loa thật hoặc đo FPS, pin và nhiệt. Không thay thế P8 hoặc UAT.

## Tối ưu vòng lặp game 18/11/2026

- Tách tính toán camera và lựa chọn điểm nghi lễ thành module riêng, giữ các ca kiểm thử cho góc nhìn, cửa, bán kính và trường hợp khoảng cách bằng nhau. Vector camera được tái sử dụng, tránh tạo nhiều vector mới mỗi khung hình; bỏ truy vấn DOM lặp và cập nhật nhãn nghi lễ khi trạng thái thay đổi.
- Phép thử Node trên máy này cho 500.000 lần chọn điểm với cùng bộ vị trí giả: hàm cũ 155,80 ms, hàm mới 18,41 ms sau khởi động. Hai kết quả chọn điểm khớp trên 100 vị trí giả. Đây là microbenchmark một lần, không phải phép đo FPS hay cải thiện thực tế trên điện thoại.
- `pnpm test` đạt 37 bài; `pnpm build` thành công, JS 529,51 kB trước gzip và vẫn cảnh báo > 500 kB. Đã thử local trên trình duyệt desktop: chuyển góc nhìn, di chuyển tới tràng hạt và bấm đếm một hạt. Chưa đo lại Lighthouse, chưa kiểm tra điện thoại thật và chưa triển khai thay đổi này lên bản công khai.
