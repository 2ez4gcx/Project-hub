/* Test nhật ký kiểm toán do MÁY CHỦ sinh (audit 04/09: A8, A10, Q3).
   Yêu cầu: mọi thay đổi qua API đều để lại vết, kể cả khi client cố tình không ghi "Lịch sử".
   Chạy SAU test-authz.mjs.  Cách dùng: node tests/test-audit-trail.mjs [BASE_URL] */
const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const api = (path, opts = {}, tok) => fetch(B + path, { ...opts, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}), ...(opts.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (email) => (await api("/api/login", { method: "POST", body: JSON.stringify({ email, password: "matkhau123" }) })).body.token;

const OWNER = await login("boss@test.vn");
const AN = await login("an@test.vn");
const BINH = await login("binh@test.vn");
const auditOf = async (tok, limit = 200) => (await api("/api/audit?limit=" + limit, {}, tok)).body.entries || [];

ok("chỉ Chủ sở hữu/Lãnh đạo xem được nhật ký kiểm toán", (await api("/api/audit", {}, BINH)).status === 403);
const before = await auditOf(OWNER);
ok("Chủ sở hữu đọc được nhật ký kiểm toán", Array.isArray(before));

// ── thay đổi lén: sửa hạn + % + ngày bắt đầu NHƯNG giữ nguyên history của client ──
const kv = await api("/api/kv?key=pm_shared_v3", {}, OWNER);
const st = JSON.parse(kv.body.value);
const soLichSuTruoc = (st.history || []).length;
const t1 = st.tasks[0];
const lenLut = { ...st, rev: st.rev + 1,
  tasks: st.tasks.map((x) => x.id === t1.id ? { ...x, dueDate: "2026-12-31", startDate: "2026-12-01", workdone: 95 } : x) };
let r = await api("/api/kv", { method: "POST", body: JSON.stringify({ key: "pm_shared_v3", value: JSON.stringify(lenLut) }) }, OWNER);
ok("đổi hạn/% mà KHÔNG ghi lịch sử phía client -> máy chủ vẫn nhận", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 70));

const after = await auditOf(OWNER);
const moi = after.slice(0, after.length - before.length);
ok("nhật ký kiểm toán tự sinh dòng mới", moi.length >= 3, "thêm " + moi.length + " dòng");
const co = (field, to) => moi.some((e) => e.entity === "task" && e.field === field && (to === undefined || String(e.to) === String(to)));
ok("có vết đổi hạn chót (dueDate → 2026-12-31)", co("dueDate", "2026-12-31"), JSON.stringify(moi.map((e) => e.field)));
ok("có vết đổi ngày bắt đầu (startDate)", co("startDate", "2026-12-01"));
ok("có vết đổi % hoàn thành (workdone → 95)", co("workdone", "95"));
const e0 = moi.find((e) => e.field === "dueDate");
ok("dòng nhật ký ghi đủ ai / khi nào / trước → sau", !!(e0 && e0.actor && e0.actorId && e0.ts && e0.from !== undefined && e0.to !== undefined),
   e0 && JSON.stringify({ actor: e0.actor, from: e0.from, to: e0.to }));
ok("client KHÔNG ghi lịch sử nào (chứng minh máy chủ ghi độc lập)", (JSON.parse((await api("/api/kv?key=pm_shared_v3", {}, OWNER)).body.value).history || []).length === soLichSuTruoc);

// ── không có đường nào xóa/sửa nhật ký kiểm toán qua API ──
const xoa = await api("/api/audit", { method: "DELETE" }, OWNER);
ok("không xóa được nhật ký kiểm toán qua API", xoa.status === 404 || xoa.status === 405 || xoa.status === 403, "status " + xoa.status);

// ── Q3: sửa số liệu tài chính phải để lại vết cấp trường ──
const f0 = (await api("/api/finance", {}, OWNER)).body;
const boq = { P1: { items: [{ id: "h1", stt: "1", ten: "Bê tông móng", donVi: "m3", khoiLuong: 40, donGia: 1650000, taskIds: [] }], kys: [{ id: "k1", soKy: 1, denNgay: "2026-09-01", kl: { h1: 20 } }] } };
r = await api("/api/finance", { method: "POST", body: JSON.stringify({ investorContracts: f0.investorContracts || [], subContracts: f0.subContracts || [], boq, expectedRev: f0.rev }) }, OWNER);
ok("lập BOQ ban đầu", r.status === 200, r.status);
const f1 = (await api("/api/finance", {}, OWNER)).body;
const boq2 = { P1: { items: [{ ...boq.P1.items[0], donGia: 1950000 }], kys: [{ ...boq.P1.kys[0], kl: { h1: 30 } }] } };
r = await api("/api/finance", { method: "POST", body: JSON.stringify({ investorContracts: f1.investorContracts || [], subContracts: f1.subContracts || [], boq: boq2, expectedRev: f1.rev }) }, OWNER);
ok("sửa đơn giá + khối lượng kỳ đã chốt", r.status === 200, r.status);

const auditF = await auditOf(OWNER, 300);
ok("có vết sửa ĐƠN GIÁ (1.650.000 → 1.950.000)",
   auditF.some((e) => e.entity === "boq" && e.field === "donGia" && e.from === "1650000" && e.to === "1950000"),
   JSON.stringify(auditF.filter((e) => e.entity === "boq").map((e) => e.field + ":" + e.from + "→" + e.to).slice(0, 5)));
ok("có vết sửa KHỐI LƯỢNG kỳ nghiệm thu (20 → 30)",
   auditF.some((e) => e.entity === "boq" && e.field === "khoiLuongKy" && e.from === "20" && e.to === "30"));

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
