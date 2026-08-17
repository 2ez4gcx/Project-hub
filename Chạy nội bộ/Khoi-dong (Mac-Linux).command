#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "  Chua cai Node.js. Mo https://nodejs.org , tai ban LTS, cai dat roi chay lai file nay."
  echo ""
  read -p "  Nhan Enter de thoat..."
  exit 1
fi
echo "Dang khoi dong Tram Du An..."
# Đọc cổng từ data/.env nếu có (dòng PORT=...), mặc định 3000
APPPORT=$(grep -E "^PORT=" data/.env 2>/dev/null | tail -1 | cut -d= -f2)
APPPORT=${APPPORT:-3000}
# Có chứng chỉ trong data/tls thì máy chủ chạy HTTPS -> mở đúng địa chỉ https
URL="http://localhost:$APPPORT"
if [ -f "data/tls/server.pfx" ] || [ -f "data/tls/cert.pem" ]; then URL="https://localhost:$APPPORT"; fi
( sleep 1; (open "$URL" || xdg-open "$URL") >/dev/null 2>&1 ) &
node server.js
