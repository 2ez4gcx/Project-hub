#!/bin/sh
# ============================================================
#  TRẠM DỰ ÁN — CẬP NHẬT LÊN BẢN MỚI NHẤT (NAS / Linux)
#  1. Sao lưu thư mục data  ->  data-saoluu-YYYYMMDD-HHMM
#  2. Tải gói mới nhất từ GitHub Releases
#  3. Chép đè mã chương trình (KHÔNG đụng thư mục data)
#  4. Nhắc khởi động lại (docker compose restart, hoặc chạy lại node server.js)
#  Cần: curl, unzip. Chạy:  sh cap-nhat.sh
# ============================================================
set -e
cd "$(dirname "$0")"
URL="https://github.com/2ez4gcx/Project-hub/releases/latest/download/tram-du-an-nas.zip"
STAMP=$(date +%Y%m%d-%H%M)
TMP="${TMPDIR:-/tmp}/tram-du-an-capnhat"

echo
echo " ===== TRẠM DỰ ÁN — CẬP NHẬT PHIÊN BẢN ====="
echo
if [ -d data ]; then
  echo " [1/4] Sao lưu thư mục data -> data-saoluu-$STAMP ..."
  cp -a data "data-saoluu-$STAMP"
else
  echo " [1/4] Chưa có thư mục data — bỏ qua sao lưu."
fi

echo " [2/4] Tải gói mới nhất ..."
rm -rf "$TMP"; mkdir -p "$TMP"
curl -L --fail --silent --show-error -o "$TMP/goi.zip" "$URL"

echo " [3/4] Giải nén và chép đè mã chương trình (giữ nguyên data) ..."
unzip -q -o "$TMP/goi.zip" -d "$TMP/ra"
rm -rf "$TMP/ra/data"
cp -a "$TMP/ra/." .
rm -rf "$TMP"

echo " [4/4] Xong. Phiên bản mới:"
grep '"version"' package.json
echo
echo " Khởi động lại máy chủ để chạy bản mới:"
echo "   - Docker:   docker compose restart"
echo "   - Node:     dừng tiến trình cũ rồi chạy lại  node server.js"
echo " Bảo mọi người bấm Ctrl+F5 một lần. Bản sao lưu dữ liệu: data-saoluu-$STAMP"
echo
