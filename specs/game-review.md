# TTTemple — review game và cách dùng skill

Ngày 18/11/2026. Review dựa trên mã và cấu trúc sản phẩm; chưa nghiệm thu bằng điện thoại thật hoặc đo âm lượng/FPS.

## Sử dụng skill theo phạm vi

- `ui-ux-pro-max`: áp dụng cho HUD, cần điều khiển, khả năng chạm, tương phản, các trạng thái lỗi và tính tiếp cận; kiểm tra cả dọc/ngang và vùng an toàn màn hình.
- `design-taste-frontend`: dùng chọn lọc cho màn hình giới thiệu, giao diện ngoài game, nhận diện và vòng kiểm tra ảnh chụp. Không áp công thức landing page hoặc quy tắc dashboard một cách máy móc vào cảnh 3D.
- Hai skill không thay thế kiểm thử game-feel, camera, âm thanh, tối ưu GPU/mobile, thiết kế không gian 3D, bản quyền asset hay đồng bộ mạng.

## Ưu tiên kiểm tra và cải thiện

1. **Điều khiển:** trong `src/main.js`, vector di chuyển được chuẩn hóa nên joystick hiện chỉ điều khiển hướng; ngoài vùng chết, kéo nhẹ và kéo xa vẫn cùng tốc độ. Nếu muốn điều khiển analog phải giữ độ lớn vector và kiểm tra chuyển hướng, va chạm, nhả, hủy cảm ứng và mất focus trên iPhone/Android.
2. **Camera và đa chạm:** camera đang giữ trạng thái kéo chung, không theo từng pointer; cần kiểm tra xoay camera bằng một ngón trong khi dùng joystick bằng ngón khác, và hai lần chạm lên cảnh. Kiểm tra góc nhìn gần tường, cửa và lối vào/ra.
3. **Âm thanh:** tiếng chuông cộng nhiều oscillator và tăng gain; có nguy cơ méo/âm chồng nếu gõ liên tục. Đo mức đỉnh, kiểm tra trên loa điện thoại và chọn giới hạn âm lượng sau khi nghe mẫu, không khẳng định đã có méo nếu chưa đo.
4. **HUD:** kiểm tra cần tròn, nút nghi lễ, chữ và vùng chạm không chồng lên nhau ở màn hình nhỏ, dọc/ngang và khi ngón tay che khuất. Kiểm tra tương phản, khả năng đọc và cách dùng thay thế cho người không kéo được.
5. **Mỹ thuật:** nội điện hiện dùng ảnh Phật phẳng (`src/interior.js`), nhiều vật thể tạo bằng hình cơ bản. Cần thống nhất tham chiếu kiến trúc chùa Việt, tỷ lệ, ánh sáng, chất liệu và cách thể hiện tôn nghiêm với chủ dự án; sau đó thay dần asset có nguồn và giấy phép rõ ràng.
6. **Hiệu năng:** đo FPS, thời gian khung hình, số draw calls, bộ nhớ, pin/nhiệt trên iPhone và Android đại diện trước khi quyết định tối ưu. Không suy kết quả từ máy tính hay build thành công.

Các mục này là đề xuất, chưa phải bằng chứng chức năng đạt hay nghiệm thu mỹ thuật. Số hạt hiện chỉ lưu trên trình duyệt; chưa có đồng bộ hoặc nhiều người chơi.

## Bản thử sau review

- Cần điều khiển giữ độ lớn khi kéo, có vùng chết; camera theo pointer đang kéo. Có unit test vector, chưa kiểm chứng đa chạm trên điện thoại thật.
- Tiếng chuông dùng bộ nén chung và giới hạn nhịp gõ ngắn để giảm nguy cơ méo; chưa đo đỉnh và nghe kiểm tra trên loa điện thoại.
- Bố cục mobile đã chỉnh để phần hướng dẫn và hồ sơ không đè nhau; cần thử các kích thước và tư thế tay thực tế. Đã thêm đèn đá ở sân làm điểm dẫn hướng; đây chưa phải nghiệm thu mỹ thuật, ảnh Phật vẫn là 2D.
- Cần tiếp tục đo FPS, thời gian khung hình, pin và nhiệt trên iPhone/Android; chưa có bằng chứng từ thiết bị thật.
