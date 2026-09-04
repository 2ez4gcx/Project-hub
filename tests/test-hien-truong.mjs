/* Test nghiệp vụ hiện trường (audit 04/09): B3 nhật ký cùng ngày, A5 luật báo cáo ngày.
   Chạy SAU test-authz.mjs (dùng tài khoản boss/an/binh đã tạo).
   Cách dùng:  node tests/test-hien-truong.mjs [BASE_URL] */
const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const api = (path, opts = {}, tok) => fetch(B + path, { ...opts, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}), ...(opts.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (email) => (await api("/api/login", { method: "POST", body: JSON.stringify({ email, password: "matkhau123" }) })).body.token;

const OWNER = await login("boss@test.vn");
const AN = await login("an@test.vn");     // teamlead (bộ phận Site sau khi được set)
const BINH = await login("binh@test.vn"); // nhân viên thường
ok("đăng nhập 3 tài khoản", !!OWNER && !!AN && !!BINH);

// ══════════ B3: hai người lập nhật ký cùng ngày ══════════
const NGAY = "2026-09-02";
let r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ projectId: "P1", projectName: "Du an 1", date: NGAY, work: "Đổ bê tông sàn tầng 2" }) }, OWNER);
ok("người thứ nhất lập nhật ký -> OK", r.status === 200 && !!r.body.log, JSON.stringify(r.body));
const logId = r.body.log && r.body.log.id;

r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ projectId: "P1", projectName: "Du an 1", date: NGAY, work: "Lắp cốt thép cột" }) }, OWNER);
ok("người thứ hai lập nhật ký CÙNG NGÀY -> 409 (không đè)", r.status === 409 && r.body.error === "log_exists", r.status + " " + JSON.stringify(r.body).slice(0, 90));
ok("409 chỉ đúng nhật ký đang có để mở ra sửa", r.body.logId === logId, r.body.logId + " vs " + logId);

const list = await api("/api/sitelogs?projectId=P1", {}, OWNER);
const cur = (list.body.logs || []).find((x) => x.date === NGAY);
ok("nội dung người đầu KHÔNG bị ghi đè", cur && cur.work === "Đổ bê tông sàn tầng 2", cur && cur.work);
ok("chỉ có 1 nhật ký cho ngày đó", (list.body.logs || []).filter((x) => x.date === NGAY).length === 1);

r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ id: logId, projectId: "P1", date: NGAY, work: "Đổ bê tông sàn tầng 2 + lắp cốt thép cột" }) }, OWNER);
ok("mở đúng nhật ký đó để bổ sung (gửi kèm id) -> OK", r.status === 200);
const list2 = await api("/api/sitelogs?projectId=P1", {}, OWNER);
const cur2 = (list2.body.logs || []).find((x) => x.date === NGAY);
ok("nội dung đã được bổ sung", cur2 && cur2.work.includes("lắp cốt thép"), cur2 && cur2.work);

// ══════════ A5: luật báo cáo ngày ══════════
const kv = await api("/api/kv?key=pm_shared_v3", {}, OWNER);
const state = JSON.parse(kv.body.value);
const accs = (await api("/api/accounts", {}, OWNER)).body.accounts;
const idOf = (em) => accs.find((a) => a.email === em).id;
const push = (tok, st) => api("/api/kv", { method: "POST", body: JSON.stringify({ key: "pm_shared_v3", value: JSON.stringify(st) }) }, tok);

// Bình tạo báo cáo của chính mình
let st = { ...state, rev: state.rev + 1, dailyReports: [{ id: "rp1", memberId: idOf("binh@test.vn"), memberName: "Binh Vien", date: "2026-09-02", items: [{ moTa: "Đổ bê tông" }], comments: [] }] };
r = await push(BINH, st);
ok("tạo báo cáo ngày của chính mình -> OK", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 80));

// Bình tạo báo cáo mang tên người khác
let bad = { ...st, rev: st.rev + 1, dailyReports: [...st.dailyReports, { id: "rp2", memberId: idOf("an@test.vn"), memberName: "An Teamlead", date: "2026-09-02", items: [], comments: [] }] };
r = await push(BINH, bad);
ok("tạo báo cáo MANG TÊN người khác -> 403", r.status === 403, r.status);

// An (teamlead) sửa nội dung báo cáo của Bình
bad = { ...st, rev: st.rev + 1, dailyReports: [{ ...st.dailyReports[0], items: [{ moTa: "Sửa trộm nội dung" }] }] };
r = await push(AN, bad);
ok("người khác SỬA NỘI DUNG báo cáo của Bình -> 403", r.status === 403, r.status);

// An thêm bình luận đúng tên mình
let withC = { ...st, rev: st.rev + 1, dailyReports: [{ ...st.dailyReports[0], comments: [{ id: "c1", authorId: idOf("an@test.vn"), author: "An Teamlead", text: "Đã xem", ts: 1 }] }] };
r = await push(AN, withC);
ok("người duyệt THÊM bình luận đúng tên mình -> OK", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 80));
st = withC;

// Bình giả mạo bình luận tên người khác
bad = { ...st, rev: st.rev + 1, dailyReports: [{ ...st.dailyReports[0], comments: [...st.dailyReports[0].comments, { id: "c2", authorId: idOf("an@test.vn"), author: "An Teamlead", text: "Giả mạo", ts: 2 }] }] };
r = await push(BINH, bad);
ok("bình luận GIẢ TÊN người khác -> 403", r.status === 403, r.status);

// Bình xóa bình luận của An
bad = { ...st, rev: st.rev + 1, dailyReports: [{ ...st.dailyReports[0], comments: [] }] };
r = await push(BINH, bad);
ok("xóa bình luận của người khác -> 403", r.status === 403, r.status);

// An xóa báo cáo của Bình
bad = { ...st, rev: st.rev + 1, dailyReports: [] };
r = await push(AN, bad);
ok("xóa báo cáo ngày của người khác -> 403", r.status === 403, r.status);

// Bình sửa chính báo cáo của mình -> OK
const mine = { ...st, rev: st.rev + 1, dailyReports: [{ ...st.dailyReports[0], items: [{ moTa: "Đổ bê tông sàn, 12 công" }] }] };
r = await push(BINH, mine);
ok("chủ báo cáo tự sửa nội dung của mình -> OK", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 80));

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
