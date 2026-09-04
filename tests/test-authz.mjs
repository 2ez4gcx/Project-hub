/* Test phân quyền server-side giai đoạn 1 (validateSharedWrite + /api/kv/rev) */
const B = process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };

const api = (path, opts = {}, tok) => fetch(B + path, { ...opts, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}), ...(opts.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));

let rev = 0;
const push = (tok, state) => { rev++; return api("/api/kv", { method: "POST", body: JSON.stringify({ key: "pm_shared_v3", value: JSON.stringify({ ...state, rev }) }) }, tok); };
// push kỳ vọng bị từ chối: KHÔNG tăng rev thật trên server -> hoàn rev lại sau khi thử
const pushExpectFail = async (tok, state) => { const r = await push(tok, state); rev--; return r; };

const T = (id, over = {}) => ({ id, projectId: "P1", sectionId: "S1", title: "Task " + id, status: "todo", approver: "teamlead", priority: "medium", assignees: [], workdone: 0, subtasks: [], comments: [], tags: [], ...over });

// ---- chuẩn bị ----
const su = await api("/api/setup", { method: "POST", body: JSON.stringify({ name: "Chu So Huu", email: "boss@test.vn", password: "matkhau123", code: "TEST123" }) });
const OWNER = su.body.token;
ok("setup owner", su.status === 200 && !!OWNER);

const mkAcc = (payload) => api("/api/accounts", { method: "POST", body: JSON.stringify(payload) }, OWNER);
await mkAcc({ name: "An Teamlead", email: "an@test.vn", password: "matkhau123", canAssign: true, isTeamlead: true });
await mkAcc({ name: "Binh Vien", email: "binh@test.vn", password: "matkhau123", canAssign: false });
// isTeamlead chỉ owner set được qua /api/accounts (đúng logic hiện có) — set qua update
const accs = (await api("/api/accounts", {}, OWNER)).body.accounts;
const anId = accs.find((a) => a.email === "an@test.vn").id;
await api("/api/accounts/update", { method: "POST", body: JSON.stringify({ id: anId, isTeamlead: true }) }, OWNER);
const login = async (email) => (await api("/api/login", { method: "POST", body: JSON.stringify({ email, password: "matkhau123" }) })).body.token;
const AN = await login("an@test.vn");
const BINH = await login("binh@test.vn");
ok("login thành viên", !!AN && !!BINH);

// ---- trạng thái nền do owner đẩy ----
const tasks12 = Array.from({ length: 12 }, (_, i) => T("t" + (i + 1)));
tasks12.push(T("tr1", { status: "review", approver: "teamlead" }), T("tr2", { status: "review", approver: "leader" }));
const base = {
  projects: [{ id: "P1", name: "Du an 1", color: "#f97316" }],
  sections: [{ id: "S1", projectId: "P1", name: "Can lam", order: 0 }],
  tasks: tasks12,
  history: [{ id: "h1", ts: 1, actor: "Chu So Huu", action: "project_create", projectName: "Du an 1" }],
  dailyReports: [], trash: [],
};
let r = await push(OWNER, base);
ok("owner đẩy trạng thái nền", r.status === 200);

const rv = await api("/api/kv/rev", {}, AN);
ok("/api/kv/rev trả đúng rev", rv.status === 200 && rv.body.rev === rev, JSON.stringify(rv.body));

// ---- luật 1: xóa dự án ----
r = await pushExpectFail(AN, { ...base, projects: [] });
ok("thành viên xóa dự án -> 403", r.status === 403, r.status + " " + JSON.stringify(r.body));

// ---- luật 4: xóa công việc ----
r = await pushExpectFail(BINH, { ...base, tasks: base.tasks.filter((t) => t.id !== "t1") });
ok("người không có quyền giao việc xóa task -> 403", r.status === 403);
r = await pushExpectFail(BINH, { ...base, tasks: [...base.tasks, T("tb1")] });
ok("người không có quyền giao việc TẠO task thường -> 403 (audit F1)", r.status === 403);
r = await push(AN, { ...base, tasks: [...base.tasks, T("tb1")] });
ok("người có quyền giao việc tạo task -> OK", r.status === 200);
const withB = { ...base, tasks: [...base.tasks, T("tb1")] };
r = await push(BINH, { ...withB, tasks: withB.tasks.map((t) => t.id === "t1" ? { ...t, comments: [{ id: "c1", author: "Binh Vien", text: "hi", ts: 2 }] } : t) });
ok("thành viên sửa nội dung task (bình luận) -> OK", r.status === 200);
const cur1 = { ...withB, tasks: withB.tasks.map((t) => t.id === "t1" ? { ...t, comments: [{ id: "c1", author: "Binh Vien", text: "hi", ts: 2 }] } : t) };
const tb1Task = cur1.tasks.find((t) => t.id === "tb1");
r = await pushExpectFail(AN, { ...cur1, tasks: cur1.tasks.filter((t) => t.id !== "tb1") });
ok("xóa task KHÔNG qua thùng rác -> 403 (chống mất vĩnh viễn)", r.status === 403);
const tb1Trash = { id: "tb1", kind: "task", name: "Task tb1", projectId: "P1", deletedAt: Date.now(), deletedBy: "An Teamlead", task: tb1Task };
r = await push(AN, { ...cur1, tasks: cur1.tasks.filter((t) => t.id !== "tb1"), trash: [tb1Trash] });
ok("người có quyền giao việc xóa 1 task (vào thùng rác) -> OK", r.status === 200);
const cur2a = { ...cur1, tasks: cur1.tasks.filter((t) => t.id !== "tb1"), trash: [tb1Trash] };
r = await push(AN, { ...cur2a, tasks: [...cur2a.tasks, tb1Task], trash: [] });
ok("khôi phục task từ thùng rác -> OK", r.status === 200);
const cur2b = { ...cur2a, tasks: [...cur2a.tasks, tb1Task], trash: [] };
r = await push(AN, { ...cur2b, tasks: cur2b.tasks.filter((t) => t.id !== "tb1"), trash: [tb1Trash] });
const cur2c = { ...cur2b, tasks: cur2b.tasks.filter((t) => t.id !== "tb1"), trash: [tb1Trash] };
r = await pushExpectFail(AN, { ...cur2c, trash: [] });
ok("thành viên xóa vĩnh viễn CÔNG VIỆC trong thùng rác -> 403", r.status === 403);
r = await push(OWNER, { ...cur2c, trash: [] });
ok("owner xóa vĩnh viễn công việc trong thùng rác -> OK", r.status === 200);
const cur2 = { ...cur2c, trash: [] };
const mass = cur2.tasks.slice(0, 11);
r = await pushExpectFail(AN, { ...cur2, tasks: cur2.tasks.filter((t2) => !mass.some((m) => m.id === t2.id)), trash: mass.map((m) => ({ id: m.id, kind: "task", name: m.title, projectId: "P1", deletedAt: Date.now(), task: m })) });
ok("xóa 11 task một lần (dù qua thùng rác) -> 403 (chống phá hoại hàng loạt)", r.status === 403);

// ---- luật 3: xóa cột ----
r = await pushExpectFail(AN, { ...cur2, sections: [] });
ok("thành viên xóa cột -> 403", r.status === 403);

// ---- kế hoạch gốc (baseline): chỉ Lãnh đạo / Chủ sở hữu ----
r = await pushExpectFail(AN, { ...cur2, projects: [{ ...cur2.projects[0], baseline: { savedAt: 1, by: "An", tasks: {} } }] });
ok("teamlead (không phải lãnh đạo) đặt kế hoạch gốc -> 403", r.status === 403);

// ---- luật 5: duyệt việc ----
const approve = (state, tid) => ({ ...state, tasks: state.tasks.map((t) => t.id === tid ? { ...t, status: "done", completed: true, workdone: 100, approvedBy: "x" } : t) });
r = await push(AN, approve(cur2, "tr1"));
ok("teamlead duyệt task approver=teamlead -> OK", r.status === 200);
const cur3 = approve(cur2, "tr1");
r = await pushExpectFail(AN, approve(cur3, "tr2"));
ok("teamlead duyệt task approver=leader -> 403", r.status === 403);
r = await pushExpectFail(BINH, approve(cur3, "tr2"));
ok("thành viên thường tự duyệt -> 403", r.status === 403);

// ---- luật 6: lịch sử ----
r = await push(AN, { ...cur3, history: [{ id: "h2", ts: 3, actor: "An Teamlead", action: "task_create", taskTitle: "x" }, ...cur3.history] });
ok("thêm lịch sử đúng tên mình -> OK", r.status === 200);
const cur4 = { ...cur3, history: [{ id: "h2", ts: 3, actor: "An Teamlead", action: "task_create", taskTitle: "x" }, ...cur3.history] };
r = await pushExpectFail(AN, { ...cur4, history: [{ id: "h3", ts: 4, actor: "Chu So Huu", action: "task_delete" }, ...cur4.history] });
ok("thêm lịch sử giả tên người khác -> 403", r.status === 403);
r = await pushExpectFail(AN, { ...cur4, history: cur4.history.filter((h) => h.id !== "h1") });
ok("xóa mục lịch sử cũ -> 403", r.status === 403);
r = await pushExpectFail(AN, { ...cur4, history: cur4.history.map((h) => h.id === "h1" ? { ...h, actor: "An Teamlead" } : h) });
ok("sửa mục lịch sử của người khác -> 403", r.status === 403);
r = await push(AN, { ...cur4, history: cur4.history.map((h) => h.id === "h2" ? { ...h, to: "merged" } : h) });
ok("gộp/sửa mục lịch sử MỚI NHẤT của chính mình -> OK", r.status === 200);
const cur5 = { ...cur4, history: cur4.history.map((h) => h.id === "h2" ? { ...h, to: "merged" } : h) };

// ---- luật 2: thùng rác ----
const trashed = { ...cur5, projects: [], sections: [], tasks: [], trash: [{ id: "P1", name: "Du an 1", deletedAt: Date.now(), deletedBy: "Chu So Huu", project: cur5.projects[0], sections: cur5.sections, tasks: cur5.tasks }] };
r = await push(OWNER, trashed);
ok("owner xóa dự án (vào thùng rác) -> OK", r.status === 200);
r = await pushExpectFail(AN, { ...trashed, trash: [] });
ok("thành viên xóa vĩnh viễn thùng rác -> 403", r.status === 403);
r = await pushExpectFail(AN, { ...trashed, trash: [{ ...trashed.trash[0], tasks: [] }] });
ok("thành viên sửa nội dung mục thùng rác -> 403", r.status === 403);
r = await push(AN, { ...trashed, projects: cur5.projects, sections: cur5.sections, tasks: cur5.tasks, trash: [] });
ok("thành viên KHÔI PHỤC dự án từ thùng rác -> OK", r.status === 200);
const cur6 = { ...trashed, projects: cur5.projects, sections: cur5.sections, tasks: cur5.tasks, trash: [] };
// mục quá 90 ngày: client tự dọn
const old = { ...cur6, trash: [{ id: "PX", name: "Cu", deletedAt: Date.now() - 100 * 86400000, project: { id: "PX" }, sections: [], tasks: [] }] };
r = await push(OWNER, old);
r = await push(BINH, { ...old, trash: [] });
ok("client tự dọn mục thùng rác quá 90 ngày -> OK", r.status === 200);

// ---- siết quyền xem file theo dự án (v3.8) ----
const binhId = accs.find((a) => a.email === "binh@test.vn").id;
// owner tạo biên bản + upload 1 file cho P1
const recR = await api("/api/records", { method: "POST", body: JSON.stringify({ projectId: "P1", projectName: "Du an 1", date: "2026-08-14", type: "BB test" }) }, OWNER);
const rid = recR.body.record.id;
const up = await fetch(B + "/api/records/file?recordId=" + rid + "&filename=test.pdf", { method: "POST", headers: { Authorization: "Bearer " + OWNER, "Content-Type": "application/pdf" }, body: "PDF-DATA" });
ok("owner upload file biên bản", up.status === 200);
// trạng thái hiện tại trên server (sau các test trước)
const curState = { ...old, trash: [] };
// Bình: không có việc trong P1 -> danh sách bị lọc rỗng, tải file bị chặn
let r2 = await api("/api/records?projectId=P1", {}, BINH);
ok("người ngoài dự án: danh sách biên bản rỗng", r2.status === 200 && (r2.body.records || []).length === 0);
let fr = await fetch(B + "/api/records/file?recordId=" + rid + "&idx=0", { headers: { Authorization: "Bearer " + BINH } });
ok("người ngoài dự án: tải file biên bản -> 403", fr.status === 403);
r2 = await api("/api/records?projectId=P1", {}, AN);
ok("teamlead vẫn xem được biên bản", r2.status === 200 && (r2.body.records || []).length === 1);
// owner giao việc t2 cho Bình -> thành người trong dự án
r2 = await push(OWNER, { ...curState, tasks: curState.tasks.map((t2) => t2.id === "t2" ? { ...t2, assignees: [binhId] } : t2) });
ok("owner giao việc t2 cho Bình", r2.status === 200);
r2 = await api("/api/records?projectId=P1", {}, BINH);
ok("được giao việc -> thấy biên bản", r2.status === 200 && (r2.body.records || []).length === 1);
fr = await fetch(B + "/api/records/file?recordId=" + rid + "&idx=0", { headers: { Authorization: "Bearer " + BINH } });
ok("được giao việc -> tải file OK", fr.status === 200);
const upB = await fetch(B + "/api/taskfiles/upload?taskId=t2&filename=anh.jpg", { method: "POST", headers: { Authorization: "Bearer " + BINH, "Content-Type": "image/jpeg" }, body: "JPG" });
ok("người trong dự án đính kèm tệp công việc -> OK", upB.status === 200);
// tắt công tắc (features.fileByProject = false) -> mở như cũ
const assignedState = { ...curState, tasks: curState.tasks.map((t2) => t2.id === "t2" ? { ...t2, assignees: [binhId] } : t2) };
r2 = await push(OWNER, { ...assignedState, tasks: curState.tasks });
ok("owner rút Bình khỏi việc t2", r2.status === 200);
r2 = await api("/api/records?projectId=P1", {}, BINH);
ok("rút khỏi việc -> lại bị lọc rỗng", r2.status === 200 && (r2.body.records || []).length === 0);
await api("/api/settings", { method: "POST", body: JSON.stringify({ features: { fileByProject: false } }) }, OWNER);
r2 = await api("/api/records?projectId=P1", {}, BINH);
ok("tắt công tắc trong Cài đặt -> mở xem như cũ", r2.status === 200 && (r2.body.records || []).length === 1);

// ---- F1 (audit 17/08): ma trận phân quyền sửa nội dung ----
const S = { ...old, trash: [] }; // trạng thái hiện tại trên server
r = await pushExpectFail(BINH, { ...S, projects: [{ ...S.projects[0], name: "Đổi tên trái phép" }] });
ok("canAssign=false đổi tên dự án -> 403", r.status === 403);
r = await pushExpectFail(BINH, { ...S, tasks: S.tasks.map((x) => x.id === "t3" ? { ...x, title: "Sửa trái phép" } : x) });
ok("canAssign=false sửa tiêu đề task -> 403", r.status === 403);
r = await pushExpectFail(BINH, { ...S, tasks: S.tasks.map((x) => x.id === "t3" ? { ...x, dueDate: "2030-01-01" } : x) });
ok("canAssign=false đổi hạn chót -> 403", r.status === 403);
r = await pushExpectFail(BINH, { ...S, tasks: S.tasks.map((x) => x.id === "t3" ? { ...x, assignees: [binhId] } : x) });
ok("canAssign=false tự nhận việc (đổi assignees) -> 403", r.status === 403);
r = await push(OWNER, { ...S, tasks: S.tasks.map((x) => x.id === "t3" ? { ...x, assignees: [binhId] } : x) });
const S2 = { ...S, tasks: S.tasks.map((x) => x.id === "t3" ? { ...x, assignees: [binhId] } : x) };
r = await push(BINH, { ...S2, tasks: S2.tasks.map((x) => x.id === "t3" ? { ...x, workdone: 40, status: "doing" } : x) });
ok("người được giao cập nhật %/trạng thái việc CỦA MÌNH -> OK", r.status === 200);
const S3 = { ...S2, tasks: S2.tasks.map((x) => x.id === "t3" ? { ...x, workdone: 40, status: "doing" } : x) };
r = await push(BINH, { ...S3, tasks: S3.tasks.map((x) => x.id === "t4" ? { ...x, comments: [{ id: "cB1", author: "Binh Vien", text: "góp ý", ts: 5 }] } : x) });
ok("bình luận vào việc người khác -> OK", r.status === 200);
const S4 = { ...S3, tasks: S3.tasks.map((x) => x.id === "t4" ? { ...x, comments: [{ id: "cB1", author: "Binh Vien", text: "góp ý", ts: 5 }] } : x) };
r = await pushExpectFail(BINH, { ...S4, tasks: S4.tasks.map((x) => x.id === "t5" ? { ...x, comments: [{ id: "cX", author: "Chu So Huu", text: "giả mạo", ts: 6 }] } : x) });
ok("bình luận giả tên người khác -> 403", r.status === 403);
r = await push(BINH, { ...S4, tasks: S4.tasks.map((x) => x.id === "t6" ? { ...x, status: "doing" } : x) });
ok("tự promote todo->doing việc người khác (client tự động) -> OK", r.status === 200);
const S5 = { ...S4, tasks: S4.tasks.map((x) => x.id === "t6" ? { ...x, status: "doing" } : x) };
r = await pushExpectFail(BINH, { ...S5, tasks: S5.tasks.map((x) => x.id === "t3" ? { ...x, status: "done", completed: true, workdone: 100 } : x) });
ok("người được giao tự set 'hoàn thành' không qua duyệt -> 403", r.status === 403);
// việc lặp: client của người không quyền vẫn tự sinh kỳ mới được
r = await push(OWNER, { ...S5, tasks: S5.tasks.map((x) => x.id === "t7" ? { ...x, recur: "weekly", status: "done", completed: true } : x) });
const S6 = { ...S5, tasks: S5.tasks.map((x) => x.id === "t7" ? { ...x, recur: "weekly", status: "done", completed: true } : x) };
const t7 = S6.tasks.find((x) => x.id === "t7");
const spawn = { ...t7, id: "t7b", status: "todo", completed: false, workdone: 0, recurSpawned: false };
r = await push(BINH, { ...S6, tasks: [...S6.tasks.map((x) => x.id === "t7" ? { ...x, recurSpawned: true } : x), spawn] });
ok("client không quyền tự sinh việc lặp (spawn hợp lệ) -> OK", r.status === 200);

// ---- rev cache sau các lần ghi ----
const rv2 = await api("/api/kv/rev", {}, AN);
ok("/api/kv/rev cập nhật sau khi ghi", rv2.body.rev === rev, "expect " + rev + " got " + rv2.body.rev);

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0; // exit tự nhiên — process.exit đua với keep-alive socket gây abort libuv trên Node 24/Windows
