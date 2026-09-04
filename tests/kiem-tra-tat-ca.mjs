/* KIỂM TRA TRƯỚC KHI PHÁT HÀNH — chạy tại máy, thay cho CI khi CI không dùng được.
   Một lệnh duy nhất:   node tests/kiem-tra-tat-ca.mjs
   Tự lo: thư mục dữ liệu tạm, bật/tắt máy chủ, chạy đủ 4 bộ test + HTTPS + đối chiếu hai bản.
   Thoát mã 0 = đủ điều kiện phát hành. */
import { spawn, spawnSync } from "child_process";
import { mkdtempSync, rmSync, readFileSync, existsSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const LOCAL = path.join(ROOT, "Chạy nội bộ");
const NAS = path.join(ROOT, "Chạy trên NAS");
const PORT = 3251, TLS_PORT = 3252, RESTORE_PORT = 3253;

let pass = 0, fail = 0;
const ok = (name, good, extra) => {
  if (good) { pass++; console.log("  [32m✔[0m " + name); }
  else { fail++; console.log("  [31m✘ HỎNG[0m " + name + (extra ? "\n      " + String(extra).split("\n").slice(-6).join("\n      ") : "")); }
};
const h = (t) => console.log("\n[1m" + t + "[0m");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fetchT = (url, ms = 4000) => fetch(url, { signal: AbortSignal.timeout(ms) });   // tránh treo vô hạn khi máy chủ nhận kết nối nhưng không trả lời
const waitUp = async (url, n = 40) => { for (let i = 0; i < n; i++) { try { const r = await fetchT(url); if (r.ok) return true; } catch {} await sleep(500); } return false; };

const tmp = mkdtempSync(path.join(tmpdir(), "tda-kt-"));
const servers = [];
const stopAll = () => { for (const s of servers) { try { s.kill(); } catch {} } };
process.on("exit", stopAll);

// ───────────────────────── 1. Hai bản phải giống nhau ─────────────────────────
h("1. Hai bản (nội bộ / NAS) giống nhau");
for (const f of ["server.js", "ProjectManager.jsx", "public/shim.js", "public/app.js", "package-lock.json", "package.json"]) {
  const a = path.join(LOCAL, f), b = path.join(NAS, f);
  if (!existsSync(a) || !existsSync(b)) { ok(f + " (có mặt ở cả hai bản)", false, "thiếu tệp"); continue; }
  let same = readFileSync(a).equals(readFileSync(b));
  if (!same && f === "package.json") { // chỉ cần trùng version
    const va = JSON.parse(readFileSync(a, "utf8")).version, vb = JSON.parse(readFileSync(b, "utf8")).version;
    same = va === vb; ok("package.json cùng version (" + va + ")", same, va + " vs " + vb); continue;
  }
  ok(f, same, "nội dung khác nhau — chạy: cd build && npm run build");
}

// ───────────────────────── 2. Cú pháp ─────────────────────────
h("2. Cú pháp mã nguồn");
for (const f of ["server.js", "reset-password.js"]) {
  const r = spawnSync(process.execPath, ["--check", path.join(LOCAL, f)], { encoding: "utf8" });
  ok(f, r.status === 0, r.stderr);
}

// ───────────────────────── 3. Bốn bộ test nghiệp vụ ─────────────────────────
h("3. Bộ kiểm thử (phân quyền, nghiệp vụ, hiện trường, nhật ký kiểm toán, khôi phục)");
const DATA = path.join(tmp, "data");
mkdirSync(DATA, { recursive: true });
const srv = spawn(process.execPath, [path.join(LOCAL, "server.js")],
  { env: { ...process.env, DATA_DIR: DATA, PORT: String(PORT), SETUP_CODE: "TEST123" }, stdio: "ignore" });
servers.push(srv);
const up = await waitUp("http://localhost:" + PORT + "/api/config");
ok("máy chủ thử nghiệm khởi động", up);

const runTest = (file, args = []) => {
  const r = spawnSync(process.execPath, [path.join(HERE, file), ...args], { encoding: "utf8", env: { ...process.env, TDA_BASE: "http://localhost:" + PORT } });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(/KẾT QUẢ: (\d+) pass, (\d+) fail/);
  const line = m ? m[1] + " đạt, " + m[2] + " hỏng" : "không đọc được kết quả";
  ok(file + " — " + line, r.status === 0 && m && m[2] === "0", out);
  return m ? Number(m[1]) : 0;
};
let cases = 0;
if (up) {
  cases += runTest("test-authz.mjs");
  cases += runTest("test-nghiep-vu.mjs");
  cases += runTest("test-hien-truong.mjs");
  cases += runTest("test-audit-trail.mjs");
  cases += runTest("test-loi-ton-dong.mjs");
  cases += runTest("test-nghiem-thu.mjs");
  cases += runTest("test-nhat-ky-cau-truc.mjs");
  cases += runTest("test-thanh-vien-du-an.mjs");
  cases += runTest("test-chi-phi-qs.mjs");
  cases += runTest("test-hoi-quy-lan2.mjs");
  cases += runTest("test-restore.mjs", [DATA, String(RESTORE_PORT)]);
}
try { srv.kill(); } catch {}
await sleep(400);

// ── 3b. Logic lịch & đường găng (không cần máy chủ) ──
cases += runTest("test-lich-gantt.mjs");
cases += runTest("test-gop-xung-dot.mjs");

// ───────────────────────── 4. HTTPS ─────────────────────────
h("4. HTTPS (chứng chỉ tự ký)");
const tlsDir = path.join(tmp, "tls-data", "tls");
mkdirSync(tlsDir, { recursive: true });
const ssl = spawnSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "2",
  "-keyout", path.join(tlsDir, "key.pem"), "-out", path.join(tlsDir, "cert.pem"), "-subj", "/CN=test"],
  { encoding: "utf8", env: { ...process.env, MSYS_NO_PATHCONV: "1" } });
if (ssl.status !== 0) {
  console.log("  [33m•[0m bỏ qua: máy này không có openssl (không tính là hỏng)");
} else {
  const s2 = spawn(process.execPath, [path.join(LOCAL, "server.js")],
    { env: { ...process.env, DATA_DIR: path.join(tmp, "tls-data"), PORT: String(TLS_PORT) }, stdio: "ignore" });
  servers.push(s2);
  const prev = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";           // chứng chỉ tự ký
  let good = false;
  for (let i = 0; i < 40 && !good; i++) {
    try { const r = await fetchT("https://localhost:" + TLS_PORT + "/api/config"); good = r.ok && (await r.json()).serverMode === true; } catch {}
    if (!good) await sleep(500);
  }
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = prev;
  ok("máy chủ chạy HTTPS và trả lời đúng", good);
  try { s2.kill(); } catch {}
}

// ───────────────────────── 5. Gói phân phối ─────────────────────────
h("5. Gói phân phối");
const filesDir = path.join(ROOT, "..", "files");
/* Thư mục này nằm ngoài repo (chỗ chứa zip giao khách) nên CI không có — đóng gói là
   việc của máy phát hành. Vắng thì bỏ qua hẳn mục này, đừng chấm hỏng oan cho CI. */
const coGoi = existsSync(filesDir);
if (!coGoi) console.log("  – bỏ qua: chưa có thư mục " + filesDir + " (chỉ kiểm ở máy đóng gói).");
for (const z of coGoi ? ["tram-du-an-noi-bo.zip", "tram-du-an-nas.zip"] : []) {
  const zp = path.join(filesDir, z);
  if (!existsSync(zp)) { ok(z, false, "chưa đóng gói — chạy: cd build && npm run dong-goi"); continue; }
  const ageH = (Date.now() - Number(readFileSync ? (await import("fs")).statSync(zp).mtimeMs : 0)) / 3600000;
  const srcAge = (Date.now() - (await import("fs")).statSync(path.join(LOCAL, "server.js")).mtimeMs) / 3600000;
  ok(z + " (đóng gói sau lần sửa mã cuối)", ageH <= srcAge + 0.5, "zip cũ hơn mã nguồn — đóng gói lại");

  /* Bản chạy trên máy cá nhân phải kèm nodemailer: người dùng chỉ nhấp đúp file .bat,
     không ai bảo họ chạy "npm install". Bản NAS thì Dockerfile tự "npm ci" nên không cần. */
  if (z === "tram-du-an-noi-bo.zip") {
    // Tên file trong zip để dạng chữ thường (không nén) nên tìm thẳng trong buffer là đủ,
    // khỏi phụ thuộc adm-zip — CI không cài build/node_modules.
    const coMail = readFileSync(zp).includes("node_modules/nodemailer/");
    ok(z + " kèm sẵn thư viện nodemailer (email nhắc việc)", coMail,
       "thiếu node_modules/nodemailer trong zip -> email im lặng không gửi được");
  }
}

// ───────────────────────── Kết luận ─────────────────────────
stopAll();
try { rmSync(tmp, { recursive: true, force: true }); } catch {}
console.log("\n" + "═".repeat(60));
console.log(fail === 0
  ? "[32m  ĐỦ ĐIỀU KIỆN PHÁT HÀNH[0m — " + pass + " mục đạt, " + cases + " ca kiểm thử nghiệp vụ."
  : "[31m  CHƯA ĐẠT[0m — " + fail + " mục hỏng (xem ở trên), " + pass + " mục đạt.");
console.log("═".repeat(60));
process.exitCode = fail ? 1 : 0;
