# KIỂM TRA TOÀN BỘ THEO BẤT BIẾN (v4.2.3)

**Ngày:** 06/09/2026 · **Đối tượng:** commit `ffcf6bb` (v4.2.3) · **Khác gì các lần audit trước:** không đi tìm từng lỗi theo cảm nhận nữa, mà **định nghĩa bất biến rồi quét ma trận** vai trò × phạm vi × trạng thái trên **toàn bộ 28 endpoint**, cộng **kiểm tra tĩnh toàn bộ** từ điển, mã lỗi, tên trường audit và mục lịch sử. Mục tiêu: tìm hết một lượt, không để lỗi "cùng họ" lộ ra từng cái ở mỗi lần audit sau.

---

## 0. Cách kiểm tra

**Bất biến (chạy cho từng người ngoài dự án giới hạn: QS, teamlead Site, nhân viên, kế toán chỉ xem):**

| Mã | Bất biến | Cách đo |
|---|---|---|
| I1 | **Không rò rỉ:** phản hồi của `/api/kv` và `/api/finance` không chứa bất kỳ dấu vết nào (id, tên dự án, tên việc, tên hạng mục, dòng báo cáo, mục lịch sử, mục thùng rác, ngân sách, chi phí, hợp đồng) của dự án ẩn | quét chuỗi 12 dấu hiệu gieo sẵn trong JSON trả về |
| I2 | **Không ghi đè:** sau khi họ lưu, toàn bộ dữ liệu ẩn trên máy chủ giống hệt trước (so JSON) | chụp phần ẩn trước/sau |
| I3 | **Không từ chối sai:** lưu "không đổi gì" phải được 200 dù dự án ẩn có kỳ khóa, việc trong thùng rác, dự án đã xóa, báo cáo có dòng ẩn | POST nguyên bản vừa GET |
| I5 | **Quyền đúng vai trò:** không token → 401, không quyền → 403 trên mọi endpoint | gọi thẳng |
| I6 | **Audit không giả:** lần lưu của người bị giới hạn không sinh dòng "xóa" cho dữ liệu họ không thấy | đọc `/api/audit` |

**Ma trận endpoint:** đọc toàn bộ 28 handler, với mỗi handler liệt kê: điều kiện quyền, có xét phạm vi không, có xét trạng thái (khóa/thùng rác/đã duyệt) không, có ghi audit không — rồi bắn probe vào từng ô còn trống.

**Kiểm tra tĩnh:** (a) hai từ điển vi/en cùng tập khóa (732 khóa, đệ quy); (b) 565 khóa `t.*` dùng trong JSX đều có định nghĩa; (c) 26 mã lỗi máy chủ đối chiếu bản dịch `e_*` tiếng Anh; (d) 42 tên trường + 7 thực thể audit máy chủ ghi ra đối chiếu `auditField`/`auditEntity`; (e) 18 `action` lịch sử đối chiếu `t.act`; (f) mọi `log({...})` của client có `projectId` hay không.

Tất cả chạy trên máy chủ thử riêng (cổng 3261, dữ liệu seed 2 dự án + 30 việc + BOQ + nhật ký), không đụng dữ liệu thật. Script: `kt-toan-bo.mjs`, `kt-tu-dien.cjs`, `kt-k4.mjs` trong thư mục tạm của phiên.

---

## 1. Kết quả tổng

| | Số ca | Đạt | Lỗi |
|---|---|---|---|
| Bất biến (4 người × 5–8 ca) | 26 | 20 | 6 (2 lỗi gốc) |
| Probe ma trận endpoint (K1–K11) | 27 | 7 | 20 (10 lỗi gốc) |
| Kiểm tra tĩnh | 6 nhóm | 4 | 2 (3 thiếu sót nhỏ) |

**Tổng: 15 lỗi/thiếu sót gốc, trong đó 4 mức Cao, 6 Trung bình, 5 Thấp.** Điểm chung của 8/15: máy chủ tin một tham số hoặc một bản dữ liệu do client gửi mà không đối chiếu với bản đầy đủ của chính nó (id nhật ký, projectId, danh sách thành viên, dự án mới, kỳ khóa).

---

## 2. Danh sách lỗi (đầy đủ, xếp theo mức)

### Mức CAO

| # | Lỗi | Bằng chứng | Hậu quả thực tế | Cách vá |
|---|---|---|---|---|
| **G1** | `/api/finance POST` kiểm tra khóa kỳ **trước** khi ghép phạm vi | I3-TC: qs@ và ketoan@ lưu không-đổi-gì → **403 "Kỳ nghiệm thu số 1 đã khóa — không xóa được"** | Người tài chính bị giới hạn **không lưu được gì** khi bất kỳ dự án ẩn nào có kỳ đã khóa | Đảo thứ tự: ghép rồi mới kiểm khóa |
| **K1** | Dự án **mới** do người bị giới hạn (có quyền giao việc) tạo bị **ghép rớt im lặng** | site@ tạo P_moi + cột + việc + mục lịch sử → **200** nhưng máy chủ không có gì; tải lại thì mất | Giao diện cho người có quyền giao việc tạo dự án (`canEdit`) → **mất dữ liệu không báo**, đúng cảnh teamlead bị giới hạn một dự án tạo dự án mới | Coi id dự án chưa có trên máy chủ (không nằm trong thùng rác) là thuộc phạm vi người gửi |
| **K3** | `/api/sitelogs POST` sửa nhật ký **theo id** nhưng xét quyền theo `projectId` **client khai**; bản trong thùng rác cũng sửa được | tho@ (chỉ được ghi P_nhapho) gửi `{id: <nhật ký P_lon>, projectId: "P_nhapho"}` → **200**, nội dung P_lon bị thay; nhật ký đã xóa → **200** | Ai có quyền ghi nhật ký ở **một** dự án sửa được nhật ký của **mọi** dự án nếu biết id (id lộ trong danh sách đã từng tải) | Xét `canRecordProject(me, rec.projectId)` và chặn bản có `deletedAt` |
| **K7** | Máy chủ không chặn người **không phải** Chủ sở hữu/Lãnh đạo đổi `members` của dự án | site@ (teamlead) đặt `members=[site]` cho P_nhapho → **200**, tho@ **mất** dự án; chiều ngược lại: đặt `members=[]` là **mở toang** dự án giới hạn | Hàng rào phạm vi chỉ có ở giao diện | Luật 1b: đổi `members` cần Lãnh đạo/Chủ sở hữu |

### Mức TRUNG BÌNH

| # | Lỗi | Bằng chứng | Cách vá |
|---|---|---|---|
| **K2** | `canViewTaskFiles` trả true ngay cho Teamlead, **bỏ qua** cửa thành viên dự án (khác với biên bản/nhật ký) | site@ (teamlead, ngoài P_lon) **liệt kê, tải lên, tải xuống** tệp của việc T2_1 thuộc P_lon → 200 | Teamlead đi qua `canViewProjectFiles` như mọi người |
| **I1** | Mục lịch sử `project_delete` và `trash_purge` của client **không mang projectId**, chỉ mang tên → lọc phạm vi bỏ sót, **lộ tên dự án ẩn đã xóa** cho cả 4 vai trò | I1 hỏng ở 4/4 người: "Du an an so 2" nằm trong `history` | Client gắn `projectId`; máy chủ lọc thêm theo **tên** dự án ẩn cho dữ liệu cũ |
| **K5** | Chủ sở hữu/Lãnh đạo sửa nội dung nhật ký **đã duyệt** → 200, con dấu "đã duyệt" giữ nguyên trên nội dung mới, **không có vết audit**; đổi `trangThai` về nháp qua đường lưu cũng không có vết | work đổi, `trangThai=daduyet`, `duyetBoi` không đổi; audit chỉ có "duyệt nhật ký" | Ghi `suaSauDuyetBoi/Luc` + dòng audit "sửa nhật ký đã duyệt"; mở khóa qua đường lưu cũng ghi vết |
| **K4** | `diffAuditFinance` **không** so **ngân sách, sổ chi phí, đề nghị thanh toán** (chú thích trong mã nói có, thực tế không) | owner sửa cả ba + giá trị hợp đồng → audit chỉ có `contract/value` | Thêm diff cho ba khối |
| **K6** | Người có quyền "Tạo tài khoản" **tự cấp** quyền xem/sửa tài chính cho chính mình qua `/api/accounts/update` | mgr@ update self `canViewFinance: true` → 200, rồi GET finance 200 | Chặn tự đổi quyền của chính mình (Chủ sở hữu vẫn được); tài liệu ghi rõ quyền này tương đương tín nhiệm cao |
| **K25** | Chuyển việc đang thấy sang dự án ngoài phạm vi bị chặn đúng, nhưng thông báo sai: "Xóa công việc phải qua thùng rác — hãy tải lại trang" | HTTP 403 với câu trên | Bắt riêng, báo "không thể chuyển việc sang dự án ngoài phạm vi" |

### Mức THẤP

| # | Lỗi | Cách vá |
|---|---|---|
| **K11** | Người lập biên bản/nhật ký **đã bị loại khỏi dự án** vẫn sửa/khôi phục được hồ sơ của mình (`/api/records/update`, `/restore`, `/api/sitelogs/restore`) | Thêm điều kiện còn thuộc dự án |
| **K8** | Dòng báo cáo trỏ tới việc của dự án ẩn **đã xóa vĩnh viễn** vẫn hiện cho người ngoài (mang `taskTitle`) | Dòng trỏ tới việc không tra được dự án: chỉ chủ báo cáo (và người thấy tất cả) mới thấy; ghép giữ nguyên chỗ |
| **S-e** | Giao diện tiếng Anh thấy tiếng Việt khi nhật ký đã duyệt bị khóa (mã `locked`) và khi sai mật khẩu hiện tại (mã `invalid`) — hai mã này **dùng chung với** khóa đăng nhập / sai mật khẩu đăng nhập nên `test-song-ngu` cấm dịch theo mã | Tách mã riêng `sitelog_locked`, `wrong_current_password` rồi dịch |
| **S-act** | `action: "csv_import"` không có nhãn trong `t.act` → dòng lịch sử nhập CSV hiện chữ thô | Thêm nhãn + case hiển thị |
| **F-4** | Nhật ký thi công và biên bản **không có CAS** (khác `/api/kv` và `/api/finance`): hai người sửa cùng nhật ký một ngày → người sau đè người trước không báo | Ghi nhận thiết kế; vá ở bản lớn hơn (`expectedUpdatedAt`) |

### Đã kiểm và ĐÚNG (không cần sửa)

- `/api/kv POST`: thứ tự ghép phạm vi → thẩm định → lưu → audit đúng; audit tính trên bản đã ghép (I6 đạt 4/4); phần ẩn nguyên vẹn (I2 đạt 4/4); lưu không-đổi-gì 200 (I3 đạt 4/4).
- Tài chính: I1-TC và I2-TC đạt (không rò rỉ, không ghi đè) — chỉ hỏng I3-TC (G1).
- Không token → 401 và sai vai trò → 403 trên mọi endpoint mới; `pm_shared_v2` trả null.
- Biên bản/nhật ký/ảnh: cửa thành viên dự án đúng; duyệt/mở khóa đúng vai trò (N2/N3/R7 giữ nguyên); khôi phục nhật ký trùng ngày → 409.
- Từ điển vi/en cùng 732 khóa; 565 khóa `t.*` đều có; 42 trường + 7 thực thể audit đều có bản dịch; 17/18 `action` có nhãn.
- Đường dẫn tĩnh, chặn đuôi tệp nguy hiểm, Content-Type theo đuôi, giới hạn kích thước, ẩn mật khẩu SMTP: đúng.

---

## 3. Vì sao các lần audit trước bỏ sót

Bốn lần trước đều **đi theo kịch bản người dùng** (một người, một thao tác) nên chỉ chạm một ô của ma trận mỗi lần; lỗi cùng họ ở ô bên cạnh (K1 ngay cạnh R1, K3 ngay cạnh N3, G1 ngay cạnh R8) không được nhìn tới. Lần này bất biến I1–I6 chạy **cho mọi vai trò, trên mọi trạng thái cùng lúc**, và ma trận endpoint buộc trả lời "có xét phạm vi/trạng thái/audit không?" cho **từng** handler. Hai script kiểm tra này nên được đưa vào bộ test phát hành để mọi handler mới sau này bị ép qua cùng bộ câu hỏi.

---

## 4. Trạng thái vá (cùng ngày, chưa phát hành)

**Đã vá cả 15 điểm trong một lượt** (server.js 30 chỗ, ProjectManager.jsx: từ điển + 2 mục lịch sử + 1 nhãn), trừ F-4 (CAS cho nhật ký/biên bản — ghi nhận, để bản lớn hơn). Chạy lại đúng hai script đã bắt lỗi: `kt-toan-bo` 51/53 đạt (2 "lỗi" còn lại là kỳ vọng của probe chặt hơn thiết kế đã chọn: K5 giữ con dấu duyệt nhưng ghi ai sửa + audit; probe K4 dùng sai cấu trúc `deNghi`), `kt-tu-dien` 0 lỗi.

| Điểm | Cách vá đã áp dụng |
|---|---|
| G1 | Đảo thứ tự ghép phạm vi → kiểm khóa kỳ trong `/api/finance`, kèm chú thích "mọi đối chiếu với bản đầy đủ đứng SAU bước ghép" ở cả hai handler |
| K1 | Id dự án chưa có trên máy chủ (và không nằm trong thùng rác) được thêm vào phạm vi người gửi trước khi ghép |
| K25 | Chuyển việc sang dự án ngoài phạm vi → 403 "Không thể chuyển công việc sang dự án ngoài phạm vi của bạn" |
| K3 | `/api/sitelogs POST` có `id`: xét `canRecordProject(me, rec.projectId)`; bản trong thùng rác → 409 `in_trash` |
| K7 | Luật 1b: đổi `members` cần Lãnh đạo / Chủ sở hữu |
| K2 | `canViewTaskFiles`: Teamlead đi qua `canViewProjectFiles` (cửa thành viên); việc đã xóa vẫn chỉ quản lý xem |
| I1 | Client gắn `projectId` cho `project_delete` / `trash_purge`; máy chủ lọc thêm mục lịch sử cũ theo tên dự án ẩn |
| K5 | Sửa bản đã duyệt: con dấu giữ, ghi `suaSauDuyetBoi/Luc`, audit "sửa nhật ký đã duyệt"; kéo về nháp qua đường lưu → audit "mở khóa nhật ký" |
| K4 | `diffAuditFinance` so thêm ngân sách (từng nhóm), sổ chi phí (thêm/sửa/xóa, tên khoản + số tiền), đề nghị thanh toán (tên kỳ + trường đổi) |
| K6 | `/api/accounts/update`: người không phải Chủ sở hữu không đổi được quyền/vai trò/bộ phận của **chính mình** (403 `self_caps`) |
| K11 | `records/update`, `records/restore`, `sitelogs/restore`: phải còn thuộc dự án |
| K8 | Dòng báo cáo trỏ tới việc không tra được dự án: chỉ chủ báo cáo (và người thấy tất cả) thấy; ghép giữ nguyên chỗ |
| S-e | Tách mã `sitelog_locked` (3 chỗ) và `wrong_current_password` khỏi `locked` / `invalid` hai nghĩa; dịch vi + en; `test-song-ngu` duyệt mã mới |
| S-act | Nhãn `csv_import` vi + en + dòng hiển thị |

**Kiểm thử:** `tests/test-hoi-quy-lan5.mjs` — 49 ca (bất biến I1/I2/I3 cho 3 vai trò + G1 + K1–K8/K11/K25 + 4 ca tĩnh), đăng ký trong cổng sau lan4. **Cổng phát hành:** 16/16 bộ test đạt, **487 ca**, HTTPS đạt, hai bản giống nhau; chỉ còn 2 mục "zip cũ hơn mã" vì **chưa đóng gói / chưa phát hành**.

---

## 5. Lượt hai (cùng ngày): fuzz máy chủ, tác vụ nền, giao diện thật, script phụ

Sau khi vá 15 điểm ở trên, kiểm tiếp bốn vùng lượt một chưa chạm.

### 5.1 Fuzz máy chủ — 979 yêu cầu méo vào 28 endpoint × 3 vai trò (`kt-fuzz.mjs`)

| # | Lỗi | Mức | Vá |
|---|---|---|---|
| F-1 | Body `null` (JSON hợp lệ) → **37 chỗ trả 500** vì destructuring | Trung bình | `readBody` chỉ trả về đối tượng |
| F-2 | Chủ sở hữu (hoặc client lỗi) ghi `value` là `null` / `[]` / `"abc"`, `projects` là chuỗi, mảng có phần tử `null`/số → 200 và **mọi trình duyệt vỡ khi tải về**; `rev` chuỗi được lưu; `rev = 1e308` → **không ai ghi được nữa** (mọi bản gửi đều "cũ hơn") | **Cao** (cần token owner, nhưng một lỗi client là đủ) | `sachKhoiChung`: chỉ đối tượng, mọi mảng lọc phần tử rác (kể cả comments/subtasks/assignees/items), rev số hữu hạn, rev nhảy > 1 triệu → 400 `bad_shape` |
| F-3 | Tài chính: `boq[P] = null`, `items: [null]`, `kys: [null]`, hợp đồng `[null]`, `chiPhi[P] = "x"` → lưu nguyên; body `{}` **không có expectedRev** → xóa sạch tài chính | **Cao** | `sachTaiChinh`; `expectedRev` bắt buộc (400 `missing_rev`) |
| F-4 | Tài khoản: email `khong-phai-email`, `[object object]`, tên `[object Object]` được tạo | Thấp | kiểm kiểu + regex email (400 `bad_email` / `bad_shape`), cả `/api/setup` |
| F-5 | Cài đặt: `smtp: "x"` rải thành `{0:"x"}`, `appName: {}` → "[object Object]" | Thấp | chỉ nhận đúng kiểu |
| F-6 | Biên bản / nhật ký lập được cho dự án **không tồn tại** (Chủ sở hữu bỏ qua kiểm dự án) | Thấp | 400 `no_project` |
| F-7 | Tác vụ nền (nhắc việc, sao lưu, bản tin) `.catch(() => {})` — chết im lặng | Thấp | ghi security.log |
| — | Đường dẫn tĩnh (`..%2f`, `%2e%2e`, `/public/../data`) **không** lộ tệp; prototype pollution không tác dụng; `reset-password.js` liệt kê / đặt lại / từ chối mật khẩu yếu **đúng** | ✅ | |

Sau vá: chạy lại 979 yêu cầu → **0 lỗi 5xx**, dữ liệu nguyên; `tests/test-manh-me.mjs` 24 ca.

### 5.2 Giao diện thật (trình duyệt, bundle build từ mã đã vá, dữ liệu gãy tham chiếu: việc trỏ cột/dự án/người/việc không còn, phụ thuộc vòng, ngày rác, báo cáo của người đã xóa, BOQ trỏ việc đã xóa, kỳ không số, hợp đồng của dự án đã xóa…), bốn vai trò

**Không có lỗi runtime / màn hình trắng** ở 30+ màn hình: tổng quan, việc của tôi, tìm kiếm, báo cáo ngày, lịch sử (app + máy chủ), chi phí (5 tab), khối lượng, cài đặt, cộng tác, thùng rác, dự án (danh sách, bảng, lịch, Gantt 30 việc, lỗi tồn đọng, nhật ký, biên bản, HSE), chi tiết việc (modal / drawer), thành viên dự án, quản lý thành viên, form nhật ký. Phát hiện và vá:

| # | Hiện tượng | Vá |
|---|---|---|
| UI-1 | Dự án tên rỗng hiện trống ở sidebar / tiêu đề / tổng quan | "(dự án chưa đặt tên)" |
| UI-2 | Lịch sử: "→ undefined", "NaN ngày trước · Invalid Date", "Ưu tiên: undefined → undefined", action lạ hiện thô | guard từng trường |
| UI-3 | Việc có ngày rác hiện "NaN/NaN" ở Danh sách / Bảng | ngày không hợp lệ = không hạn |
| UI-4 | Phụ thuộc tới việc đã xóa hiện "Việc chưa đặt tên" | "(việc đã xóa)" |
| UI-5 | **Nhật ký máy chủ nhiễu**: mở dữ liệu cũ, client điền `kind: "task"`… rồi ghi lại → mỗi việc cũ một dòng "đổi loại việc (trống) → task" | máy chủ bỏ qua trường mặc định client tự điền |
| UI-6 | Client cho tạo tài khoản với mật khẩu 4 ký tự, máy chủ đòi 8 + chữ + số | khớp điều kiện |
| **UI-7** | **Người phụ trách chính đã bị xóa tài khoản → không ai cập nhật được % hoàn thành** ("Chỉ người phụ trách chính…") | id phụ trách chính không còn là thành viên → mọi người được giao đều cập nhật được |
| K6-UI | Người quản lý tài khoản vẫn thấy ô quyền của chính mình bật được (máy chủ đã chặn) | khóa ô của chính mình |
| UI-8 | Kỳ nghiệm thu không số hiện "Kỳ null" trong ô chọn | "Kỳ ?" |

### 5.3 Trạng thái cuối lượt hai

Cổng phát hành: **18/18 bộ, 520 ca** (thêm `test-manh-me.mjs`), HTTPS đạt, hai bản giống nhau. Tổng cộng **24 điểm vá trong một bản** (15 lượt một + 7 fuzz + UI-5/UI-7 và các chỉnh giao diện). Đã chuẩn bị sẵn v4.3.0 (CHANGELOG, CÓ GÌ MỚI, version, gói zip, thử từ bản giải nén) — **chưa commit / chưa phát hành**, chờ lệnh.

Ghi nhận thiết kế, không vá trong bản này: F-4 (không CAS cho nhật ký / biên bản); quyền "Tạo tài khoản" vẫn phân quyền được cho người khác (tương đương tín nhiệm cao — ghi trong từ điển hướng dẫn); xóa tài khoản không dọn id khỏi `members` / `siteLoggers` / `assignees` (giao diện đã chịu được).

---

## 6. Lượt ba (cùng ngày): soát lại chính bản vá trước khi phát hành

Mục tiêu: tìm **hồi quy do 24 điểm vá gây ra** và lỗi còn sót, trên đúng bản build cuối.

**6.1 Tự soát diff** (server.js +228/−, ProjectManager.jsx 74 dòng, từng hunk một). Đối chiếu từng quy tắc mới với mọi đường client gọi nó: `expectedRev` luôn là số (`useRef(0)`); client gặp 400 thì tải lại bản máy chủ và báo lỗi, không lặp vô hạn; email client và máy chủ cùng một regex; `dept` trong CAP_KEYS không chạm đường tự đổi mật khẩu; K2 với dự án mở vẫn cho Teamlead; K25 không chặn việc mới. **Không thấy hồi quy.**

**6.2 Chạy lại trên bản cuối:** ma trận bất biến 51/53 (2 "lỗi" là kỳ vọng probe chặt hơn thiết kế, như lượt hai); fuzz 979 yêu cầu → 0 lỗi 5xx; đo tải 25 người / 5.000 việc: poll rev p95 65 ms, pull p95 98 ms, ghi p95 148 ms, 0 lỗi — không đổi so với trước khi thêm bước làm sạch cấu trúc.

**6.3 Lỗi mới tìm được — L1 (cao, có từ lâu, không phải do bản vá):** client **chuẩn hóa mọi việc** khi tải (điền `tags`, `subtasks`, `comments`, `kind`, `milestone`, `approver`… mặc định) rồi gửi lại nguyên khối. Nếu dữ liệu trên máy chủ còn thiếu các trường ấy — dữ liệu cũ, hoặc **mỗi lần nâng cấp thêm trường mới** — luật phân quyền 5b thấy mọi việc "đổi trường `tags`" và trả **403 cho mọi lần lưu của nhân viên thường** cho tới khi một người có quyền giao việc lưu trước. Tái hiện: Chủ sở hữu ghi 2 việc kiểu cũ → nhân viên (được giao 1 việc) chuẩn hóa như client, đổi 10 → 55 % → **403 "không có quyền sửa nội dung công việc này (trường 'tags')"**, lưu lại lần nữa không đổi gì cũng 403. Vá: máy chủ chuẩn hóa cả hai bên đúng như client trước khi so (`chuanHoaViecSS`, bản sao của `normalizeTask`); test 4c trong `test-manh-me.mjs` (200 + workdone 55; đổi tên việc người khác vẫn 403). Đây chính là lớp lỗi "client và máy chủ hiểu khác nhau về mặc định" — cùng gốc với UI-5.

**6.4 Đưa cách kiểm vào cổng vĩnh viễn:** `tests/test-tu-dien-audit.mjs` (5 ca tĩnh: thực thể + trường audit, action lịch sử, projectId của mục lịch sử, mã lỗi có message → e_*) chạy trong cổng; `docs/QUY-TAC-HOAN-CHINH.md` ghi 6 câu hỏi bắt buộc cho mỗi handler / trường mới và lớp test tương ứng — để không còn "vá đi vá lại".

**Trạng thái:** cổng **18/18 bộ, 520 ca**, ĐỦ ĐIỀU KIỆN PHÁT HÀNH; zip đóng lại và thử từ bản giải nén sau L1.

---

## 7. Sau ba lượt: "hoàn thiện tất cả" thay vì phát hành v4.3.0

Theo yêu cầu, bản 4.3.0 không phát hành; toàn bộ lộ trình (`docs/LO-TRINH-HOAN-THIEN.md`) được làm tiếp trong cùng
cây mã và gộp thành **v5.0.0**. Đã làm: 13 mục nghiệp vụ còn mở (P4, P3, Q4, Q6, H4, H6, Q9/U4, U6, A11/N7, VAT, N5/N6,
A2, U7 một phần), 3 nợ thiết kế (F-4 CAS, dọn tài khoản, ghi rõ quyền Tạo tài khoản), vận hành (dataVersion + di trú,
/api/client-error, /api/health + cảnh báo, script cập nhật, service worker), người dùng (nút Góp ý, thẻ Sức khỏe vận hành).
Kiểm thử: `test-hoan-thien.mjs` 39 ca; cổng **19/19 bộ, 559 ca**; thử giao diện mới trong trình duyệt (desktop + 375 px);
thử từ hai gói zip giải nén. Chưa làm (có chủ đích): kiến trúc tách ghi theo thao tác (mục 4.2) — để sau thí điểm.
Chi tiết từng mục: CHANGELOG v5.0.0.

**Diễn tập nâng cấp trên bản sao dữ liệu thật (data/ của máy này, 12 tài khoản, 1 dự án, 167 mục lịch sử, có chứng chỉ TLS):**
máy chủ v5.0.0 khởi động, di trú lên dataVersion 5, chạy HTTPS như thật; Chủ sở hữu và một nhân viên đăng nhập, tải đủ mọi
khối (rev, lịch sử, báo cáo, hồ sơ, tài chính, sức khỏe, thông báo), nhân viên lưu không-đổi-gì → 200, dữ liệu nguyên; giao
diện Tổng quan / dự án / Gantt / Lịch sử / Báo cáo ngày không lỗi, lịch sử cũ không hiện "undefined". Đo tải lại trên bản cuối:
pull p95 94 ms, ghi p95 148 ms, 0 lỗi. **Tìm thêm một lỗi thật:** máy chủ chỉ nghe IPv4 nên Edge trên chính máy chủ báo
"localhost refused to connect" (localhost → ::1) — đã sửa nghe cả hai, kiểm bằng curl `[::1]` và `127.0.0.1`. Service worker:
chưa kiểm được trong trình duyệt thường — trình duyệt nhúng của công cụ không cho đăng ký, còn Edge qua tiện ích thì đang
bị một phiên Claude khác dùng chung (tab bị gỡ ngay, không kết nối được cả LAN dù curl 200). Đã thêm dòng **"PWA / service
worker"** vào Cài đặt > Sức khỏe máy chủ để quản trị viên tự thấy trạng thái sau khi cập nhật; SW chỉ chạy khi HTTPS/localhost,
lỗi thì bỏ qua im lặng, không bao giờ chặn /api.
