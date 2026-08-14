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
( sleep 1; (open http://localhost:3000 || xdg-open http://localhost:3000) >/dev/null 2>&1 ) &
node server.js
