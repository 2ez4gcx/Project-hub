FROM node:20-alpine
RUN apk add --no-cache tzdata
ENV TZ=Asia/Ho_Chi_Minh
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev || true
COPY . .
ENV DATA_DIR=/app/data
VOLUME ["/app/data"]
EXPOSE 3000
CMD ["node", "server.js"]
