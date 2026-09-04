/* Test Bảng kiểm nghiệm thu nội bộ (H2) và Thùng rác hồ sơ 90 ngày (H5).
   Chạy SAU test-authz.mjs.  Cách dùng: node tests/test-nghiem-thu.mjs [BASE_URL] */
const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const api = (path, opts = {}, tok) => fetch(B + path, { ...opts, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}), ...(opts.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (email) => (await api("/api/login", { method: "POST", body: JSON.stringify({ email, password: "matkhau123" }) })).body.token;

const OWNER = await login("boss@test.vn");
const AN = await login("an@test.vn");     // teamlead
const list = async (tok, q = "") => (await api("/api/records?projectId=P1" + q, {}, tok)).body.records || [];

// ── H2: lập biên bản nghiệm thu kèm bảng kiểm ──
const BK = [
  { text: "Tim, cốt, kích thước hình học đúng bản vẽ", ketQua: "dat", ghiChu: "" },
  { text: "Cốp pha kín khít, không hở chân", ketQua: "khongdat", ghiChu: "Hở chân cột C2 khoảng 15 mm" },
  { text: "Cây chống đủ, chân trên nền cứng", ketQua: "na", ghiChu: "" },
  { text: "", ketQua: "dat", ghiChu: "dòng rỗng phải bị loại" },
  { text: "Mục có kết quả bịa đặt", ketQua: "SIEU_DAT", ghiChu: "" },
];
let r = await api("/api/records", { method: "POST", body: JSON.stringify({ projectId: "P1", projectName: "Du an 1", date: "2026-09-04", type: "Nghiệm thu nội bộ", number: "NT-01", note: "Nghiệm thu cốp pha cột tầng 2", checklist: BK }) }, OWNER);
ok("lập được biên bản nghiệm thu có bảng kiểm", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 70));
const rid = r.body.record.id;

let recs = await list(OWNER);
let rec = recs.find((x) => x.id === rid);
ok("bảng kiểm đọc lại được", !!(rec && rec.checklist), JSON.stringify(rec && rec.checklist).slice(0, 90));
ok("dòng rỗng bị loại (còn 4 mục)", rec.checklist.length === 4, "còn " + rec.checklist.length);
ok("kết quả hợp lệ giữ nguyên", rec.checklist[0].ketQua === "dat" && rec.checklist[1].ketQua === "khongdat" && rec.checklist[2].ketQua === "na");
ok("kết quả bịa đặt bị đưa về rỗng", rec.checklist[3].ketQua === "", "'" + rec.checklist[3].ketQua + "'");
ok("ghi chú mục không đạt được lưu", rec.checklist[1].ghiChu.includes("Hở chân cột C2"));

// ── H2: sửa lại bảng kiểm sau khi lập (trước đây chỉ tạo hoặc xóa) ──
const BK2 = rec.checklist.map((x, i) => i === 1 ? { ...x, ketQua: "dat", ghiChu: "Đã chèn kín, kiểm tra lại đạt" } : x);
r = await api("/api/records/update", { method: "POST", body: JSON.stringify({ id: rid, checklist: BK2, note: "Đã khắc phục, nghiệm thu lại" }) }, OWNER);
ok("sửa được biên bản đã lập", r.status === 200, r.status);
recs = await list(OWNER); rec = recs.find((x) => x.id === rid);
ok("bảng kiểm sau khi sửa: mục 2 đã Đạt", rec.checklist[1].ketQua === "dat" && rec.note.includes("Đã khắc phục"));
ok("có ghi ai sửa và khi nào", !!rec.updatedBy && rec.updatedAt > 0, JSON.stringify({ updatedBy: rec.updatedBy }));

// ── H5: xóa = vào thùng rác, KHÔNG mất hẳn ──
r = await api("/api/records/delete", { method: "POST", body: JSON.stringify({ id: rid, reason: "Lập nhầm dự án" }) }, OWNER);
ok("xóa biên bản -> vào thùng rác (không xóa hẳn)", r.status === 200 && r.body.trashed === true, JSON.stringify(r.body));
recs = await list(OWNER);
ok("biên bản không còn ở danh sách thường", !recs.some((x) => x.id === rid));
const rac = await list(OWNER, "&trash=1");
ok("biên bản nằm trong thùng rác, còn nguyên bảng kiểm", rac.some((x) => x.id === rid && x.checklist && x.checklist.length === 4));

// ── H5: chỉ Chủ sở hữu mới xóa vĩnh viễn ──
r = await api("/api/records/delete", { method: "POST", body: JSON.stringify({ id: rid, purge: true }) }, AN);
ok("teamlead KHÔNG xóa vĩnh viễn được hồ sơ", r.status === 403, "status " + r.status);
r = await api("/api/records/delete", { method: "POST", body: JSON.stringify({ id: rid, purge: true }) }, OWNER);
ok("Chủ sở hữu xóa vĩnh viễn được", r.status === 200 && r.body.purged === true, JSON.stringify(r.body));
ok("sau khi xóa vĩnh viễn thì thùng rác cũng sạch", !(await list(OWNER, "&trash=1")).some((x) => x.id === rid));

// ── H5: nhật ký thi công cũng vào thùng rác, và ngày đó lập lại được (B3 không chặn nhầm) ──
r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ projectId: "P1", projectName: "Du an 1", date: "2026-09-03", work: "Đổ bê tông sàn tầng 2" }) }, OWNER);
ok("lập nhật ký ngày 03/09", r.status === 200, r.status);
const lid = r.body.log.id;
r = await api("/api/sitelogs/delete", { method: "POST", body: JSON.stringify({ id: lid, reason: "Ghi nhầm ngày" }) }, OWNER);
ok("xóa nhật ký -> vào thùng rác", r.status === 200 && r.body.trashed === true, JSON.stringify(r.body));
r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ projectId: "P1", projectName: "Du an 1", date: "2026-09-03", work: "Đổ bê tông sàn tầng 2 (lập lại)" }) }, OWNER);
ok("lập lại nhật ký cùng ngày sau khi xóa -> KHÔNG bị chặn nhầm", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 70));

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
