# Lịch sử phiên bản — Trạm Dự Án

## v3.11.1 — 17/08/2026 (theo báo cáo đánh giá 17/08)

Thực thi các mục "trong 7 ngày" của báo cáo đánh giá đợt 4:
- **Test nghiệp vụ mới** (tests/test-nghiep-vu.mjs, 12 ca): đồng bộ 2 client
  và xung đột revision (client sau nhận 409, pull rồi lưu lại thành công),
  round-trip tệp biên bản (đúng từng byte, đúng Content-Type), round-trip
  finance/BOQ và gate quyền tài chính.
- **Diễn tập khôi phục tự động** (tests/test-restore.mjs, 5 ca): chép bộ file
  dữ liệu sang DATA_DIR mới, khởi động máy chủ, đăng nhập bằng tài khoản cũ,
  dữ liệu nguyên vẹn — đã diễn tập cả từ bộ file đang chạy lẫn từ snapshot
  hằng ngày thật. Cả hai bộ test đưa vào CI (tổng 66 ca + HTTPS).
- Khóa phiên bản phụ thuộc runtime: package-lock.json cho cả 2 bản (đi kèm zip).
- **Nâng nodemailer 6.9 -> 9.0.5**: bản 6.x có 8 lỗ hổng đã công bố (SMTP
  command injection, CRLF injection, SSRF... — mức high). API phần mềm dùng
  không đổi; npm audit sau nâng cấp: 0 lỗ hổng.
- Cảnh báo vào security.log khi khối dữ liệu chung vượt 5MB (trần cứng 8MB).
- Sửa README ghi sai số ca test (36 -> tham chiếu CI, không ghi cứng nữa).

## v3.11.0 — 14/08/2026

### Đường cong S — % giá trị (tab BOQ & Khối lượng)
- Biểu đồ so KẾ HOẠCH (từ hạn chót các công việc liên kết với từng hạng mục)
  với THỰC HIỆN (giá trị lũy kế các kỳ nghiệm thu) theo thời gian, tính theo
  % tổng giá trị BOQ. Nhìn một phát biết dự án nhanh hay chậm về GIÁ TRỊ,
  không chỉ về số việc.

### Bộ mẫu dự án xây dựng đóng gói sẵn
- Hộp "Dự án mới" có nhóm "Mẫu có sẵn (xây dựng)": Thi công nhà phố (30 việc,
  6 giai đoạn), Fit-out văn phòng / nội thất (21 việc), Thiết kế nhà — hồ sơ
  (16 việc). Chọn mẫu là có ngay khung cột + danh sách công việc chuẩn ngành,
  sửa thoải mái như dự án thường.

### Kế hoạch gốc (baseline) trên Gantt
- Chủ sở hữu / Lãnh đạo bấm "Lưu kế hoạch gốc" trên view Dòng thời gian để
  chốt lịch hiện tại. Từ đó mỗi việc hiện thêm thanh xám mảnh (lịch gốc) và
  nhãn đỏ "+X ngày" khi trễ so với kế hoạch — bằng chứng trượt tiến độ cho
  họp giao ban và hồ sơ với chủ đầu tư.
- Máy chủ chặn thành viên thường tự sửa kế hoạch gốc (kể cả qua API).

## v3.10.0 — 14/08/2026

### Khép vòng nghiệp vụ giao – làm – duyệt
- **Thùng rác cho công việc**: xóa một việc giờ vào thùng rác (giữ 90 ngày,
  khôi phục được, kèm bình luận/tệp) thay vì mất vĩnh viễn như trước.
  Máy chủ BẮT BUỘC điều này — không lách được qua API. Xóa vĩnh viễn
  vẫn là quyền của Chủ sở hữu.
- **Trả về kèm lý do**: người duyệt (Teamlead/Lãnh đạo) có nút "Trả về"
  bên cạnh nút Duyệt — bắt buộc ghi lý do, việc quay về "Đang làm",
  lý do thành bình luận ⛔ và được ghi vào lịch sử thay đổi.
- **Email sự kiện** (cần cấu hình SMTP như email nhắc việc):
  • Được GIAO việc -> người được giao nhận email (việc, dự án, hạn, ai giao).
  • Việc bị TRẢ VỀ -> người làm nhận email kèm lý do.
  • Mỗi sáng (sau 7h, đổi bằng digestHour trong config): Chủ sở hữu +
    Lãnh đạo nhận BẢN TIN VIỆC QUÁ HẠN toàn công ty, mỗi ngày một email.
  Tắt tất cả bằng công tắc "Nhắc nhở & Email" trong Cài đặt như cũ.

## v3.9.1 — 14/08/2026 (hiệu chỉnh)

- File Khởi động (Windows/Mac) tự mở đúng địa chỉ https:// khi đã bật HTTPS
  (trước đó mở cứng http:// -> trang lỗi sau khi bật chứng chỉ).
- "CÓ GÌ MỚI.txt" viết lại đầy đủ v3.7 → v3.9, nêu rõ thay đổi hành vi
  về quyền xem tệp (v3.8) và cách mở lại chế độ cũ; sửa lỗi gõ "%%".
- CHANGELOG.md được đóng kèm vào gói zip giao khách.
- Thêm README.md cho repo (cấu trúc, quy trình build/test/đóng gói).

## v3.9.0 — 14/08/2026

### HTTPS cho bản chạy nội bộ
- Đặt chứng chỉ vào thư mục `data/tls` là máy chủ TỰ chạy HTTPS — mật khẩu
  và dữ liệu đi trong mạng nội bộ được mã hóa. Hỗ trợ cả `cert.pem + key.pem`
  (openssl) lẫn `server.pfx` (Windows).
- Kèm file **"Tạo chứng chỉ HTTPS (Windows).bat"**: bấm đúp là xong, dùng
  công cụ có sẵn của Windows, không cần cài gì; chứng chỉ tự bao gồm
  localhost + địa chỉ IP mạng nội bộ + tên máy, hạn 5 năm.
- Tài liệu mới "BẢO MẬT - Bật HTTPS (nội bộ).txt" (giải thích cảnh báo
  trình duyệt với chứng chỉ tự ký, cách làm trên Mac/Linux).
- Không có chứng chỉ thì chạy HTTP như trước; màn hình khởi động nhắc rõ
  đang bật hay chưa. Bản NAS Synology vẫn khuyến nghị reverse proxy như cũ.

## v3.8.1 — 14/08/2026

### Gia cố bản dùng thử
- Hạn dùng thử được KÝ SỐ và lưu 3 bản (config.json, tài khoản chủ,
  kho dữ liệu). Sửa số hạn ở đâu thì bản đó mất hiệu lực và các bản còn lại
  tự khôi phục; sửa cả 3 nơi thì phần mềm chuyển CHỈ ĐỌC (không cấp lại
  hạn mới cho dấu vết giả). Muốn xóa dấu vết để "làm mới" thì phải xóa cả
  dữ liệu công việc lẫn tài khoản.
- Chống lùi đồng hồ máy: lùi quá 3 ngày so với lần chạy gần nhất -> CHỈ ĐỌC.
- Bản đang dùng nâng cấp lên: hạn hiện tại tự chuyển sang dạng ký, không đổi hạn.
- Dữ liệu KHÔNG bao giờ bị xóa vì giấy phép — hết hạn chỉ chuyển chế độ CHỈ ĐỌC
  như trước nay.

## v3.8.0 — 14/08/2026

### Siết quyền xem tệp theo dự án (THAY ĐỔI HÀNH VI)
- Tệp đính kèm, biên bản và ảnh nhật ký thi công của một dự án giờ chỉ
  những người sau xem/tải được: Chủ sở hữu, Lãnh đạo, Teamlead, người được
  chỉ định ghi nhật ký, và người CÓ VIỆC ĐƯỢC GIAO trong dự án đó.
- Đính kèm tệp vào công việc cũng theo luật trên (trước đây ai đăng nhập
  cũng đính kèm được vào mọi việc).
- Ai không thuộc dự án sẽ thấy danh sách biên bản/nhật ký trống và bị chặn
  khi tải file (chặn ở máy chủ, không phải chỉ ẩn trên giao diện).
- Muốn quay lại chế độ mở như trước (mọi người xem hết): Cài đặt →
  tắt "Chỉ người trong dự án xem được tệp / biên bản / nhật ký".
- Dữ liệu công việc (tên việc, tiến độ, bình luận) vẫn chia sẻ chung như cũ.

## v3.7.3 — 14/08/2026

### BOQ trong báo cáo HTML xuất ra
- "Tải báo cáo" (HTML) giờ kèm bảng BOQ – khối lượng – chi phí của từng dự án:
  đủ dòng nhóm, KL hợp đồng / đơn giá / thành tiền, KL thực hiện lũy kế, %KL
  (đỏ khi vượt hợp đồng), giá trị thực hiện, dòng tổng, số kỳ nghiệm thu và
  đối chiếu với giá trị hợp đồng CĐT.
- Phần BOQ chỉ xuất hiện khi người tải báo cáo có quyền xem tài chính.

## v3.7.2 — 14/08/2026

### Gantt: kéo giãn thanh để đổi thời lượng
- Kéo **mép trái** thanh = đổi ngày bắt đầu; kéo **mép phải** = đổi hạn chót;
  kéo giữa thanh = dời cả lịch như trước.
- Trong lúc kéo giãn, thanh hiện số ngày thời lượng; có chặn không cho
  kéo mép trái vượt qua hạn (và ngược lại).
- Đường găng và cảnh báo vi phạm lịch tự tính lại ngay khi thả tay.

## v3.7.1 — 14/08/2026

### Sao lưu cục bộ hằng ngày (tự động, không cần cấu hình)
- Mỗi ngày máy chủ tự chép các file dữ liệu (công việc, tài khoản, chi phí,
  biên bản, nhật ký, cấu hình) vào `data/snapshots/YYYY-MM-DD/`, giữ 14 ngày
  gần nhất. Lỡ xóa nhầm giữa tuần: tắt máy chủ, chép file từ snapshot đè lại,
  bật lại — không cần chờ email sao lưu thứ Bảy.
- Tệp đính kèm/ảnh (uploads, nhatky-thi-cong) vẫn nên sao lưu bằng
  Hyper Backup của NAS như hướng dẫn.

### Quy trình
- CI trên GitHub: mỗi lần đẩy mã tự chạy 25 test phân quyền, kiểm tra cú pháp,
  và bắt buộc hai bản (nội bộ / NAS) giống nhau từng byte.

## v3.7.0 — 14/08/2026

### BOQ – Khối lượng – Chi phí (tab mới trong Chi phí)
- Bảng BOQ theo dự án: Mã, Tên công tác, ĐVT, KL hợp đồng, Đơn giá, Thành tiền;
  dòng nhóm (Phần I, II…) như BOQ thật.
- **Kỳ nghiệm thu**: khối lượng nhập theo từng kỳ, lũy kế luôn tính lại từ các kỳ
  (sửa kỳ cũ thì kỳ sau tự đúng) — cột đối chiếu form thanh toán:
  Lũy kế trước / Kỳ này / Tổng lũy kế / %KL / Giá trị thực hiện.
- **Liên kết hạng mục ↔ công việc**: nút gợi ý điền KL kỳ này từ % tiến độ
  các công việc liên kết.
- Nhập BOQ bằng cách dán từ Excel/CSV (tự nhận tiêu đề, dòng nhóm, số kiểu VN/EN).
- **Xuất CSV bảng nghiệm thu theo kỳ** — nộp CĐT hoặc nhập sang phần mềm chi phí.
- Đối chiếu tổng BOQ với giá trị hợp đồng CĐT; cảnh báo đỏ khi vượt KL hợp đồng.

### Gantt — đường găng (view Dòng thời gian)
- Tính **đường găng (CPM)** trên lịch thực tế: việc đỏ + nhãn "Găng" là việc
  trễ ngày nào cả dự án trễ ngày đó; tooltip hiện số ngày dự trữ cho việc thường.
- Cảnh báo **vi phạm lịch** (việc bắt đầu trước khi việc nó phụ thuộc xong)
  và **phụ thuộc vòng tròn**.
- Vạch "Hôm nay", chú giải màu, hàng sắp theo ngày bắt đầu.

## v3.6.0 — 14/08/2026

### Phân quyền phía máy chủ (giai đoạn 1)
- Máy chủ tự thẩm định mọi lần ghi dữ liệu chung và **chặn hành vi vượt quyền
  kể cả khi thao tác ngoài giao diện** (DevTools/API): xóa dự án (chỉ Chủ sở hữu),
  xóa vĩnh viễn thùng rác, xóa cột, xóa hàng loạt công việc, tự duyệt việc,
  sửa/xóa lịch sử thay đổi. Mọi lần từ chối ghi vào security.log.
- Bộ test tự động 25 ca trong `tests/`.

### Hiệu năng
- Đồng bộ 4 giây chỉ hỏi số phiên bản (`/api/kv/rev`), chỉ tải dữ liệu khi có
  bản mới — giảm hẳn băng thông với NAS.
- Không còn gọi máy chủ khi chưa đăng nhập.

## v3.5.1 — 14/08/2026 (đợt sửa sau audit)

### Bảo mật
- Trả file tải lên với Content-Type suy từ đuôi tên file (chặn giả dạng
  file PDF chứa trang HTML); CSP thêm `form-action 'self'`.
- `/api/kv` chỉ chấp nhận key hợp lệ và JSON hợp lệ.
- Email sao lưu hằng tuần **không còn gửi kèm mật khẩu SMTP** trong config.json.
- Quyền xóa biên bản/tệp so theo ID người tạo (tránh trùng tên).
- Chống CSV formula injection khi xuất Excel.

### Chống mất dữ liệu
- Trạng thái nhắc việc/sao lưu tách khỏi `data.json` (hết nguy cơ scheduler
  ghi đè thao tác người dùng khi đang gửi email; hết ghi đĩa mỗi phút).
- Client bỏ qua các lần lưu không có thay đổi thực — hết cảnh báo
  "conflict" oan khi nhiều người cùng dùng.

### Quy trình
- Thư mục `build/`: `npm install && npm run build` dựng lại `public/app.js`
  từ `ProjectManager.jsx` cho cả hai bản; tự đóng dấu hash vào `index.html`
  để trình duyệt không bao giờ chạy bản cũ.

## v3.5.0 — 13/07/2026

Bản gốc trước đợt audit (xem commit đầu tiên trong git).
