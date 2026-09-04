/* Test nghiệp vụ (bổ sung theo báo cáo đánh giá 17/08/2026):
   đồng bộ 2 client / xung đột revision, round-trip tệp biên bản, round-trip finance/BOQ.
   Chạy SAU test-authz.mjs (dùng tài khoản boss/binh đã tạo), TRƯỚC test-license.mjs
   (test license phá trạng thái giấy phép của DATA_DIR).
   Cách dùng:  node tests/test-nghiep-vu.mjs [BASE_URL] */
const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const api = (path, opts = {}, tok) => fetch(B + path, { ...opts, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}), ...(opts.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (email) => (await api("/api/login", { method: "POST", body: JSON.stringify({ email, password: "matkhau123" }) })).body.token;

const OWNER = await login("boss@test.vn");
const BINH = await login("binh@test.vn");
ok("đăng nhập 2 client", !!OWNER && !!BINH);

// ---- đồng bộ 2 client: xung đột revision ----
const cur = await api("/api/kv?key=pm_shared_v3", {}, OWNER);
const state = JSON.parse(cur.body.value);
const rev0 = state.rev;
const rv = await api("/api/kv/rev", {}, BINH);
ok("2 client cùng thấy rev hiện tại", rv.body.rev === rev0, rv.body.rev + " vs " + rev0);
// cả hai client cùng sửa từ rev gốc: client A lưu trước
const pushAs = (tok, st) => api("/api/kv", { method: "POST", body: JSON.stringify({ key: "pm_shared_v3", value: JSON.stringify(st) }) }, tok);
let r = await pushAs(OWNER, { ...state, updatedBy: "clientA", rev: rev0 + 1 });
ok("client A lưu rev+1 -> OK", r.status === 200);
r = await pushAs(BINH, { ...state, updatedBy: "clientB", rev: rev0 + 1 });
ok("client B lưu cùng rev -> 409 conflict (không mất dữ liệu thầm lặng)", r.status === 409 && typeof r.body.rev === "number");
// client B pull lại rồi lưu chồng lên -> OK
const cur2 = await api("/api/kv?key=pm_shared_v3", {}, BINH);
const state2 = JSON.parse(cur2.body.value);
ok("client B pull được bản của A", state2.updatedBy === "clientA" && state2.rev === rev0 + 1);
r = await pushAs(BINH, { ...state2, updatedBy: "clientB", rev: state2.rev + 1 });
ok("client B lưu lại sau khi pull -> OK", r.status === 200);

// ---- round-trip tệp biên bản: byte tải xuống phải đúng byte tải lên ----
const rec = await api("/api/records", { method: "POST", body: JSON.stringify({ projectId: "P1", projectName: "Du an 1", date: "2026-08-17", type: "BB round-trip" }) }, OWNER);
const rid = rec.body.record.id;
const PAYLOAD = "PDF-BYTES-" + Math.random().toString(36).slice(2) + "-âấu"; // kèm ký tự ngoài ASCII
const up = await fetch(B + "/api/records/file?recordId=" + rid + "&filename=roundtrip.pdf", { method: "POST", headers: { Authorization: "Bearer " + OWNER, "Content-Type": "application/pdf" }, body: PAYLOAD });
ok("upload tệp biên bản", up.status === 200);
const dl = await fetch(B + "/api/records/file?recordId=" + rid + "&idx=0", { headers: { Authorization: "Bearer " + OWNER } });
const body = await dl.text();
ok("tải xuống: Content-Type suy từ đuôi (.pdf)", (dl.headers.get("content-type") || "") === "application/pdf");
ok("tải xuống: nội dung đúng từng byte", body === PAYLOAD, JSON.stringify(body.slice(0, 40)));

// ---- round-trip finance/BOQ + gate ----
const boq = { P1: { items: [{ id: "x1", stt: "1", ten: "Round-trip", donVi: "m2", laNhom: false, khoiLuong: 10.5, donGia: 123456, taskIds: [] }], kys: [{ id: "k1", soKy: 1, denNgay: "2026-08-17", kl: { x1: 4.5 } }] } };
r = await api("/api/finance", { method: "POST", body: JSON.stringify({ investorContracts: [], subContracts: [], boq }) }, OWNER);
ok("lưu finance kèm BOQ", r.status === 200);
const f = await api("/api/finance", {}, OWNER);
const it = ((f.body.boq || {}).P1 || {}).items || [];
ok("đọc lại BOQ: đủ hạng mục + kỳ, số không đổi", it.length === 1 && it[0].khoiLuong === 10.5 && f.body.boq.P1.kys[0].kl.x1 === 4.5);
r = await api("/api/finance", {}, BINH);
ok("thành viên không có quyền tài chính -> 403", r.status === 403);

// ---- CAS tài chính (audit 17/08 F2): bản cũ không được ghi đè bản mới ----
const rv1 = f.body.rev;
ok("GET finance trả về rev", typeof rv1 === "number" && rv1 > 0, "rev=" + rv1);
r = await api("/api/finance", { method: "POST", body: JSON.stringify({ ...f.body, expectedRev: rv1 }) }, OWNER);
ok("lưu với expectedRev đúng -> OK, rev tăng", r.status === 200 && r.body.rev === rv1 + 1);
r = await api("/api/finance", { method: "POST", body: JSON.stringify({ ...f.body, expectedRev: rv1 }) }, OWNER);
ok("bản STALE (expectedRev cũ) -> 409, không mất dữ liệu người khác", r.status === 409 && r.body.rev === rv1 + 1);

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0; // exit tự nhiên — process.exit đua với keep-alive socket gây abort libuv trên Node 24/Windows
