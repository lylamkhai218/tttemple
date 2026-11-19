# Bản thử Vite trên Cloudflare Workers

Worker `tttemple-vite-test` phục vụ asset build trong `dist/`. `worker.mjs` chỉ cho qua request khi Cloudflare xác định `request.cf.country === 'VN'`. Bộ lọc này không đăng nhập và có thể không xác định được quốc gia cho một số request.

## Trạng thái được đọc từ Cloudflare ngày 19/11/2026

- `workers.dev` đang bật; Preview URLs đang tắt.
- Version đang nhận 100% traffic: `d31f763e-ccb5-42b0-95dd-e9736cc9de00`.
- Version trước: `b8bdbac0-119f-4c81-89fb-b00a1aedadf6`.
- GitHub Actions hiện chỉ chạy `pnpm test` và `pnpm build`; chưa kết nối deploy.

## Quy trình deploy thử từ GitHub Actions

- Workflow `.github/workflows/deploy-preview.yml` chỉ chạy thủ công trên nhánh `progress/2026-11-18`. Mặc định chọn `SKIP`; để deploy cần chọn `DEPLOY_PREVIEW`.
- Workflow cài đúng phiên bản Node/pnpm của repo, chạy test và build hiện có, kiểm tra gói bằng `wrangler deploy --dry-run`, rồi mới deploy `tttemple-vite-test`. Worker này là đường dẫn bản thử; lệnh deploy sẽ đưa phiên bản mới lên 100% traffic của Worker thử.
- Trước khi chạy, repo GitHub cần có Actions secrets `CLOUDFLARE_API_TOKEN` và `CLOUDFLARE_ACCOUNT_ID`. Token cần quyền sửa Workers trong đúng account. Không lưu hoặc dán token vào repo hay chat.
- Config Wrangler giờ khai báo Logs và Traces cùng sampling/redaction để lần deploy sau giữ cấu hình Observability đã bật qua API.
- CI workflow run [44500261192](https://github.com/lylamkhai218/tttemple/actions/runs/44500261192) đã qua: 52/52 test và build. Deploy workflow chưa chạy. GitHub Settings read-only hiện không có repository hoặc environment Actions secrets; cần cấu hình `CLOUDFLARE_API_TOKEN` và `CLOUDFLARE_ACCOUNT_ID` trong repo trước khi deploy. Không gửi token qua chat. Không chạy workflow trên nhánh khác vì job được chặn theo nhánh.

## Rollback khi cần khôi phục

Rollback tạo deployment mới ngay, gửi 100% traffic của Worker sang version đã chọn và áp dụng trên các route/domain của Worker. Lệnh chỉ được diễn tập sau khi xác nhận đúng Worker và version, vì chạy nhầm sẽ đổi bản người dùng đang truy cập.

1. Kiểm tra lại deployment và version đang active trong Cloudflare Dashboard.
2. Chọn version đã biết ổn định. Version trước tại thời điểm ghi tài liệu là `b8bdbac0-119f-4c81-89fb-b00a1aedadf6`; đây chỉ là thông tin tham khảo, phải đọc trạng thái mới nhất trước khi rollback.
3. Trong PowerShell, từ thư mục gốc repo, chạy lệnh có prompt xác nhận:

   ```powershell
   pnpm exec wrangler rollback b8bdbac0-119f-4c81-89fb-b00a1aedadf6 --name tttemple-vite-test --config poc/vite-preview/wrangler.jsonc
   ```

4. Đọc prompt và xác nhận Worker/version trước khi tiếp tục. Sau đó kiểm tra deployment active và tải lại trang thử.

Rollback không khôi phục hoặc đảo dữ liệu ở tài nguyên được bind. Với ứng dụng có static assets, cần kiểm tra khả năng lệch phiên bản giữa trang đã mở trước đó và các asset được tải sau rollback. Lệnh trên chưa được chạy trong lần cập nhật tài liệu này.

Tham khảo hướng dẫn chính thức về [Worker rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/) và [Wrangler rollback](https://developers.cloudflare.com/workers/wrangler/commands/workers/#rollback).
