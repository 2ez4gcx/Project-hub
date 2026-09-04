# BÁO CÁO AUDIT NĂM VAI TRÒ — TRẠM DỰ ÁN v4.0.0

**Ngày audit:** 04/09/2026 · **Mã nguồn:** commit `ef7096a` (v4.0.0, phần mềm tự do MIT) · **Phạm vi:** `D:\Quản lý dự án\Quản lý dự án` (server.js 1.308 dòng / 32 endpoint; ProjectManager.jsx 4.295 dòng; bộ test 74 ca)

**Vai trò đánh giá:** (1) Chỉ huy trưởng / Senior Construction PM · (2) Kỹ sư dự toán & kiểm soát chi phí (QS) · (3) Chuyên viên QA/QC & HSE · (4) Product/UX Designer B2B · (5) Kiến trúc sư phần mềm & CSDL

---

## 0. Kết luận điều hành

**Điểm tổng hợp 5,1/10.** Trạm Dự Án là một phần mềm **quản lý công việc** (kiểu Asana) có nền kỹ thuật tốt và đã được "may" thêm nghiệp vụ xây dựng ở mức khá: nhật ký thi công in được theo mẫu, BOQ theo kỳ nghiệm thu, đường găng, kế hoạch gốc, duyệt 2 cấp có trả về. Nhưng nếu đo bằng thước của một **phần mềm quản lý thi công** (WBS phân cấp, phụ thuộc FS/SS/FF/SF, kế hoạch – thực tế, khối lượng – chi phí – phát sinh, punch list, an toàn, làm việc ngoài hiện trường không có mạng) thì còn thiếu cả một tầng nghiệp vụ, và có **4 lỗi cần vá ngay** vì làm sai dữ liệu một cách âm thầm.

| # | Vai trò | Điểm /10 | Nhận định một dòng |
|---|---|---|---|
| 1 | Chỉ huy trưởng / PM thi công | **5,5** | Có đường găng, kế hoạch gốc, nhật ký in được; nhưng WBS phẳng (giai đoạn của mẫu bị ẩn), chỉ có phụ thuộc FS không lag, kéo Gantt lệch 1 ngày do múi giờ, nhật ký toàn ô chữ tự do |
| 2 | QS / Cost Controller | **5,0** | BOQ theo kỳ đúng tư duy IPC (lũy kế tính lại từ các kỳ, S-curve, CSV); nhưng không có phát sinh (VO), không có ngân sách chi phí – chi phí thực tế, không có vết sửa số, xung đột ghi toàn khối |
| 3 | QA/QC & HSE | **3,0** | Không có punch list, không có checklist nghiệm thu, không có Đạt/Không đạt, không có gì cho an toàn lao động; chỉ có duyệt/trả về công việc và ảnh đính kèm |
| 4 | UX B2B (văn phòng ↔ hiện trường) | **5,5** | Desktop tốt (đã qua 5 đợt audit); trên điện thoại danh sách việc **mất tên việc**, BOQ/Gantt không có chế độ rút gọn; **không có offline**, chỉ báo "Đã đồng bộ" báo sai khi mất mạng và thao tác bị mất khi tải lại |
| 5 | Kiến trúc & CSDL | **6,5** | Phân quyền phía máy chủ chặt cho công việc, CAS tài chính, 74 ca test xanh, ghi 500 KB mất 30 ms; nhưng Gantt 1.000 việc kéo ~105 ms/khung, quyền không theo dự án, báo cáo ngày không có luật bảo vệ, lịch sử thay đổi do client tự ghi (tự nguyện) và tài chính không có vết ở cấp trường |

**Bốn lỗi cần vá trong tuần này** (đều tái hiện được, xem mã bằng chứng ở từng mục):

1. **B1 — Kéo thanh Gantt lệch ngày do múi giờ** (`isoOf` dùng `toISOString` trên ngày local; ở Việt Nam UTC+7 mọi lần kéo đều rơi về **trước 1 ngày** so với chỗ thả).
2. **B2 — Mất mạng vẫn báo "Đã đồng bộ"**, thao tác chỉ nằm trong RAM trình duyệt và **mất hẳn khi tải lại trang**.
3. **B4 — Đường găng tính trên tập việc đang lọc/tìm kiếm**, không phải toàn dự án → nhãn "Găng" sai khi có bộ lọc.
4. **B3 — Hai người lập nhật ký cùng ngày: bản sau đè bản trước**, vẫn ghi tên người lập cũ.

---

## 1. Phương pháp và bằng chứng

- **Đọc toàn bộ mã**: server.js (luật phân quyền `validateSharedWrite`, endpoint tệp/nhật ký/biên bản/tài chính, scheduler), ProjectManager.jsx (CPM, Gantt, BOQ, nhật ký, phân quyền client, đồng bộ), shim.js, tests, CI, Dockerfile.
- **Máy chủ thử riêng** (cổng 3231, thư mục dữ liệu tạm) với dữ liệu mẫu: 5 tài khoản (Chỉ huy trưởng = chủ sở hữu, Kỹ sư QS, Kỹ sư hiện trường = teamlead Site, Kế toán dự án, Công nhân trưởng), dự án "Nhà phố" 20 việc / 6 giai đoạn / chuỗi phụ thuộc / BOQ 8 hạng mục 2 kỳ / hợp đồng CĐT + thầu phụ / 1 nhật ký; dự án "Dự án lớn" **1.000 việc** có phụ thuộc chéo (khối dữ liệu 501 KB).
- **Đo trên trình duyệt thật** (viewport 1366×800 và 375×812) bằng PerformanceObserver `longtask` và thao tác kéo thanh bằng sự kiện chuột; **gọi API trực tiếp** để thử phân quyền, vết lưu, xung đột, và tình huống tắt máy chủ giữa chừng.
- **Chạy lại bộ kiểm thử phát hành**: `node tests/kiem-tra-tat-ca.mjs` → **ĐỦ ĐIỀU KIỆN PHÁT HÀNH**, 15 mục đạt, 74 ca (authz 52, nghiệp vụ 15, khôi phục 7).

### 1.1 Số đo hiệu năng (dự án 1.000 việc, máy Windows 11, một máy chạy cả server lẫn trình duyệt)

| Phép đo | Kết quả | Nhận xét |
|---|---|---|
| DOM của màn Gantt | **25.135 nút** cho 1.000 thanh | Không ảo hóa; mỗi việc ≈ 25 nút |
| Mở tab Gantt (render + vẽ) | 2 long task **131 + 209 ms** (~340 ms) | Chấp nhận được |
| Mở tab Danh sách | 2 long task **600 + 326 ms** (~0,9 s) | Chậm hơn Gantt vì mỗi dòng nhiều badge AntD |
| Kéo thanh Gantt — mỗi lần chuột di chuyển | long task **~105 ms** | ≈ 9–10 khung hình/giây, cảm giác giật; CPM + toàn bộ 1.000 dòng render lại mỗi khung |
| Thả chuột (cập nhật ngày + tính lại đường găng) | **~72 ms** + gửi 501 KB lên máy chủ | Ổn |
| Gõ bộ lọc khi đang ở Gantt (còn 112 việc) | < 50 ms | Nhanh — nhưng đường găng tính trên 112 việc (lỗi B4) |
| Máy chủ `POST /api/kv` 501 KB — chủ sở hữu (bỏ qua thẩm định) | 22–50 ms | |
| Máy chủ `POST /api/kv` 501 KB — teamlead (thẩm định đầy đủ) | 26–36 ms | Thẩm định thêm ~10 ms, tốt |
| `GET /api/kv/rev` / `GET /api/kv` cả khối / `GET /api/records` | 1 / 21 / 8 ms | |

**Kết luận hiệu năng:** dưới ~300 việc/dự án mọi thứ mượt; ở 1.000 việc Gantt vẫn dùng được nhưng kéo thả giật và Danh sách mất gần 1 giây mỗi lần đổi tab. Nút thắt nằm ở client (render lại toàn bộ), không phải máy chủ.

---

## 2. Vai trò 1 — Chỉ huy trưởng / Senior Construction PM — 5,5/10

**Điểm mạnh:** đường găng CPM có tính dự trữ (slack), cảnh báo phụ thuộc vòng tròn và vi phạm lịch; kế hoạch gốc có thanh xám và nhãn "+X ngày" trễ; kéo thanh và kéo mép để đổi thời lượng; 3 mẫu dự án chuẩn ngành; nhật ký thi công in được có khung chữ ký; báo cáo ngày cá nhân với ma trận theo dõi nộp; duyệt 2 cấp có trả về kèm lý do + email; việc tự chuyển "Đang làm" khi tới ngày bắt đầu và tự đặt ngày bắt đầu khi việc trước xong.

| Mã | Mức | Phát hiện | Bằng chứng | Khuyến nghị |
|---|---|---|---|---|
| B1 | **Nghiêm trọng** | Kéo thanh Gantt lệch **−1 ngày** so với chỗ thả (múi giờ UTC+7) | `isoOf = d.toISOString().slice(0,10)` (ProjectManager.jsx:3295) áp lên ngày local 00:00 → thành 17:00 UTC hôm trước. Tái hiện: kéo +12 ngày, hạn 14/10 → 25/10 (đúng phải 26/10); kéo +2 ngày, 18/10 → 19/10 (đúng phải 20/10); trong trang `isoOf(local 14/10 + 2 ngày)` = "2026-10-15". Đường ngày ở TaskDetail (`addDays`) và `promoteStarted` (`fmt`) dùng cách local nên đúng — chỉ đường kéo Gantt sai | Thay `isoOf` bằng hàm định dạng local đã có (`fmt` / `addDays`); thêm test: kéo k ngày → đúng k ngày |
| B4 | **Cao** | Đường găng tính trên **tập việc đang lọc**, không phải toàn dự án | `TimelineView` nhận `projectTasks` đã qua `passesFilter` (search / ưu tiên / người làm / ẩn việc xong) (ProjectManager.jsx:1252, 1506). Tái hiện: lọc "Công tác #1" → còn 112 thanh, chỉ 1 việc "Găng" trong khi trước đó hàng trăm; tắt "Hiện việc đã xong" thì việc trước đã xong biến mất khỏi đồ thị phụ thuộc | Tính CPM trên toàn bộ việc của dự án (memo theo `tasks`), bộ lọc chỉ quyết định dòng nào hiển thị |
| P1 | **Cao** | **WBS phẳng — giai đoạn của mẫu bị ẩn.** Mẫu "Thi công nhà phố" tạo 6 giai đoạn (Chuẩn bị, Phần móng, Phần thân…) lưu vào `sections`, nhưng Danh sách và Bảng gom theo **trạng thái** (`sections={STATUS_ORDER…}` :1503) — `sectionId` chỉ còn được dùng khi ghi lịch sử (:986). Không có việc cha/con, không có mã WBS, không gộp % theo trọng số, không có mốc (milestone) | Ảnh chụp Danh sách: các nhóm là "Cần làm 11 / Đang làm 3 / Hoàn thành…", không thấy "Phần móng / Phần thân". Tiến độ dự án trên dashboard = số việc xong / tổng số việc (không trọng số) | Hiển thị theo giai đoạn (dữ liệu đã có sẵn), cho phép gộp % giai đoạn theo thời lượng hoặc giá trị BOQ; thêm mốc (thời lượng 0, ký hiệu hình thoi); dài hạn: việc cha/con 2 cấp |
| P2 | **Cao** | Phụ thuộc chỉ có **FS, không lag/lead**, không SS/FF/SF; CPM theo **ngày lịch** (không có lịch làm việc: Chủ nhật, lễ, ngày mưa); không dùng % hoàn thành để tính thời lượng còn lại | `dependsOn` là mảng id (normalizeTask :620); CPM: `es = max(startDay, max(ef của deps))` (:3357–3366); `dur = end − start + 1` ngày lịch | Cấu trúc phụ thuộc `{id, type: FS/SS/FF/SF, lag}`; lịch làm việc theo dự án (ngày nghỉ); tính lại thời lượng còn lại = dur × (1 − %) khi có data date |
| P3 | **Trung bình** | Baseline chỉ 1 bản, ghi đè; chỉ lưu start/end; chỉ so lệch **ngày kết thúc**; không có ngày cắt dữ liệu (data date), không có % kế hoạch tại ngày so với % thực tế, không có SV/SPI | `saveBaseline` :1150–1156 lưu `{s,e}`; `drift = end − blE` (:3445) | Baseline có phiên bản (BL0, BL1…), lưu thêm % hoặc giá trị; tính % kế hoạch đến ngày và chênh lệch; S-curve tiến độ (hiện chỉ có S-curve giá trị trong BOQ và phải liên kết thủ công) |
| P4 | **Trung bình** | Không tách **kế hoạch – thực tế**: kéo thanh là đổi luôn lịch, không có "bắt đầu thực tế / kết thúc thực tế"; `completedAt` là thời điểm duyệt, không phải ngày xong việc ngoài công trường | Task chỉ có `startDate`, `dueDate`, `duration`, `workdone`, `completedAt` | Thêm actualStart/actualFinish (mặc định lấy ngày đổi trạng thái); Gantt vẽ 2 lớp: kế hoạch (baseline) – hiện tại – thực tế |
| B3 | **Cao** | **Nhật ký cùng ngày bị ghi đè**: người thứ hai bấm "Thêm nhật ký" cho ngày đã có → máy chủ gộp theo `projectId + date` và `Object.assign` nội dung mới, giữ nguyên tên người lập cũ | server.js:758–760. Tái hiện: kỹ sư hiện trường POST cùng ngày 02/09 → nội dung "Đổ bê tông sàn…" của Chỉ huy trưởng bị thay bằng "Lắp cốt thép cột…", `createdBy` vẫn là "Chỉ huy trưởng", chỉ còn 1 nhật ký | Trả 409 "Ngày này đã có nhật ký của X — mở để sửa"; hoặc tách nhật ký theo người lập/ca; lưu lịch sử phiên bản (updatedBy, bản trước) |
| P5 | **Trung bình** | Nhật ký thi công là **7 ô chữ tự do**: nhân lực, hạng mục + khối lượng, thiết bị & vật tư, vướng mắc, kế hoạch mai — không có bảng (tổ đội × số người, máy × giờ), không số hóa khối lượng, không liên kết công việc/hạng mục BOQ, thời tiết chỉ "Nắng / Mưa" (không nhiệt độ, không giờ mưa/ngừng việc), "sự cố" gộp chung với "vướng mắc", không có mục ý kiến/chỉ đạo của TVGS – CĐT, không có kết quả nghiệm thu trong ngày, không có trạng thái ký duyệt của Chỉ huy trưởng (bản in chỉ có khung chữ ký) | `SiteLogModal` :1739–1783; bản in ghi "Theo NĐ 06/2021/NĐ-CP" nhưng nội dung chưa đủ các mục của mẫu | Chuyển 3 ô thành bảng có tổng (nhân lực theo tổ/nghề, máy theo loại/giờ, khối lượng theo hạng mục BOQ); thời tiết chọn nhanh + giờ ngừng việc; mục "Sự cố / mất an toàn" riêng; trạng thái Nháp → Đã nộp → CHT đã duyệt; sau duyệt khóa sửa |
| P6 | **Trung bình** | Nhật ký: xóa vĩnh viễn ngay (không thùng rác), sửa không lưu phiên bản; ảnh chỉ bắt buộc phía client — upload ảnh lỗi bị nuốt (`try {} catch {}`) nên nhật ký có thể lưu **không kèm ảnh** dù quy tắc "ít nhất 1 ảnh" | :1763; máy chủ `POST /api/sitelogs` không kiểm tra ảnh | Máy chủ từ chối hoàn tất nhật ký khi 0 ảnh; báo lỗi từng ảnh; thùng rác cho nhật ký/biên bản |
| P7 | **Thấp** | Gantt sắp theo ngày bắt đầu, không theo thứ tự WBS; cột nhãn cố định 224 px; không zoom ngày/tuần/tháng; không in/xuất Gantt | :3324–3330, `LABEL_W = 224` | Sắp theo giai đoạn → thứ tự; thang tuần/tháng; xuất PDF/ảnh |

**Tiêu chí PM:** Cấu trúc WBS 3,5 · Phụ thuộc & CPM 5,5 · Baseline vs Actual 5,0 · Nhật ký thi công 5,5 · Điều hành hằng ngày (báo cáo, duyệt, nhắc) 7,5.

---

## 3. Vai trò 2 — Kỹ sư dự toán & Kiểm soát chi phí (QS) — 5,0/10

**Điểm mạnh:** mô hình BOQ **không lưu số lũy kế** — khối lượng nhập theo kỳ, lũy kế tính lại nên sửa kỳ cũ thì kỳ sau tự đúng (đúng tư duy IPC); cột đối chiếu form thanh toán (LK trước / kỳ này / lũy kế / % / giá trị); dòng nhóm; nhập bằng dán từ Excel (nhận số kiểu VN và Anh); xuất CSV bảng nghiệm thu theo kỳ (khớp CostManager); liên kết hạng mục ↔ công việc và gợi ý khối lượng; cảnh báo đỏ vượt KL hợp đồng; đối chiếu tổng BOQ với giá trị hợp đồng CĐT; S-curve % giá trị; hợp đồng – phụ lục – đợt xuất hóa đơn/thu – thầu phụ – dòng tiền theo tháng; CAS chống ghi đè.

| Mã | Mức | Phát hiện | Bằng chứng | Khuyến nghị |
|---|---|---|---|---|
| Q1 | **Cao** | **Không có phát sinh (Variation Order).** Chỉ có "Phụ lục" ở cấp hợp đồng với 1 con số; không có dòng BOQ phát sinh, không cột "KL phát sinh / KL điều chỉnh", không trạng thái đề xuất → CĐT duyệt → đưa vào thanh toán | `ContractForm` kind: contract/appendix (:2440); BOQ item chỉ có `khoiLuong` (1 cột) | Thêm loại dòng BOQ "Phát sinh" gắn số VO, trạng thái (Đề xuất / Đã duyệt / Từ chối), cột KL hợp đồng gốc – KL điều chỉnh; tổng BOQ = gốc + VO đã duyệt |
| Q2 | **Cao** | **Không có ngân sách chi phí – chi phí thực tế.** BOQ chỉ là mặt doanh thu (đơn giá hợp đồng với CĐT). Thầu phụ chỉ có giá trị hợp đồng và các đợt trả; không có dự toán chi phí theo mã (vật tư / nhân công / máy / thầu phụ / chung), không nhập chi phí thực tế phát sinh, không tính lợi nhuận gộp, chi phí đến hoàn thành (ETC/EAC) | `finance.json` = `{investorContracts, subContracts, boq}`; "Dòng tiền" chỉ cộng tiền thu – tiền chi theo tháng | Tối thiểu: ngân sách theo nhóm chi phí cho từng dự án + sổ chi phí thực tế (ngày, mã, số tiền, chứng từ, thầu phụ/NCC) → bảng Ngân sách vs Thực tế vs Cam kết (hợp đồng thầu phụ) theo dự án |
| Q3 | **Cao** | **Không có vết sửa số liệu tài chính.** Sửa đơn giá, sửa khối lượng của kỳ đã chốt, xóa đợt thanh toán → máy chủ chỉ ghi "Lưu tài chính rev N bởi email"; `finance.json` không có ai-sửa-gì | Tái hiện: QS đổi đơn giá 1.650.000 → 1.950.000 và KL kỳ 1 (đã chốt) 20 → 30: HTTP 200, security.log chỉ có "Lưu tài chính rev 2 bởi qs@test.vn" | Máy chủ diff bản cũ/mới ở cấp hạng mục và ghi nhật ký (ai, khi nào, dự án, hạng mục, trường, trước → sau); **khóa kỳ** đã nộp CĐT (chỉ chủ sở hữu mở khóa, có lý do) |
| Q4 | **Trung bình** | Chưa phân biệt **khối lượng đã thi công** (thực tế hiện trường, theo ngày) với **khối lượng nghiệm thu** theo kỳ và **khối lượng đã xuất hóa đơn**; nhật ký ghi khối lượng bằng chữ nên không cộng dồn được; gợi ý KL kỳ này = KL hợp đồng × **trung bình cộng %** các việc liên kết (không trọng số) − lũy kế trước — dễ gợi ý sai khi liên kết nhiều việc kích cỡ khác nhau | `suggestKyNay` :2809–2816; nhật ký `work` là chuỗi | Sổ khối lượng theo ngày (từ nhật ký, theo hạng mục BOQ) → "Đã thi công lũy kế"; kỳ nghiệm thu lấy từ sổ này; gợi ý theo trọng số thời lượng/giá trị |
| Q5 | **Trung bình** | Kỳ nghiệm thu (giá trị thực hiện) **không nối** với đợt xuất hóa đơn / thu tiền (hai nguồn nhập tay riêng); không có giữ lại bảo hành, khấu trừ tạm ứng, VAT; "Đang chờ thu" = đã xuất − đã thu, không đối chiếu với giá trị nghiệm thu | `InstallmentList` billed/paid tách khỏi `kys` | Từ kỳ nghiệm thu sinh "Đề nghị thanh toán" (giá trị kỳ − giữ lại − khấu trừ tạm ứng + VAT) và gắn hóa đơn/thu vào đó |
| Q6 | **Trung bình** | **Xung đột ghi toàn khối tài chính:** CAS theo 1 rev cho toàn công ty. QS sửa BOQ dự án A và Kế toán ghi đợt thu dự án B trong cùng ~1 giây → người sau nhận 409, app tải bản mới và **bỏ thay đổi của người đó** ("vui lòng thao tác lại") | server.js:929–933; client :866–882 | Tách rev theo dự án (hoặc theo `boq[projectId]`, `contracts`), gộp thay đổi không giao nhau thay vì bỏ |
| Q7 | **Trung bình** | Quyền tài chính **tất cả hoặc không**: `canViewFinance` = xem + sửa mọi dự án; không có "chỉ xem" cho Kế toán/Lãnh đạo; QS và Kế toán dự án có quyền y hệt nhau; không giới hạn theo dự án | server.js:320 `canFinance`; `/api/finance POST` chỉ kiểm `canFinance` | Tách `finance.view` / `finance.edit`, phạm vi theo dự án |
| Q8 | **Thấp** | Số BOQ lưu dạng chuỗi từ ô nhập (`khoiLuong: ""`), cộng dồn số thực không làm tròn; không có đơn vị tiền tệ/quy ước làm tròn; không xuất Excel có công thức | `BoqNum` :2678; `boqCellStyle` | Chuẩn hóa số khi lưu; làm tròn theo ĐVT; xuất .xlsx (bảng nghiệm thu có công thức) |
| Q9 | **Thấp** | BOQ trên điện thoại: bảng rộng 1.366 px trong màn 375 px, không cột dính, mỗi lần chỉ thấy 3 cột | Ảnh chụp mobile tab BOQ | Chế độ thẻ (card) theo hạng mục cho mobile: tên, KL hợp đồng, kỳ này, lũy kế, % |

**Tiêu chí QS:** Liên kết tiến độ ↔ BOQ 6,0 · Quản lý định mức (kế hoạch / đã thi công / lũy kế) 6,0 · Phát sinh (VO) 1,5 · Ngân sách vs chi phí thực tế 2,0 · Toàn vẹn & vết số liệu 4,0 · Xuất/nhập 7,5.

---

## 4. Vai trò 3 — QA/QC & HSE — 3,0/10

**Điểm mạnh:** luồng duyệt công việc có Đạt (Phê duyệt) / Không đạt (Trả về, bắt buộc lý do, thành bình luận ⛔, gửi email); đính kèm tệp/ảnh vào công việc (40 MB/tệp, chặn tệp nguy hiểm); ảnh hiện trường trong nhật ký; biên bản có 3 loại (hiện trường / họp / chỉ thị), số hiệu, ghi chú, PDF/ảnh; quyền xem tệp theo dự án; việc con (subtasks) có thể dùng như checklist đơn giản.

| Mã | Mức | Phát hiện | Bằng chứng | Khuyến nghị |
|---|---|---|---|---|
| H1 | **Cao** | **Không có Punch list / Defect tracking.** Không có thực thể "lỗi" với vị trí (tầng/trục/phòng), mức độ, nhà thầu chịu trách nhiệm, hạn khắc phục, ảnh trước – sau, người kiểm tra lại, trạng thái Mở → Đã sửa → Đã xác nhận. Làm tạm bằng công việc + nhãn thì thiếu mọi trường trên và không lọc/thống kê được theo khu vực/nhà thầu | Không có từ khóa punch/defect/lỗi tồn đọng trong mã; task không có trường vị trí/mức độ | Thêm thực thể "Lỗi tồn đọng" (có thể là task loại "defect" với trường mở rộng), bảng theo khu vực và nhà thầu, ảnh trước/sau, xác nhận đóng bởi QC |
| H2 | **Cao** | **Không có biểu mẫu nghiệm thu nội bộ / checklist số hóa** với kết quả Đạt / Không đạt từng mục; "Biên bản" chỉ là hộp chứa tệp PDF/ảnh + ghi chú, không có trường cấu trúc, không có luồng phê duyệt (lập → kiểm tra → duyệt), không sửa được sau khi tạo (chỉ xóa) | `RecordModal` :1626–1648; endpoint `/api/records` chỉ có tạo / tệp / xóa | Mẫu checklist theo công tác (cốp pha, cốt thép, bê tông, MEP…) với từng mục Đạt / Không đạt / N/A + ảnh + ghi chú; kết quả tổng Đạt/Không đạt; không đạt tự sinh mục punch list; luồng ký số 2 bước |
| H3 | **Cao** | **An toàn lao động: không có gì.** Không có checklist đầu giờ (toolbox talk), điểm danh, PPE, giấy phép làm việc (làm việc trên cao, hàn cắt), sổ sự cố/suýt xảy ra; nhật ký chỉ có ô "Vướng mắc ảnh hưởng tiến độ" | Không có từ khóa an toàn/HSE/safety trong mã | Checklist an toàn đầu giờ (1 phút trên điện thoại: tích + ảnh + chữ ký), sổ sự cố tách riêng với mức độ và hành động khắc phục, thống kê ngày không tai nạn |
| H4 | **Trung bình** | Duyệt việc = "Đạt", trả về = "Không đạt" nhưng **không có tiêu chí**, không có hồ sơ nghiệm thu đính kèm bắt buộc trước khi duyệt; người duyệt là Teamlead/Lãnh đạo theo phòng ban, không phải QC | `approveTask` :1035; `rejectTask` :1125 | Cho phép yêu cầu "phải có checklist Đạt + ≥1 ảnh" trước khi chuyển Chờ duyệt; thêm vai trò QC là người duyệt |
| H5 | **Trung bình** | Xóa biên bản/nhật ký là **xóa vĩnh viễn kèm tệp** ngay lập tức (người tạo hoặc Lãnh đạo), không thùng rác, không lý do — hồ sơ chất lượng có thể biến mất | server.js:682–691, 800–809 | Thùng rác 90 ngày như công việc; ghi lý do; chỉ Chủ sở hữu xóa vĩnh viễn |
| H6 | **Thấp** | Loại biên bản là 3 chuỗi cố định, không có "Biên bản nghiệm thu công việc / vật liệu / giai đoạn"; số biên bản không tự tăng, không kiểm trùng | :1639 | Danh mục loại biên bản cấu hình được; số tự động theo dự án |

**Tiêu chí QA/QC & HSE:** Punch list 1,0 · Checklist nghiệm thu 2,0 · Đạt/Không đạt có hồ sơ 4,5 · An toàn lao động 0,5 · Quản lý hồ sơ (biên bản, ảnh, quyền xem) 6,5.

---

## 5. Vai trò 4 — Product/UX Designer B2B — 5,5/10

**Điểm mạnh (desktop):** kiến trúc thông tin rõ, dashboard trả lời đúng câu hỏi giám đốc, tương phản WCAG AA đã sửa, hộp thoại trong app, gzip, PWA manifest, safe-area iPhone, sidebar thành drawer dưới 768 px, không tràn ngang (đo `scrollWidth` = 375 ở mobile), kéo Gantt hỗ trợ touch, song ngữ.

| Mã | Mức | Phát hiện | Bằng chứng | Khuyến nghị |
|---|---|---|---|---|
| B2 | **Nghiêm trọng** | **Không có chế độ offline và chỉ báo đồng bộ báo sai.** Không có service worker, không hàng đợi thao tác, không kiểm tra `navigator.onLine`. Khi mất kết nối, `window.storage.set` trả `false` → client rẽ vào nhánh "thành công" và cập nhật nhãn **"Đã đồng bộ · 03:28 PM"**; không toast, không cảnh báo. Thao tác chỉ nằm trong RAM; **tải lại trang hoặc app bị đóng là mất** | Tái hiện: tắt máy chủ → tích xong 2 việc trên điện thoại → nhãn "Đã đồng bộ" đổi giờ mới, `fetch` = "Failed to fetch" → bật lại máy chủ: 2 việc vẫn 0% trên máy chủ; tải lại trang → mất. Mã: shim.js:23–27 trả `false`; save effect :862–870 chỉ xử lý `"conflict"` và `{error}` | Ngắn hạn: `status 0` → nhãn đỏ "Chưa lưu — mất kết nối", giữ hàng đợi trong `localStorage` và tự gửi lại khi có mạng, chặn đóng tab (`beforeunload`) khi còn thay đổi chưa lưu. Trung hạn: PWA offline shell + hàng đợi upload ảnh (IndexedDB) + đồng bộ theo thao tác thay vì cả khối |
| U1 | **Cao** | **Danh sách việc trên điện thoại không hiện tên việc.** Ở 375 px, dải badge bên phải (thanh %, phụ thuộc, hạn, ưu tiên, avatar) chiếm hết chiều ngang, tiêu đề `flex-1 truncate` bị ép về 0 | Ảnh chụp mobile: 20 dòng chỉ thấy vòng tròn, %, hạn, "Trung bình", avatar; `TaskRow` :1910 | Dưới 640 px: tiêu đề chiếm dòng riêng (2 dòng), badge phụ xuống dòng 2 hoặc ẩn (giữ hạn + %); vùng chạm ≥ 44 px |
| U2 | **Cao** | **Nhập liệu hiện trường chưa "nhanh"**: nhật ký = 7 ô văn bản gõ tay; không có danh sách chọn nhanh (tổ đội, máy, hạng mục BOQ), không có bộ đếm số, không có giọng nói → văn bản, không có ghi âm; ảnh: `accept="image/*"` **không có `capture`** nên không mở thẳng camera; tệp công việc không có `accept`; **không nén ảnh** (ảnh điện thoại 3–8 MB/tấm, tải tuần tự, lỗi bị nuốt) | :1779, :1641, :3666; không có `SpeechRecognition` / `capture=` trong mã | Chọn nhanh từ danh mục + số lượng; nút "Chụp ảnh" (`capture="environment"`) và nén phía client (≤ 1.600 px, ~300 KB); nút micro dùng Web Speech API (Chrome Android) cho ô văn bản; mẫu nhật ký "sao chép từ hôm qua" |
| U3 | **Cao** | **Khởi động lại máy chủ/NAS = mọi điện thoại bị đăng xuất** (token trong RAM), phiên hết hạn 12 giờ không hoạt động → người hiện trường đăng nhập lại thường xuyên; không có "nhớ đăng nhập" | server.js:449 `tokens = new Map()`; sau khi bật lại máy chủ thử, `/api/kv/rev` trả 401, trang về màn đăng nhập | Lưu token (băm) vào tệp `sessions.json` để sống qua restart; phiên di động 30 ngày có gia hạn; đăng nhập bằng mã QR/đường link cho công nhân |
| U4 | **Trung bình** | Gantt trên điện thoại: cột nhãn 224 px chiếm 60 % màn, vùng biểu đồ còn ~150 px (thấy 1 tuần), không có chế độ rút gọn/tuần/tháng; BOQ là bảng 1.366 px cuộn ngang (Q9); bảng "Theo dõi nộp báo cáo" cỡ chữ 11 px | Ảnh chụp mobile Gantt, BOQ | Chế độ mobile: Gantt dạng danh sách thẻ (tên + thanh + hạn + Găng), BOQ dạng thẻ, bảng nhỏ nhất 13 px |
| U5 | **Trung bình** | Từ chối 403 / xung đột 409 → app **tải lại và bỏ thao tác** của người dùng ("vui lòng thao tác lại") — trên hiện trường (mạng chập chờn, nhiều người ghi) cảm giác "gõ xong mất" | :864–866; :878–881 | Giữ nội dung đang gõ, thử gộp lại tự động, chỉ hỏi khi thật sự trùng trường |
| U6 | **Trung bình** | Không có thông báo đẩy (chỉ email, cần SMTP); bảng thông báo trong app là suy diễn từ dữ liệu (chờ duyệt, quá hạn, bình luận báo cáo) — không có "việc được giao", "bị trả về", "nhật ký cần duyệt" | `notifications` useMemo :1078–1088 | Web Push qua service worker (đi cùng PWA) cho 4 sự kiện trên |
| U7 | **Thấp** | Nợ i18n: 66 chuỗi tam phân `lang === "vi" ?` ngoài bảng T; 0 `aria-label` (đã nêu ở audit trước, chưa đóng) | grep | Gom vào bảng T; aria-label cho nút icon |

**Tiêu chí UX:** Desktop văn phòng 8,0 · Điện thoại/máy tính bảng hiện trường 4,0 · Nhập liệu nhanh hiện trường 3,5 · Offline & tự đồng bộ 1,0 · Phản hồi & trạng thái 5,5.

---

## 6. Vai trò 5 — Kiến trúc phần mềm & CSDL — 6,5/10

**Điểm mạnh:** máy chủ Node thuần, 1 phụ thuộc; phân quyền phía máy chủ theo **trường** (`validateSharedWrite`: xóa dự án, thùng rác, cột, xóa hàng loạt, duyệt đúng người, người được giao chỉ sửa % / trạng thái việc mình, bình luận đúng tên, lịch sử không sửa/xóa); CAS tài chính; ghi nguyên tử + .bak + snapshot 14 ngày + email sao lưu; 52 ca test phân quyền + 15 nghiệp vụ + 7 khôi phục, tất cả xanh; ghi 501 KB trong ~30 ms; rev cache cho poll; gzip; HTTPS tự bật; Docker fail-closed + healthcheck.

### 6.1 Hiệu năng Gantt / cây công việc

| Mã | Mức | Phát hiện | Bằng chứng | Khuyến nghị |
|---|---|---|---|---|
| A1 | **Cao** | CPM và toàn bộ hình học Gantt tính **trong hàm render**, không `useMemo`; kéo thanh gọi `setDrag` mỗi sự kiện chuột → 1.000 dòng render lại + CPM + dây phụ thuộc mỗi khung | ~105 ms/khung ở 1.000 việc (đo `longtask`); `TimelineView` 197 dòng, 0 memo (:3297–3494) | `useMemo` cho CPM và `geo` theo `[tasks]`; dòng thành component `React.memo`; khi kéo chỉ cập nhật thanh đang kéo bằng `transform` (không đi qua state của cả bảng); ảo hóa dòng (react-window) trên 300 việc |
| A2 | **Trung bình** | Danh sách 1.000 việc mất ~0,9 s mỗi lần đổi tab (badge AntD nặng: Progress, Tag, Avatar ×3); không ảo hóa; Dashboard duyệt `tasks.filter` cho từng dự án và từng thành viên | `longtask` 600 + 326 ms | Ảo hóa danh sách; thay `AntProgress` bằng div; tính chỉ số dashboard một lần bằng `useMemo` |
| A3 | **Trung bình** | Mỗi request đọc và `JSON.parse` toàn bộ `data.json` (loadData 11 chỗ; gate xem tệp parse cả khối mỗi GET); mỗi lần lưu ghi lại cả khối + .bak; trần 8 MB | server.js:99, 355–356, 371 | Cache trong RAM có invalidation khi ghi (đã nêu audit 17/08, chưa làm); tách `tasks` theo dự án khi vượt 5 MB |
| A4 | **Thấp** | Client gửi **cả khối** sau mỗi thay đổi (debounce 500 ms) — gõ mô tả việc = nhiều lần tải 500 KB (gzip giúp nhiều) | :855–875 | Đồng bộ theo patch (JSON Patch theo entity) là điều kiện để làm offline và giảm xung đột |

### 6.2 Phân quyền nội bộ

Ma trận quyền hiện có (Owner / Lãnh đạo / Teamlead / Người có `canAssign` / Người có `canViewFinance` / Nhân viên):

| Phạm vi | Thực tế hiện nay | Khoảng trống so với yêu cầu "đúng phạm vi được cấp" |
|---|---|---|
| Xem công việc/dự án | **Mọi người đăng nhập thấy mọi dự án** (client tải cả khối qua `/api/kv`) | Tái hiện: "Công nhân trưởng" không thuộc "Dự án lớn" vẫn tải được 1.000 việc của dự án đó. Không có thành viên theo dự án |
| Sửa công việc | Nhân viên thường: chỉ %/trạng thái việc của mình, bình luận, tick việc con (máy chủ chặn) — **tốt** | — |
| Sửa dự án | Bất kỳ ai có `canAssign`/teamlead: đổi tên, đổi người lập nhật ký (`siteLoggers`) **mọi dự án** | Tái hiện: teamlead Site đổi tên dự án và tự thêm mình làm người lập nhật ký → 200 |
| Báo cáo ngày | **Không có luật nào** trong `validateSharedWrite` cho `dailyReports` | Tái hiện: nhân viên không quyền **sửa nội dung và xóa** báo cáo ngày của người khác → 200 |
| Tài chính | `canViewFinance` = xem + sửa toàn bộ (Q7); Kế toán ≡ QS | Không có chỉ-xem, không theo dự án |
| Nhật ký / biên bản | Owner/Lãnh đạo/Teamlead Site/người được chỉ định (máy chủ chặn) — **tốt**; tệp xem theo dự án — **tốt** | Xóa vĩnh viễn ngay (H5) |
| Tài khoản | Owner cấp quyền; người được `canManageMembers` không cấp được quyền cao hơn — **tốt** | Lịch sử khớp người bằng **tên hiển thị** (`e.actor === me.name`) — hai tài khoản trùng tên có thể ghi lịch sử thay nhau |

| Mã | Mức | Khuyến nghị |
|---|---|---|
| A5 | **Cao** | Thêm luật `dailyReports` (chỉ chủ báo cáo tạo/sửa trước hạn; người duyệt chỉ thêm bình luận của mình) — 15 dòng trong `validateSharedWrite` + 3 ca test |
| A6 | **Cao** | Mô hình **thành viên theo dự án** (`project.members[]`) → lọc `/api/kv` theo dự án người xem; `canAssign` chỉ trong dự án mình là thành viên; là nền cho vai Chỉ huy trưởng / Kỹ sư hiện trường / QS / Kế toán theo từng công trình |
| A7 | **Trung bình** | Tách quyền tài chính xem/sửa, khóa kỳ; khớp actor lịch sử theo `id` thay vì tên |

### 6.3 Nhật ký lưu vết (audit trail)

| Mã | Mức | Phát hiện | Bằng chứng | Khuyến nghị |
|---|---|---|---|---|
| A8 | **Nghiêm trọng** | **Lịch sử thay đổi do client tự ghi và là tự nguyện.** Máy chủ chỉ cấm sửa/xóa mục cũ và bắt mục mới đúng tên; **không bắt buộc** mỗi thay đổi phải có mục lịch sử. Qua API/DevTools, người có quyền đổi hạn, ngày bắt đầu, % mà không để lại dấu vết nào trong "Lịch sử thay đổi" | Tái hiện: teamlead đổi `dueDate` 27/10 → 31/12, `startDate`, `workdone` 0 → 95 với `history` giữ nguyên → HTTP 200, số mục lịch sử 2 → 2; security.log không ghi gì | Máy chủ **tự sinh** nhật ký từ phần diff nó đã tính trong `validateSharedWrite`/`notifyChanges`: ghi `audit.jsonl` chỉ-thêm (ts, actorId, rev, entity, id, field, from, to, ip); "Lịch sử" đọc từ tệp này |
| A9 | **Cao** | Ngay trên giao diện, nhiều thay đổi **không được ghi**: ngày bắt đầu và thời lượng (kéo Gantt chỉ ghi hạn chót), đổi trạng thái qua dropdown/kéo Kanban (`setStatus` không log), người duyệt, lưu kế hoạch gốc, xóa vĩnh viễn thùng rác, sửa nhật ký thi công, xóa biên bản (chỉ security.log) | `logPatch` :983–991 chỉ xử lý title/description/priority/dueDate/section/tags/subtasks; `setStatus` :1042; `saveBaseline` :1150; lịch sử sau kéo Gantt chỉ có `field: "dueDate"` | Trong lúc chờ A8: bổ sung log cho các hành động trên |
| A10 | **Cao** | Lịch sử giữ **tối đa 500 mục** trong cùng khối dữ liệu, mục cũ bị cắt vĩnh viễn; Chủ sở hữu **xóa được từng dòng** lịch sử; tài chính **không có** vết cấp trường (Q3) | :975 `slice(0, 500)`; `deleteHistoryEntry` :978; server cho owner bỏ qua mọi luật | Lưu ngoài khối, giữ theo thời gian (≥ 2 năm), không ai xóa được (kể cả owner) — chỉ xuất/ẩn |
| A11 | **Trung bình** | `security.log` ghi sự kiện thô (đăng nhập, tạo tài khoản, "Lưu tài chính rev N") — đủ để biết **ai đã ghi**, không đủ để biết **ghi gì**; xoay vòng 5 MB giữ 1 bản | server.js:49–57 | Giữ security.log cho bảo mật; audit.jsonl cho nghiệp vụ; báo cáo "ai sửa gì tuần này" cho Chỉ huy trưởng |

**Tiêu chí kiến trúc:** Hiệu năng bảng/Gantt 5,5 · Phân quyền đúng phạm vi 5,5 · Audit trail chống gian lận 3,0 · Toàn vẹn dữ liệu & khôi phục 8,5 · Bảo mật 8,0 · Kiểm thử 8,5 · Bảo trì (mã nguyên khối, 2 bản sao) 5,5.

---

## 7. Kế hoạch hành động

### Trong 1 tuần — vá lỗi làm sai dữ liệu (không đụng kiến trúc)
1. **B1** `isoOf` → định dạng local; test kéo k ngày = k ngày.
2. **B4** CPM tính trên toàn bộ việc của dự án; bộ lọc chỉ ẩn dòng.
3. **B2** Trạng thái mất kết nối: nhãn đỏ "Chưa lưu", hàng đợi `localStorage` + gửi lại, `beforeunload`.
4. **B3** Nhật ký cùng ngày → 409 hoặc mở bản có sẵn; máy chủ bắt buộc ≥ 1 ảnh.
5. **A5** Luật `dailyReports`; **A9** ghi lịch sử cho startDate/duration/status/baseline/purge.
6. **U1** Dòng việc mobile: tiêu đề 2 dòng, badge phụ ẩn dưới 640 px.

### Trong 1 tháng — lấp tầng nghiệp vụ thi công tối thiểu
- **A8/A10/Q3** Audit trail sinh ở máy chủ (`audit.jsonl`), gồm tài chính; khóa kỳ nghiệm thu.
- **P1** Hiển thị theo giai đoạn (dữ liệu `sections` có sẵn), % giai đoạn theo trọng số; mốc.
- **P2** Lag/lead + SS/FF; lịch làm việc (ngày nghỉ) cho CPM.
- **P5** Nhật ký có bảng nhân lực/máy/khối lượng theo hạng mục BOQ, mục sự cố riêng, trạng thái CHT duyệt.
- **H1/H2** Punch list tối thiểu (task loại "defect" + vị trí, mức độ, ảnh trước/sau, xác nhận đóng) và 3 checklist mẫu Đạt/Không đạt.
- **U2** Nút chụp ảnh + nén ảnh; chọn nhanh danh mục; micro Web Speech.
- **A1** Memo CPM + dòng Gantt; kéo bằng `transform`.
- **U3** Phiên đăng nhập sống qua restart.

### Trong 1 quý — để gọi là "phần mềm quản lý thi công"
- **Q1/Q2/Q5** Phát sinh (VO), ngân sách theo mã chi phí + chi phí thực tế + cam kết thầu phụ, Đề nghị thanh toán từ kỳ (giữ lại, tạm ứng, VAT).
- **A6/Q7** Thành viên theo dự án; quyền tài chính xem/sửa theo dự án.
- **B2 (dài hạn)** PWA offline thật: đồng bộ theo patch, hàng đợi ảnh, Web Push.
- **H3** Module an toàn: checklist đầu giờ, giấy phép làm việc, sổ sự cố.
- **A2/A3/A4** Ảo hóa danh sách/Gantt; cache máy chủ; tách khối theo dự án; tách monolith (đã nêu 17/08).

---

## 8. Kết luận

Trạm Dự Án đã làm rất tốt phần khó của một phần mềm nội bộ: an toàn dữ liệu, phân quyền phía máy chủ cho công việc, kiểm thử và vận hành trên NAS. Năm góc nhìn chuyên môn cho thấy khoảng cách còn lại nằm ở **mô hình nghiệp vụ**, không ở kỹ thuật: tiến độ mới có "việc" mà chưa có "cấu trúc" (WBS, loại phụ thuộc, lịch làm việc, kế hoạch – thực tế); chi phí mới có "doanh thu" mà chưa có "chi phí" và "phát sinh"; chất lượng – an toàn chưa có thực thể nào; hiện trường chưa dùng được khi mất sóng. Bốn lỗi B1–B4 nên vá trước khi phát hành rộng vì chúng làm sai dữ liệu mà người dùng không biết. Sau đó, thứ tự hợp lý là **audit trail sinh ở máy chủ → thành viên theo dự án → nhật ký/khối lượng có cấu trúc → punch list/checklist → offline thật**; mỗi bước đều xây được trên nền hiện có mà không cần viết lại.

*Kết thúc báo cáo. Máy chủ thử, dữ liệu mẫu và các script tái hiện nằm trong thư mục tạm của phiên audit, không đụng dữ liệu thật của người dùng.*
