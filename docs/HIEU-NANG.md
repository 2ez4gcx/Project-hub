# Hiệu năng & ngưỡng vận hành — Trạm Dự Án

Đo ngày 17/08/2026 (v3.12.x) bằng `tests/test-tai.mjs` — mô phỏng đúng hành vi
client: poll `/api/kv/rev` mỗi 4 giây ± jitter, pull cả khối khi có bản mới,
biên tập viên ghi mỗi 7–17 giây (xử lý 409 bằng pull-rồi-ghi-lại), kèm upload
tệp 200KB. Máy đo: Windows 11, Node 24 (một máy chạy cả server lẫn client —
số liệu LAN thật sẽ cộng thêm độ trễ mạng ~1–5ms).

## Kết quả

| Kịch bản | Khối dữ liệu | Poll rev p95 | Pull cả khối p95 | Ghi p95 | Lỗi | RAM server |
|---|---|---|---|---|---|---|
| 15 người · 20 dự án · 2.000 việc | 0,73 MB | 20 ms | 34 ms | 59 ms | 0 | 64 MB (đứng yên) |
| 25 người · 20 dự án · 5.000 việc | 1,74 MB | 44 ms | 70 ms | 113 ms | 0 | 65 MB (đứng yên) |

Tất cả dưới ngưỡng chấp nhận (rev < 200ms, pull/ghi < 2s) hàng chục lần.
Băng thông kịch bản nặng: ~430 MB/76s ≈ 5,7 MB/s tổng cho 25 client —
LAN gigabit dư sức, wifi công ty vẫn thoải mái.

## Xung đột ghi (409)

Với 8 biên tập viên ghi dồn dập (mỗi ~12 giây — dày hơn thực tế nhiều),
~45% lần ghi gặp 409 và client tự pull-ghi-lại thành công, không mất dữ liệu.
Thực tế văn phòng (vài giây một thao tác là hiếm) tỷ lệ này thấp hơn hẳn;
cảm nhận người dùng chỉ là thông báo "có người khác vừa cập nhật" thỉnh thoảng.

## Ngưỡng khuyến nghị (đặt theo số liệu)

- **Quy mô thoải mái**: ≤ 25 người dùng đồng thời, ≤ 5.000 việc đang mở.
- Khối dữ liệu chung: cảnh báo vào security.log khi vượt **5 MB**
  (~15.000 việc), trần cứng **8 MB**. Chạm cảnh báo thì dọn: xóa dự án đã
  xong (thùng rác), lịch sử tự giữ 500 mục, thùng rác tự dọn 90 ngày.
- Tệp đính kèm: tối đa **40 MB/tệp** (giới hạn sẵn có).
- Vượt xa quy mô trên (50+ người, vạn việc): cân nhắc tách dữ liệu theo
  dự án hoặc chuyển finance/tasks sang lưu trữ có giao dịch — chưa cần
  cho tệp khách hàng hiện tại.

## Bug tìm được nhờ đo tải

Đo tải phát hiện (và đã vá trong v3.12.1) bug vỡ UTF-8 trong `readBody`:
body lớn bị chunk giữa ký tự tiếng Việt 3-byte làm hỏng chữ ("Công việc" →
"Công vi❍c") — tồn tại từ bản đầu, chỉ lộ với payload lớn. Luật bảo vệ
lịch sử phía máy chủ đã chặn đứng các bản ghi hỏng này trước khi vào đĩa.

## Chạy lại phép đo

```bash
DATA_DIR=/tmp/tai PORT=3221 SETUP_CODE=TEST123 node "Chạy nội bộ/server.js" &
node tests/test-tai.mjs 25 5000 60
```
