/* ĐO TẢI (audit đợt 5, mục 30 ngày): mô phỏng N người dùng thật —
   poll /api/kv/rev mỗi 4s (± jitter), pull cả khối khi có bản mới, biên tập viên
   ghi định kỳ (xử lý 409 như client thật: pull rồi ghi lại), kèm upload tệp.
   Cách dùng:  node tests/test-tai.mjs [USERS=15] [TASKS=2000] [DURATION_S=60] [BASE]
   Chạy trên máy chủ MỚI (DATA_DIR trống, SETUP_CODE=TEST123). */
const USERS = Number(process.argv[2]) || 15;
const TASKS = Number(process.argv[3]) || 2000;
const DUR = (Number(process.argv[4]) || 60) * 1000;
const B = process.argv[5] || "http://localhost:3221";
const EDITORS = Math.max(2, Math.round(USERS / 3));

const api = (path, opts = {}, tok) => fetch(B + path, { ...opts, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}), ...(opts.headers || {}) } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (base, spread) => base + (Math.random() - 0.5) * 2 * spread;

const M = { revPoll: [], fullPull: [], write: [], upload: [], conflicts: 0, errors: 0, pulledBytes: 0, writes: 0, errDetail: {} };
const noteErr = (tag) => { M.errors++; M.errDetail[tag] = (M.errDetail[tag] || 0) + 1; };
const timed = async (arr, fn) => { const t0 = performance.now(); const out = await fn(); arr.push(performance.now() - t0); return out; };
const pct = (arr, p) => { if (!arr.length) return 0; const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(a.length * p))]; };
const fmt = (arr) => arr.length + " lần · p50 " + pct(arr, 0.5).toFixed(0) + "ms · p95 " + pct(arr, 0.95).toFixed(0) + "ms · max " + Math.max(0, ...arr).toFixed(0) + "ms";

// ---- chuẩn bị: tài khoản + dữ liệu nền ----
const su = await api("/api/setup", { method: "POST", body: JSON.stringify({ name: "Sep Tai", email: "boss@test.vn", password: "matkhau123", code: "TEST123" }) }).then((r) => r.json());
const OWNER = su.token;
if (!OWNER) { console.error("Setup thất bại (máy chủ phải mới tinh):", JSON.stringify(su)); process.exit(1); }
const toks = [OWNER];
for (let i = 1; i < USERS; i++) {
  const email = "u" + i + "@test.vn";
  await api("/api/accounts", { method: "POST", body: JSON.stringify({ name: "User " + i, email, password: "matkhau123", canAssign: i <= EDITORS }) }, OWNER);
  const lg = await api("/api/login", { method: "POST", body: JSON.stringify({ email, password: "matkhau123" }) }).then((r) => r.json());
  toks.push(lg.token);
}
const NPROJ = 20;
const projects = Array.from({ length: NPROJ }, (_, i) => ({ id: "P" + i, name: "Dự án số " + i + " — hạng mục thi công", color: "#f97316" }));
const sections = projects.map((p, i) => ({ id: "S" + i, projectId: p.id, name: "Cần làm", order: 0 }));
const tasks = Array.from({ length: TASKS }, (_, i) => ({
  id: "t" + i, projectId: "P" + (i % NPROJ), sectionId: "S" + (i % NPROJ), status: "doing", approver: "teamlead",
  title: "Công việc số " + i + " — tô trát hoàn thiện khu vực tầng " + (i % 9), description: "Mô tả chi tiết công việc, vật tư và yêu cầu nghiệm thu cho hạng mục.",
  priority: ["low", "medium", "high"][i % 3], assignees: [], workdone: i % 100, subtasks: [], comments: [], tags: ["đợt " + (i % 4)],
  dueDate: "2026-0" + ((i % 4) + 6) + "-1" + (i % 9),
}));
const history = Array.from({ length: 500 }, (_, i) => ({ id: "h" + i, ts: i, actor: "Sep Tai", action: "task_field", field: "workdone", taskTitle: "Công việc số " + i }));
let state = { projects, sections, tasks, history, dailyReports: [], trash: [], rev: 1, updatedBy: "seed" };
let seedRes = await api("/api/kv", { method: "POST", body: JSON.stringify({ key: "pm_shared_v3", value: JSON.stringify(state) }) }, OWNER);
const blobSize = JSON.stringify(state).length;
console.log("Nền: " + USERS + " người (" + EDITORS + " biên tập) · " + NPROJ + " dự án · " + TASKS + " việc · khối dữ liệu " + (blobSize / 1048576).toFixed(2) + " MB · seed " + seedRes.status);
// biên bản để upload
const rec = await api("/api/records", { method: "POST", body: JSON.stringify({ projectId: "P0", projectName: "Dự án số 0", date: "2026-08-17", type: "BB tải" }) }, OWNER).then((r) => r.json());
const FILE = Buffer.alloc(200 * 1024, 65); // 200KB

// ---- vòng đời client ----
const end = Date.now() + DUR;
async function reader(tok) {
  let known = 0;
  await sleep(Math.random() * 4000); // so le
  while (Date.now() < end) {
    try {
      const rv = await timed(M.revPoll, () => api("/api/kv/rev", {}, tok).then((r) => r.json()));
      if (rv.rev > known) {
        const full = await timed(M.fullPull, () => api("/api/kv?key=pm_shared_v3", {}, tok).then((r) => r.json()));
        M.pulledBytes += (full.value || "").length; known = rv.rev;
      }
    } catch (e) { noteErr("reader:" + (e.cause && e.cause.code || e.message).slice(0, 40)); }
    await sleep(jitter(4000, 500));
  }
}
async function editor(tok, idx) {
  let mine = null, myRev = 0;
  await sleep(1000 + Math.random() * 5000);
  while (Date.now() < end) {
    try {
      if (!mine) { const full = await api("/api/kv?key=pm_shared_v3", {}, tok).then((r) => r.json()); mine = JSON.parse(full.value); myRev = mine.rev; }
      const ti = Math.floor(Math.random() * TASKS);
      mine.tasks = mine.tasks.map((x) => x.id === "t" + ti ? { ...x, workdone: Math.min(100, (x.workdone || 0) + 1) } : x);
      mine.rev = myRev + 1; mine.updatedBy = "editor" + idx;
      const r = await timed(M.write, () => api("/api/kv", { method: "POST", body: JSON.stringify({ key: "pm_shared_v3", value: JSON.stringify(mine) }) }, tok));
      if (r.status === 409) { M.conflicts++; mine = null; continue; } // pull lại rồi ghi tiếp — như client thật
      if (r.status !== 200) { const body = await r.json().catch(() => ({})); noteErr("write:" + r.status + ":" + (body.error || "")); mine = null; }
      else { M.writes++; myRev = mine.rev; }
    } catch (e) { noteErr("editor:" + (e.cause && e.cause.code || e.message).slice(0, 40)); mine = null; }
    await sleep(jitter(12000, 5000));
  }
}
async function uploader(tok) {
  await sleep(3000);
  while (Date.now() < end) {
    try {
      const r = await timed(M.upload, () => fetch(B + "/api/records/file?recordId=" + rec.record.id + "&filename=tai.pdf", { method: "POST", headers: { Authorization: "Bearer " + tok, "Content-Type": "application/pdf" }, body: FILE }));
      if (r.status !== 200) noteErr("upload:" + r.status);
    } catch (e) { noteErr("uploader:" + (e.cause && e.cause.code || e.message).slice(0, 40)); }
    await sleep(10000);
  }
}

const jobs = toks.map((tok, i) => i > 0 && i <= EDITORS ? editor(tok, i) : reader(tok));
jobs.push(uploader(OWNER));
const t0 = Date.now();
await Promise.all(jobs);
const secs = (Date.now() - t0) / 1000;

console.log("\n===== KẾT QUẢ ĐO TẢI (" + secs.toFixed(0) + "s) =====");
console.log("Poll rev      : " + fmt(M.revPoll));
console.log("Pull cả khối  : " + fmt(M.fullPull) + " · tổng " + (M.pulledBytes / 1048576).toFixed(1) + " MB");
console.log("Ghi (write)   : " + fmt(M.write) + " · thành công " + M.writes + " · xung đột 409: " + M.conflicts);
console.log("Upload 200KB  : " + fmt(M.upload));
console.log("Lỗi khác      : " + M.errors + (M.errors ? " — " + JSON.stringify(M.errDetail) : ""));
const okGate = pct(M.revPoll, 0.95) < 200 && pct(M.fullPull, 0.95) < 2000 && pct(M.write, 0.95) < 2000 && M.errors === 0;
console.log(okGate ? "\n  ✔ ĐẠT ngưỡng (rev p95<200ms, pull p95<2s, write p95<2s, 0 lỗi)" : "\n  ✘ KHÔNG đạt ngưỡng — xem số liệu trên");
process.exitCode = okGate ? 0 : 1;
