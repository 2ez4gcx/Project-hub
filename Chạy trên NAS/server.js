/* Trạm Dự Án — máy chủ NAS / mạng nội bộ, có đăng nhập.
   Tài khoản (tên, email, mật khẩu) do Chủ sở hữu tạo. Đăng nhập bằng email + mật khẩu.
   Mật khẩu được băm (scrypt + salt). Không cần thư viện ngoài cho phần đăng nhập.

   NÂNG CẤP BẢO MẬT (v3.1):
   - Chống dò mật khẩu: khóa tạm sau nhiều lần đăng nhập sai.
   - So sánh mật khẩu an toàn theo thời gian (crypto.timingSafeEqual).
   - Phiên đăng nhập (token) tự hết hạn sau 12 giờ không hoạt động.
   - Yêu cầu mật khẩu tối thiểu 8 ký tự, có cả chữ và số.
   - Trang tạo tài khoản chủ đầu tiên yêu cầu "Mã cài đặt" (hiện trong cửa sổ máy chủ).
   - Mật khẩu email (SMTP) đọc được từ file .env, không cần lưu thô trong config.json.
   - Thêm HTTP security headers + ghi nhật ký bảo mật (data/security.log). */
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const PUBLIC = path.join(__dirname, "public");
const DATA = path.join(DATA_DIR, "data.json");
const ACCOUNTS = path.join(DATA_DIR, "accounts.json");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");
const PORT = process.env.PORT || 3000;
const SHARED_KEY = "pm_shared_v3";

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}

// ---- .env loader: nạp bí mật (vd SMTP_PASS) từ file .env, không cần thư viện ngoài ----
(function loadEnv() {
  for (const envp of [path.join(DATA_DIR, ".env"), path.join(__dirname, ".env")]) {
    try {
      const txt = fs.readFileSync(envp, "utf8");
      for (const line of txt.split(/\r?\n/)) {
        if (/^\s*#/.test(line) || !line.trim()) continue;
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!m) continue;
        let v = m[2].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        if (!(m[1] in process.env)) process.env[m[1]] = v;
      }
    } catch {}
  }
})();

// ---- Nhật ký bảo mật ----
function slog(msg) {
  const line = "[" + new Date().toISOString() + "] " + msg;
  console.log("[bảo mật] " + msg);
  try {
    const lf = path.join(DATA_DIR, "security.log");
    try { const st = fs.statSync(lf); if (st.size > 5 * 1024 * 1024) fs.renameSync(lf, lf + ".1"); } catch {}
    fs.appendFileSync(lf, line + "\n");
  } catch {}
}
const TRUST_PROXY = String(process.env.TRUST_PROXY || "").toLowerCase() === "true";
function clientIp(req) {
  if (TRUST_PROXY) { const xf = (req.headers["x-forwarded-for"] || "").split(",")[0].trim(); if (xf) return xf; }
  return (req.socket && req.socket.remoteAddress) || "?";
}
// Ghi JSON kiểu nguyên tử: ghi .tmp rồi đổi tên, giữ 1 bản .bak (chống hỏng khi mất điện giữa lúc ghi).
function writeJsonAtomic(file, str) {
  try {
    const tmp = file + ".tmp";
    fs.writeFileSync(tmp, str);
    try { if (fs.existsSync(file)) fs.copyFileSync(file, file + ".bak"); } catch {}
    fs.renameSync(tmp, file);
    return true;
  } catch (e) { try { fs.writeFileSync(file, str); } catch {} return false; }
}
function bearerOf(req) { return (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "").trim(); }

// Migrate data files from older layout (app root) into the data/ folder, once.
(function migrateOldData() {
  if (DATA_DIR === __dirname) return;
  for (const f of ["data.json", "accounts.json", "finance.json", "config.json"]) {
    const oldp = path.join(__dirname, f), newp = path.join(DATA_DIR, f);
    try { if (fs.existsSync(oldp) && !fs.existsSync(newp)) fs.copyFileSync(oldp, newp); } catch {}
  }
})();

function loadConfig() {
  const candidates = [CONFIG_PATH, path.join(__dirname, "config.json")];
  for (const p of candidates) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch {} }
  return {};
}
function saveConfigFile(obj) { return writeJsonAtomic(CONFIG_PATH, JSON.stringify(obj, null, 2)); }
(function ensureConfig() {
  if (!fs.existsSync(CONFIG_PATH)) { try { fs.copyFileSync(path.join(__dirname, "config.json"), CONFIG_PATH); } catch {} }
})();
let CONFIG = loadConfig();

/* ===================== LICENSE (giấy phép có thời hạn 6 tháng) =====================
   App chứa KHÓA CÔNG KHAI để kiểm tra mã gia hạn. Mã gia hạn do tác giả tạo bằng
   KHÓA RIÊNG (không có trong app). Hết hạn -> chế độ CHỈ ĐỌC, KHÔNG xóa dữ liệu. */
const LICENSE_PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAemYPTLcLeo7RJ4orF58pGq8W2EPH663Ocp1XxJF06+M=\n-----END PUBLIC KEY-----\n";
const LICENSE_MONTHS_DEFAULT = 6;
const LICENSE_AUTHOR = "Khuong Doan";
let APP_VERSION = "3.3.0"; try { APP_VERSION = require("./package.json").version || APP_VERSION; } catch (e) {}
const LICENSE_YEAR = 2026;
function addMonths(ms, n) { const d = new Date(ms); d.setMonth(d.getMonth() + n); return d.getTime(); }
function getLicenseExpiry() {
  const c = loadConfig(); const lic = (c && c.license) || {};
  if (lic.code) { const pl = verifyLicenseCode(lic.code); return pl ? pl.exp : 1; } // có mã ký -> lấy hạn từ chữ ký; mã bị sửa/hỏng -> 1 (đã qua = chỉ đọc, không cho thoát giới hạn)
  return Number(lic.expiry) || 0; // bản dùng thử (chưa kích hoạt) -> vẫn dùng số (giới hạn cố hữu)
}
function setLicense(exp, code) { const c = loadConfig(); c.license = { ...(c.license || {}), expiry: exp }; if (code) c.license.code = code; saveConfigFile(c); CONFIG = c; }
function setLicenseExpiry(ms) { const c = loadConfig(); c.license = { ...(c.license || {}), expiry: ms }; saveConfigFile(c); CONFIG = c; }
function ensureLicense() { if (!getLicenseExpiry() && loadAccounts().length > 0) setLicenseExpiry(addMonths(Date.now(), LICENSE_MONTHS_DEFAULT)); }
function licenseReadOnly() { const e = getLicenseExpiry(); return e > 0 && Date.now() > e; }
function verifyLicenseCode(code) {
  try {
    const parts = String(code || "").trim().split(".");
    if (parts.length !== 3 || parts[0] !== "TDA1") return null;
    const ok = crypto.verify(null, Buffer.from(parts[1]), crypto.createPublicKey(LICENSE_PUBLIC_KEY), Buffer.from(parts[2], "base64url"));
    if (!ok) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    if (!payload || typeof payload.exp !== "number") return null;
    return payload;
  } catch { return null; }
}

function loadData() { try { return JSON.parse(fs.readFileSync(DATA, "utf8")); } catch { return {}; } }
function saveData(d) { writeJsonAtomic(DATA, JSON.stringify(d)); }
function saveAccounts(a) { writeJsonAtomic(ACCOUNTS, JSON.stringify(a, null, 2)); }
const FINANCE = path.join(DATA_DIR, "finance.json");
function loadFinance() { try { const f = JSON.parse(fs.readFileSync(FINANCE, "utf8")); return { investorContracts: f.investorContracts || [], subContracts: f.subContracts || [] }; } catch { return { investorContracts: [], subContracts: [] }; } }
function saveFinance(f) { writeJsonAtomic(FINANCE, JSON.stringify(f)); }
function canFinance(a) { return !!a && (a.role === "owner" || a.canViewFinance); }
function canManageMembers(a) { return !!a && (a.role === "owner" || a.canManageMembers); }

/* ===================== BIÊN BẢN (records + tệp đính kèm) ===================== */
const UPLOADS = path.join(DATA_DIR, "uploads");
const NHATKY = path.join(DATA_DIR, "nhatky-thi-cong");
const SITELOGS = path.join(DATA_DIR, "sitelogs.json");
try { fs.mkdirSync(NHATKY, { recursive: true }); } catch {}
function loadSiteLogs() { try { return JSON.parse(fs.readFileSync(SITELOGS, "utf8")); } catch { return []; } }
function saveSiteLogs(r) { writeJsonAtomic(SITELOGS, JSON.stringify(r, null, 2)); }
function siteBaseName(projectName, date) { return sanitizeName(String(projectName || "duan") + " - " + String(date || "").replace(/-/g, ".")); }
const RECORDS = path.join(DATA_DIR, "records.json");
try { fs.mkdirSync(UPLOADS, { recursive: true }); } catch {}
function loadRecords() { try { return JSON.parse(fs.readFileSync(RECORDS, "utf8")); } catch { return []; } }
function saveRecords(r) { writeJsonAtomic(RECORDS, JSON.stringify(r, null, 2)); }
const TASKUPLOADS = path.join(DATA_DIR, "task-uploads");
try { fs.mkdirSync(TASKUPLOADS, { recursive: true }); } catch {}
const TASKFILES = path.join(DATA_DIR, "taskfiles.json");
function loadTaskFiles() { try { return JSON.parse(fs.readFileSync(TASKFILES, "utf8")); } catch { return {}; } }
function saveTaskFiles(o) { writeJsonAtomic(TASKFILES, JSON.stringify(o, null, 2)); }
function canRecords(a) { return !!a; } // fine per-project gating (site loggers) done on client
const INLINE_SAFE_EXT = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif", ".bmp"]);
const UPLOAD_BLOCK_EXT = new Set([".html", ".htm", ".xhtml", ".shtml", ".js", ".mjs", ".svg", ".xml", ".php", ".phtml", ".php3", ".php4", ".php5", ".exe", ".bat", ".cmd", ".sh", ".com", ".scr", ".jar", ".vbs", ".hta"]);
function fileExt(name) { const m = String(name || "").toLowerCase().match(/\.[a-z0-9]+$/); return m ? m[0] : ""; }
function projectOf(projectId) { try { const d = loadData(); const shared = JSON.parse(d[SHARED_KEY] || "{}"); return (shared.projects || []).find((x) => x.id === projectId) || null; } catch { return null; } }
function taskExists(tid) { try { const d = loadData(); const shared = JSON.parse(d[SHARED_KEY] || "{}"); return (shared.tasks || []).some((x) => x.id === tid); } catch { return false; } }
function canRecordProject(me, projectId) {
  if (!me) return false;
  if (me.role === "owner" || me.isLeader) return true;
  if (me.isTeamlead && me.dept === "Site") return true;
  const pr = projectOf(projectId);
  if (!pr) return false;
  return (pr.siteLoggers || []).includes(me.id);
}
function canDeleteRecord(me, rec) {
  if (!me) return false;
  if (me.role === "owner" || me.isLeader) return true;
  return !!rec && (rec.createdById === me.id || rec.createdBy === me.name || rec.createdBy === me.email);
}
const REC_ILLEGAL = /[\/\\:*?"<>|\n\r\t]/g;
function sanitizeName(x) { return String(x || "").replace(REC_ILLEGAL, "").replace(/\s+/g, " ").trim().slice(0, 120) || "khong-ten"; }
function extOf(name, mime) {
  const m = /\.([A-Za-z0-9]{1,8})$/.exec(String(name || "")); if (m) return m[1].toLowerCase();
  const map = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/heic": "heic", "image/webp": "webp", "image/gif": "gif" };
  return map[mime] || "dat";
}
function recBaseName(date, number, type) {
  const q = String(date || "").split("-"); const yy = (q[0] || "").slice(2), mm = q[1] || "00", dd = q[2] || "00";
  let s = yy + "." + mm + "." + dd;
  if (type && String(type).trim()) s += " " + String(type).trim();
  if (number && String(number).trim()) s += " " + String(number).trim();
  return sanitizeName(s);
}
function uniqueName(dir, base, ext) {
  let name = base + "." + ext, i = 2;
  while (fs.existsSync(path.join(dir, name))) { name = base + " (" + i + ")." + ext; i++; }
  return name;
}
function readRawBody(req, max) {
  return new Promise((resolve, reject) => {
    const chunks = []; let len = 0;
    req.on("data", (c) => { len += c.length; if (len > max) { req.destroy(); reject(new Error("too_large")); return; } chunks.push(c); });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

/* ---- auth helpers ---- */
const uid = () => crypto.randomBytes(6).toString("hex");
const makeSalt = () => crypto.randomBytes(16).toString("hex");
const hashPw = (pw, salt) => crypto.scryptSync(String(pw), salt, 64).toString("hex");
// So sánh hash an toàn theo thời gian (chống dò qua thời gian phản hồi).
function verifyPw(pw, salt, hash) {
  try {
    const a = Buffer.from(hashPw(pw, salt), "hex");
    const b = Buffer.from(String(hash || ""), "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch { return false; }
}
// Kiểm tra độ mạnh mật khẩu. Trả về thông báo lỗi (tiếng Việt) hoặc null nếu hợp lệ.
function passwordProblem(pw) {
  pw = String(pw || "");
  if (pw.length < 8) return "Mật khẩu phải dài ít nhất 8 ký tự.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "Mật khẩu phải gồm cả chữ và số.";
  return null;
}

// ---- Phiên đăng nhập có thời hạn ----
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 giờ không hoạt động thì hết hạn
const tokens = new Map(); // token -> { id, exp }
function newToken(id) {
  const tok = crypto.randomBytes(24).toString("hex");
  tokens.set(tok, { id, exp: Date.now() + TOKEN_TTL_MS });
  if (tokens.size > 5000) { const arr = [...tokens.entries()].sort((a, b) => a[1].exp - b[1].exp); for (let i = 0; i < arr.length - 5000; i++) tokens.delete(arr[i][0]); }
  return tok;
}
function purgeTokens() { const now = Date.now(); for (const [t, r] of tokens) if (now > r.exp) tokens.delete(t); }
function revokeTokens(accountId, exceptTok) { let n = 0; for (const [t, r] of tokens) { if (r.id === accountId && t !== exceptTok) { tokens.delete(t); n++; } } return n; }

// ---- Chống dò mật khẩu (rate-limit + khóa tạm) ----
const MAX_FAILS = 5, FAIL_WINDOW_MS = 15 * 60 * 1000, LOCK_MS = 15 * 60 * 1000;
const loginAttempts = new Map(); // key(ip|email) -> { count, first, lockUntil }
function attemptKey(req, email) { return clientIp(req) + "|" + String(email || "").trim().toLowerCase(); }
function lockedMinutes(key) {
  const r = loginAttempts.get(key);
  if (r && r.lockUntil && Date.now() < r.lockUntil) return Math.ceil((r.lockUntil - Date.now()) / 60000);
  return 0;
}
function noteFail(key) {
  const now = Date.now();
  let r = loginAttempts.get(key);
  if (!r || now - r.first > FAIL_WINDOW_MS) r = { count: 0, first: now, lockUntil: 0 };
  r.count++;
  if (r.count >= MAX_FAILS) r.lockUntil = now + LOCK_MS;
  loginAttempts.set(key, r);
  if (loginAttempts.size > 5000) { const arr = [...loginAttempts.entries()].sort((a, b) => (a[1].first || 0) - (b[1].first || 0)); for (let i = 0; i < arr.length - 5000; i++) loginAttempts.delete(arr[i][0]); }
  return r;
}
function clearFails(key) { loginAttempts.delete(key); }

// ---- Mã cài đặt cho tài khoản chủ đầu tiên ----
let SETUP_CODE = "";
function ensureSetupCode() {
  if (loadAccounts().length > 0) { SETUP_CODE = ""; return; }
  if (!SETUP_CODE) SETUP_CODE = process.env.SETUP_CODE || crypto.randomBytes(3).toString("hex").toUpperCase();
}

function safe(a) { return { id: a.id, name: a.name, email: a.email, role: a.role === "owner" ? "owner" : "member", dept: a.dept || "", canAssign: !!a.canAssign, canViewHistory: !!a.canViewHistory, canViewFinance: !!a.canViewFinance, canViewWorkload: !!a.canViewWorkload, canManageMembers: !!a.canManageMembers, isLeader: !!a.isLeader, isTeamlead: !!a.isTeamlead, noReport: !!a.noReport, position: a.position || "" }; }
function normAcc(a) {
  const role = a.role === "owner" ? "owner" : "member";
  let canAssign = a.canAssign;
  if (canAssign === undefined) canAssign = (a.role === "owner" || a.role === "manager"); // migrate old roles
  return { ...a, role, dept: a.dept || "", canAssign: role === "owner" ? true : !!canAssign,
    canViewHistory: role === "owner" ? true : !!a.canViewHistory,
    canViewFinance: role === "owner" ? true : !!a.canViewFinance,
    canViewWorkload: role === "owner" ? true : !!a.canViewWorkload,
    canManageMembers: role === "owner" ? true : !!a.canManageMembers };
}
function loadAccounts() { try { return JSON.parse(fs.readFileSync(ACCOUNTS, "utf8")).map(normAcc); } catch { return []; } }
function authOf(req) {
  const h = req.headers["authorization"] || "";
  const tok = h.startsWith("Bearer ") ? h.slice(7) : "";
  const rec = tokens.get(tok);
  if (!rec) return null;
  if (Date.now() > rec.exp) { tokens.delete(tok); return null; }
  rec.exp = Date.now() + TOKEN_TTL_MS; // gia hạn khi còn hoạt động
  return loadAccounts().find((a) => a.id === rec.id) || null;
}
function readBody(req) {
  return new Promise((resolve) => {
    let b = ""; req.on("data", (c) => { b += c; if (b.length > 8e6) req.destroy(); });
    req.on("end", () => { try { resolve(JSON.parse(b || "{}")); } catch { resolve({}); } });
  });
}
function json(res, code, obj) { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); }

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

const server = http.createServer(async (req, res) => {
  // ---- HTTP security headers (áp cho mọi phản hồi) ----
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");

  const u = new URL(req.url, "http://localhost");
  const p = u.pathname;

  // ---- public auth endpoints ----
  if (p === "/api/config" && req.method === "GET") {
    CONFIG = loadConfig();
    return json(res, 200, { serverMode: true, appName: CONFIG.appName || "Trạm Dự Án", version: APP_VERSION, features: CONFIG.features || {}, hasAccounts: loadAccounts().length > 0 });
  }
  if (p === "/api/setup" && req.method === "POST") {
    const accts = loadAccounts();
    if (accts.length > 0) return json(res, 403, { error: "already_setup" });
    ensureSetupCode();
    const setupKey = attemptKey(req, "__setup__");
    const lmS = lockedMinutes(setupKey);
    if (lmS > 0) return json(res, 429, { error: "locked", message: "Nhập sai mã cài đặt quá nhiều lần. Thử lại sau " + lmS + " phút." });
    const { name, email, password, code } = await readBody(req);
    if (SETUP_CODE && String(code || "").trim().toUpperCase() !== SETUP_CODE) {
      noteFail(setupKey);
      slog("SETUP bị từ chối (sai mã) từ " + clientIp(req));
      return json(res, 403, { error: "bad_code", message: "Mã cài đặt không đúng. Xem mã trong cửa sổ máy chủ (Terminal)." });
    }
    clearFails(setupKey);
    if (!name || !email || !password) return json(res, 400, { error: "missing", message: "Thiếu tên, email hoặc mật khẩu." });
    const pwErr = passwordProblem(password);
    if (pwErr) return json(res, 400, { error: "weak_password", message: pwErr });
    const salt = makeSalt();
    const acc = { id: uid(), name: String(name).trim(), email: String(email).trim().toLowerCase(), role: "owner", dept: "Lead", canAssign: true, canViewHistory: true, canViewFinance: true, canViewWorkload: true, canManageMembers: true, noReport: true, salt, hash: hashPw(password, salt) };
    saveAccounts([acc]);
    setLicenseExpiry(addMonths(Date.now(), LICENSE_MONTHS_DEFAULT));
    SETUP_CODE = "";
    slog("Tạo tài khoản CHỦ SỞ HỮU đầu tiên: " + acc.email + " từ " + clientIp(req));
    const tok = newToken(acc.id);
    return json(res, 200, { token: tok, user: safe(acc) });
  }
  if (p === "/api/login" && req.method === "POST") {
    const { email, password } = await readBody(req);
    const key = attemptKey(req, email);
    const mins = lockedMinutes(key);
    if (mins) {
      slog("Đăng nhập bị KHÓA cho " + key + " (còn " + mins + " phút)");
      return json(res, 429, { error: "locked", message: "Sai quá nhiều lần. Vui lòng thử lại sau " + mins + " phút." });
    }
    const acc = loadAccounts().find((a) => a.email === String(email || "").trim().toLowerCase());
    if (!acc || !verifyPw(password, acc.salt, acc.hash)) {
      const r = noteFail(key);
      const left = Math.max(0, MAX_FAILS - r.count);
      slog("Đăng nhập SAI: " + String(email || "").trim().toLowerCase() + " từ " + clientIp(req) + " (còn " + left + " lần)");
      const msg = r.lockUntil ? "Sai quá nhiều lần. Tài khoản bị khóa tạm 15 phút." : "Email hoặc mật khẩu không đúng." + (left <= 2 ? " Còn " + left + " lần thử." : "");
      return json(res, 401, { error: "invalid", message: msg });
    }
    clearFails(key);
    slog("Đăng nhập THÀNH CÔNG: " + acc.email + " từ " + clientIp(req));
    const tok = newToken(acc.id);
    return json(res, 200, { token: tok, user: safe(acc) });
  }

  // ---- everything below needs a valid token ----
  const needsAuth = p.startsWith("/api/");
  let me = null;
  if (needsAuth) { me = authOf(req); if (!me && p !== "/api/config") return json(res, 401, { error: "unauthorized" }); }

  // ---- license: chặn ghi khi hết hạn (chế độ chỉ đọc). Đọc (GET) vẫn cho phép. ----
  const WRITE_PATHS = new Set(["/api/kv", "/api/finance", "/api/accounts", "/api/accounts/update", "/api/accounts/delete", "/api/settings", "/api/records", "/api/records/file", "/api/records/delete", "/api/sitelogs", "/api/sitelogs/photo", "/api/sitelogs/delete", "/api/taskfiles/upload", "/api/taskfiles/delete"]);
  if (req.method === "POST" && WRITE_PATHS.has(p) && licenseReadOnly()) {
    return json(res, 423, { error: "license_expired", message: "Giấy phép đã hết hạn — phần mềm đang ở chế độ CHỈ ĐỌC. Liên hệ tác giả để gia hạn.", expiry: getLicenseExpiry() });
  }
  if (p === "/api/license" && req.method === "GET") {
    const exp = getLicenseExpiry();
    const daysLeft = exp ? Math.ceil((exp - Date.now()) / 86400000) : null;
    return json(res, 200, { expiry: exp, daysLeft, readOnly: licenseReadOnly(), author: LICENSE_AUTHOR, year: LICENSE_YEAR });
  }
  if (p === "/api/license/activate" && req.method === "POST") {
    if (!me || me.role !== "owner") return json(res, 403, { error: "forbidden" });
    const { code } = await readBody(req);
    const payload = verifyLicenseCode(code);
    if (!payload) return json(res, 400, { error: "bad_code", message: "Mã gia hạn không hợp lệ." });
    if (payload.exp <= Date.now()) return json(res, 400, { error: "code_expired", message: "Mã gia hạn này đã hết hạn." });
    const curExp = getLicenseExpiry();
    if (payload.exp > curExp) setLicense(payload.exp, String(code).trim());
    const newExp = Math.max(curExp, payload.exp);
    slog("Kích hoạt giấy phép tới " + new Date(newExp).toISOString().slice(0, 10) + " bởi " + me.email);
    const daysLeft = Math.ceil((newExp - Date.now()) / 86400000);
    return json(res, 200, { ok: true, expiry: newExp, daysLeft, readOnly: false });
  }

  // ---- BIÊN BẢN ----
  if (p === "/api/records" && req.method === "GET") {
    const pid = u.searchParams.get("projectId") || "";
    const list = loadRecords().filter((r) => !pid || r.projectId === pid)
      .map((r) => ({ id: r.id, projectId: r.projectId, date: r.date, type: r.type, number: r.number || "", note: r.note || "", createdBy: r.createdBy || "", createdAt: r.createdAt, files: (r.files || []).map((f, i) => ({ idx: i, name: f.name, size: f.size, mime: f.mime })) }))
      .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || 0) - (a.createdAt || 0));
    return json(res, 200, { records: list });
  }
  if (p === "/api/records" && req.method === "POST") {
    if (!canRecords(me)) return json(res, 403, { error: "forbidden" });
    const b = await readBody(req);
    if (!b.projectId) return json(res, 400, { error: "missing", message: "Thiếu dự án." });
    if (!canRecordProject(me, b.projectId)) return json(res, 403, { error: "forbidden", message: "Bạn không được phân công cho dự án này." });
    const folder = sanitizeName(b.projectName || b.projectId);
    const rec = { id: uid(), projectId: String(b.projectId), projectName: String(b.projectName || ""), folder, date: String(b.date || "").slice(0, 10), type: String(b.type || ""), number: String(b.number || ""), note: String(b.note || ""), files: [], createdBy: me.name || me.email, createdById: me.id, createdAt: Date.now() };
    const recs = loadRecords(); recs.push(rec); saveRecords(recs);
    slog("Tạo biên bản " + rec.date + " (" + rec.type + ") dự án " + folder + " bởi " + me.email);
    return json(res, 200, { record: { id: rec.id } });
  }
  if (p === "/api/records/file" && req.method === "POST") {
    if (!canRecords(me)) return json(res, 403, { error: "forbidden" });
    const rid = u.searchParams.get("recordId") || "";
    const origName = u.searchParams.get("filename") || "file";
    const mime = req.headers["content-type"] || "application/octet-stream";
    if (UPLOAD_BLOCK_EXT.has(fileExt(origName))) return json(res, 400, { error: "bad_type", message: "Loại tệp này không được phép tải lên (nguy cơ bảo mật)." });
    const recs = loadRecords(); const rec = recs.find((r) => r.id === rid);
    if (!rec) return json(res, 404, { error: "not_found" });
    if (!canRecordProject(me, rec.projectId)) return json(res, 403, { error: "forbidden" });
    let buf; try { buf = await readRawBody(req, 40 * 1024 * 1024); } catch { return json(res, 413, { error: "too_large", message: "Tệp quá lớn (tối đa 40MB)." }); }
    const dir = path.join(UPLOADS, rec.folder || sanitizeName(rec.projectName || rec.projectId));
    try { fs.mkdirSync(dir, { recursive: true }); } catch {}
    const fname = uniqueName(dir, recBaseName(rec.date, rec.number, rec.type), extOf(origName, mime));
    try { fs.writeFileSync(path.join(dir, fname), buf); } catch { return json(res, 500, { error: "write_failed" }); }
    rec.files = rec.files || []; rec.files.push({ name: fname, stored: path.join(rec.folder, fname), size: buf.length, mime });
    saveRecords(recs);
    return json(res, 200, { file: { name: fname, size: buf.length, mime, idx: rec.files.length - 1 } });
  }
  if (p === "/api/records/file" && req.method === "GET") {
    const rid = u.searchParams.get("recordId") || ""; const idx = parseInt(u.searchParams.get("idx") || "-1", 10);
    const rec = loadRecords().find((r) => r.id === rid);
    if (!rec || !rec.files || !rec.files[idx]) { res.writeHead(404); res.end("Not found"); return; }
    const f = rec.files[idx];
    fs.readFile(path.join(UPLOADS, f.stored), (err, buf) => {
      if (err) { res.writeHead(404); res.end("Not found"); return; }
      res.writeHead(200, { "Content-Type": INLINE_SAFE_EXT.has(fileExt(f.name)) ? (f.mime || "application/octet-stream") : "application/octet-stream", "Content-Disposition": (INLINE_SAFE_EXT.has(fileExt(f.name)) ? "inline" : "attachment") + "; filename*=UTF-8''" + encodeURIComponent(f.name) });
      res.end(buf);
    });
    return;
  }
  if (p === "/api/records/delete" && req.method === "POST") {
    if (!canRecords(me)) return json(res, 403, { error: "forbidden" });
    const { id } = await readBody(req);
    let recs = loadRecords(); const rec = recs.find((r) => r.id === id);
    if (rec && !canDeleteRecord(me, rec)) return json(res, 403, { error: "forbidden", message: "Chỉ người tạo hoặc quản lý mới xóa được." });
    if (rec) { for (const f of (rec.files || [])) { try { fs.unlinkSync(path.join(UPLOADS, f.stored)); } catch {} } }
    recs = recs.filter((r) => r.id !== id); saveRecords(recs);
    slog("Xóa biên bản " + id + " bởi " + me.email);
    return json(res, 200, { ok: true });
  }

  // ---- TỆP ĐÍNH KÈM CÔNG VIỆC ----
  if (p === "/api/taskfiles" && req.method === "GET") {
    const tid = u.searchParams.get("taskId") || "";
    const arr = (loadTaskFiles()[tid] || []).map((f, i) => ({ idx: i, name: f.name, size: f.size, mime: f.mime, by: f.by || "" }));
    return json(res, 200, { files: arr });
  }
  if (p === "/api/taskfiles/upload" && req.method === "POST") {
    if (!me) return json(res, 403, { error: "forbidden" });
    const tid = u.searchParams.get("taskId") || "";
    const origName = u.searchParams.get("filename") || "file";
    const mime = req.headers["content-type"] || "application/octet-stream";
    if (!tid) return json(res, 400, { error: "missing" });
    if (!taskExists(tid)) return json(res, 404, { error: "no_task", message: "Công việc không tồn tại." });
    if (UPLOAD_BLOCK_EXT.has(fileExt(origName))) return json(res, 400, { error: "bad_type", message: "Loại tệp này không được phép tải lên (nguy cơ bảo mật)." });
    let buf; try { buf = await readRawBody(req, 40 * 1024 * 1024); } catch { return json(res, 413, { error: "too_large", message: "Tệp quá lớn (tối đa 40MB)." }); }
    const dir = path.join(TASKUPLOADS, sanitizeName(tid));
    try { fs.mkdirSync(dir, { recursive: true }); } catch {}
    const base = sanitizeName(String(origName).replace(/\.[^.]+$/, "")) || "file";
    const fname = uniqueName(dir, base, extOf(origName, mime));
    try { fs.writeFileSync(path.join(dir, fname), buf); } catch { return json(res, 500, { error: "write_failed" }); }
    const store = loadTaskFiles(); store[tid] = store[tid] || []; store[tid].push({ name: fname, stored: path.join(sanitizeName(tid), fname), size: buf.length, mime, by: me.name || me.email, ts: Date.now() }); saveTaskFiles(store);
    slog("Đính kèm tệp công việc " + tid + " bởi " + me.email);
    return json(res, 200, { ok: true });
  }
  if (p === "/api/taskfiles/file" && req.method === "GET") {
    const tid = u.searchParams.get("taskId") || "";
    const idx = parseInt(u.searchParams.get("idx") || "-1", 10);
    const f = (loadTaskFiles()[tid] || [])[idx];
    if (!f) return json(res, 404, { error: "not_found" });
    let buf; try { buf = fs.readFileSync(path.join(TASKUPLOADS, f.stored)); } catch { return json(res, 404, { error: "not_found" }); }
    res.writeHead(200, { "Content-Type": INLINE_SAFE_EXT.has(fileExt(f.name)) ? (f.mime || "application/octet-stream") : "application/octet-stream", "Content-Disposition": (INLINE_SAFE_EXT.has(fileExt(f.name)) ? "inline" : "attachment") + "; filename*=UTF-8''" + encodeURIComponent(f.name) });
    return res.end(buf);
  }
  if (p === "/api/taskfiles/delete" && req.method === "POST") {
    if (!me) return json(res, 403, { error: "forbidden" });
    const tid = u.searchParams.get("taskId") || "";
    const idx = parseInt(u.searchParams.get("idx") || "-1", 10);
    const store = loadTaskFiles(); const arr = store[tid] || []; const f = arr[idx];
    if (!f) return json(res, 404, { error: "not_found" });
    if (!(me.role === "owner" || me.isLeader || f.by === me.name || f.by === me.email)) return json(res, 403, { error: "forbidden", message: "Chỉ người tải lên hoặc quản lý mới xóa được." });
    try { fs.unlinkSync(path.join(TASKUPLOADS, f.stored)); } catch {}
    arr.splice(idx, 1); store[tid] = arr; saveTaskFiles(store);
    return json(res, 200, { ok: true });
  }

  // ---- NHẬT KÝ THI CÔNG ----
  if (p === "/api/sitelogs" && req.method === "GET") {
    const pid = u.searchParams.get("projectId") || "";
    const list = loadSiteLogs().filter((r) => !pid || r.projectId === pid)
      .map((r) => ({ id: r.id, projectId: r.projectId, date: r.date, weatherAM: r.weatherAM || "", weatherPM: r.weatherPM || "", manpower: r.manpower || "", work: r.work || "", equipment: r.equipment || "", issues: r.issues || "", nextPlan: r.nextPlan || "", createdBy: r.createdBy || "", createdAt: r.createdAt, photos: (r.photos || []).map((f, i) => ({ idx: i, name: f.name, size: f.size, mime: f.mime })) }))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    return json(res, 200, { logs: list });
  }
  if (p === "/api/sitelogs" && req.method === "POST") {
    if (!canRecords(me)) return json(res, 403, { error: "forbidden" });
    const b = await readBody(req);
    if (!b.projectId || !b.date) return json(res, 400, { error: "missing", message: "Thiếu dự án hoặc ngày." });
    if (!canRecordProject(me, b.projectId)) return json(res, 403, { error: "forbidden", message: "Bạn không được phân công cho dự án này." });
    const logs = loadSiteLogs();
    let rec = logs.find((r) => r.id === b.id) || logs.find((r) => r.projectId === b.projectId && r.date === b.date);
    if (rec) {
      Object.assign(rec, { weatherAM: b.weatherAM || "", weatherPM: b.weatherPM || "", manpower: b.manpower || "", work: b.work || "", equipment: b.equipment || "", issues: b.issues || "", nextPlan: b.nextPlan || "", updatedAt: Date.now() });
    } else {
      rec = { id: uid(), projectId: String(b.projectId), projectName: String(b.projectName || ""), folder: sanitizeName(b.projectName || b.projectId), date: String(b.date).slice(0, 10), weatherAM: b.weatherAM || "", weatherPM: b.weatherPM || "", manpower: b.manpower || "", work: b.work || "", equipment: b.equipment || "", issues: b.issues || "", nextPlan: b.nextPlan || "", photos: [], createdBy: me.name || me.email, createdById: me.id, createdAt: Date.now() };
      logs.push(rec);
    }
    saveSiteLogs(logs);
    slog("Nhật ký thi công " + rec.date + " dự án " + rec.folder + " bởi " + me.email);
    return json(res, 200, { log: { id: rec.id } });
  }
  if (p === "/api/sitelogs/photo" && req.method === "POST") {
    if (!canRecords(me)) return json(res, 403, { error: "forbidden" });
    const rid = u.searchParams.get("logId") || "";
    const origName = u.searchParams.get("filename") || "photo.jpg";
    const mime = req.headers["content-type"] || "application/octet-stream";
    if (UPLOAD_BLOCK_EXT.has(fileExt(origName))) return json(res, 400, { error: "bad_type", message: "Loại tệp này không được phép tải lên (nguy cơ bảo mật)." });
    const logs = loadSiteLogs(); const rec = logs.find((r) => r.id === rid);
    if (!rec) return json(res, 404, { error: "not_found" });
    if (!canRecordProject(me, rec.projectId)) return json(res, 403, { error: "forbidden" });
    let buf; try { buf = await readRawBody(req, 40 * 1024 * 1024); } catch { return json(res, 413, { error: "too_large", message: "Ảnh quá lớn (tối đa 40MB)." }); }
    const dir = path.join(NHATKY, rec.folder || sanitizeName(rec.projectName || rec.projectId), rec.date);
    try { fs.mkdirSync(dir, { recursive: true }); } catch {}
    const fname = uniqueName(dir, siteBaseName(rec.projectName || rec.folder, rec.date), extOf(origName, mime));
    try { fs.writeFileSync(path.join(dir, fname), buf); } catch { return json(res, 500, { error: "write_failed" }); }
    rec.photos = rec.photos || []; rec.photos.push({ name: fname, stored: path.join(rec.folder || "", rec.date, fname), size: buf.length, mime });
    saveSiteLogs(logs);
    return json(res, 200, { photo: { name: fname, size: buf.length, mime, idx: rec.photos.length - 1 } });
  }
  if (p === "/api/sitelogs/photo" && req.method === "GET") {
    const rid = u.searchParams.get("logId") || ""; const idx = parseInt(u.searchParams.get("idx") || "-1", 10);
    const rec = loadSiteLogs().find((r) => r.id === rid);
    if (!rec || !rec.photos || !rec.photos[idx]) { res.writeHead(404); res.end("Not found"); return; }
    const f = rec.photos[idx];
    fs.readFile(path.join(NHATKY, f.stored), (err, buf) => {
      if (err) { res.writeHead(404); res.end("Not found"); return; }
      res.writeHead(200, { "Content-Type": INLINE_SAFE_EXT.has(fileExt(f.name)) ? (f.mime || "application/octet-stream") : "application/octet-stream", "Content-Disposition": (INLINE_SAFE_EXT.has(fileExt(f.name)) ? "inline" : "attachment") + "; filename*=UTF-8''" + encodeURIComponent(f.name) });
      res.end(buf);
    });
    return;
  }
  if (p === "/api/sitelogs/delete" && req.method === "POST") {
    if (!canRecords(me)) return json(res, 403, { error: "forbidden" });
    const { id } = await readBody(req);
    let logs = loadSiteLogs(); const rec = logs.find((r) => r.id === id);
    if (rec && !canDeleteRecord(me, rec)) return json(res, 403, { error: "forbidden", message: "Chỉ người tạo hoặc quản lý mới xóa được." });
    if (rec) { for (const f of (rec.photos || [])) { try { fs.unlinkSync(path.join(NHATKY, f.stored)); } catch {} } }
    logs = logs.filter((r) => r.id !== id); saveSiteLogs(logs);
    slog("Xóa nhật ký thi công " + id + " bởi " + me.email);
    return json(res, 200, { ok: true });
  }

  if (p === "/api/me" && req.method === "GET") return json(res, 200, { user: safe(me) });
  if (p === "/api/logout" && req.method === "POST") {
    const h = req.headers["authorization"] || ""; tokens.delete(h.startsWith("Bearer ") ? h.slice(7) : ""); return json(res, 200, { ok: true });
  }
  if (p === "/api/accounts" && req.method === "GET") return json(res, 200, { accounts: loadAccounts().map(safe) });

  if (p === "/api/accounts" && req.method === "POST") {
    if (!canManageMembers(me)) return json(res, 403, { error: "forbidden" });
    const { name, email, password, role, dept, canAssign, canViewHistory, canViewFinance, canViewWorkload, canManageMembers: setMng, isLeader, isTeamlead, noReport, position } = await readBody(req);
    if (!name || !email || !password) return json(res, 400, { error: "missing", message: "Thiếu tên, email hoặc mật khẩu." });
    const pwErr = passwordProblem(password);
    if (pwErr) return json(res, 400, { error: "weak_password", message: pwErr });
    if (role === "owner" && me.role !== "owner") return json(res, 403, { error: "owner_only" });
    const accts = loadAccounts();
    const em = String(email).trim().toLowerCase();
    if (accts.some((a) => a.email === em)) return json(res, 409, { error: "email_exists", message: "Email này đã được dùng." });
    const salt = makeSalt();
    const r = role === "owner" ? "owner" : "member";
    const acc = { id: uid(), name: String(name).trim(), email: em, role: r, dept: dept || "", canAssign: r === "owner" || !!canAssign, canViewHistory: r === "owner" || !!canViewHistory, canViewFinance: r === "owner" || !!canViewFinance, canViewWorkload: r === "owner" || !!canViewWorkload, canManageMembers: r === "owner" || (me.role === "owner" && !!setMng), isLeader: me.role === "owner" && !!isLeader, isTeamlead: me.role === "owner" && !!isTeamlead, noReport: me.role === "owner" && !!noReport, position: me.role === "owner" ? String(position || "") : "", salt, hash: hashPw(password, salt) };
    accts.push(acc); saveAccounts(accts);
    slog("Tạo tài khoản " + acc.email + " (vai trò " + acc.role + ") bởi " + me.email);
    return json(res, 200, { account: safe(acc) });
  }
  if (p === "/api/accounts/update" && req.method === "POST") {
    if (!canManageMembers(me)) return json(res, 403, { error: "forbidden" });
    const { id, name, role, dept, canAssign, canViewHistory, canViewFinance, canViewWorkload, canManageMembers: setMng, isLeader, isTeamlead, noReport, position, password } = await readBody(req);
    const accts = loadAccounts(); const a = accts.find((x) => x.id === id);
    if (!a) return json(res, 404, { error: "not_found" });
    if (a.role === "owner" && me.role !== "owner") return json(res, 403, { error: "owner_only" });
    if (role === "owner" && me.role !== "owner") return json(res, 403, { error: "owner_only" });
    if (password) { const pwErr = passwordProblem(password); if (pwErr) return json(res, 400, { error: "weak_password", message: pwErr }); }
    if (name != null) a.name = String(name).trim();
    if (dept != null) a.dept = String(dept);
    if (role) a.role = role === "owner" ? "owner" : "member";
    if (canAssign != null) a.canAssign = !!canAssign;
    if (canViewHistory != null) a.canViewHistory = !!canViewHistory;
    if (canViewFinance != null) a.canViewFinance = !!canViewFinance;
    if (canViewWorkload != null) a.canViewWorkload = !!canViewWorkload;
    if (setMng != null && me.role === "owner") a.canManageMembers = !!setMng;
    if (isLeader != null && me.role === "owner") a.isLeader = !!isLeader;
    if (isTeamlead != null && me.role === "owner") a.isTeamlead = !!isTeamlead;
    if (noReport != null && me.role === "owner") a.noReport = !!noReport;
    if (position != null && me.role === "owner") a.position = String(position || "");
    if (a.role === "owner") { a.canAssign = true; a.canViewHistory = true; a.canViewFinance = true; a.canViewWorkload = true; a.canManageMembers = true; }
    if (password) { a.salt = makeSalt(); a.hash = hashPw(password, a.salt); }
    if (!accts.some((x) => x.role === "owner")) return json(res, 400, { error: "need_owner" });
    saveAccounts(accts);
    if (password) revokeTokens(a.id, a.id === me.id ? bearerOf(req) : null);
    slog("Cập nhật tài khoản " + a.email + " bở" + "i " + me.email + (password ? " (đổi mật khẩu)" : ""));
    return json(res, 200, { account: safe(a) });
  }
  if (p === "/api/accounts/delete" && req.method === "POST") {
    if (!canManageMembers(me)) return json(res, 403, { error: "forbidden" });
    const { id } = await readBody(req);
    let accts = loadAccounts();
    const target = accts.find((x) => x.id === id);
    if (target && target.role === "owner" && me.role !== "owner") return json(res, 403, { error: "owner_only" });
    accts = accts.filter((x) => x.id !== id);
    if (!accts.some((x) => x.role === "owner")) return json(res, 400, { error: "need_owner" });
    saveAccounts(accts);
    revokeTokens(id);
    slog("Xóa tài khoản " + (target ? target.email : id) + " bởi " + me.email);
    return json(res, 200, { ok: true });
  }
  if (p === "/api/password" && req.method === "POST") { // self change
    const { oldPassword, newPassword } = await readBody(req);
    const accts = loadAccounts(); const a = accts.find((x) => x.id === me.id);
    if (!a || !verifyPw(oldPassword, a.salt, a.hash)) return json(res, 401, { error: "invalid", message: "Mật khẩu hiện tại không đúng." });
    const pwErr = passwordProblem(newPassword);
    if (pwErr) return json(res, 400, { error: "weak_password", message: pwErr });
    a.salt = makeSalt(); a.hash = hashPw(newPassword, a.salt); saveAccounts(accts);
    const revoked = revokeTokens(a.id, bearerOf(req));
    slog("Đổi mật khẩu của chính mình: " + a.email + " (thu hồi " + revoked + " phiên khác)");
    return json(res, 200, { ok: true });
  }

  // ---- settings (owner only) ----
  if (p === "/api/settings" && req.method === "GET") {
    if (me.role !== "owner") return json(res, 403, { error: "forbidden" });
    const c = loadConfig();
    const smtp = { ...(c.smtp || {}) };
    // Không trả mật khẩu SMTP về trình duyệt; chỉ cho biết đã có hay chưa.
    const hasSmtpPass = !!(process.env.SMTP_PASS || smtp.pass);
    smtp.pass = "";
    return json(res, 200, { appName: c.appName || "Trạm Dự Án", appUrl: c.appUrl || "", reminderCheckSeconds: c.reminderCheckSeconds || 60, backup: c.backup || { email: "" }, smtp, hasSmtpPass, smtpPassFromEnv: !!process.env.SMTP_PASS, features: c.features || {} });
  }
  if (p === "/api/settings" && req.method === "POST") {
    if (me.role !== "owner") return json(res, 403, { error: "forbidden" });
    const b = await readBody(req);
    const cfg = loadConfig();
    const merged = { ...cfg };
    if (b.appName != null) merged.appName = String(b.appName);
    if (b.appUrl != null) merged.appUrl = String(b.appUrl);
    if (b.reminderCheckSeconds != null) merged.reminderCheckSeconds = Number(b.reminderCheckSeconds) || 60;
    if (b.features && typeof b.features === "object") merged.features = { ...(cfg.features || {}), ...b.features };
    if (b.backup) merged.backup = { ...(cfg.backup || {}), ...b.backup };
    if (b.smtp) {
      const sm = { ...(cfg.smtp || {}), ...b.smtp };
      // Nếu ô mật khẩu để trống thì GIỮ mật khẩu cũ (tránh xóa nhầm khi lưu cài đặt).
      if (b.smtp.pass === "" || b.smtp.pass == null) sm.pass = (cfg.smtp || {}).pass || "";
      merged.smtp = sm;
    }
    writeJsonAtomic(CONFIG_PATH, JSON.stringify(merged, null, 2));
    CONFIG = merged;
    slog("Cập nhật cài đặt hệ thống bởi " + me.email);
    return json(res, 200, { ok: true });
  }

  // ---- finance (owner or permitted manager only) ----
  if (p === "/api/finance" && req.method === "GET") {
    if (!canFinance(me)) return json(res, 403, { error: "forbidden" });
    return json(res, 200, loadFinance());
  }
  if (p === "/api/finance" && req.method === "POST") {
    if (!canFinance(me)) return json(res, 403, { error: "forbidden" });
    const body = await readBody(req);
    saveFinance({ investorContracts: Array.isArray(body.investorContracts) ? body.investorContracts : [], subContracts: Array.isArray(body.subContracts) ? body.subContracts : [], rev: (loadFinance().rev || 0) + 1, updatedAt: Date.now() });
    return json(res, 200, { ok: true });
  }

  // ---- data KV (token required) ----
  if (p === "/api/kv" && req.method === "GET") {
    const key = u.searchParams.get("key"); const d = loadData();
    return json(res, 200, { value: key in d ? d[key] : null });
  }
  if (p === "/api/kv" && req.method === "POST") {
    const { key, value } = await readBody(req); const d = loadData();
    if (key === SHARED_KEY) {
      let inRev = null, curRev = null;
      try { inRev = JSON.parse(value).rev; } catch {}
      try { curRev = JSON.parse(d[key] || "{}").rev; } catch {}
      if (typeof inRev === "number" && typeof curRev === "number" && inRev <= curRev) {
        return json(res, 409, { error: "conflict", rev: curRev });
      }
    }
    d[key] = value; saveData(d);
    return json(res, 200, { ok: true });
  }

  // ---- static ----
  let fpath = p === "/" ? "/index.html" : p;
  const sfe = path.normalize(fpath).replace(/^(\.\.([/\\]|$))+/, "");
  const fp = path.join(PUBLIC, sfe);
  fs.readFile(fp, (err, buf) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    const ex2 = path.extname(fp);
    let nc = {};
    if (ex2 === ".html") nc = { "Cache-Control": "no-store" };
    else if ([".js", ".css", ".woff", ".woff2", ".png", ".jpg", ".svg", ".ico"].includes(ex2)) nc = { "Cache-Control": "public, max-age=31536000, immutable" };
    res.writeHead(200, { "Content-Type": MIME[ex2] || "application/octet-stream", ...nc });
    res.end(buf);
  });
});

/* ===================== EMAIL REMINDER SCHEDULER ===================== */
let nodemailer = null;
try { nodemailer = require("nodemailer"); } catch {}
function buildTransport() {
  const s = CONFIG.smtp || {};
  const host = process.env.SMTP_HOST || s.host;
  if (!nodemailer || !host) return null;
  const user = process.env.SMTP_USER || s.user;
  const pass = process.env.SMTP_PASS || s.pass;
  const port = Number(process.env.SMTP_PORT || s.port || 587);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : !!s.secure;
  try { return nodemailer.createTransport({ host, port, secure, auth: user ? { user, pass } : undefined }); }
  catch { return null; }
}
function smtpFrom() {
  const s = CONFIG.smtp || {};
  return process.env.SMTP_FROM || s.from || process.env.SMTP_USER || s.user || "no-reply@localhost";
}
function deadlineDate(iso) { return new Date(iso + "T17:00:00"); }

async function runReminderCheck() {
  CONFIG = loadConfig();
  if (CONFIG.features && CONFIG.features.notifications === false) return;
  const d = loadData();
  let shared; try { shared = JSON.parse(d[SHARED_KEY] || "{}"); } catch { return; }
  const tasks = shared.tasks || [], projects = shared.projects || [];
  const accounts = loadAccounts();
  const emailById = Object.fromEntries(accounts.map((a) => [a.id, a.email]));
  const nameById = Object.fromEntries(accounts.map((a) => [a.id, a.name]));
  const projById = Object.fromEntries(projects.map((p) => [p.id, p.name]));
  const sent = d.__reminders_sent || {};
  const now = Date.now();
  const transport = buildTransport();
  const from = smtpFrom();
  let due = [];
  for (const tk of tasks) {
    if (tk.completed || !tk.dueDate || !tk.reminderLead) continue;
    const sig = tk.id + "|" + tk.dueDate + "|" + tk.reminderLead;
    if (sent[sig]) continue;
    const dl = deadlineDate(tk.dueDate).getTime();
    const remindAt = dl - tk.reminderLead * 60000;
    if (now >= remindAt && now <= dl) {
      const emails = (tk.assignees || []).map((id) => emailById[id]).filter(Boolean);
      if (emails.length === 0) { sent[sig] = now; continue; }
      due.push({ tk, emails, primary: nameById[tk.primaryAssigneeId] || "", proj: projById[tk.projectId] || "", sig });
    }
  }
  if (due.length === 0) { d.__reminders_sent = sent; saveData(d); return; }
  for (const item of due) {
    const { tk, emails, primary, proj, sig } = item;
    const subject = "[Nhắc việc] " + (tk.title || "Công việc") + " — hạn " + tk.dueDate;
    const link = CONFIG.appUrl ? "\n\nMở phần mềm: " + CONFIG.appUrl : "";
    const text = "Nhắc việc sắp đến hạn:\n\n• Công việc: " + (tk.title || "(chưa đặt tên)") + "\n• Dự án: " + proj + "\n• Hạn chót: " + tk.dueDate + "\n• Phụ trách chính: " + primary + "\n• Đã hoàn thành: " + (tk.workdone || 0) + "%" + link + "\n\n(Email tự động từ Trạm Dự Án)";
    if (transport) {
      try { await transport.sendMail({ from, to: emails.join(","), subject, text }); console.log("[reminder] đã gửi: \"" + tk.title + "\" -> " + emails.join(", ")); }
      catch (e) { console.log("[reminder] LỖI gửi \"" + tk.title + "\":", e.message); continue; }
    } else { console.log("[reminder][DRY-RUN — chưa cấu hình SMTP] sẽ gửi \"" + tk.title + "\" -> " + emails.join(", ") + " (hạn " + tk.dueDate + ")"); }
    sent[sig] = Date.now();
  }
  d.__reminders_sent = sent; saveData(d);
}

/* ===================== WEEKLY BACKUP (Saturday) ===================== */
function isoWeek(d) {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = dt.getUTCDay() || 7; dt.setUTCDate(dt.getUTCDate() + 4 - day);
  const ys = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const wk = Math.ceil((((dt - ys) / 86400000) + 1) / 7);
  return dt.getUTCFullYear() + "-W" + wk;
}
async function runBackupCheck() {
  CONFIG = loadConfig();
  if (CONFIG.features && CONFIG.features.notifications === false) return;
  const b = CONFIG.backup || {};
  if (!b.email) return;
  const now = new Date();
  if (now.getDay() !== 6) return;                 // chỉ thứ Bảy (0=CN ... 6=T7)
  if (typeof b.hour === "number" && now.getHours() < b.hour) return;
  const d = loadData();
  const wk = isoWeek(now);
  if (d.__backup_week === wk) return;             // đã gửi trong tuần này
  const transport = buildTransport();
  const from = smtpFrom();
  const attachments = [];
  for (const [fn, fp] of [["data.json", DATA], ["finance.json", FINANCE], ["records.json", RECORDS], ["sitelogs.json", SITELOGS], ["taskfiles.json", TASKFILES], ["config.json", CONFIG_PATH]]) {
    try { if (fs.existsSync(fp)) attachments.push({ filename: fn, content: fs.readFileSync(fp) }); } catch {}
  }
  const dateStr = now.toISOString().slice(0, 10);
  if (transport) {
    try {
      await transport.sendMail({ from, to: b.email, subject: "[Sao lưu] Trạm Dự Án — " + dateStr,
        text: "Bản sao lưu tự động hằng tuần của Trạm Dự Án (ngày " + dateStr + ").\n\nĐính kèm: data.json (công việc/dự án), finance.json (chi phí), records.json (biên bản), sitelogs.json (nhật ký thi công), config.json (cấu hình).\nLƯU Ý: accounts.json (mật khẩu đã băm) và các tệp/ảnh đính kèm (thư mục uploads, nhatky-thi-cong) KHÔNG gửi qua email vì lý do bảo mật/dung lượng — hãy sao lưu toàn bộ thư mục data bằng Hyper Backup của NAS.\nĐể phục hồi: đặt các file này vào thư mục data rồi khởi động lại.",
        attachments });
      console.log("[backup] đã gửi sao lưu -> " + b.email);
      d.__backup_week = wk; saveData(d);
    } catch (e) { console.log("[backup] LỖI gửi:", e.message); }
  } else {
    console.log("[backup][DRY-RUN — chưa cấu hình SMTP] sẽ gửi sao lưu -> " + b.email);
    d.__backup_week = wk; saveData(d);
  }
}

server.listen(PORT, "0.0.0.0", () => {
  let lan = "localhost";
  const ifaces = os.networkInterfaces();
  for (const name in ifaces) for (const ni of ifaces[name]) if (ni.family === "IPv4" && !ni.internal) lan = ni.address;
  console.log("\n  ===========================================================");
  console.log("   TRẠM DỰ ÁN đang chạy / Project Hub is running");
  console.log("  ===========================================================\n");
  console.log("   • Máy này (This computer):  http://localhost:" + PORT);
  console.log("   • Mạng nội bộ (LAN/NAS):    http://" + lan + ":" + PORT + "\n");
  const accts = loadAccounts();
  if (accts.length === 0) {
    ensureSetupCode();
    console.log("   Tài khoản: (chưa có — mở trang web để tạo tài khoản Chủ sở hữu đầu tiên)");
    console.log("   ****************************************************");
    console.log("   *  MÃ CÀI ĐẶT (nhập khi tạo tài khoản chủ): " + SETUP_CODE);
    console.log("   ****************************************************");
  } else {
    console.log("   Tài khoản: " + accts.length + " tài khoản");
  }
  const cfg = loadConfig();
  const mailReady = !!(nodemailer && (process.env.SMTP_HOST || (cfg.smtp && cfg.smtp.host)));
  console.log("   Email nhắc việc: " + (mailReady ? "ĐÃ cấu hình" : "CHƯA cấu hình (chạy thử khô — vào Cài đặt để điền)"));
  console.log("   Sao lưu hằng tuần (T7): " + ((cfg.backup && cfg.backup.email) ? ("-> " + cfg.backup.email) : "(chưa đặt email nhận sao lưu)"));
  console.log("   Bảo mật: khóa đăng nhập sau " + MAX_FAILS + " lần sai, phiên hết hạn sau 12 giờ.");
  ensureLicense();
  { const e = getLicenseExpiry(); const dl = e ? Math.ceil((e - Date.now()) / 86400000) : 0;
    console.log("   Giấy phép: " + (e ? ("còn " + dl + " ngày (hết hạn " + new Date(e).toISOString().slice(0,10) + ")" + (licenseReadOnly() ? " — ĐANG CHỈ ĐỌC" : "")) : "(chưa đặt)")); }
  console.log("   Dữ liệu: " + DATA + "\n   Tài khoản: " + ACCOUNTS + "\n   Nhật ký bảo mật: " + path.join(DATA_DIR, "security.log") + "\n");
  console.log("   Nhấn Ctrl+C để dừng.\n");
  const sec = Math.max(20, (loadConfig().reminderCheckSeconds || 60));
  runReminderCheck().catch(() => {});
  setInterval(() => runReminderCheck().catch(() => {}), sec * 1000);
  runBackupCheck().catch(() => {});
  setInterval(() => runBackupCheck().catch(() => {}), 3600 * 1000);
  setInterval(purgeTokens, 10 * 60 * 1000);
});
