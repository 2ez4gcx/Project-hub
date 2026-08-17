/* Diễn tập KHÔI PHỤC (theo báo cáo đánh giá 17/08/2026, mục 8.1):
   chép bộ file dữ liệu (đúng bộ mà snapshot/email sao lưu giữ) sang DATA_DIR mới,
   khởi động máy chủ mới và kiểm chứng đăng nhập + dữ liệu còn nguyên.
   Cách dùng:  node tests/test-restore.mjs <DATA_DIR_NGUỒN> [PORT=3299]
   (nguồn có thể là thư mục data đang chạy hoặc một thư mục data/snapshots/YYYY-MM-DD) */
import { mkdirSync, copyFileSync, existsSync, rmSync } from "fs";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const SRC = process.argv[2];
const PORT = Number(process.argv[3]) || 3299;
if (!SRC) { console.error("Thiếu DATA_DIR nguồn"); process.exit(1); }
const here = path.dirname(fileURLToPath(import.meta.url));
const serverJs = path.join(here, "..", "Chạy nội bộ", "server.js");
const DST = path.join(path.dirname(SRC), "restore-drill-" + Date.now());

let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };

// 1. "Khôi phục": chép đúng bộ file như hướng dẫn cho khách
mkdirSync(DST, { recursive: true });
const FILES = ["data.json", "accounts.json", "finance.json", "records.json", "sitelogs.json", "taskfiles.json", "config.json"];
let copied = 0;
for (const f of FILES) { const p = path.join(SRC, f); if (existsSync(p)) { copyFileSync(p, path.join(DST, f)); copied++; } }
ok("chép bộ file dữ liệu (" + copied + " file)", copied >= 2); // tối thiểu data + accounts

// 2. Khởi động máy chủ trên bản khôi phục
const child = spawn(process.execPath, [serverJs], { env: { ...process.env, DATA_DIR: DST, PORT: String(PORT) }, stdio: "ignore" });
const B = "http://localhost:" + PORT;
let up = false;
for (let i = 0; i < 30; i++) {
  try { const r = await fetch(B + "/api/config"); if (r.ok) { up = true; break; } } catch {}
  await new Promise((res) => setTimeout(res, 500));
}
ok("máy chủ khởi động trên bản khôi phục", up);

if (up) {
  const cfg = await fetch(B + "/api/config").then((r) => r.json());
  ok("nhận diện có tài khoản (không đòi setup lại)", cfg.hasAccounts === true);
  const lg = await fetch(B + "/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "boss@test.vn", password: "matkhau123" }) }).then((r) => r.json());
  ok("đăng nhập bằng tài khoản cũ", !!lg.token);
  if (lg.token) {
    const kv = await fetch(B + "/api/kv?key=pm_shared_v3", { headers: { Authorization: "Bearer " + lg.token } }).then((r) => r.json());
    let rev = 0; try { rev = JSON.parse(kv.value).rev || 0; } catch {}
    ok("dữ liệu công việc còn nguyên (rev " + rev + ")", rev > 0);
  }
}

child.kill();
await new Promise((res) => setTimeout(res, 500)); // Windows: chờ libuv đóng handle của tiến trình con trước khi thoát
try { rmSync(DST, { recursive: true, force: true }); } catch {}
console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
