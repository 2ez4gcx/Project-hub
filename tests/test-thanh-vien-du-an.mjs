/* Test THÀNH VIÊN THEO DỰ ÁN (audit 04/09: A6).
   Điều quan trọng nhất: người bị giới hạn phạm vi chỉ tải về phần mình được vào, và khi họ
   LƯU thì phần bị ẩn PHẢI còn nguyên — mô hình ghi cả khối rất dễ xóa mất dữ liệu ở đây.
   Chạy SAU test-authz.mjs.  Cách dùng: node tests/test-thanh-vien-du-an.mjs [BASE_URL] */
const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const api = (path, opts = {}, tok) => fetch(B + path, { ...opts, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}), ...(opts.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (email) => (await api("/api/login", { method: "POST", body: JSON.stringify({ email, password: "matkhau123" }) })).body.token;

const OWNER = await login("boss@test.vn");
const BINH = await login("binh@test.vn");     // nhân viên thường
const AN = await login("an@test.vn");         // teamlead
const doc = async (tok) => JSON.parse((await api("/api/kv?key=pm_shared_v3", {}, tok)).body.value);
const luu = (tok, st) => api("/api/kv", { method: "POST", body: JSON.stringify({ key: "pm_shared_v3", value: JSON.stringify(st) }) }, tok);
const binhId = (await api("/api/me", {}, BINH)).body.user.id;

// ── dựng 2 dự án: P1 (Bình là thành viên) và PX (Bình KHÔNG phải thành viên) ──
let st = await doc(OWNER);
const goc = { ...st, rev: st.rev + 1,
  projects: [...st.projects.map((p) => p.id === "P1" ? { ...p, members: [binhId] } : p),
             { id: "PX", name: "Dự án bí mật", color: "#000", createdAt: Date.now(), members: [] }],
  tasks: [...st.tasks,
    { id: "x1", projectId: "PX", sectionId: "", status: "todo", approver: "teamlead", title: "Việc mật số 1",
      description: "", priority: "high", assignees: [], primaryAssigneeId: null, workdone: 0, tags: [],
      completed: false, subtasks: [], comments: [], dueDate: "", startDate: "", duration: null, milestone: false,
      dependsOn: [], assignedAt: null, completedAt: null, reminderLead: null, reminderSentKey: "", recur: "none",
      createdAt: Date.now(), order: 500 }],
};
// PX chưa khai thành viên -> mở cho cả công ty; đặt members để khóa lại
goc.projects = goc.projects.map((p) => p.id === "PX" ? { ...p, members: ["khong-phai-binh"] } : p);
let r = await luu(OWNER, goc);
ok("Chủ sở hữu tạo dự án có danh sách thành viên", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 80));

// ── ĐỌC: Bình không thấy dự án ngoài phạm vi ──
const cuaBinh = await doc(BINH);
ok("Bình KHÔNG tải được dự án mình không thuộc", !cuaBinh.projects.some((p) => p.id === "PX"),
   JSON.stringify(cuaBinh.projects.map((p) => p.id)));
ok("Bình KHÔNG tải được công việc của dự án đó", !cuaBinh.tasks.some((x) => x.projectId === "PX"));
ok("Bình vẫn thấy dự án mình là thành viên", cuaBinh.projects.some((p) => p.id === "P1"));
ok("Bình vẫn thấy danh sách nhân sự công ty (cần để hiện tên)",
   ((await api("/api/accounts", {}, BINH)).body.accounts || []).length > 0);
const cuaChu = await doc(OWNER);
ok("Chủ sở hữu vẫn thấy đủ mọi dự án", cuaChu.projects.some((p) => p.id === "PX") && cuaChu.tasks.some((x) => x.id === "x1"));

// ── GHI: Bình lưu bản đã lọc -> dự án bị ẩn PHẢI CÒN NGUYÊN ──
const t1 = cuaBinh.tasks.find((x) => x.assignees && x.assignees.includes(binhId));
r = await luu(BINH, { ...cuaBinh, rev: cuaBinh.rev + 1,
  tasks: cuaBinh.tasks.map((x) => t1 && x.id === t1.id ? { ...x, workdone: 40 } : x) });
ok("Bình lưu được phần mình thấy", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 80));

const sauKhiLuu = await doc(OWNER);
ok("DỰ ÁN BỊ ẨN KHÔNG BỊ XÓA sau khi Bình lưu", sauKhiLuu.projects.some((p) => p.id === "PX"),
   JSON.stringify(sauKhiLuu.projects.map((p) => p.id)));
ok("CÔNG VIỆC BỊ ẨN KHÔNG BỊ XÓA", sauKhiLuu.tasks.some((x) => x.id === "x1"));
ok("thay đổi của Bình vẫn được ghi nhận", !t1 || sauKhiLuu.tasks.find((x) => x.id === t1.id).workdone === 40);

// ── Bình không thể tự chèn việc vào dự án ngoài phạm vi ──
const b2 = await doc(BINH);
r = await luu(BINH, { ...b2, rev: b2.rev + 1,
  tasks: [...b2.tasks, { ...b2.tasks[0], id: "chen-lau", projectId: "PX", title: "Việc chèn lậu" }] });
const sau2 = await doc(OWNER);
ok("việc Bình chèn vào dự án ngoài phạm vi bị bỏ qua", !sau2.tasks.some((x) => x.id === "chen-lau"),
   JSON.stringify(sau2.tasks.filter((x) => x.projectId === "PX").map((x) => x.id)));

// ── Bình không xóa được dự án ngoài phạm vi bằng cách bỏ nó khỏi mảng ──
const b3 = await doc(BINH);
r = await luu(BINH, { ...b3, rev: b3.rev + 1, projects: b3.projects.filter((p) => p.id !== "P1") });
const sau3 = await doc(OWNER);
ok("dự án bị ẩn vẫn còn dù Bình gửi lên mảng thiếu", sau3.projects.some((p) => p.id === "PX"));

// ── cổng tệp cũng theo thành viên dự án ──
const f = await api("/api/records?projectId=PX", {}, BINH);
ok("Bình không đọc được biên bản của dự án ngoài phạm vi",
   f.status === 403 || (f.body.records || []).length === 0, f.status + " " + JSON.stringify(f.body).slice(0, 60));
const f2 = await api("/api/records?projectId=PX", {}, AN);
ok("teamlead ngoài danh sách thành viên cũng không đọc được",
   f2.status === 403 || (f2.body.records || []).length === 0, f2.status);

// ── dự án KHÔNG khai thành viên vẫn mở cho cả công ty (không phá dữ liệu cũ) ──
st = await doc(OWNER);
r = await luu(OWNER, { ...st, rev: st.rev + 1, projects: st.projects.map((p) => p.id === "PX" ? { ...p, members: [] } : p) });
ok("bỏ danh sách thành viên của dự án", r.status === 200, r.status);
const b4 = await doc(BINH);
ok("dự án không khai thành viên -> mọi người thấy lại (giữ hành vi cũ)", b4.projects.some((p) => p.id === "PX"));

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
