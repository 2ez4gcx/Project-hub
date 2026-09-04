/* Test gói QS (audit 04/09): Q7 quyền xem/sửa tài chính · Q3 khóa kỳ nghiệm thu ·
   Q1 phát sinh VO · Q2 ngân sách + chi phí thực tế · Q5 đề nghị thanh toán.
   Chạy SAU test-authz.mjs.  Cách dùng: node tests/test-chi-phi-qs.mjs [BASE_URL] */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(path.join(HERE, "..", "Chạy nội bộ", "ProjectManager.jsx"), "utf8");

const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const api = (path2, opts = {}, tok) => fetch(B + path2, { ...opts, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}), ...(opts.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (email) => (await api("/api/login", { method: "POST", body: JSON.stringify({ email, password: "matkhau123" }) })).body.token;

const OWNER = await login("boss@test.vn");
const fin = async (tok) => (await api("/api/finance", {}, tok)).body;

/* Bộ test này kiểm QUYỀN tài chính, không kiểm phạm vi dự án — mở lại mọi dự án cho cả công
   ty để không phụ thuộc vào những gì bộ test chạy trước để lại (xem A6/R8a). */
{
  const st = JSON.parse((await api("/api/kv?key=pm_shared_v3", {}, OWNER)).body.value);
  if ((st.projects || []).some((p) => Array.isArray(p.members) && p.members.length)) {
    await api("/api/kv", { method: "POST", body: JSON.stringify({ key: "pm_shared_v3",
      value: JSON.stringify({ ...st, rev: st.rev + 1, projects: st.projects.map((p) => ({ ...p, members: [] })) }) }) }, OWNER);
  }
}
const luuFin = async (tok, patch) => { const cur = await fin(tok); return api("/api/finance", { method: "POST", body: JSON.stringify({ ...cur, ...patch, expectedRev: cur.rev }) }, tok); };

// ── Q7: tạo một tài khoản KẾ TOÁN CHỈ XEM ──
let r = await api("/api/accounts", { method: "POST", body: JSON.stringify({
  name: "Ke Toan Chi Xem", email: "ketoan@test.vn", password: "matkhau123", role: "member",
  dept: "Finance", canViewFinance: true, canEditFinance: false }) }, OWNER);
ok("tạo tài khoản kế toán chỉ-xem", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 70));
const KT = await login("ketoan@test.vn");
ok("kế toán XEM được số liệu tài chính", (await api("/api/finance", {}, KT)).status === 200);
r = await api("/api/finance", { method: "POST", body: JSON.stringify({ investorContracts: [], subContracts: [], boq: {} }) }, KT);
ok("kế toán chỉ-xem KHÔNG ghi được", r.status === 403, "status " + r.status);

// ── Q1: dòng phát sinh VO ──
const boq = { P1: { items: [
  { id: "g1", stt: "1", ten: "Bê tông móng", donVi: "m3", khoiLuong: 100, donGia: 1500000, taskIds: [] },
  { id: "v1", stt: "", ten: "Bổ sung chống thấm", donVi: "m2", khoiLuong: 50, donGia: 400000, taskIds: [], voSo: "VO-01", voTrangThai: "dexuat" },
], kys: [{ id: "k1", soKy: 1, denNgay: "2026-09-30", kl: { g1: 40 } }] } };
r = await luuFin(OWNER, { boq });
ok("lưu BOQ có dòng phát sinh", r.status === 200, r.status);
let f = await fin(OWNER);
ok("dòng VO lưu đủ số hiệu + trạng thái",
   f.boq.P1.items[1].voSo === "VO-01" && f.boq.P1.items[1].voTrangThai === "dexuat");

// ── Q2: ngân sách + sổ chi phí thực tế ──
r = await luuFin(OWNER, {
  nganSach: { P1: { vattu: 80000000, nhancong: 40000000, may: 10000000 } },
  chiPhi: { P1: [
    { id: "c1", ngay: "2026-09-10", nhom: "vattu", moTa: "Xi măng 200 bao", soTien: 24000000, chungTu: "HD-0012", ncc: "VLXD Minh Long" },
    { id: "c2", ngay: "2026-09-12", nhom: "nhancong", moTa: "Tổ cốp pha đợt 1", soTien: 15000000, chungTu: "PC-03", ncc: "Tổ Ba Đức" },
  ] } });
ok("lưu ngân sách + sổ chi phí thực tế", r.status === 200, r.status);
f = await fin(OWNER);
ok("ngân sách đọc lại đúng", f.nganSach.P1.vattu === 80000000, JSON.stringify(f.nganSach));
ok("sổ chi phí đọc lại đủ 2 dòng", (f.chiPhi.P1 || []).length === 2);
const tongChi = (f.chiPhi.P1 || []).reduce((a, x) => a + x.soTien, 0);
ok("cộng được tổng chi phí thực tế", tongChi === 39000000, String(tongChi));

// ── Q5: đề nghị thanh toán ──
r = await luuFin(OWNER, { deNghi: { P1: { k1: { soHieu: "DN-01", ngay: "2026-10-01", tlGiuLai: 5, tlKhauTru: 10, tlVAT: 8 } } } });
ok("lưu đề nghị thanh toán của kỳ 1", r.status === 200, r.status);
f = await fin(OWNER);
ok("đề nghị đọc lại đúng tỷ lệ", f.deNghi.P1.k1.tlGiuLai === 5 && f.deNghi.P1.k1.tlVAT === 8, JSON.stringify(f.deNghi));

/* công thức tinhDeNghi lấy thẳng từ mã nguồn đang chạy */
const than = (() => {
  const i = SRC.indexOf("function tinhDeNghi(");
  const j = SRC.indexOf("\n}", i);
  return SRC.slice(i, j + 2);
})();
const tinhDeNghi = eval("(" + than.replace("function tinhDeNghi", "function") + ")");
const kq = tinhDeNghi({ giaTriKy: 60000000, tlGiuLai: 5, tlKhauTru: 10, tlVAT: 8 });
ok("giữ lại 5% = 3.000.000", kq.giuLai === 3000000, String(kq.giuLai));
ok("khấu trừ tạm ứng 10% = 6.000.000", kq.khauTru === 6000000, String(kq.khauTru));
ok("cộng trước thuế = 51.000.000", kq.truocVAT === 51000000, String(kq.truocVAT));
ok("VAT 8% tính SAU khấu trừ = 4.080.000", kq.vat === 4080000, String(kq.vat));
ok("số tiền đề nghị = 55.080.000", kq.tong === 55080000, String(kq.tong));
const kq0 = tinhDeNghi({ giaTriKy: 0, tlGiuLai: 5, tlKhauTru: 10, tlVAT: 8 });
ok("kỳ giá trị 0 -> đề nghị 0 (không âm, không NaN)", kq0.tong === 0);

// ── Q3: khóa kỳ nghiệm thu ──
f = await fin(OWNER);
r = await luuFin(OWNER, { boq: { P1: { ...f.boq.P1, kys: [{ ...f.boq.P1.kys[0], khoa: true }] } } });
ok("khóa kỳ nghiệm thu 1", r.status === 200, r.status);
f = await fin(OWNER);
ok("cờ khóa được lưu", f.boq.P1.kys[0].khoa === true);

// người có quyền sửa nhưng KHÔNG phải chủ sở hữu -> không sửa được kỳ đã khóa
r = await api("/api/accounts", { method: "POST", body: JSON.stringify({
  name: "QS Vien", email: "qs2@test.vn", password: "matkhau123", role: "member",
  dept: "Finance", canViewFinance: true, canEditFinance: true }) }, OWNER);
const QS = await login("qs2@test.vn");
f = await fin(QS);
r = await api("/api/finance", { method: "POST", body: JSON.stringify({
  ...f, boq: { P1: { ...f.boq.P1, kys: [{ ...f.boq.P1.kys[0], kl: { g1: 90 } }] } }, expectedRev: f.rev }) }, QS);
ok("QS KHÔNG sửa được khối lượng của kỳ đã khóa", r.status === 403 && r.body.error === "period_locked",
   r.status + " " + JSON.stringify(r.body).slice(0, 70));
f = await fin(OWNER);
ok("khối lượng kỳ đã khóa không bị đổi", f.boq.P1.kys[0].kl.g1 === 40, JSON.stringify(f.boq.P1.kys[0].kl));

r = await api("/api/finance", { method: "POST", body: JSON.stringify({
  ...f, boq: { P1: { ...f.boq.P1, kys: [] } }, expectedRev: f.rev }) }, QS);
ok("QS KHÔNG xóa được kỳ đã khóa", r.status === 403, "status " + r.status);

// Chủ sở hữu mở khóa rồi sửa
f = await fin(OWNER);
r = await luuFin(OWNER, { boq: { P1: { ...f.boq.P1, kys: [{ ...f.boq.P1.kys[0], khoa: false, moKhoaLyDo: "CĐT trả lại yêu cầu tính lại" }] } } });
ok("Chủ sở hữu mở khóa được kỳ", r.status === 200, r.status);
f = await fin(OWNER);
r = await luuFin(OWNER, { boq: { P1: { ...f.boq.P1, kys: [{ ...f.boq.P1.kys[0], kl: { g1: 90 } }] } } });
ok("mở khóa xong sửa được khối lượng", r.status === 200, r.status);
f = await fin(OWNER);
ok("khối lượng mới đã ghi", f.boq.P1.kys[0].kl.g1 === 90, String(f.boq.P1.kys[0].kl.g1));

// ── nhật ký kiểm toán vẫn ghi mọi thay đổi số liệu ──
const au = (await api("/api/audit?limit=400", {}, OWNER)).body.entries || [];
ok("nhật ký kiểm toán ghi thay đổi khối lượng kỳ",
   au.some((e) => e.entity === "boq" && e.field === "khoiLuongKy"),
   JSON.stringify(au.filter((e) => e.entity === "boq").map((e) => e.field).slice(0, 6)));

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
