FROM node:24-alpine
RUN apk add --no-cache tzdata
ENV TZ=Asia/Ho_Chi_Minh
WORKDIR /app
# Cài đúng phiên bản trong package-lock; lỗi cài đặt phải làm build FAIL
# (trước đây "npm install || true" nuốt lỗi -> email có thể biến mất âm thầm)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
ENV DATA_DIR=/app/data
VOLUME ["/app/data"]
EXPOSE 3000
# Máy chủ tự chuyển HTTPS khi data/tls có chứng chỉ -> healthcheck thử cả hai giao thức (F12, re-audit 06/09)
HEALTHCHECK --interval=60s --timeout=5s --start-period=15s CMD wget -q -O /dev/null --no-check-certificate https://localhost:3000/api/config || wget -q -O /dev/null http://localhost:3000/api/config || exit 1
CMD ["node", "server.js"]
