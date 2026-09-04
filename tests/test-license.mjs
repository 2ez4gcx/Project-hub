/* Test gia cố bản dùng thử (v3.8.1). Chạy SAU khi server đã setup tài khoản chủ.
   Cách dùng:  node tests/test-license.mjs <DATA_DIR> [BASE_URL]
   Script sửa trực tiếp các file dữ liệu (đúng cách kẻ gian sẽ làm) rồi hỏi API. */
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const DATA_DIR = process.argv[2];
const B = process.argv[3] || process.env.TDA_BASE || "http://localhost:3211";
if (!DATA_DIR) { console.error("Thiếu DATA_DIR"); process.exit(1); }

let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const jread = (f) => JSON.parse(readFileSync(path.join(DATA_DIR, f), "utf8"));
const jwrite = (f, v) => writeFileSync(path.join(DATA_DIR, f), JSON.stringify(v, null, 2));

const login = await fetch(B + "/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "boss@test.vn", password: "matkhau123" }) }).then((r) => r.json());
const TOK = login.token;
const lic = () => fetch(B + "/api/license", { headers: { Authorization: "Bearer " + TOK } }).then((r) => r.json());

// 1. Trạng thái lành mạnh: trial ký ở cả 3 nơi, còn ~180 ngày
let L = await lic();
ok("trial còn hạn (~6 tháng)", !L.readOnly && L.daysLeft > 150 && L.daysLeft < 200, JSON.stringify(L));
const cfg = jread("config.json");
ok("config.json có trial ký (không còn số thô)", !!(cfg.license && cfg.license.trial && cfg.license.trial.sig) && cfg.license.expiry === undefined);
ok("accounts.json (tài khoản chủ) có bản sao trial", !!jread("accounts.json").find((a) => a.role === "owner" && a.licTrial && a.licTrial.sig));
ok("data.json có bản sao trial (__lic)", !!(jread("data.json").__lic || {}).sig);

// 2. Sửa hạn trong config.json (cách gian phổ biến nhất) -> 2 bản còn lại vẫn giữ hạn thật
const cfg2 = jread("config.json");
cfg2.license.trial.expiry = Date.now() + 100 * 365 * 86400000; // +100 năm
jwrite("config.json", cfg2);
L = await lic();
ok("sửa hạn trong config -> hạn KHÔNG đổi (bản hợp lệ còn lại quyết định)", !L.readOnly && L.daysLeft < 200, "daysLeft=" + L.daysLeft);

// 3. Sửa hạn ở CẢ 3 nơi (giữ nguyên sig cũ -> mọi chữ ký đều sai) -> CHỈ ĐỌC, không cấp trial mới
const acc3 = jread("accounts.json"); const oi = acc3.findIndex((a) => a.role === "owner");
acc3[oi].licTrial.expiry = Date.now() + 100 * 365 * 86400000; jwrite("accounts.json", acc3);
const d3 = jread("data.json"); d3.__lic.expiry = Date.now() + 100 * 365 * 86400000; jwrite("data.json", d3);
L = await lic();
ok("sửa cả 3 bản -> CHỈ ĐỌC (không thoát được)", L.readOnly === true, JSON.stringify(L));
const w = await fetch(B + "/api/kv", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + TOK }, body: JSON.stringify({ key: "pm_shared_v3", value: "{\"rev\":999}" }) });
ok("ghi dữ liệu khi chỉ đọc -> 423", w.status === 423);

// 4. Xóa sạch license trong config (chiêu 'làm mới') -> bản trong data/accounts vẫn còn dấu vết -> vẫn chỉ đọc
const cfg4 = jread("config.json"); delete cfg4.license; jwrite("config.json", cfg4);
L = await lic();
ok("xóa license khỏi config -> vẫn CHỈ ĐỌC (mirror còn dấu vết giả)", L.readOnly === true, JSON.stringify(L));

// 5. Khôi phục 1 bản hợp lệ (giả lập phục hồi từ snapshot): ký lại đúng ở data.json -> hoạt động lại
//    (không có khóa HMAC ở đây nên mượn server: xóa dấu vết giả rồi để ensureLicense cấp lại ở lần khởi động sau
//     — trong test này chỉ kiểm tra trạng thái 'mọi dấu vết sai -> khóa' là đủ.)
console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0; // exit tự nhiên — process.exit đua với keep-alive socket gây abort libuv trên Node 24/Windows
