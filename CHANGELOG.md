# Lịch sử phiên bản — Trạm Dự Án

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
