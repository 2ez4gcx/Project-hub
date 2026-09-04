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

// ---- .env loader: nạp bí mật (vd SMTP_PASS) và cấu hình (PORT...) từ file .env ----
// Chạy TRƯỚC khi đọc các hằng bên dưới, để PORT/DATA_DIR trong .env có hiệu lực.
(function loadEnv() {
  const dd = process.env.DATA_DIR || path.join(__dirname, "data");
  for (const envp of [path.join(dd, ".env"), path.join(__dirname, ".env")]) {
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

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const PUBLIC = path.join(__dirname, "public");
const DATA = path.join(DATA_DIR, "data.json");
const ACCOUNTS = path.join(DATA_DIR, "accounts.json");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");
const PORT = process.env.PORT || 3000;
const SHARED_KEY = "pm_shared_v3";

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}

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

/* Phiên bản phần mềm — hiện ở góc thanh bên và trong /api/config */
let APP_VERSION = "4.0.0";
try { APP_VERSION = require("./package.json").version || APP_VERSION; } catch (e) {}

/* ===================== NHẬT KÝ KIỂM TOÁN (audit trail) =====================
   Máy chủ tự ghi MỌI thay đổi nó nhìn thấy vào data/audit.jsonl (mỗi dòng một JSON).
   Chỉ ghi thêm, ứng dụng không có đường nào sửa hay xóa — kể cả Chủ sở hữu.
   Khác với "Lịch sử thay đổi" (do client ghi, phục vụ hiển thị thân thiện). */
const AUDIT = path.join(DATA_DIR, "audit.jsonl");
const AUDIT_MAX_BYTES = 20 * 1024 * 1024;
const AUDIT_MAX_ENTRIES = 300;         // trần mỗi lần ghi, tránh một thao tác sinh hàng vạn dòng
/* H2: chỉ nhận đúng hình dạng bảng kiểm, chặn dữ liệu rác/quá lớn từ máy trạm. */
/* P5: bảng nhân lực — mỗi dòng một tổ đội / nghề, kèm số người và số giờ. */
function sachNhanLuc(x) {
  if (!Array.isArray(x)) return null;
  return x.slice(0, 60).map((r) => ({
    to: String((r && r.to) || "").slice(0, 120),
    soNguoi: Math.max(0, Math.round(Number(r && r.soNguoi) || 0)),
    gio: Math.max(0, Number(r && r.gio) || 0),
  })).filter((r) => r.to || r.soNguoi);
}
/* P5: bảng thiết bị — mỗi dòng một loại máy, số lượng và số giờ hoạt động. */
function sachThietBi(x) {
  if (!Array.isArray(x)) return null;
  return x.slice(0, 60).map((r) => ({
    ten: String((r && r.ten) || "").slice(0, 120),
    soLuong: Math.max(0, Math.round(Number(r && r.soLuong) || 0)),
    gio: Math.max(0, Number(r && r.gio) || 0),
  })).filter((r) => r.ten);
}
/* P5: khối lượng thi công trong ngày, gắn theo hạng mục BOQ để cộng dồn được. */
function sachKhoiLuong(x) {
  if (!Array.isArray(x)) return null;
  return x.slice(0, 100).map((r) => ({
    boqId: String((r && r.boqId) || "").slice(0, 60),
    ten: String((r && r.ten) || "").slice(0, 200),
    donVi: String((r && r.donVi) || "").slice(0, 20),
    kl: Number(r && r.kl) || 0,
  })).filter((r) => r.ten || r.boqId);
}
/* P5: sự cố / mất an toàn tách hẳn khỏi "vướng mắc tiến độ". */
function sachSuCo(x) {
  if (!x || typeof x !== "object") return null;
  const MUC = ["", "nhe", "trungbinh", "nghiemtrong"];
  const o = {
    co: !!x.co,
    mucDo: MUC.includes(x.mucDo) ? x.mucDo : "",
    moTa: String(x.moTa || "").slice(0, 2000),
    khacPhuc: String(x.khacPhuc || "").slice(0, 2000),
    nguoiLienQuan: String(x.nguoiLienQuan || "").slice(0, 300),
  };
  return (o.co || o.moTa) ? o : null;
}
function sachThoiTiet(x) {
  if (!x || typeof x !== "object") return null;
  return { nhietDo: String(x.nhietDo || "").slice(0, 20),
           gioMua: Math.max(0, Math.min(24, Number(x.gioMua) || 0)),
           gioNgungViec: Math.max(0, Math.min(24, Number(x.gioNgungViec) || 0)) };
}
/* Q3: so kỳ nghiệm thu cũ với mới; kỳ có khoa=true thì mọi số liệu của kỳ đó phải giữ nguyên.
   Chỉ Chủ sở hữu mới được đổi cờ khóa (mở/đóng). Trả về chuỗi lỗi, hoặc null nếu hợp lệ. */
function kiemTraKyKhoa(cur, inc, me) {
  const cb = (cur && cur.boq) || {}, nb = (inc && inc.boq) || {};
  for (const pid of Object.keys(cb)) {
    const kysCu = (cb[pid] && cb[pid].kys) || [];
    const kysMoi = ((nb[pid] && nb[pid].kys) || []);
    const hangCu = (cb[pid] && cb[pid].items) || [];
    const hangMoi = (nb[pid] && nb[pid].items) || [];
    for (const kyCu of kysCu) {
      if (!kyCu || !kyCu.khoa) continue;
      const so = "Kỳ nghiệm thu số " + (kyCu.soKy || "?");
      const kyMoi = kysMoi.find((k) => k && k.id === kyCu.id);
      if (!kyMoi) return so + " đã khóa — không xóa được.";
      /* Mở khóa: chỉ Chủ sở hữu, và PHẢI ghi lý do (R4 — trước đây gọi thẳng API là bỏ qua được). */
      if (!kyMoi.khoa) {
        if (me.role !== "owner") return "Chỉ Chủ sở hữu mới mở khóa được kỳ nghiệm thu đã nộp.";
        if (!String(kyMoi.moKhoaLyDo || "").trim()) return so + " — phải ghi lý do khi mở khóa.";
        continue;                                   // đã mở khóa hợp lệ thì thôi không xét tiếp
      }
      if (JSON.stringify(kyCu.kl || {}) !== JSON.stringify(kyMoi.kl || {})) {
        return so + " đã khóa — phải mở khóa trước khi sửa khối lượng.";
      }
      if (String(kyCu.denNgay || "") !== String(kyMoi.denNgay || "") || String(kyCu.soKy || "") !== String(kyMoi.soKy || "")) {
        return so + " đã khóa — không đổi được số kỳ hoặc ngày chốt kỳ.";
      }
      if (JSON.stringify(kyCu.dgKhoa || {}) !== JSON.stringify(kyMoi.dgKhoa || {})) {
        return so + " đã khóa — không sửa được đơn giá đã chốt của kỳ.";
      }
      /* R3: hạng mục có khối lượng trong kỳ đã khóa thì không được xóa; đơn giá đổi vẫn cho
         (giá cho các kỳ SAU), nhưng giá trị kỳ khóa lấy theo dgKhoa nên không đổi theo. */
      for (const [hid, kl] of Object.entries(kyCu.kl || {})) {
        if (!(Number(kl) > 0)) continue;
        if (!hangMoi.some((it) => it && it.id === hid) && hangCu.some((it) => it && it.id === hid)) {
          return so + " đã khóa — không xóa được hạng mục đã nghiệm thu trong kỳ.";
        }
      }
    }
  }
  return null;
}

/* R3: khi một kỳ chuyển từ MỞ sang KHÓA, chụp lại đơn giá đang áp dụng của từng hạng mục
   có khối lượng trong kỳ. Từ đó giá trị kỳ đã nộp Chủ đầu tư là con số cố định. */
function chupDonGiaKhiKhoa(cur, inc) {
  const cb = (cur && cur.boq) || {}, nb = (inc && inc.boq) || {};
  for (const pid of Object.keys(nb)) {
    const bp = nb[pid]; if (!bp || !Array.isArray(bp.kys)) continue;
    const kysCu = (cb[pid] && cb[pid].kys) || [];
    const gia = {};
    for (const it of (bp.items || [])) if (it && it.id) gia[it.id] = Number(it.donGia) || 0;
    bp.kys = bp.kys.map((k) => {
      if (!k || !k.khoa) return k;
      const cu = kysCu.find((x) => x && x.id === k.id);
      if (cu && cu.khoa && cu.dgKhoa) return { ...k, dgKhoa: cu.dgKhoa };   // đã chụp rồi thì giữ nguyên
      const chup = {};
      for (const [hid, kl] of Object.entries(k.kl || {})) if (Number(kl) > 0) chup[hid] = gia[hid] || 0;
      return { ...k, dgKhoa: chup, khoaLuc: k.khoaLuc || Date.now() };
    });
  }
  return inc;
}
function sachBangKiem(x) {
  if (!Array.isArray(x)) return null;
  const OK = ["", "dat", "khongdat", "na"];
  return x.slice(0, 200).map((it) => ({
    text: String((it && it.text) || "").slice(0, 400),
    ketQua: OK.includes((it && it.ketQua) || "") ? (it.ketQua || "") : "",
    ghiChu: String((it && it.ghiChu) || "").slice(0, 400),
  })).filter((it) => it.text);
}
/* ---- A6: phạm vi dự án ----
   Trả về null nếu người này thấy TẤT CẢ (Chủ sở hữu, Lãnh đạo, hoặc chưa dự án nào khai
   thành viên) — khi đó mọi thứ chạy y như trước, không tốn thêm chi phí nào. */
function phamViDuAn(me, st) {
  if (!me) return new Set();
  if (me.role === "owner" || me.isLeader) return null;
  const ds = Array.isArray(st && st.projects) ? st.projects : [];
  if (!ds.some((p) => Array.isArray(p && p.members) && p.members.length)) return null;   // chưa ai dùng tính năng này
  const th = new Set();
  for (const p of ds) {
    if (!p || !p.id) continue;
    if (!Array.isArray(p.members) || !p.members.length) th.add(p.id);                    // dự án mở
    else if (p.members.includes(me.id)) th.add(p.id);
  }
  return th;
}
/* Bản rút gọn của khối dữ liệu chung, chỉ còn những dự án người này được vào.
   Danh sách thành viên công ty giữ nguyên vì giao diện cần tên/ảnh người khác. */
/* R9: tra dự án của một công việc để lọc báo cáo ngày (bản ghi báo cáo không mang projectId). */
function duAnCuaViec(st, taskId) {
  if (!taskId) return "";
  const tk = (st.tasks || []).find((x) => x && x.id === taskId);
  return tk ? tk.projectId : "";
}
function locTheoPhamVi(st, thay) {
  if (!thay) return st;
  const trong = (pid) => !pid || thay.has(pid);
  return {
    ...st,
    projects: (st.projects || []).filter((p) => p && thay.has(p.id)),
    sections: (st.sections || []).filter((x) => x && trong(x.projectId)),
    tasks: (st.tasks || []).filter((x) => x && trong(x.projectId)),
    history: (st.history || []).filter((x) => x && trong(x.projectId)),
    /* R9: bản ghi báo cáo ngày dùng `items` (mỗi dòng có taskId), KHÔNG có `lines` và
       không mang projectId — bộ lọc cũ viết theo `lines` nên luôn đúng, tức là không lọc gì.
       Nay tra dự án qua taskId; dòng nào thuộc dự án ngoài phạm vi thì cắt khỏi báo cáo. */
    dailyReports: (st.dailyReports || []).map((x) => {
      if (!x || !Array.isArray(x.items)) return x;
      return { ...x, items: x.items.filter((it) => trong(duAnCuaViec(st, it && it.taskId))) };
    }),
    trash: (st.trash || []).filter((x) => x && (trong(x.projectId) || thay.has(x.id))),
  };
}
/* Ghép phần người bị hạn chế gửi lên (đã lọc) trở lại bản đầy đủ: giữ nguyên mọi bản ghi
   thuộc dự án họ KHÔNG thấy, và chặn việc họ tự tạo bản ghi cho dự án ngoài phạm vi. */
function ghepTheoPhamVi(cur, inc, thay) {
  if (!thay) return inc;
  const dsach = (x) => (Array.isArray(x) ? x : []);
  const trong = (pid) => !pid || thay.has(pid);
  const an = (ds, lay) => dsach(ds).filter((x) => x && !trong(lay(x)));          // phần bị ẩn -> giữ nguyên
  const hienHopLe = (ds, lay) => dsach(ds).filter((x) => x && trong(lay(x)));    // phần gửi lên -> chỉ nhận trong phạm vi
  const pid = (x) => x.projectId;
  return {
    ...cur, ...inc,
    projects: [...an(cur.projects, (x) => x.id), ...hienHopLe(inc.projects, (x) => x.id)],
    sections: [...an(cur.sections, pid), ...hienHopLe(inc.sections, pid)],
    tasks: [...an(cur.tasks, pid), ...hienHopLe(inc.tasks, pid)],
    /* R1: lịch sử KHÔNG ghép kiểu [phần ẩn] + [phần gửi] được — luật 6 đòi đúng khuôn
       [mục MỚI của người gửi, giữ thứ tự họ gửi] + [nguyên văn lịch sử máy chủ].
       Mục "mới" = id chưa có trên máy chủ. Cắt 500 giống hành vi máy trạm. */
    history: (() => {
      const daCo = new Set(dsach(cur.history).map((x) => x && x.id));
      const moi = dsach(inc.history).filter((x) => x && x.id && !daCo.has(x.id) && trong(x.projectId));
      return [...moi, ...dsach(cur.history)].slice(0, 500);
    })(),
    /* R9: khi ghép lại, giữ nguyên các DÒNG thuộc dự án ngoài phạm vi (người gửi không
       nhìn thấy chúng nên cũng không được vô tình xóa mất). */
    dailyReports: (() => {
      const banCu = new Map((cur.dailyReports || []).map((x) => [x && x.id, x]));
      const ra = (inc.dailyReports || []).map((x) => {
        if (!x || !Array.isArray(x.items)) return x;
        const cu = banCu.get(x.id);
        const an = (cu && Array.isArray(cu.items)) ? cu.items.filter((it) => !trong(duAnCuaViec(cur, it && it.taskId))) : [];
        return an.length ? { ...x, items: [...x.items, ...an] } : x;
      });
      const idsMoi = new Set(ra.map((x) => x && x.id));
      for (const [id, x] of banCu) if (!idsMoi.has(id)) ra.push(x);      // báo cáo hoàn toàn nằm ngoài phạm vi
      return ra;
    })(),
    trash: [...an(cur.trash, (x) => x.projectId || x.id), ...hienHopLe(inc.trash, (x) => x.projectId || x.id)],
  };
}
/* R8: tài chính cũng phải theo phạm vi dự án. Hợp đồng có sẵn projectId; boq/nganSach/
   chiPhi/deNghi là đối tượng khóa theo projectId nên lọc/ghép theo khóa. */
function locTaiChinh(f, thay) {
  if (!thay) return f;
  const loc = (o) => Object.fromEntries(Object.entries(o || {}).filter(([pid]) => thay.has(pid)));
  return { ...f,
    investorContracts: (f.investorContracts || []).filter((c) => c && thay.has(c.projectId)),
    subContracts: (f.subContracts || []).filter((c) => c && thay.has(c.projectId)),
    boq: loc(f.boq), nganSach: loc(f.nganSach), chiPhi: loc(f.chiPhi), deNghi: loc(f.deNghi) };
}
function ghepTaiChinh(cur, inc, thay) {
  if (!thay) return inc;
  const an = (o) => Object.fromEntries(Object.entries(o || {}).filter(([pid]) => !thay.has(pid)));
  const hien = (o) => Object.fromEntries(Object.entries(o || {}).filter(([pid]) => thay.has(pid)));
  const hd = (side) => [
    ...(cur[side] || []).filter((c) => c && !thay.has(c.projectId)),        // phần ẩn: giữ nguyên
    ...(inc[side] || []).filter((c) => c && thay.has(c.projectId)),         // phần gửi: chỉ nhận trong phạm vi
  ];
  return { ...inc,
    investorContracts: hd("investorContracts"), subContracts: hd("subContracts"),
    boq: { ...an(cur.boq), ...hien(inc.boq) },
    nganSach: { ...an(cur.nganSach), ...hien(inc.nganSach) },
    chiPhi: { ...an(cur.chiPhi), ...hien(inc.chiPhi) },
    deNghi: { ...an(cur.deNghi), ...hien(inc.deNghi) } };
}
function auditWrite(entries) {
  if (!entries || !entries.length) return;
  try {
    try { const st = fs.statSync(AUDIT); if (st.size > AUDIT_MAX_BYTES) fs.renameSync(AUDIT, AUDIT + ".1"); } catch {}
    /* R10: trước đây cắt im lặng ở 300 dòng — nhập CSV 350 việc thì 50 việc không có vết nào.
       Nay vẫn giới hạn để một thao tác không sinh hàng vạn dòng, nhưng ghi thêm MỘT dòng
       tổng kết cho phần bị gộp, để không bao giờ có thay đổi biến mất khỏi nhật ký. */
    let ghi = entries;
    if (entries.length > AUDIT_MAX_ENTRIES) {
      const d = entries[0];
      ghi = entries.slice(0, AUDIT_MAX_ENTRIES).concat([{
        ts: d.ts, rev: d.rev, actor: d.actor, actorId: d.actorId, ip: d.ip,
        entity: "batch", id: "", name: "", field: "gộp",
        from: "", to: "và " + (entries.length - AUDIT_MAX_ENTRIES) + " thay đổi cùng lượt (tổng " + entries.length + ")",
        projectId: d.projectId || "",
      }]);
    }
    fs.appendFileSync(AUDIT, ghi.map((e) => JSON.stringify(e)).join("\n") + "\n");
  } catch {}
}
function auditRead(limit, projectId) {
  try {
    const txt = fs.readFileSync(AUDIT, "utf8");
    const lines = txt.split("\n").filter(Boolean);
    const out = [];
    for (let i = lines.length - 1; i >= 0 && out.length < limit; i--) {
      try { const e = JSON.parse(lines[i]); if (!projectId || e.projectId === projectId) out.push(e); } catch {}
    }
    return out;
  } catch { return []; }
}
// so sánh hai bản dữ liệu chung và sinh các dòng nhật ký
function diffAudit(me, inc, curStr, ip, rev) {
  let cur; try { cur = JSON.parse(curStr || "{}") || {}; } catch { cur = {}; }
  const arr = (x) => (Array.isArray(x) ? x : []);
  const now = Date.now();
  const out = [];
  const add = (entity, id, name, field, from, to, projectId) =>
    out.push({ ts: now, rev, actor: me.name || me.email, actorId: me.id, ip, entity, id, name, field, from, to, projectId });
  const short = (v) => {
    if (v === undefined || v === null) return "";
    if (Array.isArray(v)) return v.length + " mục";
    if (typeof v === "object") return "(dữ liệu)";
    return String(v).slice(0, 120);
  };
  const projName = Object.fromEntries(arr(inc.projects).concat(arr(cur.projects)).map((p) => [p && p.id, p && p.name]));

  // dự án
  const curP = new Map(arr(cur.projects).map((p) => [p && p.id, p]));
  const incP = new Map(arr(inc.projects).map((p) => [p && p.id, p]));
  for (const [id, p] of incP) {
    const old = curP.get(id);
    if (!old) { add("project", id, p.name, "tạo mới", "", p.name, id); continue; }
    if (p.name !== old.name) add("project", id, p.name, "name", old.name, p.name, id);
    if (JSON.stringify(p.baseline || null) !== JSON.stringify(old.baseline || null)) add("project", id, p.name, "baseline", "", "đã lưu kế hoạch gốc", id);
    if (JSON.stringify(p.siteLoggers || []) !== JSON.stringify(old.siteLoggers || [])) add("project", id, p.name, "siteLoggers", short(old.siteLoggers), short(p.siteLoggers), id);
    if (JSON.stringify(p.lich || null) !== JSON.stringify(old.lich || null)) add("project", id, p.name, "lich", short(old.lich), short(p.lich), id);
    if (JSON.stringify(p.members || []) !== JSON.stringify(old.members || [])) add("project", id, p.name, "members", short(old.members), short(p.members), id);
  }
  for (const [id, p] of curP) if (!incP.has(id)) add("project", id, p.name, "xóa", p.name, "", id);

  // công việc — các trường quan trọng
  const FIELDS = ["title", "status", "workdone", "startDate", "dueDate", "duration", "priority", "assignees", "primaryAssigneeId", "dependsOn", "approver", "completed", "description", "sectionId", "milestone", "kind", "defect"];
  const curT = new Map(arr(cur.tasks).map((x) => [x && x.id, x]));
  const incT = new Map(arr(inc.tasks).map((x) => [x && x.id, x]));
  for (const [id, tk] of incT) {
    const old = curT.get(id);
    if (!old) { add("task", id, tk.title, "tạo mới", "", tk.title, tk.projectId); continue; }
    for (const f of FIELDS) {
      const a = old[f], b = tk[f];
      if (JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b)) continue;
      add("task", id, tk.title, f, short(a), short(b), tk.projectId);
    }
    const oc = arr(old.comments).length, nc = arr(tk.comments).length;
    if (nc > oc) add("task", id, tk.title, "comment", "", String(nc - oc) + " bình luận mới", tk.projectId);
  }
  for (const [id, tk] of curT) if (!incT.has(id)) add("task", id, tk.title, "xóa (vào thùng rác)", tk.title, "", tk.projectId);

  // thùng rác: xóa vĩnh viễn
  const incTrash = new Set(arr(inc.trash).map((e) => e && e.id));
  const incIds = new Set([...incP.keys(), ...incT.keys()]);
  for (const e of arr(cur.trash)) {
    if (!e || !e.id || incTrash.has(e.id)) continue;
    if (!incIds.has(e.id)) add(e.kind === "task" ? "task" : "project", e.id, e.name, "xóa vĩnh viễn", e.name, "", e.projectId);
  }

  // báo cáo ngày
  const curR = new Map(arr(cur.dailyReports).map((r) => [r && r.id, r]));
  const incR = new Map(arr(inc.dailyReports).map((r) => [r && r.id, r]));
  for (const [id, r] of incR) {
    const old = curR.get(id);
    if (!old) { add("report", id, (r.memberName || "") + " " + (r.date || ""), "tạo mới", "", "", null); continue; }
    if (JSON.stringify(r.items || []) !== JSON.stringify(old.items || [])) add("report", id, (r.memberName || "") + " " + (r.date || ""), "items", short(old.items), short(r.items), null);
    if (arr(r.comments).length > arr(old.comments).length) add("report", id, (r.memberName || "") + " " + (r.date || ""), "comment", "", "bình luận mới", null);
  }
  for (const [id, r] of curR) if (!incR.has(id)) add("report", id, (r.memberName || "") + " " + (r.date || ""), "xóa", "", "", null);

  for (const e of out) if (!e.projectName && e.projectId) e.projectName = projName[e.projectId] || "";
  return out;
}
// so sánh dữ liệu tài chính (Q3: sửa đơn giá / khối lượng kỳ đã chốt trước đây không để lại vết)
function diffAuditFinance(me, inc, cur, ip, rev) {
  /* Q1/Q2/Q5: các khối mới cũng phải để lại vết ở cấp trường. */
  const now = Date.now();
  const out = [];
  const add = (entity, id, name, field, from, to, projectId) =>
    out.push({ ts: now, rev, actor: me.name || me.email, actorId: me.id, ip, entity, id, name, field, from, to, projectId });
  const arr = (x) => (Array.isArray(x) ? x : []);
  // hợp đồng
  for (const side of ["investorContracts", "subContracts"]) {
    const curC = new Map(arr(cur[side]).map((c) => [c && c.id, c]));
    const incC = new Map(arr(inc[side]).map((c) => [c && c.id, c]));
    for (const [id, c] of incC) {
      const old = curC.get(id);
      if (!old) { add("contract", id, c.code || "", "tạo mới", "", String(c.value || ""), c.projectId); continue; }
      if (Number(c.value || 0) !== Number(old.value || 0)) add("contract", id, c.code || "", "value", String(old.value || 0), String(c.value || 0), c.projectId);
      if (arr(c.billed).length !== arr(old.billed).length) add("contract", id, c.code || "", "billed", String(arr(old.billed).length), String(arr(c.billed).length), c.projectId);
      if (arr(c.paid).length !== arr(old.paid).length) add("contract", id, c.code || "", "paid", String(arr(old.paid).length), String(arr(c.paid).length), c.projectId);
    }
    for (const [id, c] of curC) if (!incC.has(id)) add("contract", id, c.code || "", "xóa", c.code || "", "", c.projectId);
  }
  // BOQ theo dự án: đơn giá, khối lượng hợp đồng, khối lượng từng kỳ
  const boqI = (inc.boq && typeof inc.boq === "object") ? inc.boq : {};
  const boqC = (cur.boq && typeof cur.boq === "object") ? cur.boq : {};
  for (const pid of new Set([...Object.keys(boqI), ...Object.keys(boqC)])) {
    const A = boqC[pid] || {}, B = boqI[pid] || {};
    const ia = new Map(arr(A.items).map((x) => [x && x.id, x])), ib = new Map(arr(B.items).map((x) => [x && x.id, x]));
    for (const [id, it] of ib) {
      const old = ia.get(id);
      if (!old) { add("boq", id, it.ten || "", "thêm hạng mục", "", it.ten || "", pid); continue; }
      if (Number(it.donGia || 0) !== Number(old.donGia || 0)) add("boq", id, it.ten || "", "donGia", String(old.donGia || 0), String(it.donGia || 0), pid);
      if (Number(it.khoiLuong || 0) !== Number(old.khoiLuong || 0)) add("boq", id, it.ten || "", "khoiLuong", String(old.khoiLuong || 0), String(it.khoiLuong || 0), pid);
    }
    for (const [id, it] of ia) if (!ib.has(id)) add("boq", id, it.ten || "", "xóa hạng mục", it.ten || "", "", pid);
    const ka = new Map(arr(A.kys).map((k) => [k && k.id, k])), kb = new Map(arr(B.kys).map((k) => [k && k.id, k]));
    for (const [id, k] of kb) {
      const old = ka.get(id);
      if (!old) { add("boq", id, "Kỳ " + k.soKy, "thêm kỳ nghiệm thu", "", k.denNgay || "", pid); continue; }
      const kl0 = old.kl || {}, kl1 = k.kl || {};
      for (const hid of new Set([...Object.keys(kl0), ...Object.keys(kl1)])) {
        if (Number(kl0[hid] || 0) === Number(kl1[hid] || 0)) continue;
        const ten = (ib.get(hid) || ia.get(hid) || {}).ten || hid;
        add("boq", hid, ten + " (kỳ " + k.soKy + ")", "khoiLuongKy", String(kl0[hid] || 0), String(kl1[hid] || 0), pid);
      }
      /* R4: khóa và mở khóa kỳ là hai thao tác nhạy cảm nhất của phần tài chính —
         chốt số nộp Chủ đầu tư, và mở ra để sửa lại. Phải có vết cả hai chiều. */
      if (!!old.khoa !== !!k.khoa) {
        add("boq", id, "Kỳ " + k.soKy, k.khoa ? "khóa kỳ" : "mở khóa kỳ",
            old.khoa ? "đã khóa" : "đang mở",
            k.khoa ? "đã khóa" : ("đang mở — lý do: " + String(k.moKhoaLyDo || "(không ghi)").slice(0, 200)), pid);
      }
    }
    for (const [id, k] of ka) if (!kb.has(id)) add("boq", id, "Kỳ " + k.soKy, "xóa kỳ nghiệm thu", "", "", pid);
  }
  return out;
}

/* A3: cache data.json trong RAM. Khóa cache = mtimeMs + size của chính tệp, nên nếu ai đó
   sửa tệp từ bên ngoài (khôi phục từ snapshot chẳng hạn) thì lần đọc sau vẫn thấy bản mới. */
let DATA_CACHE = null, DATA_KHOA = "", SHARED_OBJ_CACHE = null;
function loadData() {
  try {
    const st = fs.statSync(DATA);
    const khoa = st.mtimeMs + ":" + st.size;
    if (DATA_CACHE && khoa === DATA_KHOA) return DATA_CACHE;
    const d = JSON.parse(fs.readFileSync(DATA, "utf8"));
    DATA_CACHE = d; DATA_KHOA = khoa; SHARED_OBJ_CACHE = null;
    return d;
  } catch { return {}; }
}
/* Dọn dấu vết cơ chế giấy phép của các bản trước (phần mềm nay dùng tự do, không giới hạn).
   Chạy một lần khi khởi động, không đụng dữ liệu công việc. */
function donDauVetGiayPhep() {
  try { const c = loadConfig(); if (c && c.license) { delete c.license; saveConfigFile(c); CONFIG = c; } } catch {}
  try { const d = loadData(); if (d && d.__lic) { delete d.__lic; saveData(d); } } catch {}
  try {
    const accs = JSON.parse(fs.readFileSync(ACCOUNTS, "utf8"));
    if (Array.isArray(accs) && accs.some((a) => a && a.licTrial)) { for (const a of accs) delete a.licTrial; saveAccounts(accs); }
  } catch {}
}
function saveData(d) {
  writeJsonAtomic(DATA, JSON.stringify(d));
  DATA_CACHE = d; SHARED_OBJ_CACHE = null;                       // A3: cập nhật cache ngay, không phải đọc lại đĩa
  try { const st = fs.statSync(DATA); DATA_KHOA = st.mtimeMs + ":" + st.size; } catch { DATA_KHOA = ""; }
}
// ---- Trạng thái nhắc việc/sao lưu: TÁCH KHỎI data.json.
// (Trước đây scheduler load data.json -> await gửi email -> save lại bản CŨ, có thể đè mất
// thay đổi người dùng vừa lưu qua /api/kv trong lúc email đang gửi; đồng thời ghi data.json mỗi phút.)
const SCHED_STATE = path.join(DATA_DIR, "sched-state.json");
function loadSchedState() { try { const s = JSON.parse(fs.readFileSync(SCHED_STATE, "utf8")); return { remindersSent: s.remindersSent || {}, backupWeek: s.backupWeek || "", digestDay: s.digestDay || "" }; } catch { return { remindersSent: {}, backupWeek: "", digestDay: "" }; } }
function saveSchedState(s) { writeJsonAtomic(SCHED_STATE, JSON.stringify(s)); }
(function migrateSchedState() {
  if (fs.existsSync(SCHED_STATE)) return;
  try {
    const d = loadData();
    if (d.__reminders_sent || d.__backup_week) {
      saveSchedState({ remindersSent: d.__reminders_sent || {}, backupWeek: d.__backup_week || "" });
      delete d.__reminders_sent; delete d.__backup_week; saveData(d);
    }
  } catch {}
})();
function saveAccounts(a) { writeJsonAtomic(ACCOUNTS, JSON.stringify(a, null, 2)); }
const FINANCE = path.join(DATA_DIR, "finance.json");
function loadFinance() {
  try {
    const f = JSON.parse(fs.readFileSync(FINANCE, "utf8"));
    const obj = (x) => (x && typeof x === "object" && !Array.isArray(x)) ? x : {};
    return { investorContracts: f.investorContracts || [], subContracts: f.subContracts || [],
      boq: obj(f.boq),
      nganSach: obj(f.nganSach),   // Q2: ngân sách chi phí theo dự án
      chiPhi: obj(f.chiPhi),       // Q2: sổ chi phí thực tế theo dự án
      deNghi: obj(f.deNghi),       // Q5: đề nghị thanh toán theo dự án
      rev: Number(f.rev) || 0 };
  } catch { return { investorContracts: [], subContracts: [], boq: {}, nganSach: {}, chiPhi: {}, deNghi: {}, rev: 0 }; }
}
function saveFinance(f) { writeJsonAtomic(FINANCE, JSON.stringify(f)); }
// ---- Cache rev của khối dữ liệu chung (phục vụ /api/kv/rev, tránh parse cả file mỗi lần poll) ----
let SHARED_REV_CACHE = null;
function sharedRev() {
  if (SHARED_REV_CACHE == null) {
    try { SHARED_REV_CACHE = JSON.parse(loadData()[SHARED_KEY] || "{}").rev || 0; } catch { SHARED_REV_CACHE = 0; }
  }
  return SHARED_REV_CACHE;
}

/* ===================== PHÂN QUYỀN PHÍA MÁY CHỦ (giai đoạn 1) =====================
   Client giữ nguyên mô hình đồng bộ cả khối; máy chủ so sánh bản MỚI với bản HIỆN TẠI
   và CHẶN các thay đổi phá hoại vượt quyền. Nguyên tắc: chỉ chặn khi vi phạm rõ ràng
   (thêm mới/cập nhật thông thường luôn được phép để không chặn nhầm thao tác hợp lệ,
   ví dụ client tự sinh việc lặp lại hoặc tự dọn thùng rác quá 90 ngày). */
const TRASH_TTL_MS = 90 * 86400000; // khớp với auto-prune phía client
function validateSharedWrite(me, inc, curStr) {
  if (!me) return "Chưa đăng nhập.";
  if (me.role === "owner") return null; // Chủ sở hữu: toàn quyền
  let cur; try { cur = JSON.parse(curStr || "{}") || {}; } catch { cur = {}; }
  if (!inc || typeof inc !== "object") return "Dữ liệu không hợp lệ.";
  const arr = (x) => (Array.isArray(x) ? x : []);
  const idSet = (list) => new Set(arr(list).map((x) => x && x.id).filter(Boolean));
  const sameJson = (a, b) => { try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; } };

  // 1. Xóa dự án: chỉ Chủ sở hữu (client cũng chỉ cho owner xóa).
  const incProjIds = idSet(inc.projects);
  for (const pr of arr(cur.projects)) {
    if (pr && pr.id && !incProjIds.has(pr.id)) return "Chỉ Chủ sở hữu mới được xóa dự án.";
  }
  // 1b. Kế hoạch gốc (baseline) của dự án: chỉ Lãnh đạo (Chủ sở hữu đã bypass ở trên).
  const curProjById = new Map(arr(cur.projects).map((p) => [p && p.id, p]));
  for (const pr of arr(inc.projects)) {
    if (!pr || !pr.id) continue;
    const old = curProjById.get(pr.id);
    if (!sameJson(pr.baseline, old ? old.baseline : undefined) && !me.isLeader) return "Chỉ Lãnh đạo / Chủ sở hữu mới được lưu kế hoạch gốc.";
  }

  // 2. Thùng rác: không được sửa nội dung; chỉ được bỏ mục khi KHÔI PHỤC (dự án trở lại
  //    danh sách dự án, công việc trở lại danh sách việc) hoặc mục đã quá 90 ngày
  //    (client tự dọn). Xóa vĩnh viễn là quyền của Chủ sở hữu.
  const incTrash = new Map(arr(inc.trash).map((e) => [e && e.id, e]));
  const incTaskIds = idSet(inc.tasks);
  for (const e of arr(cur.trash)) {
    if (!e || !e.id) continue;
    const kept = incTrash.get(e.id);
    if (!kept) {
      const restored = incProjIds.has(e.id) || incTaskIds.has(e.id);
      const expired = (e.deletedAt || 0) < Date.now() - TRASH_TTL_MS;
      if (!restored && !expired) return "Chỉ Chủ sở hữu mới được xóa vĩnh viễn mục trong thùng rác.";
    } else if (!sameJson(kept, e)) {
      return "Không được sửa nội dung mục trong thùng rác.";
    }
  }

  // 3. Cột (sections): thành viên không có thao tác hợp lệ nào xóa cột
  //    (cột chỉ mất khi xóa dự án — việc của Chủ sở hữu).
  const incSecIds = idSet(inc.sections);
  for (const s of arr(cur.sections)) {
    if (s && s.id && !incSecIds.has(s.id)) return "Bạn không có quyền xóa cột.";
  }

  // 4. Xóa công việc: cần quyền giao việc (canAssign); mỗi việc bị xóa PHẢI có mặt
  //    trong thùng rác (chống xóa vĩnh viễn lách qua giao diện); chặn xóa hàng loạt.
  const incTasks = new Map(arr(inc.tasks).map((x) => [x && x.id, x]));
  const curTasks = new Map(arr(cur.tasks).map((x) => [x && x.id, x]));
  let removedTasks = 0;
  for (const id of curTasks.keys()) {
    if (!id || incTasks.has(id)) continue;
    removedTasks++;
    if (!incTrash.has(id)) return "Xóa công việc phải qua thùng rác — hãy tải lại trang (Ctrl+R) để cập nhật phiên bản mới.";
  }
  if (removedTasks > 0 && !me.canAssign) return "Bạn không có quyền xóa công việc.";
  if (removedTasks > 10) return "Không thể xóa nhiều công việc như vậy trong một thao tác. Hãy xóa từng việc.";

  // 5. Duyệt hoàn thành (chờ duyệt -> hoàn thành): phải đúng người có quyền duyệt.
  for (const [id, tk] of incTasks) {
    const old = id && curTasks.get(id);
    if (old && old.status === "review" && tk && tk.status === "done") {
      const okApprove = old.approver === "leader" ? !!me.isLeader : !!me.isTeamlead;
      if (!okApprove) return "Chỉ người có quyền duyệt (Teamlead / Lãnh đạo) mới được duyệt hoàn thành công việc.";
    }
  }

  // 5b. PHÂN QUYỀN SỬA NỘI DUNG (audit 17/08 F1): người KHÔNG có quyền giao việc
  // (không canAssign/teamlead/leader) chỉ được: cập nhật tiến độ việc CỦA MÌNH,
  // bình luận, và các thay đổi tự động của client (sinh việc lặp, promote todo->doing).
  // Sửa cấu trúc (tên, mô tả, hạn, phân công, dự án, cột...) cần quyền giao việc.
  const priv = !!me.canAssign || !!me.isTeamlead || !!me.isLeader;
  if (!priv) {
    // Dự án: cấm tạo mới / sửa mọi nội dung (baseline đã có luật 1b riêng)
    for (const pr of arr(inc.projects)) {
      if (!pr || !pr.id) continue;
      const old = curProjById.get(pr.id);
      if (!old) return "Bạn không có quyền tạo dự án.";
      if (!sameJson(pr, old)) return "Bạn không có quyền sửa dự án.";
    }
    // Cột: cấm tạo mới / sửa (xóa đã cấm ở luật 3)
    const curSecById = new Map(arr(cur.sections).map((s) => [s && s.id, s]));
    for (const sc of arr(inc.sections)) {
      if (!sc || !sc.id) continue;
      const old = curSecById.get(sc.id);
      if (!old) return "Bạn không có quyền thêm cột.";
      if (!sameJson(sc, old)) return "Bạn không có quyền sửa cột.";
    }
    const isMine = (e) => e && (e.author === me.name || e.author === me.email);
    // các trường người-được-giao được đổi trên việc của mình
    const ASSIGNEE_FIELDS = new Set(["workdone", "status", "completed", "completedAt", "approvedBy", "comments", "subtasks", "reminderSentKey"]);
    // các trường client tự động đổi trên MỌI việc
    const AUTO_FIELDS = new Set(["comments", "recurSpawned", "status"]);
    for (const [id, tk] of incTasks) {
      if (!id || !tk) continue;
      const old = curTasks.get(id);
      if (!old) {
        // tạo việc mới: chỉ chấp nhận việc do máy tự sinh từ việc lặp (recur) —
        // phải có việc gốc cùng tiêu đề + chu kỳ vừa được đánh dấu recurSpawned trong lần ghi này
        const spawned = tk.recur && tk.recur !== "none" && !tk.recurSpawned &&
          arr(cur.tasks).some((src) => src && src.recur === tk.recur && src.title === tk.title && src.recurSpawned !== true &&
            (incTasks.get(src.id) || {}).recurSpawned === true);
        if (!spawned) return "Bạn không có quyền tạo công việc.";
        continue;
      }
      if (sameJson(tk, old)) continue;
      const assignee = arr(old.assignees).includes(me.id);
      const keys = new Set([...Object.keys(old), ...Object.keys(tk)]);
      for (const k of keys) {
        if (sameJson(tk[k], old[k])) continue;
        const allowed = assignee ? (ASSIGNEE_FIELDS.has(k) || AUTO_FIELDS.has(k)) : AUTO_FIELDS.has(k);
        if (!allowed) return "Bạn không có quyền sửa nội dung công việc này (trường '" + k + "').";
      }
      // bình luận: chỉ THÊM vào cuối, và bình luận mới phải ghi đúng tên mình
      if (!sameJson(tk.comments, old.comments)) {
        const oc = arr(old.comments), nc = arr(tk.comments);
        if (nc.length < oc.length) return "Không được xóa bình luận.";
        for (let i = 0; i < oc.length; i++) if (!sameJson(nc[i], oc[i])) return "Không được sửa bình luận cũ.";
        for (let i = oc.length; i < nc.length; i++) if (!isMine(nc[i])) return "Bình luận mới phải ghi đúng tên người viết.";
      }
      // recurSpawned: chỉ được bật từ chưa-đánh-dấu -> true
      if (!sameJson(tk.recurSpawned, old.recurSpawned) && !(old.recurSpawned !== true && tk.recurSpawned === true)) return "Thay đổi không hợp lệ.";
      // trạng thái: người ngoài chỉ được promote todo->doing (client tự làm khi tới ngày bắt đầu);
      // người được giao không được tự nhảy thẳng sang 'hoàn thành' (đường done chỉ qua duyệt — luật 5)
      if (tk.status !== old.status) {
        if (!assignee && !(old.status === "todo" && tk.status === "doing")) return "Bạn không có quyền đổi trạng thái việc này.";
        if (tk.status === "done" && old.status !== "review") return "Việc phải qua bước duyệt trước khi hoàn thành.";
      }
      // subtasks: người được giao chỉ tick xong/chưa xong, không thêm/xóa/đổi tên
      if (assignee && !sameJson(tk.subtasks, old.subtasks)) {
        const os = arr(old.subtasks), ns = arr(tk.subtasks);
        if (ns.length !== os.length) return "Bạn không có quyền thêm/xóa việc con.";
        for (let i = 0; i < os.length; i++) {
          if (ns[i].id !== os[i].id || ns[i].title !== os[i].title) return "Bạn không có quyền sửa việc con.";
        }
      }
      // approvedBy: người được giao chỉ được xóa (khi mở lại việc), không tự điền
      if (assignee && !sameJson(tk.approvedBy, old.approvedBy) && tk.approvedBy) return "Không được tự điền người duyệt.";
    }
  }

  /* 7. BÁO CÁO NGÀY (audit 04/09 A5): trước đây không có luật nào — ai cũng sửa/xóa được
     báo cáo của người khác qua API. Nay: chỉ chủ báo cáo sửa nội dung của mình; người khác
     chỉ được THÊM bình luận ghi đúng tên mình. (Chủ sở hữu đã bỏ qua toàn bộ ở đầu hàm.) */
  {
    const stripComments = (x) => { const y = { ...x }; delete y.comments; return y; };
    const curRep = new Map(arr(cur.dailyReports).map((r) => [r && r.id, r]));
    const incRep = new Map(arr(inc.dailyReports).map((r) => [r && r.id, r]));
    for (const [id, r] of incRep) {
      if (!id || !r) continue;
      const old = curRep.get(id);
      if (!old) { if (r.memberId !== me.id) return "Chỉ được tạo báo cáo ngày của chính mình."; continue; }
      if (sameJson(r, old)) continue;
      if (old.memberId !== me.id && !sameJson(stripComments(r), stripComments(old))) return "Không được sửa nội dung báo cáo ngày của người khác.";
      const oc = arr(old.comments), nc = arr(r.comments);
      if (nc.length < oc.length) return "Không được xóa bình luận trong báo cáo ngày.";
      for (let i = 0; i < oc.length; i++) if (!sameJson(nc[i], oc[i])) return "Không được sửa bình luận cũ trong báo cáo ngày.";
      for (let i = oc.length; i < nc.length; i++) if (!nc[i] || nc[i].authorId !== me.id) return "Bình luận báo cáo phải ghi đúng tên người viết.";
    }
    for (const [id, r] of curRep) {
      if (id && !incRep.has(id) && r && r.memberId !== me.id) return "Không được xóa báo cáo ngày của người khác.";
    }
  }

  // 6. Lịch sử thay đổi: chỉ được THÊM mục mới (ghi đúng tên mình), gộp mục mới nhất
  //    của chính mình, hoặc cắt bớt mục cũ ở cuối (client giữ tối đa 500). Cấm sửa/xóa.
  const curH = arr(cur.history), incH = arr(inc.history);
  const isMine = (e) => e && (e.actor === me.name || e.actor === me.email);
  if (curH.length === 0) {
    for (const e of incH) if (!isMine(e)) return "Mục lịch sử mới phải ghi đúng tên người thao tác.";
  } else {
    const headId = curH[0] && curH[0].id;
    const j = incH.findIndex((e) => e && e.id === headId);
    const diag = (why, extra) => { try { slog("CHẨN ĐOÁN lịch sử (" + why + "): head=" + headId + " j=" + j + " cur=" + curH.length + " inc=" + incH.length + (extra ? " | " + extra : "")); } catch {} return "Không được sửa hoặc xóa lịch sử thay đổi."; };
    if (j === -1) return diag("mất mục đầu", "incHead=" + (incH[0] && incH[0].id));
    for (let i = 0; i < j; i++) if (!isMine(incH[i])) return "Mục lịch sử mới phải ghi đúng tên người thao tác.";
    const restLen = incH.length - j;
    if (restLen > curH.length) return diag("dài hơn bản gốc");
    // Chỉ được cắt bớt mục cũ khi lịch sử đã chạm trần 500 mục (đúng hành vi client);
    // còn lại, thiếu mục cũ = có người cố xóa lén lịch sử.
    if (restLen < curH.length && incH.length < 500) return diag("thiếu mục cũ");
    for (let k = 1; k < restLen; k++) {
      if (!sameJson(incH[j + k], curH[k])) return diag("lệch tại k=" + k, "inc=" + JSON.stringify(incH[j + k]).slice(0, 120) + " cur=" + JSON.stringify(curH[k]).slice(0, 120));
    }
    if (!sameJson(incH[j], curH[0]) && !isMine(incH[j])) return "Không được sửa lịch sử của người khác.";
  }
  return null;
}

/* Q7: xem được tài chính (Chủ sở hữu, hoặc được cấp canViewFinance). */
function canFinance(a) { return !!a && (a.role === "owner" || a.canViewFinance); }
/* Q7: SỬA được tài chính. Mặc định ai xem được thì sửa được (giữ hành vi cũ cho dữ liệu đã có);
   đặt canEditFinance = false cho tài khoản chỉ-xem (Kế toán đối chiếu, Lãnh đạo theo dõi). */
function canEditFinance(a) { return !!a && (a.role === "owner" || (a.canViewFinance && a.canEditFinance !== false)); }
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
// Content-Type khi TRẢ file luôn suy từ ĐUÔI TÊN file (không tin Content-Type do client khai lúc upload,
// tránh việc kẻ xấu upload "x.pdf" với Content-Type text/html để phục vụ trang HTML giả mạo cùng origin).
const DL_MIME = { ".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".heic": "image/heic", ".heif": "image/heif", ".bmp": "image/bmp" };
function downloadHeaders(name) {
  const ext = fileExt(name);
  const inline = INLINE_SAFE_EXT.has(ext);
  return {
    "Content-Type": inline ? (DL_MIME[ext] || "application/octet-stream") : "application/octet-stream",
    "Content-Disposition": (inline ? "inline" : "attachment") + "; filename*=UTF-8''" + encodeURIComponent(name),
  };
}
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
/* ---- SIẾT QUYỀN XEM FILE THEO DỰ ÁN (v3.8) ----
   Được xem file (biên bản, ảnh nhật ký thi công, tệp công việc) của một dự án khi:
   Chủ sở hữu / Lãnh đạo / Teamlead, người được chỉ định ghi nhật ký (siteLoggers),
   hoặc CÓ VIỆC ĐƯỢC GIAO trong dự án đó. Chủ sở hữu tắt được trong Cài đặt
   (features.fileByProject = false) để quay về chế độ mở như trước. */
function fileGateOn() { const c = loadConfig(); return !(c.features && c.features.fileByProject === false); }
/* A3: khối dữ liệu chung được parse một lần cho mỗi phiên bản data.json.
   Người gọi CHỈ ĐƯỢC ĐỌC đối tượng này (mọi đường ghi đều dựng đối tượng mới rồi saveData). */
function sharedState() {
  if (SHARED_OBJ_CACHE) return SHARED_OBJ_CACHE;
  try { SHARED_OBJ_CACHE = JSON.parse(loadData()[SHARED_KEY] || "{}"); } catch { SHARED_OBJ_CACHE = {}; }
  return SHARED_OBJ_CACHE;
}
function canViewProjectFiles(me, projectId, shared) {
  if (!me) return false;
  if (me.role === "owner" || me.isLeader) return true;
  const sh0 = shared || sharedState();
  const pr0 = (sh0.projects || []).find((x) => x.id === projectId);
  // A6: dự án đã khai thành viên -> chỉ thành viên (và Chủ sở hữu/Lãnh đạo) mới xem hồ sơ
  if (pr0 && Array.isArray(pr0.members) && pr0.members.length && !pr0.members.includes(me.id)) return false;
  if (me.isTeamlead) return true;
  if (!fileGateOn()) return true;
  const sh = sh0;
  const pr = pr0;
  if (pr && (pr.siteLoggers || []).includes(me.id)) return true;
  return (sh.tasks || []).some((x) => x.projectId === projectId && (x.assignees || []).includes(me.id));
}
function taskProjectId(tid, shared) { const sh = shared || sharedState(); const tk = (sh.tasks || []).find((x) => x.id === tid); return tk ? tk.projectId : null; }
// Tệp của công việc: theo dự án của công việc đó; công việc đã bị xóa -> chỉ quản lý xem được.
function canViewTaskFiles(me, tid, shared) {
  if (!me) return false;
  if (me.role === "owner" || me.isLeader || me.isTeamlead) return true;
  const prid = taskProjectId(tid, shared);
  return prid ? canViewProjectFiles(me, prid, shared) : false;
}

function canDeleteRecord(me, rec) {
  if (!me) return false;
  if (me.role === "owner" || me.isLeader) return true;
  if (!rec) return false;
  // Ưu tiên so theo ID người tạo; chỉ rơi về so theo tên/email với bản ghi cũ chưa có createdById
  // (so theo tên hiển thị có thể trùng giữa hai người khác nhau).
  if (rec.createdById) return rec.createdById === me.id;
  return rec.createdBy === me.name || rec.createdBy === me.email;
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

/* ---- Phiên đăng nhập ----
   Lưu BĂM của token vào data/sessions.json để phiên sống qua lần khởi động lại máy chủ
   (trước đây token chỉ nằm trong RAM: restart NAS là mọi điện thoại ngoài công trường
   bị đăng xuất giữa chừng). Tệp chỉ chứa băm — lộ tệp cũng không đăng nhập được. */
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 ngày không hoạt động thì hết hạn
const SESSIONS = path.join(DATA_DIR, "sessions.json");
const tokens = new Map(); // băm(token) -> { id, exp }
const hashTok = (t) => crypto.createHash("sha256").update(String(t)).digest("hex");
let sessionsDirty = false;
function loadSessions() {
  try {
    const arr = JSON.parse(fs.readFileSync(SESSIONS, "utf8"));
    const now = Date.now();
    for (const r of arr) if (r && r.h && r.id && r.exp > now) tokens.set(r.h, { id: r.id, exp: r.exp });
  } catch {}
}
function saveSessions() {
  if (!sessionsDirty) return;
  sessionsDirty = false;
  try { writeJsonAtomic(SESSIONS, JSON.stringify([...tokens.entries()].map(([h, r]) => ({ h, id: r.id, exp: r.exp })))); } catch {}
}
function newToken(id) {
  const tok = crypto.randomBytes(24).toString("hex");
  tokens.set(hashTok(tok), { id, exp: Date.now() + TOKEN_TTL_MS });
  if (tokens.size > 5000) { const arr = [...tokens.entries()].sort((a, b) => a[1].exp - b[1].exp); for (let i = 0; i < arr.length - 5000; i++) tokens.delete(arr[i][0]); }
  sessionsDirty = true; saveSessions();
  return tok;
}
function purgeTokens() { const now = Date.now(); for (const [t, r] of tokens) if (now > r.exp) { tokens.delete(t); sessionsDirty = true; } saveSessions(); }
function revokeTokens(accountId, exceptTok) {
  const keep = exceptTok ? hashTok(exceptTok) : null;
  let n = 0;
  for (const [t, r] of tokens) { if (r.id === accountId && t !== keep) { tokens.delete(t); n++; } }
  if (n) { sessionsDirty = true; saveSessions(); }
  return n;
}

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

function safe(a) { return { id: a.id, name: a.name, email: a.email, role: a.role === "owner" ? "owner" : "member", dept: a.dept || "", canAssign: !!a.canAssign, canViewHistory: !!a.canViewHistory, canViewFinance: !!a.canViewFinance, canEditFinance: a.role === "owner" ? true : a.canEditFinance !== false, canViewWorkload: !!a.canViewWorkload, canManageMembers: !!a.canManageMembers, isLeader: !!a.isLeader, isTeamlead: !!a.isTeamlead, noReport: !!a.noReport, position: a.position || "" }; }
function normAcc(a) {
  const role = a.role === "owner" ? "owner" : "member";
  let canAssign = a.canAssign;
  if (canAssign === undefined) canAssign = (a.role === "owner" || a.role === "manager"); // migrate old roles
  return { ...a, role, dept: a.dept || "", canAssign: role === "owner" ? true : !!canAssign,
    canViewHistory: role === "owner" ? true : !!a.canViewHistory,
    canViewFinance: role === "owner" ? true : !!a.canViewFinance,
    canEditFinance: role === "owner" ? true : a.canEditFinance !== false,
    canViewWorkload: role === "owner" ? true : !!a.canViewWorkload,
    canManageMembers: role === "owner" ? true : !!a.canManageMembers };
}
function loadAccounts() { try { return JSON.parse(fs.readFileSync(ACCOUNTS, "utf8")).map(normAcc); } catch { return []; } }
function authOf(req) {
  const h = req.headers["authorization"] || "";
  const tok = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!tok) return null;
  const key = hashTok(tok);
  const rec = tokens.get(key);
  if (!rec) return null;
  if (Date.now() > rec.exp) { tokens.delete(key); sessionsDirty = true; return null; }
  const moi = Date.now() + TOKEN_TTL_MS;
  if (moi - rec.exp > 3600 * 1000) sessionsDirty = true;   // chỉ ghi đĩa khi hạn đổi đáng kể
  rec.exp = moi;                                           // gia hạn khi còn hoạt động
  return loadAccounts().find((a) => a.id === rec.id) || null;
}
function readBody(req) {
  return new Promise((resolve) => {
    // GHÉP BUFFER rồi mới decode UTF-8 MỘT LẦN. Trước đây "b += chunk" decode từng
    // chunk riêng lẻ — chunk cắt giữa ký tự tiếng Việt (3 byte) làm VỠ dữ liệu với
    // body lớn (bug ẩn từ bản đầu, lộ ra khi đo tải: "Công việc" thành "Công vi❍c").
    const chunks = []; let len = 0, done = false;
    const settle = (v) => { if (!done) { done = true; resolve(v); } };
    req.on("data", (c) => { len += c.length; if (len > 8e6) { req.destroy(); settle({}); return; } chunks.push(c); });
    req.on("end", () => { try { settle(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch { settle({}); } });
    req.on("error", () => settle({}));
    req.on("close", () => settle({}));
  });
}
function json(res, code, obj, req) {
  const buf = Buffer.from(JSON.stringify(obj));
  if (code === 200 && req && acceptsGzip(req) && buf.length >= GZIP_MIN) {
    try {
      const gz = zlib.gzipSync(buf, { level: 6 });
      res.writeHead(code, { "Content-Type": "application/json", "Content-Encoding": "gzip", "Content-Length": gz.length, Vary: "Accept-Encoding" });
      return res.end(gz);
    } catch {}
  }
  res.writeHead(code, { "Content-Type": "application/json", "Content-Length": buf.length });
  res.end(buf);
}

/* ---- T4 (audit 3 vai trò): nén gzip ----
   app.js 1,1MB tải qua wifi/NAS ở xa khá chậm; gzip đưa xuống ~350KB.
   Chỉ nén khi trình duyệt khai báo hỗ trợ và nội dung đủ lớn để bõ công nén. */
const zlib = require("zlib");
const GZIP_MIN = 1024;
const GZIP_EXT = new Set([".html", ".js", ".css", ".json", ".svg", ".txt", ".map"]);
function acceptsGzip(req) { return /\bgzip\b/.test(String(req.headers["accept-encoding"] || "")); }
function sendMaybeGzip(req, res, buf, headers) {
  if (acceptsGzip(req) && buf.length >= GZIP_MIN) {
    try {
      const gz = zlib.gzipSync(buf, { level: 6 });
      res.writeHead(200, { ...headers, "Content-Encoding": "gzip", "Content-Length": gz.length, Vary: "Accept-Encoding" });
      return res.end(gz);
    } catch {}
  }
  res.writeHead(200, { ...headers, "Content-Length": buf.length });
  res.end(buf);
}

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

const requestHandler = async (req, res) => {
  // ---- HTTP security headers (áp cho mọi phản hồi) ----
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'");

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

  // Chặn sớm JSON body quá lớn bằng 413 có cấu trúc (endpoint upload tệp có giới hạn 40MB riêng)
  const isFileUpload = p === "/api/records/file" || p === "/api/sitelogs/photo" || p === "/api/taskfiles/upload";
  if (req.method === "POST" && needsAuth && !isFileUpload && Number(req.headers["content-length"] || 0) > 8e6) {
    return json(res, 413, { error: "too_large", message: "Dữ liệu gửi lên quá lớn (tối đa 8MB)." });
  }

  // ---- BIÊN BẢN ----
  if (p === "/api/records" && req.method === "GET") {
    const pid = u.searchParams.get("projectId") || "";
    const shView = sharedState(); const viewCache = {};
    const viewOK = (prid) => (prid in viewCache) ? viewCache[prid] : (viewCache[prid] = canViewProjectFiles(me, prid, shView));
    const xemRac = u.searchParams.get("trash") === "1";
    const list = loadRecords().filter((r) => (!pid || r.projectId === pid) && (xemRac ? !!r.deletedAt : !r.deletedAt) && viewOK(r.projectId))
      .map((r) => ({ id: r.id, projectId: r.projectId, date: r.date, type: r.type, number: r.number || "", note: r.note || "", checklist: r.checklist || null, createdBy: r.createdBy || "", createdById: r.createdById || "", createdAt: r.createdAt, updatedBy: r.updatedBy || "", updatedAt: r.updatedAt || 0,
        deletedAt: r.deletedAt || 0, deletedBy: r.deletedBy || "", deleteReason: r.deleteReason || "", files: (r.files || []).map((f, i) => ({ idx: i, name: f.name, size: f.size, mime: f.mime })) }))
      .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || 0) - (a.createdAt || 0));
    return json(res, 200, { records: list }, req);
  }
  if (p === "/api/records" && req.method === "POST") {
    if (!canRecords(me)) return json(res, 403, { error: "forbidden" });
    const b = await readBody(req);
    if (!b.projectId) return json(res, 400, { error: "missing", message: "Thiếu dự án." });
    if (!canRecordProject(me, b.projectId)) return json(res, 403, { error: "forbidden", message: "Bạn không được phân công cho dự án này." });
    const folder = sanitizeName(b.projectName || b.projectId);
    const rec = { id: uid(), projectId: String(b.projectId), projectName: String(b.projectName || ""), folder, date: String(b.date || "").slice(0, 10), type: String(b.type || ""), number: String(b.number || ""), note: String(b.note || ""), checklist: sachBangKiem(b.checklist), files: [], createdBy: me.name || me.email, createdById: me.id, createdAt: Date.now() };
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
    if (!canViewProjectFiles(me, rec.projectId)) { res.writeHead(403); res.end("Forbidden"); return; }
    const f = rec.files[idx];
    fs.readFile(path.join(UPLOADS, f.stored), (err, buf) => {
      if (err) { res.writeHead(404); res.end("Not found"); return; }
      res.writeHead(200, downloadHeaders(f.name));
      res.end(buf);
    });
    return;
  }
  /* H2: sửa biên bản đã tạo (đổi ghi chú, số hiệu, và nhất là điền tiếp bảng kiểm).
     Quyền: đúng người được xóa biên bản đó (người tạo hoặc quản lý). */
  if (p === "/api/records/update" && req.method === "POST") {
    if (!canRecords(me)) return json(res, 403, { error: "forbidden" });
    const b = await readBody(req);
    const recs = loadRecords(); const rec = recs.find((r) => r.id === b.id && !r.deletedAt);
    if (!rec) return json(res, 404, { error: "notfound" });
    if (!canDeleteRecord(me, rec)) return json(res, 403, { error: "forbidden", message: "Chỉ người lập hoặc quản lý mới sửa được." });
    if (b.date !== undefined) rec.date = String(b.date).slice(0, 10);
    if (b.type !== undefined) rec.type = String(b.type);
    if (b.number !== undefined) rec.number = String(b.number);
    if (b.note !== undefined) rec.note = String(b.note);
    if (b.checklist !== undefined) rec.checklist = sachBangKiem(b.checklist);
    rec.updatedBy = me.name || me.email; rec.updatedAt = Date.now();
    saveRecords(recs);
    slog("Sửa biên bản " + rec.id + " bởi " + me.email);
    return json(res, 200, { ok: true });
  }
  /* R6: khôi phục biên bản từ thùng rác (trong 90 ngày). Quyền: đúng người được xóa nó. */
  if (p === "/api/records/restore" && req.method === "POST") {
    if (!canRecords(me)) return json(res, 403, { error: "forbidden" });
    const { id } = await readBody(req);
    const recs = loadRecords(); const rec = recs.find((r) => r.id === id);
    if (!rec || !rec.deletedAt) return json(res, 404, { error: "notfound", message: "Không thấy hồ sơ này trong thùng rác." });
    if (!canDeleteRecord(me, rec)) return json(res, 403, { error: "forbidden", message: "Chỉ người lập hoặc quản lý mới khôi phục được." });
    delete rec.deletedAt; delete rec.deletedBy; delete rec.deleteReason;
    rec.updatedBy = me.name || me.email; rec.updatedAt = Date.now();
    saveRecords(recs);
    slog("Khôi phục biên bản " + id + " từ thùng rác bởi " + me.email);
    return json(res, 200, { ok: true });
  }
  if (p === "/api/records/delete" && req.method === "POST") {
    if (!canRecords(me)) return json(res, 403, { error: "forbidden" });
    const b0 = await readBody(req);
    const id = b0.id;
    const recs = loadRecords(); const rec = recs.find((r) => r.id === id);
    if (rec && !canDeleteRecord(me, rec)) return json(res, 403, { error: "forbidden", message: "Chỉ người tạo hoặc quản lý mới xóa được." });
    if (!rec) return json(res, 200, { ok: true });
    if (b0.purge) {   // H5: xóa hẳn kèm tệp — chỉ Chủ sở hữu
      if (me.role !== "owner") return json(res, 403, { error: "forbidden", message: "Chỉ Chủ sở hữu mới xóa vĩnh viễn hồ sơ." });
      for (const f of (rec.files || [])) { try { fs.unlinkSync(path.join(UPLOADS, f.stored)); } catch {} }
      saveRecords(recs.filter((r) => r.id !== id));
      slog("XÓA VĨNH VIỄN biên bản " + id + " bởi " + me.email);
      return json(res, 200, { ok: true, purged: true });
    }
    rec.deletedAt = Date.now(); rec.deletedBy = me.name || me.email; rec.deleteReason = String(b0.reason || "").slice(0, 300);
    saveRecords(recs);
    slog("Chuyển biên bản " + id + " vào thùng rác bởi " + me.email + (rec.deleteReason ? " — lý do: " + rec.deleteReason : ""));
    return json(res, 200, { ok: true, trashed: true });
  }

  // ---- TỆP ĐÍNH KÈM CÔNG VIỆC ----
  if (p === "/api/taskfiles" && req.method === "GET") {
    const tid = u.searchParams.get("taskId") || "";
    if (!canViewTaskFiles(me, tid)) return json(res, 200, { files: [] });
    const arr = (loadTaskFiles()[tid] || []).map((f, i) => ({ idx: i, name: f.name, size: f.size, mime: f.mime, by: f.by || "" }));
    return json(res, 200, { files: arr }, req);
  }
  if (p === "/api/taskfiles/upload" && req.method === "POST") {
    if (!me) return json(res, 403, { error: "forbidden" });
    const tid = u.searchParams.get("taskId") || "";
    const origName = u.searchParams.get("filename") || "file";
    const mime = req.headers["content-type"] || "application/octet-stream";
    if (!tid) return json(res, 400, { error: "missing" });
    if (!taskExists(tid)) return json(res, 404, { error: "no_task", message: "Công việc không tồn tại." });
    if (!canViewTaskFiles(me, tid)) return json(res, 403, { error: "forbidden", message: "Bạn không thuộc dự án này." });
    if (UPLOAD_BLOCK_EXT.has(fileExt(origName))) return json(res, 400, { error: "bad_type", message: "Loại tệp này không được phép tải lên (nguy cơ bảo mật)." });
    let buf; try { buf = await readRawBody(req, 40 * 1024 * 1024); } catch { return json(res, 413, { error: "too_large", message: "Tệp quá lớn (tối đa 40MB)." }); }
    const dir = path.join(TASKUPLOADS, sanitizeName(tid));
    try { fs.mkdirSync(dir, { recursive: true }); } catch {}
    const base = sanitizeName(String(origName).replace(/\.[^.]+$/, "")) || "file";
    const fname = uniqueName(dir, base, extOf(origName, mime));
    try { fs.writeFileSync(path.join(dir, fname), buf); } catch { return json(res, 500, { error: "write_failed" }); }
    const store = loadTaskFiles(); store[tid] = store[tid] || []; store[tid].push({ name: fname, stored: path.join(sanitizeName(tid), fname), size: buf.length, mime, by: me.name || me.email, byId: me.id, ts: Date.now() }); saveTaskFiles(store);
    slog("Đính kèm tệp công việc " + tid + " bởi " + me.email);
    return json(res, 200, { ok: true });
  }
  if (p === "/api/taskfiles/file" && req.method === "GET") {
    const tid = u.searchParams.get("taskId") || "";
    const idx = parseInt(u.searchParams.get("idx") || "-1", 10);
    if (!canViewTaskFiles(me, tid)) return json(res, 403, { error: "forbidden" });
    const f = (loadTaskFiles()[tid] || [])[idx];
    if (!f) return json(res, 404, { error: "not_found" });
    let buf; try { buf = fs.readFileSync(path.join(TASKUPLOADS, f.stored)); } catch { return json(res, 404, { error: "not_found" }); }
    res.writeHead(200, downloadHeaders(f.name));
    return res.end(buf);
  }
  if (p === "/api/taskfiles/delete" && req.method === "POST") {
    if (!me) return json(res, 403, { error: "forbidden" });
    const tid = u.searchParams.get("taskId") || "";
    const idx = parseInt(u.searchParams.get("idx") || "-1", 10);
    const store = loadTaskFiles(); const arr = store[tid] || []; const f = arr[idx];
    if (!f) return json(res, 404, { error: "not_found" });
    const isUploader = f.byId ? f.byId === me.id : (f.by === me.name || f.by === me.email);
    if (!(me.role === "owner" || me.isLeader || isUploader)) return json(res, 403, { error: "forbidden", message: "Chỉ người tải lên hoặc quản lý mới xóa được." });
    try { fs.unlinkSync(path.join(TASKUPLOADS, f.stored)); } catch {}
    arr.splice(idx, 1); store[tid] = arr; saveTaskFiles(store);
    return json(res, 200, { ok: true });
  }

  // ---- NHẬT KÝ THI CÔNG ----
  if (p === "/api/sitelogs" && req.method === "GET") {
    const pid = u.searchParams.get("projectId") || "";
    const shView = sharedState(); const viewCache = {};
    const viewOK = (prid) => (prid in viewCache) ? viewCache[prid] : (viewCache[prid] = canViewProjectFiles(me, prid, shView));
    const xemRac = u.searchParams.get("trash") === "1";
    const list = loadSiteLogs().filter((r) => (!pid || r.projectId === pid) && (xemRac ? !!r.deletedAt : !r.deletedAt) && viewOK(r.projectId))
      .map((r) => ({ id: r.id, projectId: r.projectId, date: r.date, weatherAM: r.weatherAM || "", weatherPM: r.weatherPM || "", manpower: r.manpower || "", work: r.work || "", equipment: r.equipment || "", issues: r.issues || "", nextPlan: r.nextPlan || "",
        thoiTiet: r.thoiTiet || null, nhanLuc: r.nhanLuc || null, thietBi: r.thietBi || null, khoiLuong: r.khoiLuong || null, suCo: r.suCo || null, ykienGiamSat: r.ykienGiamSat || "",
        trangThai: r.trangThai || "nhap", duyetBoi: r.duyetBoi || "", duyetLuc: r.duyetLuc || 0,
        createdBy: r.createdBy || "", createdById: r.createdById || "", createdAt: r.createdAt, updatedBy: r.updatedBy || "", updatedAt: r.updatedAt || 0,
        deletedAt: r.deletedAt || 0, deletedBy: r.deletedBy || "", photos: (r.photos || []).map((f, i) => ({ idx: i, name: f.name, size: f.size, mime: f.mime })) }))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    return json(res, 200, { logs: list }, req);
  }
  if (p === "/api/sitelogs" && req.method === "POST") {
    if (!canRecords(me)) return json(res, 403, { error: "forbidden" });
    const b = await readBody(req);
    if (!b.projectId || !b.date) return json(res, 400, { error: "missing", message: "Thiếu dự án hoặc ngày." });
    if (!canRecordProject(me, b.projectId)) return json(res, 403, { error: "forbidden", message: "Bạn không được phân công cho dự án này." });
    const logs = loadSiteLogs();
    let rec = b.id ? logs.find((r) => r.id === b.id) : null;
    if (!rec) {
      // Ngày này đã có nhật ký của người khác -> KHÔNG đè (trước đây gộp theo project+date và
      // ghi đè nội dung nhưng vẫn giữ tên người lập cũ). Trả 409 để client mở đúng bản đang có.
      const sameDay = logs.find((r) => r.projectId === b.projectId && r.date === b.date && !r.deletedAt);
      if (sameDay) {
        return json(res, 409, { error: "log_exists", logId: sameDay.id,
          message: "Ngày " + b.date + " đã có nhật ký do " + (sameDay.createdBy || "người khác") + " lập. Hãy mở nhật ký đó để bổ sung." });
      }
    }
    const TT = ["nhap", "danop", "daduyet"];
    const noiDung = {
      weatherAM: b.weatherAM || "", weatherPM: b.weatherPM || "",
      manpower: b.manpower || "", work: b.work || "", equipment: b.equipment || "",
      issues: b.issues || "", nextPlan: b.nextPlan || "",
      thoiTiet: sachThoiTiet(b.thoiTiet), nhanLuc: sachNhanLuc(b.nhanLuc), thietBi: sachThietBi(b.thietBi),
      khoiLuong: sachKhoiLuong(b.khoiLuong), suCo: sachSuCo(b.suCo),
      ykienGiamSat: String(b.ykienGiamSat || "").slice(0, 2000),
    };
    if (rec) {
      /* P5: nhật ký đã được Chỉ huy trưởng duyệt thì khóa — chỉ Chủ sở hữu/Lãnh đạo mở lại được. */
      if (rec.trangThai === "daduyet" && !(me.role === "owner" || me.isLeader)) {
        return json(res, 409, { error: "locked", message: "Nhật ký ngày " + rec.date + " đã được duyệt nên không sửa được. Đề nghị Chỉ huy trưởng mở khóa." });
      }
      Object.assign(rec, noiDung, { updatedAt: Date.now(), updatedBy: me.name || me.email });
      if (TT.includes(b.trangThai)) {
        // người lập chỉ được chuyển Nháp <-> Đã nộp; "Đã duyệt" phải đi qua endpoint duyệt
        if (b.trangThai === "daduyet" && rec.trangThai !== "daduyet") { /* bỏ qua, không tự duyệt */ }
        else { rec.trangThai = b.trangThai; if (b.trangThai !== "daduyet") { rec.duyetBoi = ""; rec.duyetLuc = 0; } }
      }
    } else {
      rec = Object.assign({ id: uid(), projectId: String(b.projectId), projectName: String(b.projectName || ""),
        folder: sanitizeName(b.projectName || b.projectId), date: String(b.date).slice(0, 10) }, noiDung,
        { trangThai: b.trangThai === "danop" ? "danop" : "nhap", duyetBoi: "", duyetLuc: 0,
          photos: [], createdBy: me.name || me.email, createdById: me.id, createdAt: Date.now() });
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
    /* R7: nhật ký đã được Chỉ huy trưởng duyệt thì khóa cả phần ẢNH — trước đây vẫn thêm
       ảnh vào bản đã duyệt được, tức là hồ sơ đã ký vẫn đổi nội dung được. */
    if (rec.trangThai === "daduyet" && !(me.role === "owner" || me.isLeader)) {
      return json(res, 409, { error: "locked", message: "Nhật ký ngày " + rec.date + " đã được duyệt — không thêm ảnh được. Đề nghị Chỉ huy trưởng mở khóa." });
    }
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
    if (!canViewProjectFiles(me, rec.projectId)) { res.writeHead(403); res.end("Forbidden"); return; }
    const f = rec.photos[idx];
    fs.readFile(path.join(NHATKY, f.stored), (err, buf) => {
      if (err) { res.writeHead(404); res.end("Not found"); return; }
      res.writeHead(200, downloadHeaders(f.name));
      res.end(buf);
    });
    return;
  }
  /* P5: Chỉ huy trưởng (Chủ sở hữu / Lãnh đạo / Teamlead bộ phận Site) duyệt nhật ký.
     duyet=false để mở khóa cho người lập sửa tiếp. */
  if (p === "/api/sitelogs/approve" && req.method === "POST") {
    const b = await readBody(req);
    const laCHT = me.role === "owner" || me.isLeader || (me.isTeamlead && (me.dept || "") === "Site");
    if (!laCHT) return json(res, 403, { error: "forbidden", message: "Chỉ Chỉ huy trưởng / Lãnh đạo mới duyệt được nhật ký." });
    const logs = loadSiteLogs(); const rec = logs.find((r) => r.id === b.id && !r.deletedAt);
    if (!rec) return json(res, 404, { error: "notfound" });
    if (!canRecordProject(me, rec.projectId)) return json(res, 403, { error: "forbidden" });
    if (b.duyet === false) { rec.trangThai = "danop"; rec.duyetBoi = ""; rec.duyetLuc = 0; }
    else {
      /* R7: phải qua bước "Đã nộp" mới duyệt được — trước đây duyệt thẳng bản còn Nháp,
         nên con dấu "Chỉ huy trưởng đã duyệt" có thể đóng lên một bản chưa ai nộp. */
      if (rec.trangThai !== "danop") {
        return json(res, 409, { error: "not_submitted",
          message: "Nhật ký ngày " + rec.date + " chưa được nộp (đang ở trạng thái " + (rec.trangThai === "daduyet" ? "đã duyệt" : "nháp") + "). Người lập phải bấm \"Nộp nhật ký\" trước." });
      }
      rec.trangThai = "daduyet"; rec.duyetBoi = me.name || me.email; rec.duyetLuc = Date.now();
    }
    saveSiteLogs(logs);
    slog((b.duyet === false ? "Mở khóa" : "Duyệt") + " nhật ký thi công " + rec.date + " dự án " + rec.folder + " bởi " + me.email);
    return json(res, 200, { ok: true, trangThai: rec.trangThai, duyetBoi: rec.duyetBoi, duyetLuc: rec.duyetLuc });
  }
  /* R6: khôi phục nhật ký thi công từ thùng rác. Nếu ngày đó đã có nhật ký khác thì báo rõ
     (luật B3 — mỗi dự án một nhật ký cho mỗi ngày). */
  if (p === "/api/sitelogs/restore" && req.method === "POST") {
    if (!canRecords(me)) return json(res, 403, { error: "forbidden" });
    const { id } = await readBody(req);
    const logs = loadSiteLogs(); const rec = logs.find((r) => r.id === id);
    if (!rec || !rec.deletedAt) return json(res, 404, { error: "notfound", message: "Không thấy nhật ký này trong thùng rác." });
    if (!canDeleteRecord(me, rec)) return json(res, 403, { error: "forbidden", message: "Chỉ người lập hoặc quản lý mới khôi phục được." });
    const dungNgay = logs.find((r) => r !== rec && r.projectId === rec.projectId && r.date === rec.date && !r.deletedAt);
    if (dungNgay) return json(res, 409, { error: "log_exists", logId: dungNgay.id,
      message: "Ngày " + rec.date + " nay đã có nhật ký khác (do " + (dungNgay.createdBy || "người khác") + " lập). Xóa hoặc gộp bản đó trước khi khôi phục." });
    delete rec.deletedAt; delete rec.deletedBy; delete rec.deleteReason;
    rec.updatedBy = me.name || me.email; rec.updatedAt = Date.now();
    saveSiteLogs(logs);
    slog("Khôi phục nhật ký thi công " + id + " từ thùng rác bởi " + me.email);
    return json(res, 200, { ok: true });
  }
  if (p === "/api/sitelogs/delete" && req.method === "POST") {
    if (!canRecords(me)) return json(res, 403, { error: "forbidden" });
    const b1 = await readBody(req);
    const id = b1.id;
    const logs = loadSiteLogs(); const rec = logs.find((r) => r.id === id);
    if (rec && !canDeleteRecord(me, rec)) return json(res, 403, { error: "forbidden", message: "Chỉ người tạo hoặc quản lý mới xóa được." });
    /* R7: bản đã duyệt là hồ sơ đã ký — người lập không tự xóa được nữa, chỉ Lãnh đạo. */
    if (rec && rec.trangThai === "daduyet" && !(me.role === "owner" || me.isLeader)) {
      return json(res, 409, { error: "locked", message: "Nhật ký ngày " + rec.date + " đã được duyệt — chỉ Chủ sở hữu hoặc Lãnh đạo mới xóa được." });
    }
    if (!rec) return json(res, 200, { ok: true });
    if (b1.purge) {
      if (me.role !== "owner") return json(res, 403, { error: "forbidden", message: "Chỉ Chủ sở hữu mới xóa vĩnh viễn hồ sơ." });
      for (const f of (rec.photos || [])) { try { fs.unlinkSync(path.join(NHATKY, f.stored)); } catch {} }
      saveSiteLogs(logs.filter((r) => r.id !== id));
      slog("XÓA VĨNH VIỄN nhật ký thi công " + id + " bởi " + me.email);
      return json(res, 200, { ok: true, purged: true });
    }
    rec.deletedAt = Date.now(); rec.deletedBy = me.name || me.email; rec.deleteReason = String(b1.reason || "").slice(0, 300);
    saveSiteLogs(logs);
    slog("Chuyển nhật ký thi công " + id + " vào thùng rác bởi " + me.email + (rec.deleteReason ? " — lý do: " + rec.deleteReason : ""));
    return json(res, 200, { ok: true, trashed: true });
  }

  // Nhật ký kiểm toán do máy chủ ghi — chỉ Chủ sở hữu / Lãnh đạo được xem
  if (p === "/api/audit" && req.method === "GET") {
    if (!(me.role === "owner" || me.isLeader)) return json(res, 403, { error: "forbidden" });
    const limit = Math.min(1000, Math.max(1, parseInt(u.searchParams.get("limit") || "200", 10)));
    const pid = u.searchParams.get("projectId") || "";
    return json(res, 200, { entries: auditRead(limit, pid) }, req);
  }
  if (p === "/api/me" && req.method === "GET") return json(res, 200, { user: safe(me) });
  if (p === "/api/logout" && req.method === "POST") {
    const h = req.headers["authorization"] || ""; tokens.delete(hashTok(h.startsWith("Bearer ") ? h.slice(7) : "")); sessionsDirty = true; saveSessions(); return json(res, 200, { ok: true });
  }
  if (p === "/api/accounts" && req.method === "GET") return json(res, 200, { accounts: loadAccounts().map(safe) }, req);

  if (p === "/api/accounts" && req.method === "POST") {
    if (!canManageMembers(me)) return json(res, 403, { error: "forbidden" });
    const { name, email, password, role, dept, canAssign, canViewHistory, canViewFinance, canEditFinance: cef, canViewWorkload, canManageMembers: setMng, isLeader, isTeamlead, noReport, position } = await readBody(req);
    if (!name || !email || !password) return json(res, 400, { error: "missing", message: "Thiếu tên, email hoặc mật khẩu." });
    const pwErr = passwordProblem(password);
    if (pwErr) return json(res, 400, { error: "weak_password", message: pwErr });
    if (role === "owner" && me.role !== "owner") return json(res, 403, { error: "owner_only" });
    const accts = loadAccounts();
    const em = String(email).trim().toLowerCase();
    if (accts.some((a) => a.email === em)) return json(res, 409, { error: "email_exists", message: "Email này đã được dùng." });
    const salt = makeSalt();
    const r = role === "owner" ? "owner" : "member";
    const acc = { id: uid(), name: String(name).trim(), email: em, role: r, dept: dept || "", canAssign: r === "owner" || !!canAssign, canViewHistory: r === "owner" || !!canViewHistory, canViewFinance: r === "owner" || !!canViewFinance, canEditFinance: r === "owner" ? true : cef !== false, canViewWorkload: r === "owner" || !!canViewWorkload, canManageMembers: r === "owner" || (me.role === "owner" && !!setMng), isLeader: me.role === "owner" && !!isLeader, isTeamlead: me.role === "owner" && !!isTeamlead, noReport: me.role === "owner" && !!noReport, position: me.role === "owner" ? String(position || "") : "", salt, hash: hashPw(password, salt) };
    accts.push(acc); saveAccounts(accts);
    slog("Tạo tài khoản " + acc.email + " (vai trò " + acc.role + ") bởi " + me.email);
    return json(res, 200, { account: safe(acc) });
  }
  if (p === "/api/accounts/update" && req.method === "POST") {
    if (!canManageMembers(me)) return json(res, 403, { error: "forbidden" });
    const { id, name, role, dept, canAssign, canViewHistory, canViewFinance, canEditFinance: cef2, canViewWorkload, canManageMembers: setMng, isLeader, isTeamlead, noReport, position, password } = await readBody(req);
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
    if (cef2 != null) a.canEditFinance = !!cef2;
    if (canViewWorkload != null) a.canViewWorkload = !!canViewWorkload;
    if (setMng != null && me.role === "owner") a.canManageMembers = !!setMng;
    if (isLeader != null && me.role === "owner") a.isLeader = !!isLeader;
    if (isTeamlead != null && me.role === "owner") a.isTeamlead = !!isTeamlead;
    if (noReport != null && me.role === "owner") a.noReport = !!noReport;
    if (position != null && me.role === "owner") a.position = String(position || "");
    if (a.role === "owner") { a.canAssign = true; a.canViewHistory = true; a.canViewFinance = true; a.canEditFinance = true; a.canViewWorkload = true; a.canManageMembers = true; }
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
    const thay = phamViDuAn(me, sharedState());          // R8: chỉ trả tài chính của dự án được vào
    return json(res, 200, locTaiChinh(loadFinance(), thay), req);
  }
  if (p === "/api/finance" && req.method === "POST") {
    if (!canEditFinance(me)) return json(res, 403, { error: "forbidden", message: "Bạn chỉ có quyền XEM số liệu tài chính." });
    let body = await readBody(req);
    // CAS chống ghi đè đồng thời (audit 17/08 F2): client gửi expectedRev = rev nó đã tải;
    // lệch với rev hiện tại -> 409 kèm rev mới, KHÔNG ghi đè thầm lặng bản của người khác.
    const curF = loadFinance();
    if (body.expectedRev !== undefined && Number(body.expectedRev) !== curF.rev) {
      return json(res, 409, { error: "conflict", rev: curF.rev });
    }
    const newRev = curF.rev + 1;
    /* Q3: kỳ nghiệm thu ĐÃ KHÓA thì không ai sửa được số liệu của kỳ đó, kể cả người có quyền
       sửa tài chính — trừ khi Chủ sở hữu mở khóa (kèm lý do, ghi vào nhật ký). */
    const viPham = kiemTraKyKhoa(curF, body, me);
    if (viPham) {
      slog("TỪ CHỐI sửa kỳ nghiệm thu đã khóa bởi " + me.email + ": " + viPham);
      return json(res, 403, { error: "period_locked", message: viPham });
    }
    /* R8: người bị giới hạn phạm vi chỉ gửi lên phần họ thấy -> ghép lên bản đầy đủ, nếu
       không thì mỗi lần họ lưu là xóa sạch tài chính của dự án họ không nhìn thấy. */
    try { const thay = phamViDuAn(me, sharedState()); if (thay) body = ghepTaiChinh(curF, body, thay); }
    catch (e) {
      slog("LỖI ghép phạm vi tài chính cho " + me.email + ": " + (e && e.message));
      return json(res, 500, { error: "scope_merge_failed", message: "Máy chủ không ghép được số liệu tài chính theo phạm vi dự án. Vui lòng báo quản trị." });
    }
    try { chupDonGiaKhiKhoa(curF, body); } catch {}     // R3: chốt đơn giá của kỳ vừa khóa
    const obj = (x) => (x && typeof x === "object" && !Array.isArray(x)) ? x : {};
    saveFinance({
      investorContracts: Array.isArray(body.investorContracts) ? body.investorContracts : [],
      subContracts: Array.isArray(body.subContracts) ? body.subContracts : [],
      boq: obj(body.boq),
      nganSach: obj(body.nganSach),        // Q2: ngân sách chi phí theo nhóm, theo dự án
      chiPhi: obj(body.chiPhi),            // Q2: sổ chi phí thực tế theo dự án
      deNghi: obj(body.deNghi),            // Q5: đề nghị thanh toán sinh từ kỳ nghiệm thu
      rev: newRev, updatedAt: Date.now() });
    /* R2: chỉ ghi vết SAU khi đã lưu thật. Trước đây ghi trước cả bước kiểm tra khóa kỳ nên
       một thay đổi bị từ chối (403) vẫn để lại dòng "đã sửa 20 → 99" trong audit.jsonl. */
    try { auditWrite(diffAuditFinance(me, body, curF, clientIp(req), newRev)); } catch {}
    slog("Lưu tài chính rev " + newRev + " bởi " + me.email);
    return json(res, 200, { ok: true, rev: newRev });
  }

  // ---- data KV (token required) ----
  // Kiểm tra rev nhẹ: client poll 4 giây chỉ cần so rev, không phải tải cả khối dữ liệu.
  if (p === "/api/kv/rev" && req.method === "GET") return json(res, 200, { rev: sharedRev() });
  // Chỉ cho phép các key hợp lệ: chặn việc đọc/ghi key tùy ý trong data.json
  // (vd __reminders_sent, hoặc nhồi key lạ làm phình file dữ liệu).
  const KV_READ_KEYS = new Set([SHARED_KEY, "pm_shared_v2"]);
  if (p === "/api/kv" && req.method === "GET") {
    const key = u.searchParams.get("key");
    if (!KV_READ_KEYS.has(key)) return json(res, 403, { error: "bad_key" });
    const d = loadData();
    let val = key in d ? d[key] : null;
    if (key === SHARED_KEY && val) {                       // A6: chỉ trả các dự án người này được vào
      try {
        const st = JSON.parse(val);
        const thay = phamViDuAn(me, st);
        if (thay) val = JSON.stringify(locTheoPhamVi(st, thay));
      } catch {}
    }
    return json(res, 200, { value: val }, req); // khối lớn nhất — gzip giúp nhiều nhất
  }
  if (p === "/api/kv" && req.method === "POST") {
    const { key, value } = await readBody(req);
    if (key !== SHARED_KEY) return json(res, 403, { error: "bad_key" });
    if (typeof value !== "string") return json(res, 400, { error: "bad_value" });
    let incoming;
    try { incoming = JSON.parse(value); } catch { return json(res, 400, { error: "bad_value", message: "Dữ liệu không phải JSON hợp lệ." }); }
    const d = loadData();
    {
      let curRev = null;
      const inRev = incoming && incoming.rev;
      try { curRev = JSON.parse(d[key] || "{}").rev; } catch {}
      if (typeof inRev === "number" && typeof curRev === "number" && inRev <= curRev) {
        return json(res, 409, { error: "conflict", rev: curRev });
      }
    }
    /* A6: người bị giới hạn phạm vi chỉ gửi lên phần họ thấy -> ghép lên bản đầy đủ trước khi
       thẩm định và lưu, nếu không mỗi lần họ lưu là xóa sạch dự án họ không thấy. */
    try {
      const cur = JSON.parse(d[key] || "{}");
      const thay = phamViDuAn(me, cur);
      if (thay) incoming = ghepTheoPhamVi(cur, incoming, thay);
    } catch (e) {
      /* Ghép hỏng mà vẫn lưu thì sẽ XÓA MẤT dữ liệu của dự án người này không nhìn thấy.
         Thà từ chối và để lại dấu vết còn hơn im lặng làm hỏng dữ liệu. */
      slog("LỖI ghép phạm vi dự án cho " + me.email + ": " + (e && e.message));
      return json(res, 500, { error: "scope_merge_failed", message: "Máy chủ không ghép được dữ liệu theo phạm vi dự án. Vui lòng báo quản trị (xem security.log)." });
    }
    // PHÂN QUYỀN PHÍA MÁY CHỦ (giai đoạn 1): thẩm định phần thay đổi, chặn hành vi phá hoại.
    const problem = validateSharedWrite(me, incoming, d[key] || "");
    if (problem) {
      slog("TỪ CHỐI ghi dữ liệu chung bởi " + me.email + ": " + problem);
      return json(res, 403, { error: "forbidden_change", message: problem });
    }
    if (JSON.stringify(incoming).length > 5 * 1024 * 1024) slog("CẢNH BÁO: khối dữ liệu chung đã " + Math.round(value.length / 1048576) + "MB — cân nhắc dọn lịch sử/thùng rác (trần cứng 8MB).");
    const prevStr = d[key] || "";
    d[key] = JSON.stringify(incoming); saveData(d);   // A6: lưu bản ĐÃ GHÉP, không phải bản client gửi
    SHARED_REV_CACHE = (incoming && typeof incoming.rev === "number") ? incoming.rev : null;
    try { auditWrite(diffAudit(me, incoming, prevStr, clientIp(req), SHARED_REV_CACHE)); } catch {}
    try { notifyChanges(me, incoming, prevStr); } catch {}
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
    const headers = { "Content-Type": MIME[ex2] || "application/octet-stream", ...nc };
    if (GZIP_EXT.has(ex2)) return sendMaybeGzip(req, res, buf, headers);
    res.writeHead(200, headers);
    res.end(buf);
  });
};

/* ===================== HTTPS (tùy chọn, v3.9) =====================
   Đặt chứng chỉ vào thư mục data/tls là máy chủ TỰ chạy HTTPS, không cần cấu hình:
   - cert.pem + key.pem  (tạo bằng openssl trên Mac/Linux), hoặc
   - server.pfx          (tạo bằng "Tạo chứng chỉ HTTPS (Windows).bat" — không cần cài gì).
   Mật khẩu pfx mặc định "tramduan" (khớp file .bat), ghi đè bằng biến TLS_PFX_PASS.
   Không có chứng chỉ -> chạy HTTP như trước, không đổi gì. */
const TLS_DIR = path.join(DATA_DIR, "tls");
function loadTLS() {
  try {
    const cert = path.join(TLS_DIR, "cert.pem"), key = path.join(TLS_DIR, "key.pem");
    if (fs.existsSync(cert) && fs.existsSync(key)) return { label: "cert.pem + key.pem", options: { cert: fs.readFileSync(cert), key: fs.readFileSync(key) } };
  } catch {}
  try {
    const pfx = path.join(TLS_DIR, "server.pfx");
    if (fs.existsSync(pfx)) return { label: "server.pfx", options: { pfx: fs.readFileSync(pfx), passphrase: process.env.TLS_PFX_PASS || "tramduan" } };
  } catch {}
  return null;
}
const TLS = loadTLS();
const PROTO = TLS ? "https" : "http";
function safeHandler(req, res) {
  Promise.resolve()
    .then(() => requestHandler(req, res))
    .catch((err) => {
      try { slog("LỖI xử lý yêu cầu " + req.method + " " + req.url + ": " + (err && err.stack || err)); } catch {}
      try {
        if (!res.headersSent) json(res, 500, { error: "server_error", message: "Máy chủ gặp lỗi khi xử lý yêu cầu này." });
        else res.end();
      } catch {}
    });
}
const server = TLS ? require("https").createServer(TLS.options, safeHandler) : http.createServer(safeHandler);

/* ---- T5 (audit 3 vai trò): KHÔNG CHẾT ÂM THẦM ----
   Lỗi không bắt được trước đây làm tiến trình thoát mà không để lại dấu vết; bản chạy nội bộ
   không có ai khởi động lại nên người dùng chỉ thấy "trang không mở được". Nay ghi rõ vào
   security.log rồi thoát mã 1 để dịch vụ/NSSM/Docker khởi động lại. */
process.on("uncaughtException", (err) => {
  try { slog("LỖI NGHIÊM TRỌNG (uncaughtException): " + (err && err.stack || err)); } catch {}
  console.error("  [X] May chu gap loi nghiem trong va se thoat. Xem data/security.log de biet chi tiet.");
  setTimeout(() => process.exit(1), 100);
});
process.on("unhandledRejection", (reason) => {
  try { slog("CẢNH BÁO (unhandledRejection): " + (reason && reason.stack || reason)); } catch {}
});
process.on("SIGTERM", () => { try { slog("Máy chủ nhận tín hiệu dừng (SIGTERM)."); } catch {} server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 3000); });

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
  const st = loadSchedState();
  const sent = st.remindersSent;
  let dirty = false;
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
      if (emails.length === 0) { sent[sig] = now; dirty = true; continue; }
      due.push({ tk, emails, primary: nameById[tk.primaryAssigneeId] || "", proj: projById[tk.projectId] || "", sig });
    }
  }
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
    dirty = true;
  }
  // dọn các mốc đã gửi quá 90 ngày để file trạng thái không phình vô hạn
  const cutoff = now - 90 * 86400000;
  for (const k of Object.keys(sent)) if (typeof sent[k] === "number" && sent[k] < cutoff) { delete sent[k]; dirty = true; }
  if (dirty) saveSchedState(st);
}

/* ===================== EMAIL SỰ KIỆN (giao việc / trả về) =====================
   Sau mỗi lần lưu dữ liệu chung, so bản mới với bản cũ:
   - Ai vừa ĐƯỢC GIAO việc (thêm vào assignees) -> email cho người đó.
   - Việc vừa bị TRẢ VỀ (trường lastReturn đổi mốc thời gian) -> email người làm kèm lý do.
   Không chặn phản hồi API (gửi nền); tắt bằng features.notifications = false. */
function notifyChanges(actor, inc, curStr) {
  if (CONFIG.features && CONFIG.features.notifications === false) return;
  let cur; try { cur = JSON.parse(curStr || "{}") || {}; } catch { cur = {}; }
  const arr = (x) => (Array.isArray(x) ? x : []);
  const curTasks = new Map(arr(cur.tasks).map((x) => [x && x.id, x]));
  const accounts = loadAccounts();
  const emailById = Object.fromEntries(accounts.map((a) => [a.id, a.email]));
  const projName = Object.fromEntries(arr(inc.projects).map((p) => [p.id, p.name]));
  const transport = buildTransport(); const from = smtpFrom();
  const link = CONFIG.appUrl ? "\n\nMở phần mềm: " + CONFIG.appUrl : "";
  const send = (to, subject, text) => {
    if (!to) return;
    if (transport) transport.sendMail({ from, to, subject, text: text + link + "\n\n(Email tự động từ Trạm Dự Án)" }).then(() => console.log("[mail] đã gửi: " + subject + " -> " + to)).catch((e) => console.log("[mail] LỖI gửi \"" + subject + "\":", e.message));
    else console.log("[mail][DRY-RUN — chưa cấu hình SMTP] " + subject + " -> " + to);
  };
  for (const tk of arr(inc.tasks)) {
    if (!tk || !tk.id) continue;
    const old = curTasks.get(tk.id);
    const oldAss = new Set(old ? arr(old.assignees) : []);
    for (const uid2 of arr(tk.assignees)) {
      if (oldAss.has(uid2) || uid2 === actor.id) continue;
      send(emailById[uid2], "[Giao việc] " + (tk.title || "Công việc"),
        "Bạn vừa được giao việc:\n\n• Công việc: " + (tk.title || "(chưa đặt tên)") + "\n• Dự án: " + (projName[tk.projectId] || "") + (tk.dueDate ? "\n• Hạn chót: " + tk.dueDate : "") + "\n• Người giao: " + (actor.name || actor.email));
    }
    const newRet = tk.lastReturn && tk.lastReturn.ts;
    if (newRet && newRet !== (old && old.lastReturn && old.lastReturn.ts)) {
      for (const uid2 of arr(tk.assignees)) {
        if (uid2 === actor.id) continue;
        send(emailById[uid2], "[Trả về] " + (tk.title || "Công việc"),
          "Việc của bạn bị TRẢ VỀ để làm lại:\n\n• Công việc: " + (tk.title || "(chưa đặt tên)") + "\n• Dự án: " + (projName[tk.projectId] || "") + "\n• Lý do: " + (tk.lastReturn.reason || "") + "\n• Người trả về: " + (tk.lastReturn.by || actor.name || ""));
      }
    }
  }
}

/* ===================== BẢN TIN QUÁ HẠN MỖI SÁNG =====================
   Gửi cho Chủ sở hữu + Lãnh đạo danh sách việc quá hạn, mỗi ngày một lần
   (sau digestHour trong config, mặc định 7 giờ sáng). */
async function runOverdueDigest() {
  CONFIG = loadConfig();
  if (CONFIG.features && CONFIG.features.notifications === false) return;
  const now = new Date();
  const hour = typeof CONFIG.digestHour === "number" ? CONFIG.digestHour : 7;
  if (now.getHours() < hour) return;
  const day = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  const st = loadSchedState();
  if (st.digestDay === day) return;
  const sh = sharedState();
  const overdue = (sh.tasks || []).filter((x) => x && !x.completed && x.dueDate && x.dueDate < day);
  st.digestDay = day; saveSchedState(st); // đánh dấu trước, tránh gửi lặp nếu lỗi giữa chừng
  if (!overdue.length) return;
  const accounts = loadAccounts();
  const mgrs = accounts.filter((a) => a.role === "owner" || a.isLeader).map((a) => a.email).filter(Boolean);
  if (!mgrs.length) return;
  const nameById = Object.fromEntries(accounts.map((a) => [a.id, a.name]));
  const projById = Object.fromEntries((sh.projects || []).map((p) => [p.id, p.name]));
  const lines = overdue.sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || "")).slice(0, 50).map((x) => {
    const days = Math.max(1, Math.round((Date.parse(day) - Date.parse(x.dueDate)) / 86400000));
    const who = (x.assignees || []).map((id) => nameById[id]).filter(Boolean).join(", ");
    return "• " + (x.title || "(chưa đặt tên)") + " — " + (projById[x.projectId] || "") + " — quá hạn " + days + " ngày (hạn " + x.dueDate + ")" + (who ? " — " + who : "");
  });
  const text = "Việc QUÁ HẠN tính đến sáng " + day + " (" + overdue.length + " việc):\n\n" + lines.join("\n")
    + (overdue.length > 50 ? "\n… và " + (overdue.length - 50) + " việc nữa" : "")
    + (CONFIG.appUrl ? "\n\nMở phần mềm: " + CONFIG.appUrl : "") + "\n\n(Email tự động từ Trạm Dự Án)";
  const transport = buildTransport(); const from = smtpFrom();
  if (transport) {
    try { await transport.sendMail({ from, to: mgrs.join(","), subject: "[Quá hạn] " + overdue.length + " việc — " + day, text }); console.log("[digest] đã gửi bản tin quá hạn -> " + mgrs.join(", ")); }
    catch (e) { console.log("[digest] LỖI gửi:", e.message); }
  } else console.log("[digest][DRY-RUN — chưa cấu hình SMTP] " + overdue.length + " việc quá hạn -> " + mgrs.join(", "));
}

/* ===================== SNAPSHOT CỤC BỘ HẰNG NGÀY =====================
   Email sao lưu chỉ gửi thứ Bảy; snapshot này chép các file dữ liệu JSON vào
   data/snapshots/YYYY-MM-DD/ mỗi ngày một lần (giữ 14 ngày gần nhất) — lỡ tay
   xóa nhầm giữa tuần thì lấy lại được ngay, không cần chờ hồ sơ email.
   (Tệp đính kèm/ảnh trong uploads, nhatky-thi-cong vẫn cần Hyper Backup của NAS.) */
const SNAPSHOT_DIR = path.join(DATA_DIR, "snapshots");
const SNAPSHOT_KEEP = 14;
/* H5: hồ sơ chất lượng vào thùng rác 90 ngày rồi mới bị dọn hẳn (kèm tệp/ảnh). */
const RAC_NGAY = 90;
function donThungRacHoSo() {
  const han = Date.now() - RAC_NGAY * 24 * 60 * 60 * 1000;
  let n1 = 0, n2 = 0;
  try {
    const recs = loadRecords();
    const giu = recs.filter((r) => {
      if (!r.deletedAt || r.deletedAt > han) return true;
      for (const f of (r.files || [])) { try { fs.unlinkSync(path.join(UPLOADS, f.stored)); } catch {} }
      n1++; return false;
    });
    if (n1) saveRecords(giu);
  } catch {}
  try {
    const logs = loadSiteLogs();
    const giu = logs.filter((r) => {
      if (!r.deletedAt || r.deletedAt > han) return true;
      for (const f of (r.photos || [])) { try { fs.unlinkSync(path.join(NHATKY, f.stored)); } catch {} }
      n2++; return false;
    });
    if (n2) saveSiteLogs(giu);
  } catch {}
  if (n1 || n2) console.log("[thùng rác] đã dọn hẳn " + n1 + " biên bản, " + n2 + " nhật ký quá " + RAC_NGAY + " ngày.");
}

function runSnapshotCheck() {
  try { donThungRacHoSo(); } catch {}
  const day = new Date();
  const stamp = day.getFullYear() + "-" + String(day.getMonth() + 1).padStart(2, "0") + "-" + String(day.getDate()).padStart(2, "0");
  const dir = path.join(SNAPSHOT_DIR, stamp);
  if (fs.existsSync(dir)) return; // hôm nay đã chụp
  try { fs.mkdirSync(dir, { recursive: true }); } catch { return; }
  let n = 0;
  for (const [fn, fp] of [["data.json", DATA], ["accounts.json", ACCOUNTS], ["finance.json", FINANCE], ["records.json", RECORDS], ["sitelogs.json", SITELOGS], ["taskfiles.json", TASKFILES], ["config.json", CONFIG_PATH], ["audit.jsonl", AUDIT]]) {
    try { if (fs.existsSync(fp)) { fs.copyFileSync(fp, path.join(dir, fn)); n++; } } catch {}
  }
  console.log("[snapshot] đã chụp " + n + " file dữ liệu -> " + dir);
  // dọn các snapshot cũ, giữ SNAPSHOT_KEEP bản gần nhất
  try {
    const dirs = fs.readdirSync(SNAPSHOT_DIR).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
    for (const old of dirs.slice(0, Math.max(0, dirs.length - SNAPSHOT_KEEP))) {
      try { fs.rmSync(path.join(SNAPSHOT_DIR, old), { recursive: true, force: true }); console.log("[snapshot] đã dọn bản cũ " + old); } catch {}
    }
  } catch {}
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
  const st = loadSchedState();
  const wk = isoWeek(now);
  if (st.backupWeek === wk) return;               // đã gửi trong tuần này
  const transport = buildTransport();
  const from = smtpFrom();
  const attachments = [];
  for (const [fn, fp] of [["data.json", DATA], ["finance.json", FINANCE], ["records.json", RECORDS], ["sitelogs.json", SITELOGS], ["taskfiles.json", TASKFILES]]) {
    try { if (fs.existsSync(fp)) attachments.push({ filename: fn, content: fs.readFileSync(fp) }); } catch {}
  }
  // config.json: gửi bản ĐÃ CHE mật khẩu SMTP (không bao giờ gửi mật khẩu thô qua email)
  try {
    const cfgCopy = loadConfig();
    if (cfgCopy.smtp && cfgCopy.smtp.pass) cfgCopy.smtp.pass = "";
    attachments.push({ filename: "config.json", content: Buffer.from(JSON.stringify(cfgCopy, null, 2)) });
  } catch {}
  const dateStr = now.toISOString().slice(0, 10);
  if (transport) {
    try {
      await transport.sendMail({ from, to: b.email, subject: "[Sao lưu] Trạm Dự Án — " + dateStr,
        text: "Bản sao lưu tự động hằng tuần của Trạm Dự Án (ngày " + dateStr + ").\n\nĐính kèm: data.json (công việc/dự án), finance.json (chi phí), records.json (biên bản), sitelogs.json (nhật ký thi công), config.json (cấu hình — mật khẩu SMTP đã được xóa khỏi bản gửi kèm).\nLƯU Ý: accounts.json (mật khẩu đã băm) và các tệp/ảnh đính kèm (thư mục uploads, nhatky-thi-cong) KHÔNG gửi qua email vì lý do bảo mật/dung lượng — hãy sao lưu toàn bộ thư mục data bằng Hyper Backup của NAS.\nĐể phục hồi: đặt các file này vào thư mục data rồi khởi động lại (điền lại mật khẩu SMTP trong Cài đặt hoặc file .env).",
        attachments });
      console.log("[backup] đã gửi sao lưu -> " + b.email);
      st.backupWeek = wk; saveSchedState(st);
    } catch (e) { console.log("[backup] LỖI gửi:", e.message); }
  } else {
    console.log("[backup][DRY-RUN — chưa cấu hình SMTP] sẽ gửi sao lưu -> " + b.email);
    st.backupWeek = wk; saveSchedState(st);
  }
}

server.on("error", (e) => {
  if (e && e.code === "EADDRINUSE") {
    console.log("\n  ✖ Cổng " + PORT + " đang bị một phần mềm khác trên máy này sử dụng.");
    console.log("    → Tắt phần mềm kia, HOẶC mở file data\\.env thêm dòng  PORT=3001  rồi chạy lại.\n");
    process.exit(1);
  }
  throw e;
});
server.listen(PORT, "0.0.0.0", () => {
  let lan = "localhost";
  const ifaces = os.networkInterfaces();
  for (const name in ifaces) for (const ni of ifaces[name]) if (ni.family === "IPv4" && !ni.internal) lan = ni.address;
  console.log("\n  ===========================================================");
  console.log("   TRẠM DỰ ÁN đang chạy / Project Hub is running");
  console.log("  ===========================================================\n");
  console.log("   • Máy này (This computer):  " + PROTO + "://localhost:" + PORT);
  console.log("   • Mạng nội bộ (LAN/NAS):    " + PROTO + "://" + lan + ":" + PORT + "\n");
  if (TLS) console.log("   HTTPS: ĐANG BẬT (" + TLS.label + " trong data/tls). Trình duyệt cảnh báo chứng chỉ tự ký là bình thường — bấm Nâng cao > Tiếp tục.");
  else console.log("   HTTPS: chưa bật — mật khẩu/dữ liệu đi trong mạng nội bộ KHÔNG mã hóa. Xem \"BẢO MẬT - Bật HTTPS (nội bộ).txt\".");
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
  console.log("   Bảo mật: khóa đăng nhập sau " + MAX_FAILS + " lần sai, phiên hết hạn sau " + Math.round(TOKEN_TTL_MS / 86400000) + " ngày không hoạt động.");
  try { donDauVetGiayPhep(); } catch {}
  loadSessions();
  if (tokens.size) console.log("   Phiên đăng nhập: khôi phục " + tokens.size + " phiên (không phải đăng nhập lại sau khi khởi động lại).");
  console.log("   Dữ liệu: " + DATA + "\n   Tài khoản: " + ACCOUNTS + "\n   Nhật ký bảo mật: " + path.join(DATA_DIR, "security.log") + "\n");
  console.log("   Tác giả: Khuong Doan · https://khuongdoan.com/");
  console.log("   Nhấn Ctrl+C để dừng.\n");
  const sec = Math.max(20, (loadConfig().reminderCheckSeconds || 60));
  runReminderCheck().catch(() => {});
  setInterval(() => runReminderCheck().catch(() => {}), sec * 1000);
  runBackupCheck().catch(() => {});
  setInterval(() => runBackupCheck().catch(() => {}), 3600 * 1000);
  try { runSnapshotCheck(); } catch {}
  setInterval(() => { try { runSnapshotCheck(); } catch {} }, 3600 * 1000);
  runOverdueDigest().catch(() => {});
  setInterval(() => runOverdueDigest().catch(() => {}), 30 * 60 * 1000);
  setInterval(purgeTokens, 10 * 60 * 1000);
  setInterval(saveSessions, 5 * 60 * 1000);   // ghi hạn phiên đã gia hạn xuống đĩa định kỳ
});
