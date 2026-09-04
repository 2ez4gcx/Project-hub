# Kiểm thử

## Cách nhanh nhất — một lệnh duy nhất

```bash
node tests/kiem-tra-tat-ca.mjs
```

Script tự lo mọi thứ: tạo thư mục dữ liệu tạm, bật/tắt máy chủ thử nghiệm, chạy **toàn bộ**
các bộ test, kiểm tra HTTPS, đối chiếu hai bản nội bộ/NAS và kiểm tra gói phân phối có mới
hơn mã nguồn không.

Kết quả cuối in rõ **"ĐỦ ĐIỀU KIỆN PHÁT HÀNH"** hoặc **"CHƯA ĐẠT"** (thoát mã 1).
Dùng script này làm cổng kiểm soát trước mỗi lần phát hành. CI trên GitHub gọi đúng lệnh
này, nên máy cá nhân và CI không bao giờ lệch nhau.

## Các bộ test

| Tệp | Kiểm cái gì |
|---|---|
| `test-authz.mjs` | Phân quyền phía máy chủ theo từng trường: ai sửa được gì, ai duyệt được gì, chặn xóa/sửa lén |
| `test-nghiep-vu.mjs` | Đồng bộ hai máy trạm, xung đột revision, round-trip tệp biên bản và số liệu tài chính |
| `test-hien-truong.mjs` | Nhật ký thi công trùng ngày (409), luật báo cáo ngày |
| `test-audit-trail.mjs` | Nhật ký kiểm toán do máy chủ tự ghi — kể cả khi máy trạm không ghi "Lịch sử" |
| `test-loi-ton-dong.mjs` | Punch list: vòng đời lỗi, người được giao không tự hạ mức độ / nới hạn |
| `test-nghiem-thu.mjs` | Bảng kiểm nghiệm thu, sửa biên bản đã lập, thùng rác hồ sơ 90 ngày |
| `test-nhat-ky-cau-truc.mjs` | Nhật ký có bảng nhân lực/máy/khối lượng, luồng Nháp → Đã nộp → Duyệt, khóa sau duyệt |
| `test-thanh-vien-du-an.mjs` | Thành viên theo dự án: lọc khi đọc, **ghép lại khi ghi** để không mất dữ liệu ẩn |
| `test-chi-phi-qs.mjs` | Quyền xem/sửa tài chính, phát sinh VO, ngân sách – chi phí, đề nghị thanh toán, khóa kỳ |
| `test-hoi-quy-lan2.mjs` | Các lỗi hồi quy R1–R10 của báo cáo audit lần 2 — đường lỗi mà bộ test cũ không phủ |
| `test-restore.mjs` | Khôi phục dữ liệu từ snapshot |
| `test-lich-gantt.mjs` | Logic lịch & CPM: kéo k ngày = k ngày, 4 loại phụ thuộc, lag, lịch làm việc, mốc |
| `test-gop-xung-dot.mjs` | Gộp ba chiều khi hai người lưu cùng lúc — không được mất thao tác của ai |

Hai tệp cuối và `test-chi-phi-qs` không cần máy chủ: chúng trích thẳng hàm từ
`Chạy nội bộ/ProjectManager.jsx` để chạy, nên nếu ai sửa thuật toán mà quên sửa test thì
test hỏng ngay — đúng ý đồ.

`test-tai.mjs` là script **đo tải** (không nằm trong cổng kiểm soát), chạy tay khi đụng vào
phần đồng bộ.

## Chạy từng bộ (khi cần soi lỗi cụ thể)

1. Khởi động máy chủ test với thư mục dữ liệu **TRỐNG** (đừng trỏ vào dữ liệu thật):

   ```bash
   DATA_DIR=/duong/dan/trong PORT=3211 SETUP_CODE=TEST123 node "Chạy nội bộ/server.js"
   ```

2. Chạy `test-authz.mjs` **trước tiên** — nó tạo bộ tài khoản và dữ liệu mẫu mà các bộ khác dùng:

   ```bash
   node tests/test-authz.mjs
   node tests/test-hoi-quy-lan2.mjs
   ```

Mọi bộ đều nhận `TDA_BASE` hoặc tham số dòng lệnh đầu tiên để trỏ sang cổng khác.

## Viết thêm test

- Thay đổi chạm tới **phân quyền, tiền bạc, hoặc xóa dữ liệu** thì bắt buộc kèm ca kiểm thử.
- Đặt tên ca bằng tiếng Việt, mô tả **hành vi người dùng thấy**, không mô tả hàm nội bộ.
- Tham số thứ ba của `ok()` là phần in ra khi hỏng — hãy đưa vào đó giá trị thật đo được,
  vì đó là thứ duy nhất bạn có khi test hỏng trên CI.
- Test phải **độc lập thứ tự chạy**: dùng id dự án riêng thay vì mượn dữ liệu của bộ khác.
