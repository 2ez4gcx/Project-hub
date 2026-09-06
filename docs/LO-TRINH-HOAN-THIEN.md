# Lộ trình để Trạm Dự Án "hoàn thiện" — brainstorm 06/09/2026

> **Cập nhật cuối ngày 06/09:** theo yêu cầu "không phát hành v4.3.0, làm đến khi hoàn thiện tất cả", toàn bộ
> mục 3 (13 mục nghiệp vụ), 3 nợ thiết kế, mục 4.3, mục 5 (health, cập nhật một nút, service worker) và mục 6
> (nút Góp ý, thẻ Sức khỏe vận hành) **đã làm xong trong v5.0.0** (xem CHANGELOG). Chưa làm: kiến trúc 4.2 bước
> 1–5 (tách ghi theo thao tác) — giữ nguyên đề xuất, làm ở bản lớn sau khi thí điểm; U7 mới thêm aria-label
> cho nút icon có title, 66 chuỗi song ngữ nội dòng giữ nguyên (hai ngôn ngữ đều có, chỉ là nợ gọn mã).

Viết sau 6 lượt kiểm tra trong tháng 9 (`docs/danh-gia/`), khi mã đã ở trạng thái: 520 ca test xanh,
0 lỗi fuzz, không lỗi runtime giao diện với dữ liệu gãy, v4.3.0 đóng gói sẵn. Câu hỏi bây giờ không
còn là "còn lỗi gì" mà là **"hoàn thiện" nghĩa là gì với phần mềm này, và đi đường nào cho hết**.

---

## 1. "Hoàn thiện" có năm mặt — hiện đang ở đâu

| Mặt | Nghĩa cụ thể | Hiện trạng (06/09) | Còn thiếu |
|---|---|---|---|
| **1. Đúng và bền** | không mất dữ liệu, không rò rỉ, không từ chối sai, không vỡ với dữ liệu xấu, chịu tải | **Đạt** sau ba lượt kiểm tra toàn bộ: bất biến cho mọi vai trò, fuzz 979 yêu cầu, 25 người / 5.000 việc | giữ được nó qua các bản sau (mục 5) |
| **2. Đủ nghiệp vụ** | 5 vai trò làm trọn việc của mình trong phần mềm, không phải "làm tạm" | Audit lần 1 chấm PM 5,5 · QS 5,0 · HSE 3,0 · UX 5,5 · Kiến trúc 6,5. v4.1.0 đã lấp phần lớn: WBS, phụ thuộc đủ, VO, ngân sách/chi phí, đề nghị thanh toán, punch list, checklist, HSE, nhật ký có cấu trúc, thành viên dự án, audit máy chủ | **13 mục còn mở** (mục 3) |
| **3. Kiến trúc chịu được tương lai** | thêm tính năng không phải "viết thêm luật vào bộ lọc khối" | Đồng bộ **cả khối** `pm_shared_v3`: mọi quyền là luật so-diff, mọi phạm vi là ghép, xung đột theo 1 rev toàn công ty, offline chỉ giữ 1 bản chờ | đây là **gốc của 3 trong 4 lớp lỗi** đã gặp (mục 4) |
| **4. Vận hành không cần tác giả** | cài, cập nhật, sao lưu, khôi phục, biết khi nào hỏng — người quản trị bình thường làm được | Gói zip, NAS, Docker, snapshot 14 ngày, email sao lưu, reset mật khẩu, test khôi phục trong cổng | không biết khi trình duyệt của người dùng gặp lỗi; dữ liệu không có số phiên bản; cập nhật là "chép đè" |
| **5. Người thật dùng và quay lại** | công trường thật nộp nhật ký đúng hạn, QS lập kỳ nghiệm thu bằng phần mềm chứ không bằng Excel | có máy thí điểm; chưa có số đo | vòng phản hồi và chỉ số dùng (mục 6) |

**Kết luận ngắn:** mặt 1 đã xong; mặt 2 còn 13 mục, phần lớn vừa; mặt 3 là quyết định lớn duy nhất
còn lại; mặt 4 và 5 rẻ nhưng chưa ai làm.

---

## 2. Tại sao trước đây cứ vá đi vá lại (để không lặp)

1. **Kiểm theo kịch bản, không theo bất biến** → mỗi lần chỉ chạm một ô, ô bên cạnh lộ ra lần sau.
   Đã sửa: `docs/QUY-TAC-HOAN-CHINH.md` + ba bộ test lớp (bất biến, chịu lỗi, tĩnh) trong cổng.
2. **Client và máy chủ hiểu khác nhau về "mặc định"** (UI-5, L1): client chuẩn hóa rồi gửi lại nguyên
   khối, máy chủ so diff và tưởng là sửa. Đã vá bằng `chuanHoaViecSS`, nhưng đó là **triệu chứng** của
   kiến trúc khối — chừng nào client còn gửi cả khối, mỗi trường mới đều có nguy cơ này.
3. **Mỗi tính năng mới là một luật mới trong `validateSharedWrite`** (đã 7 luật, ~200 dòng) và một nhánh
   mới trong `ghepTheoPhamVi`. Luật là heuristic trên diff → luôn có cạnh chưa nghĩ tới (R1, N1, G1, K1).
4. **Không có tín hiệu từ hiện trường**: lỗi trình duyệt (màn hình trắng, "undefined") chỉ được thấy khi
   có người ngồi thử; người dùng thật gặp thì im lặng hoặc bỏ dùng.

---

## 3. Mặt 2 — 13 mục nghiệp vụ còn mở, xếp theo giá trị / công

| # | Mục | Vai trò | Giá trị | Công | Ghi chú |
|---|---|---|---|---|---|
| 1 | **P4 Kế hoạch – thực tế**: `actualStart` / `actualFinish` tách khỏi lịch kế hoạch; kéo Gantt không còn xóa dấu vết kế hoạch | PM | Cao | Vừa | nền cho SPI, S-curve, "trễ bao nhiêu ngày thật" |
| 2 | **P3 Baseline có phiên bản + ngày cắt dữ liệu**: BL0/BL1, % kế hoạch tại ngày so với % thực tế, SV/SPI, đường S | PM, GĐ | Cao | Vừa | báo cáo tuần cho Chủ đầu tư lấy từ đây |
| 3 | **Q4 Chuỗi khối lượng**: đã thi công (nhật ký, theo ngày, cộng dồn được) → nghiệm thu (kỳ) → xuất hóa đơn; gợi ý KL kỳ có trọng số | QS | Cao | Vừa | nhật ký đã có bảng khối lượng số, chỉ cần nối |
| 4 | **Q6 rev tài chính theo dự án** (hoặc theo `boq[projectId]`): QS dự án A và Kế toán dự án B không đè nhau | QS, KT | Vừa | Nhỏ | đi cùng mục 4.2 nếu làm kiến trúc; làm lẻ cũng được |
| 5 | **H4 Tiêu chí duyệt**: dự án khai "phải có checklist Đạt + ≥ 1 ảnh" mới được chuyển Chờ duyệt; người duyệt là QC được chỉ định, không chỉ Teamlead phòng ban | QC | Cao | Vừa | checklist và ảnh đã có, thiếu **ràng buộc** |
| 6 | **H6 Danh mục loại biên bản + số tự tăng theo dự án** (BBNT-01/2026-DA…) | QC | Vừa | Nhỏ | |
| 7 | **Q9/U4 Điện thoại: BOQ và Gantt dạng thẻ** (tên, KL hợp đồng, kỳ này, lũy kế, %; Gantt: tên + thanh + hạn + Găng) | Hiện trường | Cao | Vừa | ảnh chụp 375 px hiện chỉ thấy 3 cột |
| 8 | **U6 Thông báo đẩy** (Web Push qua service worker) cho 4 sự kiện: được giao việc, bị trả về, nhật ký cần duyệt, quá hạn — kèm **Zalo OA** nếu công ty đã dùng | Tất cả | Cao | Lớn | đi cùng PWA (mục 4.3) |
| 9 | **A11 Báo cáo "ai sửa gì tuần này"** từ `audit.jsonl` cho Chỉ huy trưởng; **N7** xoay audit theo tháng, không xóa | CHT | Vừa | Nhỏ | dữ liệu đã có |
| 10 | **VAT (N8)**: chốt công thức (VAT trên giá trị sau giữ lại / trước khấu trừ) theo mẫu Đề nghị thanh toán thực tế của công ty | QS, KT | Vừa | Nhỏ | cần **một mẫu thật** để chốt |
| 11 | **N5 hợp đồng khung** (không gắn dự án) hiện với người bị giới hạn; **N6** gộp mục lịch sử của mình khi bị giới hạn | QS | Thấp | Nhỏ | |
| 12 | **U7** 66 chuỗi `lang === "vi" ?` ngoài bảng T; `aria-label` cho nút icon | UX | Thấp | Nhỏ | `test-song-ngu` có thể ép về 0 |
| 13 | **A2** ảo hóa Danh sách 1.000+ việc (Gantt đã ảo hóa) | Hiệu năng | Thấp | Nhỏ | |

Cộng ba nợ thiết kế đã ghi: **F-4** CAS cho nhật ký / biên bản (`expectedUpdatedAt`, nhỏ); quyền "Tạo tài
khoản" tương đương tín nhiệm cao (ghi tài liệu, hoặc tách "chỉ tạo tài khoản" khỏi "phân quyền"); xóa
tài khoản dọn id khỏi `members` / `siteLoggers` / `assignees` (nhỏ, một hàm khi xóa).

---

## 4. Mặt 3 — quyết định kiến trúc: đi tiếp với khối, hay tách theo thực thể

### 4.1 Tại sao phải quyết
- 3/4 lớp lỗi của tháng 9 (phạm vi ghép, luật diff, mặc định client/máy chủ) đều do **client là bên
  quyết định nội dung cả khối** còn máy chủ chỉ **đoán** ý qua diff.
- Xung đột 409 toàn công ty và offline "một bản chờ" cũng từ đó. Q6, U6, P4 (ghi nhận thực tế từ hiện
  trường nhiều người) đều đụng trần này.
- Ngược lại, khối có ưu điểm thật: một tệp, một phụ thuộc, sao lưu = copy tệp, chạy trên NAS 2 GB RAM.

### 4.2 Đề xuất: **tách dần theo thao tác, không viết lại**
Giữ `data.json` và `GET /api/kv` (đọc cả khối vẫn rẻ: 5.000 việc = 86 ms). Chuyển **ghi** sang thao
tác có ý nghĩa, máy chủ là người quyết định:

| Bước | Việc | Điều gì biến mất |
|---|---|---|
| 1 | `POST /api/tasks/:id` với patch một việc (workdone, status, comment, subtask tick) — 4 thao tác chiếm >80 % lần lưu của nhân viên hiện trường | luật 5b trên diff cả khối cho các trường này; L1; xung đột giữa hai người sửa hai việc khác nhau |
| 2 | Máy chủ **tự ghi lịch sử và audit** từ thao tác (client không gửi `history` nữa; "Lịch sử thay đổi" đọc từ audit) | luật 6, R1/N6, 500 mục bị cắt, A10 |
| 3 | `POST /api/projects/:id` (tên, thành viên, siteLoggers, baseline), `POST /api/reports/:id` | luật 1/1b/K7, luật 7, ghép báo cáo theo dòng (N1/F2/K8) |
| 4 | rev theo dự án cho tài chính (Q6) và cho khối việc | 409 toàn công ty |
| 5 | Hàng đợi offline **theo thao tác** (mỗi thao tác một mục, phát lại lần lượt, xung đột chỉ ở đúng việc đó) + service worker | B2 dài hạn, U6 |

Mỗi bước đều **tương thích ngược** (client cũ vẫn gửi khối, máy chủ vẫn nhận), có thể phát hành lẻ.
Sau bước 3, `validateSharedWrite` chỉ còn là lưới an toàn cho đường cũ.

### 4.3 Việc nhỏ đi kèm, làm ngay được
- **Số phiên bản dữ liệu + di trú ở máy chủ** (`dataVersion` trong `data.json`; khi khởi động, máy chủ
  chuẩn hóa một lần theo `chuanHoaViecSS`). Từ đó client không còn phải điền mặc định — lớp lỗi L1/UI-5
  biến mất tận gốc, không chỉ được vá.
- **`POST /api/client-error`**: client gửi lỗi runtime (message, stack, view, rev) vào `security.log`;
  màn hình trắng ngoài công trường sẽ nhìn thấy được từ NAS.
- **Service worker tối thiểu** (cache app.js + trang) để mở được app khi mất mạng — điều kiện cho U6.

---

## 5. Mặt 4 — vận hành không cần tác giả

- **Cập nhật một nút:** script `cap-nhat.bat` / `cap-nhat.sh` tải zip theo phiên bản, sao lưu `data`,
  chép đè, khởi động lại, gọi `/api/config` kiểm tra phiên bản — thay cho "chép đè trừ thư mục data".
- **Kiểm tra sức khỏe:** `/api/health` (đĩa còn, kích thước data.json, tuổi snapshot, email lần cuối gửi
  được) + một dòng trong màn Cài đặt; email cảnh báo khi snapshot > 2 ngày hoặc data.json > 6 MB.
- **Diễn tập khôi phục** mỗi quý bằng `test-restore.mjs` trên bản sao lưu thật (không phải dữ liệu test).
- **Tài liệu cho quản trị viên không phải tác giả**: một trang "10 sự cố thường gặp và cách xử lý" —
  đã có `VẬN HÀNH & SỰ CỐ.txt`, rà lại sau các thay đổi mã lỗi mới.

---

## 6. Mặt 5 — người thật dùng: vòng phản hồi và chỉ số

- **Thí điểm có kịch bản:** 1 công trình, 4 người (CHT, kỹ sư hiện trường, QS, kế toán), 4 tuần, mỗi
  tuần 30 phút ngồi cùng. Ghi lại **mọi lần họ mở Excel/Zalo thay vì phần mềm** — đó là danh sách thiếu
  thật, hơn bất kỳ audit nào.
- **Nút "Góp ý" trong app** (gửi vào `security.log` hoặc email chủ sở hữu, kèm màn hình đang mở).
- **Chỉ số dùng đọc được từ dữ liệu sẵn có** (không cần telemetry): % nhật ký nộp trước 17:30 hôm sau;
  % báo cáo ngày đúng hạn; số kỳ nghiệm thu lập trong app / tổng kỳ; số việc có ảnh khi duyệt. Hiện một
  thẻ "Sức khỏe vận hành" trên Tổng quan cho Chủ sở hữu.
- **Hoàn thiện = không còn "làm tạm"**: khi 4 tuần thí điểm không phát sinh việc nào phải làm ngoài phần
  mềm, lúc đó gọi là 5.0.

---

## 7. Thứ tự đề xuất (một bản lớn mỗi tháng, giữa các bản không vá lẻ trừ lỗi mất dữ liệu)

| Bản | Nội dung | Vì sao xếp ở đây |
|---|---|---|
| **v4.3.0 — ngay** | 25 điểm đã vá, 520 ca | đã sẵn, chỉ chờ lệnh phát hành |
| **v4.4 — 2–3 tuần** | Đóng **toàn bộ nợ nhỏ**: F-4 CAS nhật ký/biên bản; dọn id khi xóa tài khoản; N5–N7; VAT (cần mẫu thật); U7 i18n + aria; A2; H6; Q6 rev theo dự án; `dataVersion` + di trú máy chủ; `/api/client-error`; service worker cache; báo cáo "ai sửa gì tuần này" | toàn bộ là việc nhỏ, làm một lượt là sạch danh sách "còn mở" lần đầu tiên kể từ tháng 7 |
| **v4.5 — 1 tháng** | Nghiệp vụ giá trị cao: **P4 + P3** (thực tế, baseline phiên bản, S-curve), **Q4** chuỗi khối lượng, **H4** ràng buộc duyệt, **Q9/U4** thẻ mobile | đây là những thứ CHT/QS/QC thấy ngay; không đụng kiến trúc |
| **v5.0 — quý 4** | Kiến trúc 4.2 bước 1–3 (patch theo việc, máy chủ ghi lịch sử, project/report endpoint) + **U6** thông báo đẩy + offline theo thao tác | sau khi nghiệp vụ ổn định, để không phải làm hai lần |
| **Song song từ v4.4** | Thí điểm 4 tuần (mục 6), nút Góp ý, thẻ "Sức khỏe vận hành" | dữ liệu quyết định v4.5 và v5.0 gồm gì |

**Điều kiện "xong" cho mỗi bản** không đổi: `node tests/kiem-tra-tat-ca.mjs` ĐỦ ĐIỀU KIỆN, thử từ zip
giải nén, fuzz 0 lỗi, giao diện không lỗi với dữ liệu gãy — và **không phát hành bản nào chỉ để vá bản
trước**, trừ khi mất dữ liệu.

---

## 8. Những ý chưa xếp lịch (để cân nhắc)

- Mã QR dán ở công trình: quét là mở thẳng nhật ký hôm nay của dự án đó trên điện thoại.
- Chế độ "màn hình công trường" (TV ở văn phòng công trường): Gantt tuần này + việc quá hạn + nhật ký
  hôm nay, tự làm mới.
- Nhập dự toán từ Excel (định dạng dự toán Việt Nam) thành BOQ một lần, thay vì dán từng bảng.
- Xuất hồ sơ hoàn công theo giai đoạn: gom nhật ký + biên bản + ảnh + checklist thành một PDF có mục lục.
- Tích hợp Zalo OA cho thông báo nếu công ty không dùng email; bản NAS chỉ cần token OA.
- Bản "nhiều công ty" trên một máy chủ (mỗi công ty một thư mục data) — chỉ khi có nhu cầu thật.
