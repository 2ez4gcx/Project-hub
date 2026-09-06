/* Test CHỊU LỖI (fuzz 06/09): máy chủ nhận dữ liệu méo thì phải trả 4xx có cấu trúc — không 500, không lưu rác,
   không để một lần gọi tay làm hỏng dữ liệu của mọi người. Tự tạo dữ liệu riêng (tiền tố PF*, tài khoản pf*).
   Cách dùng: node tests/test-manh-me.mjs [BASE_URL] */
const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const J = JSON.stringify;
const raw = (p, m, body, tok) => fetch(B + p, { method: m, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}) }, body }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const api = (p, o = {}, t) => fetch(B + p, { ...o, headers: { "Content-Type": "application/json", ...(t ? { Authorization: "Bearer " + t } : {}), ...(o.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (e) => (await api("/api/login", { method: "POST", body: J({ email: e, password: "matkhau123" }) })).body.token;
const OWNER = await login("boss@test.vn");
await api("/api/accounts", { method: "POST", body: J({ name: "PF nhan vien", email: "pf@test.vn", password: "matkhau123" }) }, OWNER);
const NV = await login("pf@test.vn");
const doc = async (t) => JSON.parse((await api("/api/kv?key=pm_shared_v3", {}, t)).body.value);
const luu = (t, st) => api("/api/kv", { method: "POST", body: J({ key: "pm_shared_v3", value: J(st) }) }, t);

/* ── 1. body méo -> không bao giờ 500 ── */
{
  const EP = ["/api/kv", "/api/finance", "/api/records", "/api/records/update", "/api/records/restore", "/api/records/delete", "/api/sitelogs", "/api/sitelogs/approve", "/api/sitelogs/restore", "/api/sitelogs/delete", "/api/accounts", "/api/accounts/update", "/api/accounts/delete", "/api/password", "/api/settings", "/api/login", "/api/setup"];
  const PL = ["null", "[]", "123", '"x"', "{bad", "", '{"id":null}', '{"id":[]}', '{"id":{},"projectId":{}}'];
  let n = 0, xau = [];
  for (const p of EP) for (const tok of [OWNER, NV]) for (const pl of PL) { n++; const r = await raw(p, "POST", pl, tok); if (r.status >= 500) xau.push(p + " <- " + pl + " = " + r.status); }
  ok("không endpoint nào trả 500 với body méo (" + n + " yêu cầu)", xau.length === 0, xau.slice(0, 5).join(" | "));
  const sống = await api("/api/config"); ok("máy chủ vẫn sống sau fuzz", sống.status === 200);
}

/* ── 2. khối dữ liệu chung: chỉ lưu đúng cấu trúc, rev có giới hạn ── */
{
  const truoc = (await api("/api/kv?key=pm_shared_v3", {}, OWNER)).body.value;
  const cur = JSON.parse(truoc);
  for (const [ten, value] of [["value null", "null"], ["value mảng", "[]"], ["value chuỗi", '"abc"'], ["rev chuỗi", J({ ...cur, rev: "abc" })], ["rev âm", J({ ...cur, rev: -1 })], ["rev nhảy 1 triệu", J({ ...cur, rev: cur.rev + 5000000 })]]) {
    const r = await api("/api/kv", { method: "POST", body: J({ key: "pm_shared_v3", value }) }, OWNER);
    const sau = (await api("/api/kv?key=pm_shared_v3", {}, OWNER)).body.value;
    ok("Chủ sở hữu gửi " + ten + " -> 400 bad_shape, dữ liệu không đổi", r.status === 400 && r.body.error === "bad_shape" && sau === truoc, r.status + " " + J(r.body).slice(0, 80) + (sau === truoc ? "" : " | ĐÃ ĐỔI"));
  }
  // mảng có phần tử rác -> lưu được nhưng rác bị lọc, phần tử hợp lệ giữ nguyên
  const st = { ...cur, rev: cur.rev + 1, projects: [null, ...cur.projects, { id: "PF1", name: "PF du an", color: "#000" }], sections: [5, ...cur.sections], tasks: ["x", ...cur.tasks, { id: "pf_t1", projectId: "PF1", title: "PF viec", status: "todo", comments: [null, { author: "a", text: "b" }], subtasks: [null], assignees: [null, 5, "id-hop-le"] }], history: [null, ...cur.history], dailyReports: [null, ...cur.dailyReports, { id: "pf_rep", memberId: "x", items: [null, { id: "l", taskId: "pf_t1", moTa: "ok" }], comments: [null] }], trash: [null, ...cur.trash] };
  const r = await luu(OWNER, st); const sau = await doc(OWNER);
  const sach = (a) => Array.isArray(a) && a.every((e) => e && typeof e === "object" && !Array.isArray(e));
  ok("mảng có phần tử null/số/chuỗi -> 200, mọi mảng được lọc sạch", r.status === 200 && ["projects", "sections", "tasks", "history", "dailyReports", "trash"].every((k) => sach(sau[k])), r.status);
  const t = sau.tasks.find((x) => x.id === "pf_t1"); const rep = sau.dailyReports.find((x) => x.id === "pf_rep");
  ok("bên trong việc / báo cáo cũng sạch (comments, subtasks, assignees, items)", t && sach(t.comments) && t.comments.length === 1 && sach(t.subtasks) && J(t.assignees) === J(["id-hop-le"]) && rep && sach(rep.items) && rep.items.length === 1 && sach(rep.comments), J(t).slice(0, 160));
  ok("phần tử hợp lệ vẫn giữ nguyên", sau.projects.some((p) => p.id === "PF1") && sau.projects.length === cur.projects.length + 1);
}

/* ── 3. tài chính: bắt buộc expectedRev, cấu trúc được làm sạch ── */
{
  const f = (await api("/api/finance", {}, OWNER)).body;
  let r = await api("/api/finance", { method: "POST", body: J({ investorContracts: [], subContracts: [], boq: {} }) }, OWNER);
  const f2 = (await api("/api/finance", {}, OWNER)).body;
  ok("POST tài chính KHÔNG có expectedRev -> 400 missing_rev, không xóa sạch dữ liệu", r.status === 400 && r.body.error === "missing_rev" && f2.rev === f.rev && J(f2.boq) === J(f.boq), r.status + " " + J(r.body).slice(0, 80));
  r = await api("/api/finance", { method: "POST", body: J({ ...f, expectedRev: f.rev, boq: { ...f.boq, PF1: { items: [null, { id: "i1", ten: "PF hang muc", khoiLuong: 1, donGia: 1 }], kys: [null, 7] }, PF_null: null, PF_mang: [1] }, investorContracts: [null, ...f.investorContracts], chiPhi: { ...(f.chiPhi || {}), PF1: "x", PF2: [null, { id: "c", soTien: 1 }] }, nganSach: { ...(f.nganSach || {}), PF1: [1, 2] }, deNghi: { ...(f.deNghi || {}), PF1: "x" } }) }, OWNER);
  const f3 = (await api("/api/finance", {}, OWNER)).body;
  ok("tài chính có rác -> 200 nhưng chỉ phần đúng cấu trúc được lưu", r.status === 200 && f3.boq.PF1 && f3.boq.PF1.items.length === 1 && f3.boq.PF1.kys.length === 0 && !("PF_null" in f3.boq) && !("PF_mang" in f3.boq) && f3.investorContracts.every((c) => c && typeof c === "object") && !("PF1" in f3.chiPhi) && f3.chiPhi.PF2.length === 1 && !("PF1" in f3.nganSach) && !("PF1" in f3.deNghi), r.status + " " + J({ boq: Object.keys(f3.boq), cp: f3.chiPhi && Object.keys(f3.chiPhi) }).slice(0, 160));
  r = await api("/api/finance", { method: "POST", body: J({ ...f, expectedRev: f3.rev }) }, OWNER); ok("khôi phục tài chính", r.status === 200);
}

/* ── 4. tài khoản / cài đặt / hồ sơ: kiểm kiểu ── */
{
  let r = await api("/api/accounts", { method: "POST", body: J({ name: "A", email: "khong-phai-email", password: "matkhau123" }) }, OWNER);
  ok("email không hợp lệ -> 400 bad_email", r.status === 400 && r.body.error === "bad_email", r.status + " " + J(r.body).slice(0, 60));
  r = await api("/api/accounts", { method: "POST", body: J({ name: {}, email: "pf2@test.vn", password: "matkhau123" }) }, OWNER);
  ok("tên là object -> 400 bad_shape (không tạo tài khoản '[object Object]')", r.status === 400 && r.body.error === "bad_shape", r.status);
  r = await api("/api/setup", { method: "POST", body: J({ name: "x", email: {}, password: "matkhau123", code: "TEST123" }) });
  ok("setup với email object -> không 500", r.status < 500, r.status);
  const s0 = (await api("/api/settings", {}, OWNER)).body;
  r = await api("/api/settings", { method: "POST", body: J({ smtp: "x", backup: 5, features: [], appName: {}, appUrl: 7 }) }, OWNER);
  const s1 = (await api("/api/settings", {}, OWNER)).body;
  ok("cài đặt méo -> bị bỏ qua, không lưu rác (smtp/backup/appName giữ nguyên)", r.status === 200 && J(s1.smtp) === J(s0.smtp) && J(s1.backup) === J(s0.backup) && s1.appName === s0.appName && s1.appUrl === s0.appUrl, J({ smtp: s1.smtp, appName: s1.appName }).slice(0, 120));
  r = await api("/api/records", { method: "POST", body: J({ projectId: "PF_KHONG_CO", date: "2026-09-06", type: "BB" }) }, OWNER);
  ok("biên bản cho dự án không tồn tại -> 400 no_project (kể cả Chủ sở hữu)", r.status === 400 && r.body.error === "no_project", r.status + " " + J(r.body).slice(0, 60));
  r = await api("/api/sitelogs", { method: "POST", body: J({ projectId: {}, date: "2026-09-06" }) }, OWNER);
  ok("nhật ký với projectId là object -> 400 no_project", r.status === 400 && r.body.error === "no_project", r.status);
  r = await api("/api/accounts/update", { method: "POST", body: J({ id: (await api("/api/me", {}, NV)).body.user.id, name: [] }) }, OWNER);
  ok("cập nhật tên bằng mảng -> 400 bad_shape", r.status === 400 && r.body.error === "bad_shape", r.status);
}

/* ── 4b. nhật ký kiểm toán không nhiễu khi client chuẩn hóa việc cũ (điền kind/milestone/... mặc định) ── */
{
  const cur = await doc(OWNER);
  const st = { ...cur, rev: cur.rev + 1, tasks: [...cur.tasks, { id: "pf_cu", projectId: "PF1", title: "Viec cu thieu truong" }] };
  let r = await luu(OWNER, st);
  const st2 = await doc(OWNER); st2.rev++; st2.tasks = st2.tasks.map((x) => x.id === "pf_cu" ? { ...x, kind: "task", milestone: false, completed: false, workdone: 0, priority: "medium", assignees: [], primaryAssigneeId: null, dependsOn: [], approver: "teamlead", description: "", startDate: "", dueDate: "", duration: null, status: "todo" } : x);
  r = await luu(OWNER, st2);
  const au = (await api("/api/audit?limit=30", {}, OWNER)).body.entries.filter((e) => e.rev === st2.rev && e.id === "pf_cu");
  ok("client điền giá trị mặc định cho việc cũ -> KHÔNG sinh dòng audit (trước: 'đổi loại việc (trống) → task' cho mọi việc cũ)", r.status === 200 && au.length === 0, r.status + " " + au.map((e) => e.field + ":" + e.from + ">" + e.to).join(", "));
  const st3 = await doc(OWNER); st3.rev++; st3.tasks = st3.tasks.map((x) => x.id === "pf_cu" ? { ...x, kind: "defect" } : x);
  r = await luu(OWNER, st3);
  const au3 = (await api("/api/audit?limit=30", {}, OWNER)).body.entries.filter((e) => e.rev === st3.rev && e.id === "pf_cu");
  ok("đổi thật (task -> defect) vẫn có vết", au3.some((e) => e.field === "kind" && e.to === "defect"), au3.map((e) => e.field).join(", "));
}

/* ── 4c. dữ liệu cũ thiếu trường + client chuẩn hóa -> nhân viên thường vẫn lưu được (L1) ── */
{
  const nvId = (await api("/api/me", {}, NV)).body.user.id;
  const cur = await doc(OWNER);
  const st = { ...cur, rev: cur.rev + 1, tasks: [...cur.tasks.filter((x) => !String(x.id).startsWith("pf_lg")), { id: "pf_lg1", projectId: "PF1", title: "Viec cu giao nv", assignees: [nvId], primaryAssigneeId: nvId, status: "doing", workdone: 10 }, { id: "pf_lg2", projectId: "PF1", title: "Viec cu khong giao ai", status: "todo" }] };
  let r = await luu(OWNER, st); ok("Chủ sở hữu ghi 2 việc kiểu cũ (thiếu tags/subtasks/comments/kind/...)", r.status === 200, r.status);
  const chuan = (x) => { const assignees = Array.isArray(x.assignees) ? x.assignees : []; const primary = x.primaryAssigneeId || (assignees.length ? assignees[0] : null); const workdone = typeof x.workdone === "number" ? x.workdone : (x.completed ? 100 : 0); const status = ["todo", "doing", "review", "onhold", "done"].includes(x.status) ? x.status : ((x.completed || workdone >= 100) ? "done" : (workdone > 0 ? "doing" : "todo")); return { subtasks: [], comments: [], tags: [], ...x, assignees, primaryAssigneeId: primary, workdone, reminderLead: x.reminderLead == null ? null : x.reminderLead, reminderSentKey: x.reminderSentKey || "", recur: x.recur || "none", recurSpawned: !!x.recurSpawned, startDate: x.startDate || "", duration: x.duration || null, milestone: !!x.milestone, kind: x.kind === "defect" ? "defect" : "task", status, approver: x.approver === "leader" ? "leader" : "teamlead", dependsOn: Array.isArray(x.dependsOn) ? x.dependsOn : [], assignedAt: x.assignedAt || null, completedAt: x.completedAt || null, completed: status === "done" }; };   // bản sao đúng của normalizeTask ở client
  let s2 = await doc(NV); s2.rev++; s2.tasks = s2.tasks.map(chuan).map((x) => x.id === "pf_lg1" ? { ...x, workdone: 55 } : x);
  r = await luu(NV, s2); const sau = await doc(OWNER);
  ok("nhân viên thường lưu sau khi client chuẩn hóa dữ liệu cũ -> 200 (trước: 403 'trường tags')", r.status === 200 && (sau.tasks.find((x) => x.id === "pf_lg1") || {}).workdone === 55, r.status + " " + J(r.body).slice(0, 100));
  let s3 = await doc(NV); s3.rev++; s3.tasks = s3.tasks.map(chuan).map((x) => x.id === "pf_lg2" ? { ...x, title: "Doi ten trai phep" } : x);
  r = await luu(NV, s3);
  ok("nhưng đổi tên việc không phải của mình vẫn bị chặn (403)", r.status === 403 && /title/.test(r.body.message || ""), r.status + " " + (r.body.message || ""));
}

/* ── 5. đường dẫn tĩnh không lộ tệp dữ liệu ── */
{
  let lo = [];
  for (const p of ["/..%2f..%2fdata%2faccounts.json", "/%2e%2e/%2e%2e/data/accounts.json", "/public/../data/accounts.json", "/index.html/../../data/accounts.json", "/../data/accounts.json"]) {
    const r = await fetch(B + p); const t = await r.text(); if (r.status === 200 && /"salt"|"hash"/.test(t)) lo.push(p);
  }
  ok("không đường dẫn nào lộ accounts.json", lo.length === 0, lo.join(", "));
}

console.log("\nKẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exit(fail ? 1 : 0);
