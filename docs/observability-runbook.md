# Workers Observability - hướng dẫn vận hành

Cập nhật: 19/11/2026. Phạm vi hiện tại là hai Worker thử nghiệm `tttemple-vite-test` và `tttemple-auth-poc`. Đây là bản dự thảo; chủ sở hữu và người nhận cảnh báo chưa được chỉ định.

## Cấu hình đã xác minh

- `tttemple-vite-test`: workers.dev bật, Preview URLs tắt, binding ASSETS.
- Logs: bật, persist, lấy mẫu 100%, invocation logs bật.
- Traces: bật, persist, lấy mẫu 10%.
- `redact_query_string: true` trên Observability.
- `logpush: false`; chưa có destination. Workers Trace Events Logpush chỉ có trên Workers Paid. Không nâng cấp billing hoặc tạo destination trong phạm vi hiện tại.
- Ngày 19/11/2026, API GET xác nhận Logs và Traces vẫn bật; Logs lấy mẫu 100%, Traces 10%, cả hai lưu bền vững, query string redaction bật. `logpush` vẫn tắt.
- Query API `view=traces`, lọc chính xác `$metadata.service=tttemple-vite-test` và khoảng 24 giờ gần nhất, trả 2 trace summaries. Query đối chiếu 2 giờ lúc 08:30 UTC có 6 invocation groups mang trace ID nhưng 0 trace summaries; đọc 36.976.978 byte cho invocations và 11.506.960 byte cho traces. Không lưu identifier; sample 10% nên kết quả chưa chứng minh Traces lỗi. Tránh query lại nếu chưa có request mới để đối chiếu. Đây là bằng chứng Trace ingestion; không đưa trace ID, Ray ID hoặc nội dung thô vào repo. API Usage trong cùng lượt kiểm tra trả 30 event, 183.093 byte cho service trong bucket hiện hành.
- Query Traces báo 19.066.540 rows read và 158.187.746 bytes read dù filter service đã đặt. Để giảm scan, dùng khoảng thời gian nhỏ và filter service chính xác; không chạy query account-wide hoặc lặp query 24 giờ nếu chỉ cần xác minh ingestion.
- Tài liệu Cloudflare hiện ghi Workers Traces có retention 7 ngày và từ 1/12/2026, traces lưu trữ được tính vào usage ingestion/storage cấp account. Giữ sample 10%; không tăng lên 100% trong phạm vi này.

## Kiểm tra log khi có sự cố

1. Trong Cloudflare Dashboard, mở đúng account, chọn **Workers & Pages**, chọn Worker, rồi **Observability > Events**.
2. Giới hạn khoảng thời gian và lọc chính xác service (`tttemple-vite-test` hoặc `tttemple-auth-poc`). Không chạy query account-wide để tìm log của một Worker.
3. Kiểm tra invocation log, `source.level`, `source.message`, thời điểm và outcome. Nếu cần đối chiếu, dùng request ID hoặc Ray ID trong Dashboard; không đưa identifier hoặc bản log thô lên repo công khai.
4. Kiểm tra Traces ở view riêng và giới hạn timeframe. Với sampling 10%, việc không thấy trace trong một mẫu nhỏ chưa chứng minh tracing bị lỗi. Không tăng sampling trên Worker đang phục vụ trang thử nếu chưa duyệt tác động thu thập và dung lượng.
5. Nếu thiếu event, xác nhận Worker/version và cấu hình Logs/Traces hiện tại, timeframe, filter service, trạng thái lưu trữ và kết quả request. Giữ truy vấn giới hạn vào đúng Worker.

## Quy tắc dữ liệu

- Không log tên nhân viên, username, email, mật khẩu, token, nội dung chat, tọa độ người chơi hoặc dữ liệu thẻ.
- Query-string redaction không che nội dung trong path, headers hoặc `console.log()`. Không đưa dữ liệu nhạy cảm vào URL, header được log hoặc thông điệp console.
- Chỉ giữ lại trường cần thiết để điều tra; giới hạn thời gian truy cập log theo chính sách account hiện hành.
- Nếu cần xuất sang dịch vụ ngoài, chốt destination, người quản lý và chính sách lưu trữ trước. Tài liệu Cloudflare: [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/), [Workers Traces](https://developers.cloudflare.com/workers/observability/traces/), [Workers Logpush](https://developers.cloudflare.com/workers/observability/logs/logpush/).

## Chủ sở hữu và trạng thái

- Owner vận hành: chưa chỉ định.
- Owner xử lý sự cố: chưa chỉ định.
- Log ingestion: đã kiểm chứng trên `tttemple-vite-test`.
- Trace ingestion: đã quan sát 2 trace summaries trong truy vấn 24 giờ ngày 19/11/2026; chưa kiểm tra đối chiếu từng trace với request log.
- Logpush: tắt; yêu cầu Workers Paid và một destination được duyệt.

Tài liệu tham chiếu: [Workers Traces](https://developers.cloudflare.com/workers/observability/traces/) và [Workers Observability API](https://developers.cloudflare.com/api/resources/workers/subresources/observability/).
