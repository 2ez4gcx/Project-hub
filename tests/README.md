# Cách chạy test

1. Khởi động máy chủ test với thư mục dữ liệu TRỐNG (đừng trỏ vào dữ liệu thật):

   DATA_DIR=/duong/dan/trong PORT=3211 SETUP_CODE=TEST123 node "Chạy nội bộ/server.js"

2. Chạy theo đúng thứ tự (test giấy phép PHÁ trạng thái license của DATA_DIR nên chạy áp chót):

   node tests/test-authz.mjs          # phân quyền server-side
   node tests/test-nghiep-vu.mjs      # đồng bộ 2 client, round-trip tệp & BOQ, CAS tài chính
   node tests/test-license.mjs <DATA_DIR>
   node tests/test-restore.mjs <DATA_DIR> 3299   # diễn tập khôi phục (JSON + tệp đính kèm)

Kỳ vọng: mọi script in "0 fail". Số ca chính xác xem output — đừng ghi cứng vào tài liệu.
CI (.github/workflows/test.yml) chạy toàn bộ trên Node 20 và 24 mỗi lần push.
