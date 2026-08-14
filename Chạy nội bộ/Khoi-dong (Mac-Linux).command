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
# Có chứng chỉ trong data/tls thì máy chủ chạy HTTPS -> mở đúng địa chỉ https
URL="http://localhost:3000"
if [ -f "data/tls/server.pfx" ] || [ -f "data/tls/cert.pem" ]; then URL="https://localhost:3000"; fi
( sleep 1; (open "$URL" || xdg-open "$URL") >/dev/null 2>&1 ) &
node server.js
