# Quy tắc để phần mềm "hoàn chỉnh" — không vá đi vá lại

Rút ra từ 6 lần kiểm tra trong tháng 09/2026 (`docs/danh-gia/`). Ba lần đầu tìm lỗi theo kịch bản
người dùng và mỗi lần lại lộ một lỗi "cùng họ" ở ô bên cạnh. Lỗi không nằm ở từng chỗ vá, mà ở
**cách kiểm**: kiểm theo cảm nhận thì chỉ chạm một ô của ma trận. Từ nay mọi thay đổi đi qua đúng
bốn cửa dưới đây, và **cổng phát hành (`node tests/kiem-tra-tat-ca.mjs`) là nơi duy nhất quyết
định "xong"**.

## 1. Mỗi handler / mỗi trường dữ liệu mới phải trả lời 6 câu

Viết thẳng vào chú thích đầu handler. Không trả lời được câu nào thì chưa được gộp.

| # | Câu hỏi | Vì sao (lỗi đã trả giá) |
|---|---|---|
| 1 | **Quyền:** ai được gọi? Xét theo bản ghi **trên máy chủ** (`rec.projectId`), không theo tham số client khai | K3: sửa nhật ký dự án khác bằng id |
| 2 | **Phạm vi:** người bị giới hạn "Thành viên dự án" gửi lên bản **thiếu** dự án ẩn — mọi đối chiếu với bản đầy đủ phải đứng **SAU** bước ghép (`ghepTheoPhamVi` / `ghepTaiChinh`) | R1, N1, G1, K1 — bốn lần cùng một lỗi |
| 3 | **Trạng thái:** bản ghi đang khóa / đã duyệt / trong thùng rác thì thao tác này có được không, ai được | K5, K3 (thùng rác), R7 |
| 4 | **Cấu trúc:** body méo (null, mảng, chuỗi, phần tử rác, rev vô lý) → 4xx có mã, **không bao giờ lưu rác** (`sachKhoiChung`, `sachTaiChinh`, `readBody`) | fuzz: 37 chỗ 500, dữ liệu làm vỡ mọi trình duyệt |
| 5 | **Vết:** thay đổi có ý nghĩa pháp lý / tiền bạc phải có dòng trong `audit.jsonl`, và **không** ghi vết cho giá trị mặc định client tự điền | K4, K5, UI-5 |
| 6 | **Chữ:** mã lỗi mới → `e_<mã>` vi + en (một mã = một nghĩa); trường audit mới → `auditField`; action lịch sử mới → `t.act` + `projectId` | F4, S-e, I1 |

## 2. Mỗi thay đổi kèm test đúng lớp, không phải test đúng chỗ

- Đụng **quyền / tiền / xóa** → thêm ca vào bộ hồi quy tương ứng (bắt buộc, đã ghi ở `tests/README.md`).
- Đụng **phạm vi dự án** → chạy lại bất biến I1–I6 trong `test-hoi-quy-lan5.mjs` cho **mọi vai trò**, không chỉ vai trò đang sửa.
- Đụng **cấu trúc dữ liệu** → thêm ca vào `test-manh-me.mjs` (body méo + dữ liệu cũ thiếu trường).
- Đụng **từ điển / audit / lịch sử** → `test-tu-dien-audit.mjs` và `test-song-ngu.mjs` tự bắt, không cần viết thêm.
- Client thêm trường mặc định vào `normalizeTask` → phải thêm cùng trường vào `chuanHoaViecSS` (server), `MAC_DINH_VIEC`, và **tăng `DATA_VERSION`** để máy chủ di trú dữ liệu cũ một lần khi khởi động — nếu không nhân viên thường bị 403 sau khi nâng cấp (L1).
- Thêm khối dữ liệu mới vào `finance.json` → thêm vào `loadFinance`, `sachTaiChinh`, `locTaiChinh`/`ghepTaiChinh` (phạm vi), `phanTaiChinh` (rev theo dự án), `diffAuditFinance` (vết) và `normalizeFinance` ở client (test-chi-phi-qs ép "máy trạm giữ đủ mọi khối").
- Thêm endpoint ghi → hỏi thêm câu 7: có cần **expectedUpdatedAt / expectedRev** không (chống ghi đè đồng thời) — nhật ký, biên bản, tài chính, khối chung đều đã có.

## 3. Trước khi phát hành, đúng một cổng

`node tests/kiem-tra-tat-ca.mjs` phải in **ĐỦ ĐIỀU KIỆN PHÁT HÀNH**: hai bản giống nhau, cú pháp,
toàn bộ bộ test, HTTPS, zip mới hơn mã, huy hiệu README đúng số ca. Sau đó **thử từ zip giải nén**
(khởi động, tạo tài khoản chủ, đăng nhập, lưu một khối dữ liệu) — test API xanh không chứng minh gói
giao khách chạy được.

## 4. Định kỳ (mỗi bản lớn), không phải khi có người kêu

- Fuzz: `scratchpad/kt-fuzz.mjs` (mọi endpoint × mọi vai trò × body méo) — 0 lỗi 5xx, dữ liệu nguyên.
- Giao diện thật: mở từng màn hình với **dữ liệu gãy tham chiếu** (`seed-xau.mjs`) bằng từng vai trò,
  bắt lỗi console — không có màn hình trắng, không "undefined / NaN".
- Đo tải: `tests/test-tai.mjs 25 5000 60` — so với `docs/HIEU-NANG.md`.

## 5. Ba việc còn nợ (ghi để không quên)

- Nhật ký thi công / biên bản chưa có CAS (hai người sửa cùng ngày → người sau đè).
- Quyền "Tạo tài khoản" phân quyền được cho người khác → tương đương tín nhiệm cao.
- Xóa tài khoản chưa dọn id khỏi `members` / `siteLoggers` / `assignees` (giao diện đã chịu được).
