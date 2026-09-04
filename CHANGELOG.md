# Lịch sử phiên bản — Trạm Dự Án

## v4.2.0 — 04/09/2026 — ĐỔI GIẤY PHÉP SANG AGPL-3.0

> **Bản v4.1.4 trở về trước vẫn theo giấy phép MIT, vĩnh viễn.** Giấy phép đã trao không
> thu hồi được: ai đang giữ một bản cũ thì giữ nguyên quyền MIT cho bản ấy, kể cả quyền bán
> lại bản đóng kín. AGPL chỉ áp dụng từ **v4.2.0** trở đi.

### Vì sao đổi

MIT cho phép bất kỳ ai lấy phần mềm này, đổi logo, đóng kín mã nguồn rồi bán cho nhà thầu
khác — không cần đóng góp gì lại, thậm chí không buộc giữ tên tác giả trên giao diện.

AGPL giữ nguyên **mọi quyền tự do cho người dùng thật** (công ty xây dựng cài về chạy trên
NAS của mình) nhưng chặn đúng trường hợp trên. Vẫn là phần mềm tự do, mã nguồn mở theo đúng
định nghĩa của FSF và OSI.

### Công ty đang dùng phần mềm: KHÔNG PHẢI LÀM GÌ CẢ

Miễn phí vĩnh viễn, không giới hạn người dùng, không mã kích hoạt, được sửa mã tùy ý, dữ
liệu vẫn nằm trọn trên máy bạn. Ràng buộc mới chỉ phát sinh khi bạn **đưa phần mềm ra ngoài**
công ty mình.

| Bạn là | Phải làm gì |
|---|---|
| Cài cho nhân viên mình dùng | Không phải làm gì |
| Sửa mã, dùng nội bộ | Không phải công khai gì |
| Sửa mã, cho người ngoài dùng qua Internet | Công khai mã nguồn bản của bạn, trỏ `sourceUrl` vào đó |
| Giao/bán cho công ty khác | Kèm mã nguồn đầy đủ, cũng theo AGPL |
| Muốn bán bản đóng kín | Cần giấy phép thương mại riêng từ tác giả |

### Điều khoản bổ sung 7(b): ghi danh tác giả bắt buộc giữ

Mục 7(b) của AGPL cho phép tác giả **bắt buộc giữ dòng ghi danh hiển thị ngay trong giao
diện**, không chỉ trong file LICENSE. Đã dùng quyền đó. Dòng
*"Phần mềm do Khuong Doan phát triển — https://khuongdoan.com/"* phải được giữ ở năm chỗ:
chân thanh bên và màn đăng nhập, banner máy chủ, trường `author` của `/api/config`, chân
biểu mẫu in, và file LICENSE. Được thêm ghi danh của mình bên cạnh; không được thay thế,
che hay thu nhỏ. Xóa là **chấm dứt quyền sử dụng** theo mục 8.

### Mục 13: phần mềm tự lo giúp người vận hành

AGPL mục 13 buộc ai cho người ngoài dùng qua mạng phải mời được họ xem mã nguồn **bản đang
chạy**. Đây là chỗ dễ vi phạm nhất mà không ai cố ý, nên phần mềm làm sẵn:

- Giao diện có liên kết **"Mã nguồn (AGPL-3.0)"** ở chân thanh bên và chân màn đăng nhập.
- Địa chỉ lấy từ `sourceUrl` trong `data/config.json`. Bỏ trống thì trỏ về kho gốc —
  không sửa mã thì như vậy là đã đúng luật, không phải làm gì.
- Có sửa mã: đăng mã nguồn của mình lên đâu đó rồi điền `sourceUrl`. Liên kết trong giao
  diện và dòng in ở cửa sổ máy chủ tự đổi theo.

### Đã đổi những gì

- `LICENSE` (gốc repo): toàn văn AGPL-3.0 tải từ gnu.org, **khớp từng byte** với bản gốc.
  Không chèn thêm gì vào đó — GitHub chỉ nhận diện đúng giấy phép khi văn bản khớp bản
  chuẩn, thêm một đoạn đầu file là nó hiện "Other". Vì vậy phần bản quyền và điều khoản bổ
  sung để riêng ở `DIEU-KHOAN-BO-SUNG.txt`.
- `LICENSE.txt` trong cả hai gói: tóm tắt tiếng Việt cho người dùng cuối + điều khoản bổ
  sung + toàn văn. `DIEU-KHOAN-BO-SUNG.txt` cũng đi kèm gói.
- `docs/Giay-phep-tieng-Viet.md`: viết lại toàn bộ, giải thích theo từng vai trò.
- Trường `license` trong hai `package.json`, tiêu đề SPDX ở đầu `server.js` và
  `ProjectManager.jsx`, thẻ `author`/`license` trong `index.html`, mô tả trong
  `manifest.json`, chân biểu mẫu in.
- `/api/config` trả thêm `license`, `author`, `authorUrl`, `sourceUrl`.
- README và ba file ĐỌC TRƯỚC.

### Kiểm thử

Thêm `tests/test-giay-phep.mjs` — **37 ca**, chạy trong cổng kiểm soát. Nó khóa cả hai
chiều: văn bản giấy phép phải đủ (toàn văn, mục 13, điều khoản 7b, mốc v4.1.4) *và* ghi danh
phải còn đủ ở cả năm chỗ. Lý do: điều khoản 7(b) chỉ có sức nặng khi chính bản phát hành của
tác giả tuân thủ điều mình đặt ra — một lần dọn mã vô tình xóa mất một chỗ là sau này rất khó
đi đòi người khác giữ.

308 → **345 ca**, 26 → **27 mục** trong cổng kiểm soát.

---

## v4.1.4 — 04/09/2026 — EMAIL NHẮC VIỆC CHƯA TỪNG CHẠY TRÊN BẢN MÁY CÁ NHÂN

### Lỗi: gói phát hành thiếu thư viện gửi email

Rà lại toàn bộ hướng dẫn thì lòi ra: gói **tram-du-an-noi-bo.zip** loại bỏ cả thư mục
`node_modules`, trong đó có `nodemailer` — thư viện DUY NHẤT mà phần mềm cần để gửi thư.
Không hướng dẫn nào bảo người dùng chạy `npm install`, mà bản này thì cách dùng chính là
nhấp đúp file .bat. Hậu quả: **email nhắc việc và email sao lưu hằng tuần chưa bao giờ gửi
được** trên bản chạy máy cá nhân, kể từ khi có tính năng đó.

Tệ hơn, cửa sổ máy chủ báo *"Email nhắc việc: CHƯA cấu hình"* — đổ lỗi cho cấu hình. Ai
gặp phải sẽ đi sửa SMTP, đổi App Password, thử cổng 465/587… mà không bao giờ ra.

Đã vá cả ba tầng:

- **Gói phát hành** giờ kèm sẵn `nodemailer` (675 KB, không có phụ thuộc con). Giải nén
  là email chạy, không phải cài gì thêm. Bản NAS không đổi — Dockerfile vẫn tự `npm ci`.
- **Thông báo nói đúng nguyên nhân**: thiếu thư viện thì in
  *"KHÔNG DÙNG ĐƯỢC — thiếu thư viện nodemailer. Chạy npm install một lần…"*, và ghi luôn
  một dòng cảnh báo vào Nhật ký máy chủ (xem trong "Lịch sử thay đổi" → "Nhật ký máy chủ").
- **Cổng kiểm soát** thêm ca chặn: zip bản nội bộ không có `nodemailer` là không cho phát
  hành. Đây là loại lỗi 308 ca kiểm thử API không đụng tới được, vì nó nằm ở khâu đóng gói.

### Lỗi: CI trên GitHub không bao giờ xanh được

Mục "5. Gói phân phối" của cổng kiểm soát tìm hai file zip trong thư mục `../files` —
thư mục nằm NGOÀI repo và bị gitignore, nên GitHub Actions không bao giờ có. Cả hai zip bị
chấm hỏng, workflow luôn kết luận "CHƯA ĐẠT". Đóng gói là việc của máy phát hành, không
phải của CI: nay vắng thư mục thì **bỏ qua mục đó và nói rõ đã bỏ qua**.

Đã kiểm bằng cách dựng lại đúng cảnh CI (chỉ 105 file được git theo dõi, không có
`../files`, không có `node_modules`): kết quả **ĐỦ ĐIỀU KIỆN PHÁT HÀNH, 23 mục đạt**.

### Hướng dẫn: sửa những chỗ trỏ nhầm

- Mỗi gói đều kèm cả ba file HƯỚNG DẪN, nhưng trong đó lại nhắc tên file chỉ có ở gói kia
  (`HUONG DAN NAS (Synology).txt`, `Khởi động (Windows).bat`…). Nay mỗi hướng dẫn ghi rõ
  ngay đầu file nó thuộc gói nào, và mọi tham chiếu chéo đều kèm tên gói/thư mục.
- HƯỚNG DẪN 3 mục 7: lệnh `scp -r "Chạy trên NAS"/* …` **không chạy trên PowerShell**
  (PowerShell không tự bung dấu `*` cho lệnh ngoài). Thay bằng cách chép qua thư mục tạm
  rồi `cp -r` trên VPS.
- Danh sách file dữ liệu trong HƯỚNG DẪN 1 và 2 thiếu `taskfiles.json` và `config.json`.
- README: quy trình phát hành ghi `git push --tags` — lệnh này chỉ đẩy nhãn, KHÔNG đẩy
  nhánh, nhãn sẽ trỏ vào commit GitHub chưa có. Đã sửa và bổ sung bước tạo GitHub Release.
- `tests/README.md`: ghi nhầm `test-hoi-quy-lan2` phủ R1–R10 (thật ra R1–R12) và nói
  `test-chi-phi-qs` không cần máy chủ (thật ra có gọi API).

---

## v4.1.3 — 04/09/2026 — GHIM CỘT TÊN VIỆC TRÊN GANTT

### Cuộn ngang không còn mất tên việc

Trên màn Dòng thời gian, cuộn sang phải một chút là **cột tên việc trôi ra ngoài**, còn
lại một rừng thanh màu không biết dòng nào là việc gì. Ở dự án vài trăm việc thì gần như
không dùng được: muốn biết thanh nào của việc nào phải cuộn ngược về đầu.

Nay cột tên việc và ô góc của thanh tiêu đề đều được **ghim cố định bên trái**; thanh
công việc trượt xuống dưới nó như bảng tính, và mép cột có đổ bóng nhẹ khi đã cuộn để
thấy rõ đây là cột đang nổi.

Đã kiểm trên trình duyệt thật: cuộn ngang 2.262 px ở mức phóng Ngày — cột tên việc đứng
nguyên tại chỗ, nhãn "Găng" vẫn đọc được. Kéo thanh đổi lịch vẫn hoạt động bình thường
(dời đúng số ngày) và tốc độ không đổi.

### Kiểm thử

301 → **308 ca**. Thêm 7 ca cho việc ghim cột, trong đó có ca kiểm **thứ tự lớp**
(vạch hôm nay → dây phụ thuộc → cột nhãn → thanh tiêu đề → ô góc) — đặt sai thứ tự thì
dây phụ thuộc sẽ vẽ đè lên tên việc, loại lỗi rất khó thấy khi đọc mã.

---

## v4.1.2 — 04/09/2026 — VÁ MẤT SỐ LIỆU CHI PHÍ

Hai lỗi lộ ra khi dựng dữ liệu mẫu để chụp ảnh màn hình cho README — cả hai đều thoát
được bộ kiểm thử vì test chỉ gọi thẳng API máy chủ, chưa đi qua bước xử lý của máy trạm.

### ⚠ MẤT SỐ LIỆU — cập nhật ngay nếu đang dùng v4.1.0 / v4.1.1

**Ngân sách, sổ chi phí thực tế và đề nghị thanh toán bị xóa mỗi khi tải lại trang.**
Hàm chuẩn hóa dữ liệu tài chính ở máy trạm chỉ giữ ba khối cũ (hợp đồng CĐT, thầu phụ,
BOQ) và **vứt bỏ** ba khối thêm ở v4.1.0. Hậu quả dây chuyền: máy trạm tải về bản đã bị
cắt, rồi lần lưu tiếp theo gửi bản cắt đó lên, máy chủ ghi đè thành rỗng — toàn bộ số
liệu chi phí người dùng đã nhập biến mất mà không có thông báo nào.

*Nếu bạn đã nhập ngân sách hoặc chi phí thực tế trên v4.1.0/v4.1.1:* số liệu đó nhiều khả
năng đã mất. Lấy lại từ `data/snapshots/` (bản chụp hằng ngày, giữ 14 ngày) — chép
`finance.json` của ngày trước khi nhập ra rồi đối chiếu.

Đã thêm 8 ca kiểm thử khứ hồi *máy chủ → máy trạm → máy chủ*, bắt buộc mọi khối dữ liệu
phải còn nguyên. Test này thất bại đúng 7 ca khi dựng lại lỗi cũ.

### Việc đã xong không còn bị gắn nhãn đỏ "Quá hạn"

Mọi công việc đã hoàn thành có hạn chót trong quá khứ đều hiện nhãn đỏ **"Quá hạn"** ở
Danh sách, Bảng, Lịch và Việc của tôi — sai về nghiệp vụ (xong rồi thì hết trễ) và làm
dự án cũ đỏ rực cả màn hình, che mất những việc trễ thật. Nay việc đã xong chỉ hiện ngày
hoàn thành với màu trung tính.

### Kiểm thử

288 → **301 ca**. Thêm 8 ca khứ hồi tài chính và 5 ca cho nhãn hạn chót.

---

## v4.1.1 — 04/09/2026 — VÁ LỖI HỒI QUY THEO AUDIT LẦN 2

Bản v4.1.0 được audit lại ngay trong ngày (`Bao-cao-audit-lan-2-Tram-Du-An-v4.1.0-2026-09-04.md`,
điểm 6,6/10). Báo cáo xác nhận cả bốn lỗi B1–B4 đã vá đúng, nhưng chỉ ra **một lỗi hồi quy
nghiêm trọng và hai lỗi làm sai bằng chứng** mà 243 ca test lúc đó không phủ. Bản này vá
toàn bộ R1–R12 và bổ sung **45 ca test** khóa đúng những đường lỗi đó.

### ⚠ Không bật "Thành viên dự án" trên bản v4.1.0
Nếu bạn đã cài v4.1.0, hãy cập nhật lên v4.1.1 **trước khi** dùng tính năng "Thành viên dự
án" — ở v4.1.0 tính năng này làm người bị giới hạn không lưu được gì (xem R1).

### Nghiêm trọng
- **R1 — Bật "Thành viên dự án" làm người bị giới hạn thành CHỈ ĐỌC.** Máy chủ ghép lịch sử
  theo thứ tự [mục ẩn] + [mục người gửi], trong khi luật chống sửa lịch sử đòi đúng khuôn
  [mục MỚI của người gửi] + [nguyên văn lịch sử máy chủ] → mọi lần lưu đều bị từ chối 403.
  Nay ghép đúng khuôn (mục mới nhận diện bằng id chưa có trên máy chủ).
  *Kèm theo:* lỗi trong bước ghép trước đây bị catch rỗng nuốt im lặng; nay ghi vào
  security.log và **từ chối lưu** thay vì lưu một bản đã mất dữ liệu.

### Bằng chứng và số liệu tài chính
- **R2 — Nhật ký kiểm toán ghi cả thay đổi BỊ TỪ CHỐI.** Vết tài chính được ghi trước khi
  kiểm tra khóa kỳ, nên một thao tác trả về 403 vẫn để lại dòng "sửa khối lượng 20 → 99"
  như thể đã xảy ra. Nay chỉ ghi sau khi lưu thành công.
- **R3 — Khóa kỳ nghiệm thu chỉ khóa khối lượng.** Đổi **đơn giá** vẫn làm giá trị kỳ đã nộp
  Chủ đầu tư thay đổi (đo được 20.000.000 → 30.000.000). Nay khi khóa, máy chủ **chụp lại
  đơn giá** của từng hạng mục vào chính kỳ đó; giá trị kỳ đã chốt tính theo bản chụp. Kỳ đã
  khóa cũng không đổi được số kỳ, ngày chốt, và không xóa được hạng mục đã nghiệm thu.
- **R4 — Khóa/mở khóa kỳ không có vết và mở khóa không cần lý do** (hộp thoại có hỏi nhưng
  gọi thẳng API là bỏ qua được). Nay máy chủ bắt buộc lý do và ghi cả hai chiều vào audit.
- **R10 — Nhật ký kiểm toán cắt im lặng ở 300 dòng** (nhập 350 việc thì 50 việc không có vết).
  Nay ghi thêm một dòng tổng kết cho phần vượt trần.

### Hồ sơ và luồng duyệt
- **R6 — "Thùng rác 90 ngày" thực chất là "xóa chậm":** không có đường khôi phục. Nay có
  endpoint khôi phục cho cả biên bản lẫn nhật ký, và **nút "Thùng rác hồ sơ"** ở hai tab
  tương ứng (xem người xóa, lý do, số ngày còn lại, Khôi phục / Xóa vĩnh viễn).
- **R7 — Con dấu "Chỉ huy trưởng đã duyệt" chưa đáng tin:** duyệt được cả bản còn Nháp,
  thêm ảnh vào bản đã duyệt vẫn được, người lập xóa được bản đã duyệt. Nay: phải qua bước
  "Đã nộp" mới duyệt; bản đã duyệt khóa cả ảnh; chỉ Chủ sở hữu/Lãnh đạo mới xóa được.

### Phạm vi dự án
- **R8 — Tài chính chưa theo phạm vi dự án:** người có quyền tài chính nhưng không thuộc dự
  án vẫn đọc được BOQ, đơn giá, hợp đồng của dự án giới hạn. Nay lọc khi đọc và **ghép lại
  khi ghi** (không thì mỗi lần họ lưu là xóa sạch tài chính của dự án họ không thấy).
- **R9 — Báo cáo ngày không hề được lọc:** bộ lọc viết theo trường `lines` không tồn tại
  (dữ liệu thật dùng `items`), nên tên việc của dự án ẩn lộ ra ngoài. Nay tra dự án qua
  `taskId` của từng dòng; dòng ẩn vẫn được giữ nguyên khi người ngoài lưu.

### Đồng bộ và tính toán
- **R5 — Gộp xung đột chỉ thành công một nửa:** lịch sử sau khi gộp bị sắp lại theo thời
  gian, nên khi bạn thao tác TRƯỚC nhưng người kia lưu TRƯỚC (trường hợp thường gặp) thì
  máy chủ từ chối và thao tác vẫn mất. Nay không sắp lại — kiểm chứng trên trình duyệt:
  cả hai thay đổi đều còn, thông báo "đã được gộp vào bản mới, không mất gì".
- **R11 — "Doanh thu đã nghiệm thu" ở tab Chi phí cộng cả phát sinh CHƯA DUYỆT**, lệch với
  tab BOQ và thổi lãi gộp lên. Nay chỉ tính dòng gốc + VO đã duyệt, và dùng đơn giá đã chốt
  của kỳ khóa.
- **R12 — Mốc (milestone) vẫn ăn 1 ngày công** trong tính đường găng. Nay bằng 0.

### Kiểm thử
243 → **288 ca**. Thêm `tests/test-hoi-quy-lan2.mjs` (40 ca cho R1–R10) và 5 ca cho R5/R12
trong hai tệp sẵn có. Ba đường lỗi mà báo cáo nêu là "test không phủ" (R1, R2, R5) nay đều
có ca test riêng.

### Còn để ngỏ (không đổi so với v4.1.0)
P3/P4 · Q4 · Q6 · Q9/U4 · H4 · H6 · U6 · U7 · A2 (ảo hóa Danh sách) · A4 · A11 ·
R11 (công thức VAT của Đề nghị thanh toán — cần kế toán chốt: hiện tính VAT **sau** khi trừ
giữ lại và tạm ứng; thông lệ phổ biến là tính trên giá trị nghiệm thu).

---

## v4.1.0 — 04/09/2026 — XỬ LÝ TOÀN BỘ BÁO CÁO AUDIT NĂM VAI TRÒ

Bản này giải quyết báo cáo `Bao-cao-audit-5-vai-tro-Tram-Du-An-2026-09-04.md`
(điểm 5,1/10): cả 4 lỗi phải vá ngay, toàn bộ gói 1 tuần, toàn bộ gói 1 tháng
và phần lớn gói 1 quý.

### ⚠ THAY ĐỔI HÀNH VI — đọc trước khi cập nhật

1. **Xóa biên bản / nhật ký thi công KHÔNG còn xóa vĩnh viễn ngay.** Hồ sơ vào
   thùng rác 90 ngày, phải ghi lý do; chỉ Chủ sở hữu mới xóa hẳn được.
2. **Nhật ký thi công có trạng thái Nháp → Đã nộp → Chỉ huy trưởng duyệt.**
   Sau khi duyệt thì khóa sửa; chỉ Chủ sở hữu / Lãnh đạo mở khóa được.
3. **Hai người lập nhật ký cùng một ngày**: người thứ hai nhận thông báo
   "ngày này đã có nhật ký của X" thay vì âm thầm ghi đè (lỗi B3).
4. **Đường găng nay tính theo NGÀY LÀM VIỆC** của dự án (mặc định nghỉ Chủ
   nhật). Số ngày dự trữ có thể khác bản cũ — đây là cách tính đúng.
5. **Lãnh đạo mặc định CHỈ XEM chi phí.** Muốn cho sửa thì bật thêm quyền
   "Sửa chi phí" trong Cộng tác. Tài khoản cũ giữ nguyên quyền sửa như trước.
6. **Kỳ nghiệm thu có thể KHÓA.** Kỳ đã khóa thì không ai sửa được số liệu,
   kể cả người có quyền sửa chi phí; mở khóa phải ghi lý do và chỉ Chủ sở hữu.
7. **Dự án có thể giới hạn thành viên.** Dự án chưa khai thành viên vẫn mở cho
   cả công ty như trước; khi đã khai thì người ngoài không tải được dữ liệu,
   tệp và hồ sơ của dự án đó.
8. **Màn Gantt nay có khung cuộn riêng cao 560 px** (ảo hóa dòng) thay vì kéo
   dài theo cả trang.

### Bốn lỗi làm sai dữ liệu — đã vá
- **B1** Kéo thanh Gantt lệch −1 ngày do múi giờ (`isoOf` dùng `toISOString`
  trên ngày local). Nay định dạng theo giờ địa phương; có 6 ca test cho việc
  kéo k ngày ra đúng k ngày, kể cả qua ranh giới năm.
- **B2** Mất mạng vẫn báo "Đã đồng bộ" và thao tác mất khi tải lại trang. Nay
  có nhãn đỏ "CHƯA LƯU — mất kết nối", hàng đợi trong `localStorage`, tự gửi
  lại khi có mạng và chặn đóng tab khi còn thay đổi chưa lưu.
- **B3** Nhật ký cùng ngày bị bản sau đè, vẫn giữ tên người lập cũ. Nay trả
  409 kèm tên người đã lập.
- **B4** Đường găng tính trên tập việc ĐANG LỌC. Nay CPM luôn chạy trên toàn
  bộ việc của dự án; bộ lọc chỉ quyết định vẽ dòng nào.

### Tiến độ & kế hoạch
- **P1 — Cấu trúc WBS.** Thêm nút "Nhóm theo: Trạng thái | Giai đoạn". Nhóm
  theo giai đoạn có mã số WBS và **% hoàn thành tính theo trọng số thời lượng**
  (việc 20 ngày nặng gấp 10 lần việc 2 ngày), thay vì đếm số việc. Thêm **mốc
  (milestone)**: việc không có thời lượng, vẽ hình thoi trên Gantt.
- **P2 — Phụ thuộc đầy đủ.** Ngoài FS nay có **SS / FF / SF** và **độ trễ
  (lag/lead)** cho từng liên kết. Thêm **lịch làm việc của dự án** (ngày nghỉ
  hằng tuần + ngày lễ); CPM tính trên trục ngày làm việc thật.
- **P5 — Nhật ký thi công có cấu trúc.** Bảng nhân lực theo tổ đội (có tổng),
  bảng máy móc theo giờ, **bảng khối lượng theo hạng mục BOQ** (là số nên cộng
  dồn được), thời tiết chi tiết (nhiệt độ, giờ mưa, giờ ngừng việc), mục
  **Sự cố / mất an toàn tách riêng**, ô ý kiến TVGS/Chủ đầu tư, và luồng ký
  duyệt của Chỉ huy trưởng. Bản in cập nhật đủ các mục mới.
- **P6** Lỗi tải ảnh nhật ký không còn bị nuốt — báo rõ số ảnh hỏng.
- **P7** Gantt có **mức phóng Ngày / Tuần / Tháng** (dự án 1.000 việc rút từ
  13.484 px xuống 2.264 px bề ngang).

### Chi phí & khối lượng (QS)
- **Q1 — Phát sinh (VO).** Dòng BOQ có thể là dòng phát sinh, mang số hiệu VO
  và trạng thái Đề xuất / Đã duyệt / Từ chối. **Chỉ VO đã duyệt mới cộng vào
  giá trị hợp đồng**; có cảnh báo tổng giá trị VO đang chờ.
- **Q2 — Ngân sách vs chi phí thực tế.** Tab "Chi phí thực tế" mới: ngân sách
  theo 6 nhóm (vật tư, nhân công, máy, thầu phụ, chung, khác), sổ chi phí thực
  tế (ngày, nhóm, chứng từ, nhà cung cấp, số tiền), và bảng đối chiếu Doanh thu
  đã nghiệm thu / Ngân sách / Đã cam kết / Thực tế / **Lãi gộp tạm tính**.
- **Q3 — Vết sửa số liệu tài chính + khóa kỳ.** Máy chủ tự ghi nhật ký kiểm
  toán cấp trường cho đơn giá, khối lượng hợp đồng và khối lượng từng kỳ; kỳ
  đã nộp Chủ đầu tư có thể khóa.
- **Q5 — Đề nghị thanh toán.** Sinh thẳng từ kỳ nghiệm thu: giá trị kỳ − giữ
  lại bảo hành − khấu trừ tạm ứng + VAT (VAT tính sau khấu trừ, đúng thông lệ).
- **Q7 — Tách quyền tài chính.** "Xem chi phí" và "Sửa chi phí" là hai quyền
  riêng; Kế toán/Lãnh đạo có thể chỉ xem.
- **Q8** Số trong BOQ được chuẩn hóa về kiểu số khi lưu, không còn lẫn chuỗi.

### Chất lượng & an toàn (QA/QC – HSE)
- **H1 — Lỗi tồn đọng (punch list).** Tab mới với vị trí, mức độ, nhà thầu chịu
  trách nhiệm, hạn khắc phục; lọc theo vị trí / nhà thầu / trạng thái; đếm
  Đang mở / Đã sửa / Đã xác nhận / Quá hạn. Ảnh **trước – sau khắc phục** có
  nhãn rõ. Vòng đời bám đúng luồng duyệt sẵn có, nên người được giao chỉ báo
  được "đã sửa" chứ không tự hạ mức độ hay nới hạn.
- **H2 — Bảng kiểm nghiệm thu số hóa.** Biên bản loại "Nghiệm thu nội bộ" với
  **8 mẫu bảng kiểm** (cốp pha, cốt thép, bê tông, hoàn thiện, MEP, an toàn đầu
  giờ, giàn giáo, giấy phép làm việc), từng mục Đạt / Không đạt / N/A + ghi chú,
  có kết quả tổng. **Mục Không đạt tự sinh lỗi tồn đọng.** Biên bản nay sửa
  được sau khi lập (trước chỉ tạo hoặc xóa).
- **H3 — Module An toàn (HSE).** Tab mới: số ngày không tai nạn, sổ sự cố lấy
  từ nhật ký thi công, danh sách họp an toàn đầu giờ và giấy phép làm việc.
- **H5 — Thùng rác hồ sơ.** Xóa biên bản/nhật ký là chuyển vào thùng rác 90
  ngày kèm lý do; chỉ Chủ sở hữu xóa hẳn.

### Giao diện & hiện trường
- **U1** Dòng việc trên điện thoại: tên việc chiếm dòng riêng, không còn bị
  dải nhãn ép về 0.
- **U2 — Nhập liệu nhanh.** Nút **"Chụp ảnh"** mở thẳng camera sau; **nén ảnh
  trên máy** (≤1600 px, JPEG 0,8 — đo được 11,4 MB → 458 KB); danh sách ảnh có
  dung lượng và nút bỏ từng ảnh; **nút micro đọc thành chữ** (Web Speech) cho
  mọi ô của nhật ký.
- **U3** Phiên đăng nhập sống qua lần khởi động lại máy chủ (lưu băm token vào
  `sessions.json`), hạn 30 ngày.
- **U5 — Không còn "gõ xong mất".** Khi hai người lưu cùng lúc, ứng dụng **gộp
  ba chiều theo từng bản ghi** thay vì tải lại và bỏ hết: ai sửa việc nào thì
  giữ việc đó; chỉ khi cả hai cùng sửa MỘT việc mới nhường máy chủ, và báo
  đúng tên việc cần kiểm tra lại.

### Kiến trúc, hiệu năng, phân quyền
- **A1/A2 — Gantt nhanh hơn ~9 lần.** CPM và hình học đưa vào `useMemo`, mỗi
  dòng thành `React.memo`, và **ảo hóa dòng**. Dự án 1.000 việc: kéo thanh từ
  **64 ms xuống 7 ms mỗi khung hình**, DOM từ 24.192 xuống 3.783 nút.
- **A3 — Cache máy chủ.** `data.json` được giữ trong RAM, chỉ đọc lại đĩa khi
  tệp đổi (so mtime + size). Tiết kiệm ~3,3 ms mỗi request ở khối 514 KB, tăng
  tuyến tính theo cỡ dữ liệu.
- **A5** Thêm luật máy chủ cho báo cáo ngày: chỉ chủ báo cáo sửa nội dung của
  mình, người khác chỉ thêm bình luận đứng tên mình.
- **A6 — Thành viên theo dự án.** Dự án có thể khai danh sách thành viên; máy
  chủ **lọc dữ liệu khi đọc** và **ghép lại khi ghi** để người bị giới hạn
  không làm mất dữ liệu dự án họ không thấy. Cổng xem tệp/hồ sơ tôn trọng
  danh sách này.
- **A8/A10 — Nhật ký kiểm toán do MÁY CHỦ ghi.** `audit.jsonl` chỉ-thêm, tự
  sinh từ phần diff máy chủ đã tính: ai, khi nào, IP, rev, thực thể, trường,
  trước → sau. Không ai xóa được qua ứng dụng. Có tab "Nhật ký máy chủ" cho
  Chủ sở hữu / Lãnh đạo. Trước đây "Lịch sử" do máy trạm tự ghi và là tự nguyện.
- **A9** Ghi lịch sử cho ngày bắt đầu, thời lượng, đổi trạng thái, lưu kế
  hoạch gốc, xóa vĩnh viễn, đổi thành viên dự án.

### Kiểm thử
Bộ kiểm thử tăng từ 74 lên **243 ca**, thêm 6 tệp test mới:
`test-audit-trail`, `test-loi-ton-dong`, `test-nghiem-thu`,
`test-nhat-ky-cau-truc`, `test-thanh-vien-du-an`, `test-chi-phi-qs`,
`test-gop-xung-dot`. Chạy một lệnh: `node tests/kiem-tra-tat-ca.mjs`.

### Còn để ngỏ (gói quý sau)
P3/P4 (kế hoạch gốc nhiều phiên bản, ngày bắt đầu/kết thúc thực tế) ·
Q4 sổ khối lượng lũy kế từ nhật ký · Q6 rev tài chính theo từng dự án ·
Q9/U4 BOQ và Gantt dạng thẻ cho điện thoại · H4 tiêu chí bắt buộc trước khi
duyệt · H6 danh mục loại biên bản cấu hình được · U6 thông báo đẩy (Web Push) ·
U7 nợ i18n và aria-label · A2 ảo hóa màn Danh sách · A4 đồng bộ theo patch ·
A11 báo cáo "ai sửa gì tuần này".

---

## v4.0.0 — 04/09/2026 — PHẦN MỀM TỰ DO

### Gỡ bỏ hoàn toàn cơ chế giấy phép
Tác giả quyết định chia sẻ phần mềm miễn phí cho mọi người. Toàn bộ phần
khóa bản quyền đã được gỡ khỏi mã nguồn, không phải vô hiệu hóa:
- Bỏ hạn dùng thử 6 tháng, chữ ký số của hạn dùng thử và 3 bản phản chiếu
  (config.json, tài khoản chủ, kho dữ liệu), cơ chế chống lùi đồng hồ.
- Bỏ chế độ CHỈ ĐỌC khi hết hạn: máy chủ không còn chặn ghi, không còn
  trả lỗi 423 cho bất kỳ thao tác nào.
- Bỏ hai endpoint /api/license và /api/license/activate, bỏ khóa công khai
  dùng để kiểm mã gia hạn.
- Giao diện: bỏ thanh nhắc gia hạn màu vàng/đỏ, hộp thoại "Gia hạn giấy
  phép" và mục tương ứng trong Cài đặt.
- Khi khởi động, phần mềm tự dọn dấu vết giấy phép cũ trong thư mục dữ
  liệu (config.json, data.json, accounts.json). Người dùng không phải làm gì.
- Bỏ bộ test giấy phép (8 ca) khỏi bộ kiểm thử và CI.

### Giấy phép mới
- LICENSE.txt: dùng, sao chép, chỉnh sửa, phân phối và bán tự do (MIT),
  điều kiện duy nhất là giữ lại dòng ghi danh tác giả. Không giới hạn thời
  gian, không mã kích hoạt, không bảo hành.
- Cập nhật hai tài liệu .docx và sổ tay vận hành cho khớp.

Nâng cấp từ bản cũ: chép đè toàn bộ thư mục (trừ thư mục "data") rồi khởi
động lại. Dữ liệu giữ nguyên; hạn dùng thử cũ trở nên vô nghĩa.


## v3.13.0 — 17/08/2026 (gói cải thiện 1 tuần theo audit ba vai trò)

### Giao diện dễ đọc hơn cho mọi người (U1)
- Sửa toàn bộ chữ và biểu tượng có tương phản dưới chuẩn WCAG AA: chữ phụ,
  nút biểu tượng, nhãn biểu đồ, thẻ bộ phận, số liệu lớn, nút cam có chữ
  trắng. Đo lại trên màn hình thật: **0 vi phạm** (trước đó 128 chỗ chữ
  ở mức 2,56:1, chuẩn cần 4,5:1). Người lớn tuổi và người dùng ngoài
  công trường đọc dễ hơn rõ rệt.

### Hộp thoại trong app thay hộp thoại trình duyệt (U2)
- 18 hộp thoại xác nhận/cảnh báo/nhập liệu kiểu cũ (chặn cả trình duyệt,
  không theo giao diện phần mềm) nay là hộp thoại AntD trong app: có tiêu
  đề tiếng Việt, nút Hủy/Xóa rõ ràng, bấm ra ngoài để đóng.
- Đặt lại mật khẩu thành viên: dùng ô nhập mật khẩu có kiểm tra độ mạnh
  ngay tại chỗ thay cho ô nhập thô của trình duyệt.

### Nhanh hơn trên wifi và NAS (T4)
- Bật nén gzip: **app.js 1,16 MB → 356 KB**; dữ liệu đồng bộ
  **217 KB → 5,7 KB** mỗi lần tải. Mở phần mềm lần đầu và đồng bộ giữa
  các máy nhanh hơn hẳn, nhất là qua wifi hoặc NAS ở xa.

### Không chết âm thầm (T5)
- Máy chủ ghi rõ lỗi nghiêm trọng vào security.log rồi thoát sạch để dịch
  vụ/Docker khởi động lại, thay vì tắt lặng lẽ. Có xử lý tín hiệu dừng.
- Hướng dẫn chạy nền tự khởi động lại (NSSM / Startup) trong sổ tay vận hành.

### Tài liệu (P1, P4)
- **Sách hướng dẫn sử dụng** cập nhật lên bản 3.12: thêm 5 mục song ngữ
  (Gantt & đường găng, BOQ – khối lượng – chi phí, giao–trả về–thùng rác–
  email, quyền xem tệp & sửa dữ liệu, vận hành HTTPS/sao lưu).
- **Hướng dẫn cài đặt** cập nhật lên bản 3.12: thêm mục 16 (HTTPS trên máy
  tính, đổi cổng, sao lưu hằng ngày, thay đổi hành vi về quyền, giấy phép).
- **Mới: "VẬN HÀNH & SỰ CỐ.txt"** — sổ tay cho người quản trị tại công ty:
  10 sự cố thường gặp kèm cách xử lý từng bước, việc cần làm hằng
  ngày/tuần/tháng, khi nào cần gọi tác giả.

### Quy trình phát hành (P2)
- Bắt đầu gắn thẻ phiên bản (git tag) cho mỗi bản phát hành và ghi rõ
  nhịp phát hành trong README.

## v3.12.1 — 17/08/2026

### Vá bug vỡ tiếng Việt với dữ liệu lớn (tìm ra nhờ đo tải)
- `readBody` decode từng chunk riêng lẻ — body lớn bị cắt giữa ký tự tiếng
  Việt 3-byte làm hỏng chữ ("Công việc" -> "Công vi❍c"). Bug ẩn từ bản đầu,
  chỉ lộ với dữ liệu lớn; nay ghép buffer rồi decode một lần. (Luật bảo vệ
  lịch sử của máy chủ đã chặn các bản ghi hỏng trước khi vào đĩa.)

### Đo tải chính thức (mục 30 ngày của audit đợt 5)
- `tests/test-tai.mjs`: mô phỏng N người dùng đúng hành vi client thật.
- Kết quả: 25 người / 5.000 việc / khối 1,74MB -> poll rev p95 44ms, pull
  p95 70ms, ghi p95 113ms, 0 lỗi, RAM server đứng yên 65MB. Xung đột 409
  tự pull-ghi-lại, không mất dữ liệu.
- Ngưỡng vận hành khuyến nghị ghi tại docs/HIEU-NANG.md (≤25 người,
  ≤5.000 việc mở thoải mái; cảnh báo 5MB; trần 8MB).
- Luật lịch sử có thêm chẩn đoán chi tiết vào security.log khi từ chối.

## v3.12.0 — 17/08/2026 (đóng các phát hiện audit đợt 5)

### F1 — Phân quyền sửa nội dung theo trường (THAY ĐỔI HÀNH VI)
- Người KHÔNG có quyền giao việc giờ chỉ được: cập nhật %/trạng thái việc
  CỦA MÌNH, tick việc con, bình luận (đúng tên mình, không sửa/xóa bình
  luận cũ), và các thay đổi tự động của phần mềm (sinh việc lặp lại,
  chuyển todo->đang làm khi tới ngày). Sửa tên/mô tả/hạn/phân công/dự án/
  cột và TẠO việc mới cần quyền giao việc — chặn tại máy chủ, DevTools
  không lách được. Người được giao không thể tự chuyển 'hoàn thành' —
  phải qua bước duyệt.

### F2 — Chống ghi đè đồng thời dữ liệu tài chính (CAS)
- /api/finance dùng expectedRev: bản cũ bị từ chối 409, KHÔNG ghi đè
  thầm lặng; app tự tải bản mới và báo người dùng thao tác lại.
  (Đồng thời sửa lỗi rev tài chính không bao giờ tăng.)

### F3 — Diễn tập khôi phục trọn hồ sơ
- test-restore chép cả cây tệp đính kèm (uploads, nhật ký, tệp việc),
  kiểm tra tài chính và đối chiếu SHA-256 từng byte tệp qua API.

### F4 — Docker fail-closed
- Dockerfile dùng npm ci với package-lock, bỏ nuốt lỗi, thêm HEALTHCHECK;
  CI thêm job build image + smoke test.

### F5 — Thống nhất quyền biên bản UI ↔ máy chủ
- Nút thêm biên bản/nhật ký chỉ hiện cho đúng người máy chủ cho phép
  (chủ sở hữu, lãnh đạo, teamlead bộ phận Site, người được chỉ định).

### F6 — Hết cuộn ngang mobile
- Dashboard đo thật tại 360/390/768px: document đúng bằng viewport,
  không container nào tràn ngang.

### F7 — Release gate đa runtime
- CI chạy ma trận Node 20 + 24; sửa các script test abort trên
  Node 24/Windows; khai báo engines; tài liệu test không ghi cứng số ca.

### F8 — Từ chối body quá lớn một cách tử tế
- JSON vượt 8MB nhận 413 có cấu trúc thay vì đứt kết nối khó hiểu.

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
