# Trạm Dự Án

Phần mềm quản lý dự án cho công ty xây dựng, chạy trong mạng nội bộ / NAS
(kiểu Asana nhưng có nghiệp vụ xây dựng: nhật ký thi công, biên bản, duyệt
việc 2 cấp, đường găng, BOQ – khối lượng – chi phí). Đăng nhập bằng
email + mật khẩu, dữ liệu nằm hoàn toàn trên máy của công ty.

## Cấu trúc

```
Chạy nội bộ/        bản chạy trên 1 máy Windows/Mac trong công ty
Chạy trên NAS/      bản chạy Docker trên NAS Synology
  server.js         máy chủ (Node thuần, không framework) — API + phân quyền + license
  ProjectManager.jsx  toàn bộ giao diện React (nguồn chuẩn ở "Chạy nội bộ")
  public/app.js     bundle đã build từ ProjectManager.jsx — KHÔNG sửa tay
build/              npm run build  -> dựng lại app.js cho CẢ 2 bản + đóng dấu hash
                    npm run dong-goi -> đóng gói 2 zip phân phối vào ../files
tests/              test tự động (phân quyền 36 ca, license 8 ca) — chạy trong CI
CHANGELOG.md        lịch sử phiên bản
```

Hai bản "Chạy nội bộ" và "Chạy trên NAS" phải giống nhau từng byte về mã
nguồn (server.js, ProjectManager.jsx, shim.js, app.js) — CI sẽ chặn nếu lệch.
`build/build.mjs` tự đồng bộ khi build.

## Làm việc với mã nguồn

```bash
# Sửa giao diện: sửa "Chạy nội bộ/ProjectManager.jsx" rồi build
cd build && npm install && npm run build

# Chạy thử
cd "Chạy nội bộ" && node server.js
# (dữ liệu test riêng: DATA_DIR=/duong/dan/khac PORT=3211 SETUP_CODE=TEST123 node server.js)

# Test (cần server test đang chạy như dòng trên)
node tests/test-authz.mjs
node tests/test-license.mjs /duong/dan/DATA_DIR

# Đóng gói giao khách (2 zip vào ../files)
cd build && npm run dong-goi
```

## Kiến trúc nhanh

- **Đồng bộ dữ liệu**: client giữ cả khối state, ghi qua `POST /api/kv`
  (key `pm_shared_v3`) với `rev` tăng dần; máy chủ thẩm định diff và chặn
  thay đổi vượt quyền (`validateSharedWrite`). Poll 4 giây chỉ hỏi
  `GET /api/kv/rev`.
- **Quyền xem tệp theo dự án** (`canViewProjectFiles`): chủ sở hữu / lãnh
  đạo / teamlead / siteLoggers / người có việc được giao; công tắc
  `features.fileByProject`.
- **Chi phí + BOQ**: lưu riêng `finance.json`, gate `canViewFinance`;
  BOQ theo kỳ nghiệm thu, không lưu lũy kế.
- **License**: mã gia hạn ký Ed25519 (khóa riêng KHÔNG có trong repo);
  bản dùng thử ký HMAC, lưu 3 bản, chống lùi đồng hồ. Hết hạn = CHỈ ĐỌC,
  không bao giờ xóa dữ liệu.
- **An toàn dữ liệu**: ghi file nguyên tử + .bak; snapshot hằng ngày vào
  `data/snapshots` (giữ 14); email sao lưu thứ Bảy (không kèm mật khẩu).
- **HTTPS**: đặt chứng chỉ vào `data/tls` là tự bật (PEM hoặc PFX).

Tác giả: Khuong Doan. Repo private — không phân phối mã nguồn.
