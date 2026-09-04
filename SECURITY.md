# Chính sách bảo mật — Trạm Dự Án

## Báo lỗ hổng

**Đừng mở Issue công khai cho lỗ hổng bảo mật.** Gửi riêng cho tác giả:

- Email: huukhuongxd@gmail.com
- Hoặc qua <https://khuongdoan.com/>

Xin kèm: mô tả lỗ hổng, các bước tái hiện, phiên bản bạn thử (`/api/config` trả về
`version`), và mức ảnh hưởng bạn ước lượng. Tôi sẽ phản hồi trong vòng **7 ngày**.

Đây là phần mềm miễn phí do một người phát triển — không có tiền thưởng săn lỗi, nhưng
người báo lỗi sẽ được ghi nhận trong CHANGELOG nếu muốn.

## Phiên bản được vá

Chỉ **bản phát hành mới nhất** được vá. Xem [CHANGELOG.md](CHANGELOG.md) để biết bản hiện tại.

## Mô hình đe dọa — phần mềm này được thiết kế cho cái gì

Trạm Dự Án được thiết kế để chạy trong **mạng nội bộ của một công ty** (một máy tính hoặc
một NAS), nơi mọi người dùng đều là nhân viên đã được cấp tài khoản.

### Đã có sẵn

- Mật khẩu băm kèm salt; không lưu mật khẩu dạng chữ.
- Khóa đăng nhập 15 phút sau 5 lần sai (tính theo IP + email).
- Phiên đăng nhập lưu dạng **băm** trong `data/sessions.json` — lộ tệp cũng không đăng nhập được.
- Phân quyền **phía máy chủ theo từng trường**, không tin máy trạm: người được giao việc chỉ
  sửa được % và trạng thái việc của mình; lịch sử không sửa/xóa được; báo cáo ngày có luật riêng.
- Thành viên theo dự án: máy chủ lọc dữ liệu khi đọc và ghép lại khi ghi.
- Nhật ký kiểm toán `audit.jsonl` **chỉ-thêm**, do máy chủ tự sinh — không xóa được qua ứng dụng.
- Chặn tải lên các đuôi tệp nguy hiểm (`.html`, `.js`, `.svg`, `.php`, `.exe`…), giới hạn 40 MB.
- Không dùng cookie (token đi trong header `Authorization`) nên **không có bề mặt CSRF**.
- Không đặt header CORS, nên trang web khác không đọc được API từ trình duyệt.
- Ghi tệp nguyên tử + `.bak`; snapshot hằng ngày giữ 14 ngày; thùng rác 90 ngày cho hồ sơ.
- HTTPS tự bật khi có chứng chỉ trong `data/tls`.

### CHƯA có — biết trước để cân nhắc

- **Không có xác thực hai lớp (2FA).**
- **Không giới hạn tần suất** cho các API ngoài đăng nhập.
- **Không có tường lửa ứng dụng.**
- Token lưu trong `localStorage`: một lỗ hổng XSS sẽ lấy được token.
- Chưa có kiểm định bảo mật độc lập (pentest).

### Khuyến nghị triển khai

| Cách chạy | Mức rủi ro | Việc cần làm |
|---|---|---|
| Một máy trong văn phòng | Thấp | Bật HTTPS nội bộ, sao lưu thư mục `data` |
| NAS trong mạng công ty | Thấp | Thêm: NAS sao lưu tự động ra ngoài (Hyper Backup) |
| NAS + **VPN** cho công trường | Thấp | Cách đúng để người ngoài văn phòng dùng |
| **Mở ra Internet** | **Cao** | Bắt buộc làm đủ mục 5 của "HƯỚNG DẪN 3 — Đưa lên hosting và tên miền": HTTPS, tường lửa chỉ mở 22/80/443, khóa SSH, fail2ban, mật khẩu ≥ 12 ký tự, xem nhật ký kiểm toán hằng tháng |

**Không mở thẳng cổng 3000 ra Internet** bằng port forwarding. Nếu dữ liệu dự án thuộc loại
nhạy cảm (quốc phòng, hạ tầng trọng yếu), hãy dùng NAS + VPN thay vì hosting.

## Dữ liệu của bạn nằm ở đâu

Toàn bộ trong thư mục `data/` cạnh `server.js` — không có máy chủ nào của tác giả, không có
dịch vụ đám mây, không gửi số liệu đi đâu. Phần mềm chỉ kết nối ra ngoài khi **bạn** cấu hình
SMTP để gửi email nhắc việc và email sao lưu.
