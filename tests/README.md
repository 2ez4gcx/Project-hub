# Cách chạy test phân quyền

1. Khởi động máy chủ test với thư mục dữ liệu TRỐNG (đừng trỏ vào dữ liệu thật):

   DATA_DIR=/duong/dan/trong PORT=3211 SETUP_CODE=TEST123 node "Chạy nội bộ/server.js"

2. Chạy test:

   node tests/test-authz.mjs

Kỳ vọng: 25/25 pass.
