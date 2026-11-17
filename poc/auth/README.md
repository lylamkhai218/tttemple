# POC xác thực — chỉ dữ liệu giả

Chạy `node poc/auth/run-local.mjs` để đo thử PBKDF2-HMAC-SHA-256 với 600.000 vòng và salt ngẫu nhiên. Các số đo là **thời gian thực trên máy**, không phải CPU time hoặc kết quả trên Cloudflare. Không nhập mật khẩu hay dữ liệu nhân viên; mã không có đăng nhập, lưu mật khẩu, API hoặc endpoint.

OWASP ưu tiên Argon2id khi có thể; PBKDF2 là một ứng viên tương thích Web Crypto để kiểm tra, chưa phải lựa chọn cuối cùng. OWASP nêu 600.000 vòng cho PBKDF2-HMAC-SHA-256; [Cloudflare hỗ trợ PBKDF2 qua Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/), nhưng khả năng chạy trong giới hạn của tài khoản phải được đo riêng. [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

Trước P2: kiểm tra quyền triển khai, tạo môi trường thử riêng; đánh giá Argon2id/scrypt và PBKDF2, lập kịch bản đo có giới hạn, chỉ dùng dữ liệu giả, kiểm tra CPU time, lỗi 1102 và độ trễ trong dashboard. Không công khai endpoint benchmark và không thay đổi Worker production đang hoạt động. Không giảm số vòng để vượt kiểm thử; nếu không đáp ứng, chọn giải pháp xác thực khác sau khi đánh giá.
