/* ============================================================
   Trạm Dự Án — CÔNG CỤ ĐẶT LẠI MẬT KHẨU
   Dùng khi quên mật khẩu quản trị (Chủ sở hữu) hoặc của nhân viên.
   Giữ nguyên mọi tài khoản, công việc và dữ liệu khác.

   CÁCH DÙNG (xem hướng dẫn chi tiết trong file .txt kèm theo):
     node reset-password.js                     -> liệt kê các email
     node reset-password.js email@congty.com "MatKhauMoi123"
   ============================================================ */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const ACCOUNTS = path.join(DATA_DIR, "accounts.json");

const makeSalt = () => crypto.randomBytes(16).toString("hex");
const hashPw = (pw, salt) => crypto.scryptSync(String(pw), salt, 64).toString("hex");
function passwordProblem(pw) {
  pw = String(pw || "");
  if (pw.length < 8) return "Mật khẩu phải dài ít nhất 8 ký tự.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "Mật khẩu phải gồm cả chữ và số.";
  return null;
}

function loadAccounts() {
  try { return JSON.parse(fs.readFileSync(ACCOUNTS, "utf8")); }
  catch (e) {
    console.error("\n  ✖ Không đọc được file tài khoản: " + ACCOUNTS);
    console.error("    (Kiểm tra biến DATA_DIR, hoặc chạy đúng trong thư mục/của container.)\n");
    process.exit(1);
  }
}

function listEmails(accts) {
  console.log("\n  Danh sách tài khoản hiện có (email — vai trò):");
  for (const a of accts) console.log("    • " + a.email + "  —  " + (a.role === "owner" ? "CHỦ SỞ HỮU" : "nhân viên"));
  console.log("");
}

const [, , emailArg, passArg] = process.argv;
const accts = loadAccounts();

if (!emailArg) {
  console.log("\n  CÔNG CỤ ĐẶT LẠI MẬT KHẨU — Trạm Dự Án");
  console.log("  File tài khoản: " + ACCOUNTS);
  listEmails(accts);
  console.log('  Để đặt lại, chạy:  node reset-password.js <email> "<mật khẩu mới>"');
  console.log('  Ví dụ:            node reset-password.js sep@congty.com "CongTy2026"\n');
  process.exit(0);
}

const email = String(emailArg).trim().toLowerCase();
const acc = accts.find((a) => String(a.email).trim().toLowerCase() === email);
if (!acc) {
  console.error("\n  ✖ Không tìm thấy tài khoản với email: " + email);
  listEmails(accts);
  process.exit(1);
}

if (!passArg) {
  console.error('\n  ✖ Thiếu mật khẩu mới. Ví dụ:');
  console.error('    node reset-password.js ' + email + ' "MatKhauMoi123"\n');
  process.exit(1);
}

const pwErr = passwordProblem(passArg);
if (pwErr) { console.error("\n  ✖ " + pwErr + "\n"); process.exit(1); }

// Sao lưu trước khi ghi đè
try {
  const bak = ACCOUNTS + ".bak-" + new Date().toISOString().slice(0, 10);
  fs.copyFileSync(ACCOUNTS, bak);
  console.log("\n  • Đã sao lưu tài khoản: " + bak);
} catch {}

acc.salt = makeSalt();
acc.hash = hashPw(passArg, acc.salt);
fs.writeFileSync(ACCOUNTS, JSON.stringify(accts, null, 2));

console.log("  ✔ ĐÃ ĐẶT LẠI mật khẩu cho: " + acc.email + " (" + (acc.role === "owner" ? "CHỦ SỞ HỮU" : "nhân viên") + ")");
console.log("  → Bây giờ đăng nhập bằng email trên và mật khẩu mới.");
console.log("  → Nên đăng nhập rồi đổi lại mật khẩu trong app cho chắc.\n");
