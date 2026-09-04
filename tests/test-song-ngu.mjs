/* Chốt chặn song ngữ Việt–Anh.

   Từ điển T có hơn 600 khóa, sửa tay rất dễ thêm một bên quên bên kia — mà hậu quả là
   giao diện hiện thẳng chữ "undefined" cho người dùng. Bộ này khóa bốn thứ:
     1. hai bên phải cùng bộ khóa
     2. bản tiếng Anh không được còn dấu tiếng Việt
     3. mỗi mã lỗi được dịch phải là mã máy chủ THẬT SỰ trả về
     4. mã lỗi mang HAI nghĩa khác nhau thì KHÔNG được dịch theo mã

   Không cần máy chủ: đọc thẳng mã nguồn.
   Cách dùng:  node tests/test-song-ngu.mjs */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const JSX = readFileSync(path.join(ROOT, "Chạy nội bộ", "ProjectManager.jsx"), "utf8");
const SRV = readFileSync(path.join(ROOT, "Chạy nội bộ", "server.js"), "utf8");

let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };

// cắt đúng khối `const T = {...};` rồi eval — chắc hơn dò bằng regex
const dau = JSX.indexOf("const T = {");
const cuoi = JSX.indexOf("\n};", dau);
const T = eval("(" + JSX.slice(dau + "const T = ".length, cuoi + 2) + ")");

const kVi = Object.keys(T.vi), kEn = Object.keys(T.en);
ok("từ điển có cả hai ngôn ngữ", kVi.length > 100 && kEn.length > 100, "vi=" + kVi.length + " en=" + kEn.length);

// ── 1. cùng bộ khóa ──
const thieuEn = kVi.filter((k) => !kEn.includes(k));
const thieuVi = kEn.filter((k) => !kVi.includes(k));
ok("mọi khóa tiếng Việt đều có bản tiếng Anh", thieuEn.length === 0, "thiếu ở en: " + thieuEn.join(", "));
ok("mọi khóa tiếng Anh đều có bản tiếng Việt", thieuVi.length === 0, "thiếu ở vi: " + thieuVi.join(", "));

// ── 2. bản en không còn tiếng Việt ──
const DAU_VIET = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ]/;
const dinhViet = kEn.filter((k) => typeof T.en[k] === "string" && DAU_VIET.test(T.en[k]));
ok("không bản dịch tiếng Anh nào còn dấu tiếng Việt", dinhViet.length === 0,
   dinhViet.map((k) => k + "=" + JSON.stringify(T.en[k])).join(" | "));

ok("từ điển tự khai ngôn ngữ của mình (loiMayChu dựa vào đây)", T.vi.__ma === "vi" && T.en.__ma === "en");

// ── 3. mã lỗi dịch phải khớp mã máy chủ thật ──
const maMayChu = new Set([...SRV.matchAll(/error:\s*"([a-z_]+)"/g)].map((m) => m[1]));
const maDich = kVi.filter((k) => k.startsWith("e_")).map((k) => k.slice(2));
ok("có bảng dịch thông báo lỗi của máy chủ", maDich.length > 10, "mới có " + maDich.length + " mã");
const maLa = maDich.filter((m) => !maMayChu.has(m));
ok("mọi mã lỗi được dịch đều là mã máy chủ thật sự trả về", maLa.length === 0,
   "mã không tồn tại phía máy chủ: " + maLa.join(", "));

// ── 4. mã dùng cho nhiều nghĩa thì không được dịch theo mã ──
/* "invalid" vừa là sai mật khẩu đăng nhập, vừa là sai mật khẩu hiện tại khi đổi mật khẩu.
   Dịch theo mã sẽ ra câu sai nghĩa ở một trong hai chỗ. */
const soLanDung = {};
for (const m of SRV.matchAll(/error:\s*"([a-z_]+)",\s*message:\s*"([^"]*)"/g)) {
  (soLanDung[m[1]] = soLanDung[m[1]] || new Set()).add(m[2]);
}
/* Một mã kèm nhiều câu KHÔNG hẳn là sai: "forbidden" có 9 câu nhưng đều cùng một ý
   "bạn không có quyền", nên một bản dịch chung vẫn đúng. Cái sai là mã mang HAI Ý khác
   nhau. Máy không phân biệt được, nên phải có danh sách đã-duyệt-bằng-mắt dưới đây; mã
   nhiều câu nào chưa nằm trong đó mà lại đang được dịch thì báo hỏng, buộc người sửa mã
   phải đọc lại từng câu rồi mới thêm vào. */
const DA_DUYET_DICH_CHUNG = {
  missing: "đều là 'thiếu thông tin bắt buộc'",
  too_large: "đều là 'vượt quá dung lượng'",
  forbidden: "đều là 'không có quyền'",
  notfound: "đều là 'không thấy trong thùng rác'",
  scope_merge_failed: "cùng một sự cố, chỉ khác loại dữ liệu",
};
const nhieuCau = Object.keys(soLanDung).filter((m) => soLanDung[m].size > 1);
const chuaDuyet = nhieuCau.filter((m) => maDich.includes(m) && !DA_DUYET_DICH_CHUNG[m]);
ok("mã mang nhiều câu mà được dịch thì phải đã duyệt bằng mắt", chuaDuyet.length === 0,
   "chưa duyệt: " + chuaDuyet.map((m) => m + " (" + soLanDung[m].size + " câu khác nhau)").join(", "));
/* "invalid" là ca đã bị bắt: vừa là sai mật khẩu đăng nhập, vừa là sai mật khẩu hiện tại
   khi đổi mật khẩu — hai ý khác hẳn nhau, nên cấm hẳn việc dịch theo mã này. */
ok("mã 'invalid' KHÔNG được dịch theo mã (nó mang hai ý khác nhau)", !maDich.includes("invalid"));

// ── 5. thứ tự dự phòng của loiMayChu ──
/* Thông báo máy chủ LUÔN tiếng Việt, nên ở chế độ English nó phải là lựa chọn CUỐI —
   sau câu mặc định của chỗ gọi. Đặt sai thứ tự là người dùng English lại đọc tiếng Việt. */
ok("có hàm dịch thông báo lỗi máy chủ", JSX.includes("function loiMayChu(r, t, macDinh)"));
ok("chế độ English: bản dịch -> câu mặc định -> mới đến câu tiếng Việt của máy chủ",
   JSX.includes('if (t.__ma !== "vi") return (b.error && t["e_" + b.error]) || macDinh || b.message;'));
ok("chế độ tiếng Việt vẫn ưu tiên câu máy chủ (cụ thể hơn, có kèm số liệu)",
   JSX.includes("return b.message || macDinh;"));
ok("không còn chỗ nào in thẳng thông báo máy chủ ra giao diện",
   !/\(r\.body && r\.body\.message\)/.test(JSX),
   "còn " + (JSX.match(/\(r\.body && r\.body\.message\)/g) || []).length + " chỗ");

// ── 6. nhãn giao diện thêm mới phải qua từ điển ──
ok("liên kết mã nguồn lấy chữ từ từ điển", JSX.includes("(t && t.srcLink)") && T.en.srcLink && !DAU_VIET.test(T.en.srcLink));

console.log("\nKẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
