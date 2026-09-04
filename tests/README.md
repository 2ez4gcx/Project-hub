# Kiểm thử

## Cách nhanh nhất — một lệnh duy nhất

    node tests/kiem-tra-tat-ca.mjs

Script tự lo mọi thứ: tạo thư mục dữ liệu tạm, bật/tắt máy chủ thử nghiệm,
chạy đủ 3 bộ test, kiểm tra HTTPS, đối chiếu hai bản nội bộ/NAS và kiểm tra
gói phân phối có mới hơn mã nguồn không.

Kết quả cuối in rõ "ĐỦ ĐIỀU KIỆN PHÁT HÀNH" hoặc "CHƯA ĐẠT" (thoát mã 1).
Dùng script này làm cổng kiểm soát trước mỗi lần phát hành — nhất là khi
CI trên GitHub không dùng được.

## Chạy từng bộ (khi cần soi lỗi cụ thể)

1. Khởi động máy chủ test với thư mục dữ liệu TRỐNG (đừng trỏ vào dữ liệu thật):

       DATA_DIR=/duong/dan/trong PORT=3211 SETUP_CODE=TEST123 node "Chạy nội bộ/server.js"

2. Chạy theo thứ tự:

       node tests/test-authz.mjs          # phân quyền server-side
       node tests/test-nghiep-vu.mjs      # đồng bộ 2 client, tệp, BOQ, CAS tài chính
       node tests/test-restore.mjs <DATA_DIR> 3299   # diễn tập khôi phục

   Đổi địa chỉ máy chủ bằng biến TDA_BASE nếu dùng cổng khác.

3. Đo tải (chỉ khi đụng phần đồng bộ) — cần máy chủ MỚI, dữ liệu trống:

       node tests/test-tai.mjs 25 5000 60

Kỳ vọng: mọi script in "0 fail". Số ca chính xác xem ở output, đừng ghi cứng
vào tài liệu.
