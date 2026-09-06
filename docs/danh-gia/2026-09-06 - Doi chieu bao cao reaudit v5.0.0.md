# Đối chiếu "Báo cáo reaudit toàn bộ Trạm Dự Án 5.0.0"

Ngày 06/09/2026. Báo cáo gốc: `audit-output-2026-09-06-v5/Bao cao reaudit toan bo Tram Du An 5.0.0.docx`
(do một phiên kiểm tra độc lập tạo; kèm probe.cjs, probe-results.json, static-results.json).
Bản đối chiếu này đọc lại mã tại đúng các dòng báo cáo dẫn (server.js sha256 `4b9ab7cc…` trùng bản
audit, ProjectManager.jsx `414f2982…` trùng) và chạy lại các kiểm tra tĩnh cần thiết. **Chưa sửa gì.**

## Kết luận ngắn

- **17/19 nhóm là đúng hoặc đúng phần lớn.** Cơ chế tái hiện của báo cáo (chạy `requestHandler` thật
  trong VM, giữ một yêu cầu chưa gửi hết thân) là hợp lệ; đọc mã xác nhận đúng nguyên nhân từng điểm.
- **1 nhóm sai về bằng chứng (F11):** advisory `GHSA-2x7j-588g-ccc2` không tồn tại trên GitHub (404),
  `npm audit` với nodemailer 9.0.5 báo 0 lỗ hổng. Phần Node 20 hết hạn hỗ trợ và lockfile ghi 3.11.1 là đúng.
- **1 nhóm là hạn chế thiết kế đã biết, không phải lỗi mới (F13):** snapshot không kèm ảnh/tệp.
- Mức "9 Cao" là nói quá. Theo điều kiện khai thác thật: **4 Cao** (F01, F03, F06, N01), **10 Trung
  bình**, còn lại thấp hoặc thuộc lộ trình.
- 561 ca test không bắt được điểm nào ở đây vì bộ test kiểm đường thuận và luật đã biết; các probe của
  báo cáo là kiểm đối kháng (đua, thiếu trường, id trùng, lỗi đĩa). Nên gộp probe vào cổng kiểm soát.
- Hai điểm đáng chú ý nhất về mặt sản phẩm: **N03** (PWA/offline chưa bao giờ chạy trên bất kỳ máy nào vì
  CSP chặn script nội tuyến) và **N02** (xung đột tài chính giả xảy ra ở trường hợp PHỔ BIẾN chứ không
  phải hiếm — hai người cùng thấy A và B, một người sửa A, người kia sửa B → người sau bị 409).

## Bảng đối chiếu

| Mã | Báo cáo nói | Đối chiếu mã | Kết luận | Mức lại | Cách sửa (phác) |
|---|---|---|---|---|---|
| F01 | Đua khi cài đặt: yêu cầu setup giữ thân chưa gửi, sau khi chủ thật tạo xong thì yêu cầu chờ với mã sai vẫn 200 và ghi đè accounts.json | server.js 1399–1423: kiểm `accts.length` và `SETUP_CODE` **trước** `await readBody`; sau await `SETUP_CODE` đã bị xóa nên `if (SETUP_CODE && …)` bỏ qua; `saveAccounts([acc])` ghi đè | **Đúng** | Cao (chỉ trong cửa sổ cài đặt lần đầu, kẻ tấn công phải ở trong mạng lúc đó) | Chụp `SETUP_CODE` vào biến cục bộ trước await; sau await kiểm lại `loadAccounts().length === 0` và so mã với biến đã chụp; thêm cờ "đang setup" chặn song song |
| F02 | Thiếu `rev` vẫn ghi được, bỏ qua CAS | `sachKhoiChung` cho phép rev undefined; CAS chỉ so khi cả hai là số | **Đúng** | Trung bình (client luôn gửi rev; chỉ gọi tay; luật phân quyền vẫn áp) | `rev` bắt buộc là số nguyên hữu hạn, thiếu → 400 `missing_rev`; máy chủ tự gán `rev = cur.rev + 1` khi lưu |
| F03 | Nhánh việc lặp cho nhân viên không quyền giao việc tạo việc mới nội dung tùy ý | 989–998: chỉ kiểm tiêu đề + chu kỳ + nguồn được đánh dấu `recurSpawned`, rồi `continue` — không kiểm trạng thái/%/người duyệt/dự án của bản mới; nguồn không cần `done` | **Đúng** | Cao (cần có sẵn một việc lặp cùng tiêu đề; tạo được việc "đã hoàn thành 100%" giả) | Việc sinh phải: nguồn `status === "done"`, kế thừa đúng projectId/sectionId/assignees/priority/approver/recur của nguồn, `status "todo"`, `workdone 0`, `completed false`, `approvedBy ""`, comments rỗng — lệch là từ chối. Về lâu dài: máy chủ tự sinh việc lặp |
| F04 | Hai việc cùng id lọt qua (Map lấy bản cuối, mảng lưu cả hai, client `find` đọc bản đầu) | 928–929 dùng Map; `sachKhoiChung` không kiểm trùng | **Đúng** | Trung bình | `sachKhoiChung` từ chối id thiếu/không phải chuỗi/trùng trong projects, sections, tasks, trash → 400 `bad_shape` |
| F05 | Tải ảnh/tệp trong lúc duyệt: danh sách đọc trước `await readRawBody`, ghi lại bản cũ → mất dấu duyệt; hai tệp biên bản song song chỉ giữ một | 1722–1744 (ảnh nhật ký), 1489–1508 (tệp biên bản): đúng như mô tả | **Đúng** | Trung bình (cần trùng thời điểm; nhưng là mất dữ liệu thật) | Sau `readRawBody` đọc lại danh sách, tìm lại bản ghi, kiểm lại quyền/khóa rồi mới push + save. Áp cho cả taskfiles/upload |
| F06 | Ghi đĩa hỏng vẫn trả 200, cache giữ giá trị chưa lưu | 83–90 `writeJsonAtomic` trả `false`; `saveData/saveFinance/saveRecords/saveSiteLogs…` không kiểm | **Đúng** | Cao về vận hành (NAS đầy đĩa là mất dữ liệu âm thầm) | `writeJsonAtomic` ném lỗi khi cả hai cách ghi hỏng; các `saveX` để lỗi lan lên → `safeHandler` (dòng 2222) đã trả 500 sẵn; chỉ cập nhật cache **sau** khi ghi thành công; client hiện thông báo "chưa lưu" |
| F07 | (a) Người lập bị gỡ khỏi dự án vẫn xóa được biên bản. (b) Dự án vào thùng rác → Teamlead ngoài dự án đọc được hồ sơ | (a) `canDeleteRecord` chỉ so người tạo, không gọi `canRecordProject`. (b) `canViewProjectFiles` chỉ tìm trong `projects`, không thấy → `me.isTeamlead` → true | **Đúng cả hai** | Trung bình | (a) xóa/khôi phục phải qua `canRecordProject`. (b) tìm dự án cả trong `trash[].project`; không xác định được dự án → từ chối mặc định |
| F08 | `reset-password.js` không thu hồi phiên cũ | Trong app `/api/password` có `revokeTokens`; công cụ CLI chỉ đổi salt/hash; sessions.json vẫn hiệu lực | **Đúng** | Trung bình-thấp | Gắn phiên với "phiên bản mật khẩu" (lưu 16 ký tự đầu của hash vào bản ghi phiên; `authOf` so lại) — reset bằng CLI hay đổi trong app đều tự vô hiệu phiên cũ, kể cả khi máy chủ đang chạy |
| F09 | Hàng đợi offline dùng chung theo trình duyệt, không theo tài khoản; xung đột là bỏ nháp; tài chính chỉ xử lý 200/409 | Đúng theo mã client (`doLogout` không dọn `pm_pending_v4`) | **Đúng (đánh giá tĩnh)** | Thấp-Trung bình (máy chủ vẫn phân quyền; rủi ro là mất thao tác) | Khóa hàng đợi theo `máy chủ + id tài khoản`, xóa khi đăng xuất; giữ nháp khi lỗi và cho tải xuống |
| F10 | Tải tệp biên bản không kiểm `res.ok`; nhật ký báo lỗi ảnh nhưng không giữ id để thử lại; chưa có hạn mức tổng | ProjectManager.jsx 2269: `await fetch(...)` không kiểm; ảnh nhật ký có đếm `anhLoi` nhưng không giữ id | **Đúng** | Trung bình | Kiểm `res.ok` từng tệp, báo tên tệp lỗi, thử lại đúng hồ sơ. Hạn mức tổng theo dự án: tính năng sau |
| F11 | Nodemailer 9.0.5 dính GHSA-2x7j-588g-ccc2 (Cao); Node 20 hết hạn; lockfile ghi 3.11.1 | `gh api advisories/GHSA-2x7j-588g-ccc2` → **404**; `npm audit` → **0 lỗ hổng**. Node 20 hết hạn hỗ trợ từ 30/04/2026: đúng. Lockfile: đúng | **Sai phần advisory, đúng hai phần còn lại** | Thấp | Dockerfile `node:24-alpine` (CI đã chạy Node 24); nâng nodemailer lên 9.1.1 (hoặc 10.0.0) cho sạch; sửa metadata lockfile 5.0.0 |
| F12 | Docker: `COPY . .` không có `.dockerignore`, thiếu `USER`, cổng 3000 công bố, healthcheck HTTP cứng | Đúng: chưa có `.dockerignore`; build từ thư mục đã vận hành sẽ chép `data/` vào image (compose mount đè lúc chạy nhưng image vẫn chứa bản sao) | **Đúng** | Trung bình-thấp | Thêm `.dockerignore` (data, data-saoluu-*, .env, *.log, node_modules); healthcheck thử HTTPS rồi HTTP. `USER node` cần cân nhắc vì volume Synology thuộc uid khác — dễ làm hỏng cài đặt hiện có |
| F13 | Snapshot chỉ có JSON, không có cây ảnh/tệp; nằm cùng đĩa | Đúng theo mã 2432–2443 và email sao lưu | **Đúng, nhưng là thiết kế đã biết** | Lộ trình | "Sao lưu đầy đủ" có manifest + checksum + tệp đính kèm, nơi lưu ngoài máy chủ; diễn tập khôi phục sang thư mục trống |
| N01 | `expectedRev = 1e300` được nhận và đưa dự án B về bản cũ | 2062–2065: chỉ kiểm `typeof number`; `ghepTaiChinhTheoDuAn` coi mọi rev < số tương lai là không xung đột | **Đúng** | Cao (cần quyền Sửa chi phí; gọi tay) | `expectedRev` phải nguyên, ≥ 0, ≤ `curF.rev`; lớn hơn → 409 |
| N02 | Hai người cùng thấy A và B: người 1 sửa B, người 2 sửa A nhưng gửi cả khối → 409 cho B | Đúng: hàm ghép so `incoming` với `cur`, phần B cũ của người 2 khác B mới → bị coi là "định sửa B". Test Q6 chỉ phủ trường hợp B bị ẩn | **Đúng, và là trường hợp phổ biến** (mọi người có quyền Chi phí đều tải cả khối) | Trung bình (không mất dữ liệu, nhưng buộc tải lại nhập lại) | Máy chủ giữ lịch sử băm phần tài chính từng dự án theo rev (20 bản gần nhất/dự án); khi client cũ: nếu băm phần B của client trùng băm B **tại rev client đã tải** → client không đụng B → lấy bản máy chủ, không báo xung đột. Không cần đổi client |
| N03 | Đăng ký service worker nằm trong script nội tuyến; CSP `script-src 'self'` không nonce → bị chặn | index.html 38–43 + server.js 1388: đúng. **PWA chưa từng chạy trên máy nào**; đây cũng là lý do hai lần thử trước không đăng ký được | **Đúng** | Trung bình (tính năng chết im lặng, đã ghi trong tài liệu là có) | Đưa đoạn đăng ký vào `public/sw-register.js` nạp bằng `<script src>` (build stamp hash như shim.js); kiểm bằng dòng "PWA / service worker" trong Sức khỏe máy chủ |
| N04 | `cap-nhat.sh` bảo `docker compose restart` → chạy mã cũ | Đúng: dòng 42 in "docker compose restart"; README và HD2 ghi `up -d --build` nhưng script thì sai | **Đúng** | Trung bình (người làm theo script tưởng đã cập nhật) | Sửa thông điệp thành `docker compose up -d --build`; thêm bước xác minh `/api/config` sau khởi động |
| N05 | Bộ đóng gói chỉ loại `data/`, `.env`; nhận `data-saoluu-*/accounts.json`, `accounts.json` gốc, `.bak-YYYY` | build/dong-goi.mjs 19–35: đúng; script cập nhật tạo `data-saoluu-*` ngay trong thư mục gói | **Đúng (có điều kiện: đóng gói từ thư mục đã vận hành)** | Trung bình | Loại thêm `data-saoluu*`, `accounts.json`, `sessions.json`, `*.bak*`, `tls/`, `*.pem/*.pfx/*.key`, `snapshots/`; cổng kiểm soát quét zip theo mẫu tên nhạy cảm |
| N06 | Thông báo không lọc lại theo phạm vi dự án hiện tại | `/api/notifications` trả thẳng danh sách theo tài khoản | **Đúng** | Trung bình-thấp (đọc lại tiêu đề việc/tên dự án đã lưu, không đọc được hồ sơ) | Lọc `projectId` theo `phamViDuAn(me)` khi trả; kiểm quyền khi mở liên kết |
| — | Cảnh báo sức khỏe / tóm tắt tuần đánh dấu "đã gửi" trước khi gửi thành công; `/api/feedback` chưa giới hạn tần suất | server.js 714–734: đúng | **Đúng** | Thấp | Đánh dấu sau khi gửi xong, có thử lại; feedback 10 lần/người/giờ |

## Những chỗ báo cáo nói đúng nhưng cần đọc cho đúng

- "Chưa nên xác nhận an toàn để phát hành rộng": với F01, F03, F06, N01 còn mở thì kết luận này hợp lý
  cho môi trường có người dùng không tin cậy trong mạng. Với công ty nhỏ, người dùng nội bộ, rủi ro thực
  tế lớn nhất là **F06** (đĩa NAS đầy → tưởng đã lưu) và **N03** (hứa offline mà không có).
- Đo tải 15 người / 2.000 việc / 20 dự án đạt ngưỡng: khớp với đo của mình (pull p95 34 ms, write p95 68 ms).
- Hai bản nội bộ/NAS và hai ZIP khớp mã audit: đúng, xác nhận quy trình đóng gói hiện tại không lệch.

## Đề xuất cách xử lý (chưa làm)

Theo chỉ thị "sau này chỉ ra bản tính năng": gộp toàn bộ phần sửa vào **v5.1.0** cùng một tính năng đã
thấy thiếu khi chụp ảnh hướng dẫn (sửa biên bản sau khi lưu — máy chủ đã có `/api/records/update`,
giao diện chưa gọi). Thứ tự làm:

1. **Cổng kiểm soát trước:** đưa `probe.cjs` của báo cáo thành `tests/test-doc-lap.mjs` (16 ca) chạy
   trong `kiem-tra-tat-ca.mjs`, kỳ vọng ban đầu là **đỏ** — rồi sửa đến khi xanh. Không sửa gì trước khi
   có test đỏ.
2. Nhóm máy chủ, một lượt vá: F01, F02, F04, N01 (xác thực đầu vào); F03 (việc lặp); F05 (đọc lại sau
   upload); F06 (ghi hỏng → 500); F07 (phạm vi hồ sơ); N06 (lọc thông báo); N02 (băm theo rev); feedback
   rate limit; sched state.
3. Phiên: F08 (gắn phiên với phiên bản mật khẩu) — sửa `authOf`, `newToken`, `reset-password.js`.
4. Giao diện: N03 (`sw-register.js`), F10 (kiểm `res.ok` từng tệp), F09 (hàng đợi theo tài khoản, dọn khi
   đăng xuất), tính năng sửa biên bản.
5. Phát hành: N04 (`cap-nhat.sh`), N05 (`dong-goi.mjs` + quét zip trong cổng), F11/F12 (`node:24-alpine`,
   nodemailer 9.1.1, `.dockerignore`, healthcheck, lockfile 5.0.0).
6. F13 để lộ trình v5.2 (sao lưu đầy đủ có manifest).

Ước lượng: khoảng một ngày làm việc kèm test; diễn tập nâng cấp trên bản sao dữ liệu thật như v5.0.0.

**Lưu ý phát hành tài liệu này:** file này mô tả lỗ hổng chưa vá (F01, F03, N01) nên **chưa commit** lên
repo công khai; commit cùng đợt sửa v5.1.0 (SECURITY.md đã yêu cầu không công khai lỗ hổng trước khi vá).

## Kết quả xử lý (v5.1.0, cùng ngày)

| Mã | Trạng thái | Ghi chú |
|---|---|---|
| F01 F02 F03 F04 F05 F06 F07 F08 N01 N02 N06 | Đã sửa, có ca test | `tests/test-doc-lap.mjs` (54 ca, tự dựng máy chủ riêng) — đỏ trên v5.0.0, xanh trên v5.1.0 |
| F09 F10 | Đã sửa | hàng đợi offline theo tài khoản; kiểm `res.ok` từng tệp (biên bản, tệp công việc) |
| N03 | Đã sửa | `public/sw-register.js` + đóng dấu hash; ca test kiểm không còn script nội tuyến |
| N04 N05 F11 F12 | Đã sửa | `cap-nhat.sh`, `build/loai-tru.mjs`, Dockerfile Node 24 + healthcheck hai giao thức, `.dockerignore`, nodemailer 9.1.1, lockfile |
| Quan sát bổ sung | Đã sửa | sched state đánh dấu sau khi gửi; `/api/feedback` 10 lần/giờ |
| F13 | Lộ trình | sao lưu đầy đủ có manifest — v5.2 |

Tính năng đi kèm: sửa biên bản sau khi lưu (giao diện gọi `/api/records/update` với `expectedUpdatedAt`).
