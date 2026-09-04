# Giấy phép sử dụng — Trạm Dự Án (bản giải thích tiếng Việt)

© 2026 Khuong Doan · <https://khuongdoan.com/>

**Giấy phép: GNU Affero General Public License phiên bản 3 trở lên (AGPL-3.0-or-later)**

> Đây là bản **giải thích cho dễ hiểu**, không phải văn bản pháp lý. Bản có giá trị pháp lý
> là [LICENSE](../LICENSE) — toàn văn AGPL-3.0 tiếng Anh kèm điều khoản bổ sung. Nếu hai bản
> hiểu khác nhau thì lấy bản tiếng Anh làm chuẩn.
>
> Người dùng cuối tải gói đóng sẵn sẽ thấy bản này rút gọn trong `LICENSE.txt`.

---

## Đọc nhanh: điều này ảnh hưởng gì đến bạn?

| Bạn là | Phải làm gì |
|---|---|
| Công ty cài để nhân viên mình dùng | **Không phải làm gì cả.** Miễn phí, vĩnh viễn, không giới hạn người dùng. |
| Công ty tự sửa mã cho hợp cách làm của mình, dùng nội bộ | Không phải công khai gì, miễn là không đưa ra ngoài công ty. |
| Cho người ngoài công ty dùng qua Internet | Chỉ mã nguồn của bản bạn đang chạy — sửa một dòng trong `config.json` là xong. |
| Giao/bán phần mềm cho công ty khác | Phải kèm mã nguồn đầy đủ, cũng theo AGPL. Không được đóng kín lại. |
| Muốn bán bản đóng kín, không công khai mã | Phải mua giấy phép thương mại riêng từ tác giả. |

---

## 1. Công ty bạn dùng phần mềm này: không đổi gì so với trước

- **Miễn phí**, dùng vĩnh viễn, không giới hạn số người, không mã kích hoạt, không hạn dùng thử.
- Cài trên bao nhiêu máy tùy ý, cho toàn bộ nhân viên và thầu phụ của bạn dùng.
- Được xem toàn bộ mã nguồn, được **sửa** cho hợp với cách làm của công ty mình.
- Dữ liệu nằm trọn trong thư mục `data` trên máy của bạn. Tác giả không thu thập gì, phần
  mềm không gọi về đâu cả.

Ba điều trên **không thay đổi** khi chuyển từ MIT sang AGPL. Toàn bộ phần còn lại của tài
liệu này chỉ liên quan khi bạn **đưa phần mềm ra ngoài** công ty mình.

---

## 2. Nếu bạn giao phần mềm cho người khác

Được phép — **kể cả bán**. AGPL không cấm bán. Nhưng phải kèm theo:

1. **Mã nguồn đầy đủ**, gồm cả những chỗ bạn đã sửa, cũng dưới giấy phép AGPL này.
2. **Ghi danh tác giả** giữ nguyên (xem mục 4).

Nói cách khác: bạn không được lấy phần mềm này, đóng kín mã nguồn lại rồi bán như sản phẩm
của riêng mình. Người nhận từ bạn có đúng những quyền mà bạn đang có — bao gồm quyền tiếp
tục chia sẻ lại miễn phí.

---

## 3. Nếu bạn cho người ngoài dùng qua mạng (hosting, tên miền, Internet)

Đây là điểm khác biệt lớn nhất của AGPL so với các giấy phép mã nguồn mở khác, nằm ở
**mục 13** của giấy phép. Với phần lớn giấy phép, chạy phần mềm trên máy chủ cho người khác
dùng thì không tính là "phân phối" nên không phải công khai gì. AGPL bịt lỗ đó lại.

**Nếu bạn KHÔNG sửa gì:** không phải làm gì thêm. Phần mềm đã có sẵn liên kết
**"Mã nguồn (AGPL-3.0)"** ở chân thanh bên và chân màn hình đăng nhập, trỏ về kho mã gốc.
Thế là đã đúng luật.

**Nếu bạn CÓ sửa:** phải công khai mã nguồn bản đã sửa cho những người dùng đó. Cách làm:

1. Đăng mã nguồn của bạn lên đâu đó công khai được — GitHub, GitLab, hoặc trang web công ty.
2. Mở `data/config.json`, sửa dòng `sourceUrl` trỏ vào đấy:

```json
"sourceUrl": "https://github.com/cong-ty-cua-ban/tram-du-an",
```

3. Khởi động lại. Liên kết trong giao diện tự đổi theo, và cửa sổ máy chủ cũng in ra địa chỉ đó.

Xong. Đó là toàn bộ nghĩa vụ của mục 13.

---

## 4. Ghi danh tác giả — bắt buộc giữ

Theo **điều khoản bổ sung mục 7(b)** ghi trong [LICENSE](../LICENSE), dòng

> Phần mềm do Khuong Doan phát triển — https://khuongdoan.com/

phải được giữ nguyên ở **tất cả** những chỗ nó đang xuất hiện:

1. Chân thanh bên và chân màn hình đăng nhập
2. Banner cửa sổ máy chủ lúc khởi động
3. Trường `author` / `authorUrl` mà `GET /api/config` trả về
4. Chân các biểu mẫu in và tệp xuất ra
5. File `LICENSE` và `LICENSE.txt`

**Được phép:** thêm dòng ghi danh của bạn bên cạnh — ví dụ *"Chỉnh sửa bởi Công ty X"* — và
dịch dòng trên sang ngôn ngữ khác.

**Không được:** thay thế, che, thu nhỏ cho khó đọc hơn chữ xung quanh, hay xóa bỏ.

Đây không phải chuyện lịch sự. Theo **mục 8** của giấy phép, xóa ghi danh làm **chấm dứt
toàn bộ quyền** sử dụng phần mềm mà giấy phép này trao cho bạn — tức là từ lúc đó bạn đang
dùng phần mềm không có giấy phép.

---

## 5. Muốn dùng mà không muốn công khai mã nguồn?

Có một cách hợp pháp: **mua giấy phép thương mại riêng**. Tác giả là người giữ bản quyền nên
có quyền cấp cho bạn một giấy phép khác với AGPL, cho phép bạn giữ kín mã nguồn bản sửa.

Liên hệ: <https://khuongdoan.com/>

---

## 6. Không bảo hành

Phần mềm được cung cấp **"nguyên trạng"** (as is), không kèm bảo đảm dưới bất kỳ hình thức
nào — dù rõ ràng hay ngụ ý — bao gồm khả năng bán được, sự phù hợp cho một mục đích cụ thể,
và không vi phạm quyền của bên thứ ba. Tác giả không chịu trách nhiệm cho bất kỳ khiếu nại,
thiệt hại hay trách nhiệm pháp lý nào phát sinh từ việc sử dụng phần mềm.

Hãy sao lưu thư mục `data` đều đặn — xem PHẦN D của *"HƯỚNG DẪN 1 - Chạy trên máy cá nhân"*
hoặc mục SAO LƯU của *"HƯỚNG DẪN 2 - Chạy trên NAS công ty"*.

---

## 7. Lịch sử giấy phép — đọc kỹ nếu bạn có bản cũ

| Phiên bản | Giấy phép |
|---|---|
| v4.1.4 trở về trước | MIT |
| v4.2.0 trở đi | AGPL-3.0-or-later + điều khoản bổ sung 7(b) |

Ai đã nhận một bản v4.1.4 hoặc cũ hơn thì **giữ nguyên quyền theo MIT cho bản ấy, vĩnh viễn**
— kể cả quyền bán lại bản đóng kín. Giấy phép đã trao thì không thu hồi được. Việc đổi giấy
phép chỉ áp dụng cho các bản phát hành **từ v4.2.0 trở đi**.

Nếu bạn đang dùng bản cũ và không muốn chịu ràng buộc của AGPL, bạn có quyền ở lại bản đó.
Nhưng bản đó sẽ không nhận thêm bản vá lỗi hay tính năng mới.

---

## 8. Vì sao đổi từ MIT sang AGPL?

MIT cho phép bất kỳ ai lấy phần mềm này, đổi logo, đóng kín mã nguồn rồi bán cho nhà thầu
khác mà không cần đóng góp gì lại, thậm chí không cần giữ tên tác giả trên giao diện.

AGPL giữ nguyên mọi quyền tự do cho **người dùng thật** — các công ty xây dựng cài về chạy
trên NAS của mình — nhưng chặn đúng trường hợp trên. Ai cải tiến phần mềm thì phần cải tiến
đó cũng phải quay lại cộng đồng, thay vì trở thành sản phẩm đóng của một bên.

Đây vẫn là **phần mềm tự do và mã nguồn mở** theo đúng định nghĩa của FSF và OSI.

---

Phần mềm do **Khuong Doan** phát triển — <https://khuongdoan.com/>
