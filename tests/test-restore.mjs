/* Diễn tập KHÔI PHỤC (theo báo cáo đánh giá 17/08/2026, mục 8.1):
   chép bộ file dữ liệu (đúng bộ mà snapshot/email sao lưu giữ) sang DATA_DIR mới,
   khởi động máy chủ mới và kiểm chứng đăng nhập + dữ liệu còn nguyên.
   Cách dùng:  node tests/test-restore.mjs <DATA_DIR_NGUỒN> [PORT=3299]
   (nguồn có thể là thư mục data đang chạy hoặc một thư mục data/snapshots/YYYY-MM-DD) */
import { mkdirSync, copyFileSync, existsSync, rmSync, cpSync, readFileSync } from "fs";
import { spawn } from "child_process";
import { createHash } from "crypto";
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

// 1. "Khôi phục": chép bộ file JSON + TOÀN BỘ cây tệp đính kèm (audit 17/08 F3:
//    khôi phục phải gồm cả hồ sơ, không chỉ JSON)
mkdirSync(DST, { recursive: true });
const FILES = ["data.json", "accounts.json", "finance.json", "records.json", "sitelogs.json", "taskfiles.json", "config.json"];
let copied = 0;
for (const f of FILES) { const p = path.join(SRC, f); if (existsSync(p)) { copyFileSync(p, path.join(DST, f)); copied++; } }
ok("chép bộ file dữ liệu (" + copied + " file)", copied >= 2); // tối thiểu data + accounts
let treeCopied = 0;
for (const d of ["uploads", "nhatky-thi-cong", "task-uploads"]) {
  const p = path.join(SRC, d);
  if (existsSync(p)) { cpSync(p, path.join(DST, d), { recursive: true }); treeCopied++; }
}
console.log("  • chép " + treeCopied + " cây thư mục tệp đính kèm");

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
    // finance còn nguyên
    const fin = await fetch(B + "/api/finance", { headers: { Authorization: "Bearer " + lg.token } }).then((r) => r.json()).catch(() => null);
    ok("dữ liệu tài chính đọc được (rev " + (fin && fin.rev) + ")", !!fin && Array.isArray(fin.investorContracts));
    // tệp đính kèm: tải qua API và ĐỐI CHIẾU SHA-256 với tệp nguồn
    const recs = await fetch(B + "/api/records", { headers: { Authorization: "Bearer " + lg.token } }).then((r) => r.json()).catch(() => ({ records: [] }));
    const withFile = (recs.records || []).find((r2) => (r2.files || []).length);
    if (withFile) {
      const raw = JSON.parse(readFileSync(path.join(SRC, "records.json"), "utf8"));
      const srcRec = raw.find((r2) => r2.id === withFile.id);
      const srcPath = path.join(SRC, "uploads", srcRec.files[0].stored);
      const srcSha = createHash("sha256").update(readFileSync(srcPath)).digest("hex");
      const buf = Buffer.from(await fetch(B + "/api/records/file?recordId=" + withFile.id + "&idx=0", { headers: { Authorization: "Bearer " + lg.token } }).then((r) => r.arrayBuffer()));
      const dstSha = createHash("sha256").update(buf).digest("hex");
      ok("tệp đính kèm khôi phục đúng SHA-256 (" + buf.length + " bytes)", srcSha === dstSha, srcSha.slice(0, 8) + " vs " + dstSha.slice(0, 8));
    } else {
      console.log("  • (nguồn không có biên bản kèm tệp — bỏ qua đối chiếu SHA)");
    }
  }
}

child.kill();
await new Promise((res) => setTimeout(res, 500)); // Windows: chờ libuv đóng handle của tiến trình con trước khi thoát
try { rmSync(DST, { recursive: true, force: true }); } catch {}
console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
