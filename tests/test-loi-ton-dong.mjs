/* Test Lỗi tồn đọng / punch list (audit 04/09: H1) và Mốc tiến độ (P1).
   Lỗi dùng chung thực thể công việc nên phải chịu ĐÚNG các luật phân quyền máy chủ:
   người được giao chỉ được báo "đã sửa", KHÔNG được tự hạ mức độ hay đổi nhà thầu.
   Chạy SAU test-authz.mjs.  Cách dùng: node tests/test-loi-ton-dong.mjs [BASE_URL] */
const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const api = (path, opts = {}, tok) => fetch(B + path, { ...opts, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}), ...(opts.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (email) => (await api("/api/login", { method: "POST", body: JSON.stringify({ email, password: "matkhau123" }) })).body.token;

const OWNER = await login("boss@test.vn");
const BINH = await login("binh@test.vn");          // nhân viên thường, không có canAssign
const doc = async (tok) => JSON.parse((await api("/api/kv?key=pm_shared_v3", {}, tok)).body.value);
const luu = (tok, st) => api("/api/kv", { method: "POST", body: JSON.stringify({ key: "pm_shared_v3", value: JSON.stringify(st) }) }, tok);
const binhId = (await api("/api/me", {}, BINH)).body.user.id;

// ── Chủ sở hữu ghi nhận một lỗi và giao cho Bình ──
let st = await doc(OWNER);
const LOI = {
  id: "d1", projectId: "P1", kind: "defect",
  defect: { viTri: "Tầng 3 – trục C2", mucDo: "high", nhaThau: "Thầu xây tô Minh Phát" },
  status: "todo", approver: "teamlead", title: "Tường bị rỗ, lộ cốt liệu", description: "",
  priority: "high", assignees: [binhId], primaryAssigneeId: binhId, workdone: 0, tags: [],
  completed: false, subtasks: [], comments: [], dueDate: "2026-09-12", startDate: "", duration: null,
  milestone: false, dependsOn: [], assignedAt: Date.now(), completedAt: null, reminderLead: null,
  reminderSentKey: "", recur: "none", createdAt: Date.now(), order: 900,
};
let r = await luu(OWNER, { ...st, rev: st.rev + 1, tasks: [...st.tasks, LOI] });
ok("Chủ sở hữu ghi nhận được lỗi tồn đọng", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 80));

st = await doc(OWNER);
const lay = (s) => s.tasks.find((x) => x.id === "d1");
ok("lỗi lưu đủ vị trí / mức độ / nhà thầu",
   lay(st).kind === "defect" && lay(st).defect.viTri === "Tầng 3 – trục C2" && lay(st).defect.mucDo === "high" && lay(st).defect.nhaThau === "Thầu xây tô Minh Phát",
   JSON.stringify(lay(st).defect));

// ── nhà thầu / người được giao: được báo ĐÃ SỬA ──
st = await doc(BINH);
r = await luu(BINH, { ...st, rev: st.rev + 1, tasks: st.tasks.map((x) => x.id === "d1" ? { ...x, status: "review", workdone: 100 } : x) });
ok("người được giao báo ĐÃ SỬA (chuyển Chờ phê duyệt)", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 80));

// ── nhưng KHÔNG được tự hạ mức độ, đổi nhà thầu, hay đổi vị trí ──
st = await doc(BINH);
r = await luu(BINH, { ...st, rev: st.rev + 1, tasks: st.tasks.map((x) => x.id === "d1" ? { ...x, defect: { ...x.defect, mucDo: "low" } } : x) });
ok("người được giao KHÔNG tự hạ mức độ lỗi", r.status === 403, "status " + r.status);
st = await doc(BINH);
r = await luu(BINH, { ...st, rev: st.rev + 1, tasks: st.tasks.map((x) => x.id === "d1" ? { ...x, defect: { ...x.defect, nhaThau: "Thầu khác" } } : x) });
ok("người được giao KHÔNG đổi được nhà thầu chịu trách nhiệm", r.status === 403, "status " + r.status);
st = await doc(BINH);
r = await luu(BINH, { ...st, rev: st.rev + 1, tasks: st.tasks.map((x) => x.id === "d1" ? { ...x, dueDate: "2026-12-31" } : x) });
ok("người được giao KHÔNG tự nới hạn khắc phục", r.status === 403, "status " + r.status);
st = await doc(BINH);
r = await luu(BINH, { ...st, rev: st.rev + 1, tasks: st.tasks.map((x) => x.id === "d1" ? { ...x, kind: "task", defect: undefined } : x) });
ok("người được giao KHÔNG biến lỗi thành việc thường để thoát punch list", r.status === 403, "status " + r.status);

// ── QC (Chủ sở hữu) xác nhận đóng ──
st = await doc(OWNER);
r = await luu(OWNER, { ...st, rev: st.rev + 1, tasks: st.tasks.map((x) => x.id === "d1" ? { ...x, status: "done", completed: true, approvedBy: "Chu So Huu", completedAt: Date.now() } : x) });
ok("QC xác nhận đóng lỗi", r.status === 200, r.status);
st = await doc(OWNER);
ok("trạng thái cuối = đã xác nhận đóng", lay(st).status === "done" && lay(st).completed === true);

// ── mọi thay đổi trên đều phải có trong nhật ký kiểm toán của máy chủ ──
const au = (await api("/api/audit?limit=400", {}, OWNER)).body.entries || [];
const cua = au.filter((e) => e.id === "d1");
ok("nhật ký kiểm toán ghi việc tạo lỗi", cua.some((e) => e.field === "tạo mới"));
ok("nhật ký kiểm toán ghi lần báo ĐÃ SỬA", cua.some((e) => e.field === "status" && e.to === "review"));
ok("nhật ký kiểm toán ghi lần xác nhận đóng", cua.some((e) => e.field === "status" && e.to === "done"));

// ── Mốc tiến độ (P1): trường milestone đi qua máy chủ và được lưu vết ──
st = await doc(OWNER);
r = await luu(OWNER, { ...st, rev: st.rev + 1, tasks: st.tasks.map((x, i) => i === 0 ? { ...x, milestone: true } : x) });
ok("đánh dấu một việc thành MỐC", r.status === 200, r.status);
st = await doc(OWNER);
ok("mốc được lưu lại", st.tasks[0].milestone === true);
const au2 = (await api("/api/audit?limit=400", {}, OWNER)).body.entries || [];
ok("nhật ký kiểm toán ghi việc đặt mốc", au2.some((e) => e.field === "milestone" && e.to === "true"));

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
