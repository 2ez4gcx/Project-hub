/* Chốt chặn giấy phép AGPL-3.0 và ghi danh tác giả.

   Điều khoản bổ sung mục 7(b) chỉ có sức nặng khi dòng ghi danh THẬT SỰ còn ở đủ các chỗ
   đã liệt kê trong LICENSE. Nếu một lần dọn mã vô tình xóa mất một chỗ, thì chính bản phát
   hành của tác giả lại không khớp với điều khoản mình đặt ra — lúc đi đòi người khác giữ
   ghi danh sẽ rất khó ăn nói. Bộ này khóa cả hai chiều: văn bản giấy phép và ghi danh
   trong mã.

   Không cần máy chủ: đọc thẳng file.
   Cách dùng:  node tests/test-giay-phep.mjs */
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const doc = (...p) => readFileSync(path.join(ROOT, ...p), "utf8");

let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };

const GHI_DANH = "Khuong Doan";
const TRANG_WEB = "khuongdoan.com";

// ══════════ 1. Văn bản giấy phép ══════════
/* LICENSE phải là AGPL NGUYÊN VĂN, không thêm bớt gì: GitHub chỉ nhận diện đúng giấy phép
   khi văn bản khớp bản gốc — chèn một đoạn đầu file là nó hiện "Other". Vì vậy phần bản
   quyền và điều khoản bổ sung để riêng ở DIEU-KHOAN-BO-SUNG.txt. */
const LIC = doc("LICENSE");
ok("LICENSE là AGPL v3, không phải giấy phép khác", LIC.startsWith("                    GNU AFFERO GENERAL PUBLIC LICENSE") && LIC.includes("Version 3, 19 November 2007"));
ok("LICENSE có toàn văn, không phải bản rút gọn", LIC.includes("END OF TERMS AND CONDITIONS") && LIC.length > 30000, "dài " + LIC.length + " ký tự");
ok("LICENSE giữ mục 13 (chạy qua mạng) — điểm khác biệt chính của AGPL", LIC.includes("13. Remote Network Interaction"));
ok("LICENSE KHÔNG bị chèn thêm gì (nếu không GitHub hiện giấy phép là Other)",
   !LIC.includes("SPDX-License-Identifier") && !LIC.includes(GHI_DANH),
   "có đoạn lạ trong LICENSE");

const BS = doc("DIEU-KHOAN-BO-SUNG.txt");
ok("DIEU-KHOAN-BO-SUNG nêu điều khoản 7(b)", BS.includes("section 7(b)") && BS.includes("MUST PRESERVE"));
// (đoạn lịch sử xuống dòng giữa "MIT" và "License" nên đừng tìm cả cụm)
ok("DIEU-KHOAN-BO-SUNG ghi rõ mốc đổi giấy phép để không ai nhầm bản cũ",
   BS.includes("v4.1.4") && BS.includes("LICENSE HISTORY") && /\bMIT\b/.test(BS));
ok("DIEU-KHOAN-BO-SUNG có dòng SPDX và tên tác giả",
   BS.includes("SPDX-License-Identifier: AGPL-3.0-or-later") && BS.includes(GHI_DANH));
ok("DIEU-KHOAN-BO-SUNG hướng dẫn mục 13 (sourceUrl)", BS.includes("sourceUrl") && BS.includes("section 13"));

for (const d of ["Chạy nội bộ", "Chạy trên NAS"]) {
  const t = doc(d, "LICENSE.txt");
  ok(d + "/LICENSE.txt kèm TOÀN VĂN giấy phép (bắt buộc theo mục 4)",
     t.includes("GNU AFFERO GENERAL PUBLIC LICENSE") && t.includes("END OF TERMS AND CONDITIONS"));
  ok(d + "/LICENSE.txt có bản tóm tắt tiếng Việt cho người dùng cuối", t.includes("BẢN TÓM TẮT DỄ HIỂU"));
  ok(d + "/LICENSE.txt gộp cả điều khoản bổ sung 7(b)", t.includes("MUST PRESERVE"));
  ok(d + "/DIEU-KHOAN-BO-SUNG.txt đi kèm gói", doc(d, "DIEU-KHOAN-BO-SUNG.txt").includes("MUST PRESERVE"));
  const pkg = JSON.parse(doc(d, "package.json"));
  ok(d + "/package.json khai đúng giấy phép", pkg.license === "AGPL-3.0-or-later", "đang là " + pkg.license);
}

// ══════════ 2. Ghi danh trong mã — đủ 5 chỗ mà LICENSE đã liệt kê ══════════
const JSX = doc("Chạy nội bộ", "ProjectManager.jsx");
const SRV = doc("Chạy nội bộ", "server.js");

ok("(1) chân thanh bên & màn đăng nhập: hằng số ghi danh còn nguyên",
   JSX.includes('const AUTHOR_CREDIT = "Phần mềm do ' + GHI_DANH) && JSX.includes('const AUTHOR_URL = "https://' + TRANG_WEB));
ok("(1) khối AuthorCredit vẫn được dựng ở cả hai màn hình",
   (JSX.match(/<AuthorCredit/g) || []).length >= 2);
ok("(2) banner máy chủ in tên tác giả và giấy phép",
   SRV.includes("Tác giả: \" + TAC_GIA") && SRV.includes("Giấy phép: AGPL-3.0"));
ok("(3) /api/config trả về ghi danh + giấy phép + mã nguồn",
   SRV.includes('license: "AGPL-3.0-or-later"') && SRV.includes("author: TAC_GIA") && SRV.includes("sourceUrl: CONFIG.sourceUrl"));
ok("(4) chân biểu mẫu in mang ghi danh", JSX.includes("Phần mềm do " + GHI_DANH + " phát triển ·"));
ok("(5) tiêu đề giấy phép ở đầu hai file mã nguồn chính",
   JSX.includes("SPDX-License-Identifier: AGPL-3.0-or-later") && SRV.includes("SPDX-License-Identifier: AGPL-3.0-or-later"));

// ══════════ 3. Mục 13: người vận hành phải chìa được mã nguồn BẢN ĐANG CHẠY ══════════
ok("máy chủ có chỗ để người vận hành khai mã nguồn của họ (config.sourceUrl)",
   SRV.includes("MA_NGUON_MAC_DINH") && SRV.includes("CONFIG.sourceUrl ||"));
ok("config.json mẫu có sẵn trường sourceUrl để sửa", JSON.parse(doc("Chạy nội bộ", "config.json")).sourceUrl !== undefined);
ok("giao diện chìa liên kết mã nguồn, ưu tiên địa chỉ máy chủ truyền xuống",
   JSX.includes("Mã nguồn (AGPL-3.0)") && JSX.includes("href={sourceUrl || SOURCE_URL}"));
ok("màn đăng nhập cũng nhận sourceUrl (người chưa đăng nhập vẫn là người dùng theo mục 13)",
   JSX.includes("function AuthScreen({ mode, t, lang, setLang, error, onSubmit, sourceUrl })"));

// ══════════ 4. Tài liệu không được nói sai giấy phép ══════════
const RM = doc("README.md");
ok("README khai AGPL-3.0", RM.includes("AGPL-3.0"));
ok("README không còn giới thiệu phần mềm là MIT", !/mã nguồn mở theo giấy phép MIT/.test(RM));
ok("README cảnh báo bản cũ vẫn theo MIT", RM.includes("v4.1.4") && RM.includes("MIT"));
ok("có bản giải thích tiếng Việt và nó đã đổi theo", doc("docs", "Giay-phep-tieng-Viet.md").includes("AGPL-3.0-or-later"));

// ══════════ 5. Không được sót dấu vết cơ chế KÍCH HOẠT đã gỡ ở v4.0.0 ══════════
/* README, LICENSE và trang phát hành đều hứa "không mã kích hoạt". Nhưng bản NAS của
   "VẬN HÀNH & SỰ CỐ.txt" đã sống sót qua nhiều lần phát hành với nguyên một mục bảo khách
   đi xin MÃ GIA HẠN và vào "Cài đặt -> Gia hạn giấy phép" — màn hình không còn tồn tại.
   Khách gặp sự cố mà đọc phải thì đi tìm thứ không có. Khóa lại để không tái diễn. */
{
  const CHET = ["mã gia hạn", "MÃ GIA HẠN", "Gia hạn giấy phép", "TDA1", "CHẾ ĐỘ CHỈ ĐỌC", "/api/license"];
  const boQua = (f) => f.includes("CÓ GÌ MỚI") || f.includes("CHANGELOG");   // đây là lịch sử, được phép nhắc
  for (const d of ["Chạy nội bộ", "Chạy trên NAS"]) {
    for (const ten of readdirSync(path.join(ROOT, d)).filter((x) => /\.(txt|md)$/.test(x))) {
      if (boQua(ten)) continue;
      const s = doc(d, ten);
      const dinh = CHET.filter((k) => s.includes(k));
      ok("không còn vết cơ chế kích hoạt: " + d + "/" + ten, dinh.length === 0, "còn: " + dinh.join(", "));
    }
  }
  const SRV2 = doc("Chạy nội bộ", "server.js");
  ok("máy chủ không còn endpoint giấy phép nào", !SRV2.includes('"/api/license'));
  ok("máy chủ vẫn tự dọn dấu vết giấy phép cũ trong dữ liệu khách", SRV2.includes("donDauVetGiayPhep"));
}

// ══════════ 6. Hai bản phải khớp nhau ══════════
for (const f of [["LICENSE.txt"], ["DIEU-KHOAN-BO-SUNG.txt"], ["package.json"], ["config.json"], ["public", "manifest.json"]]) {
  ok("hai bản giống nhau: " + f.join("/"), doc("Chạy nội bộ", ...f) === doc("Chạy trên NAS", ...f));
}

console.log("\nKẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
