/* KIỂM ĐỐI KHÁNG (06/09/2026) — chuyển từ probe.cjs của đợt re-audit độc lập v5.0.0 thành ca chạy trong cổng.
   Khác các bộ kia: tự dựng máy chủ riêng (DATA_DIR tạm, không tài khoản) để thử đua khi cài đặt, giả lỗi đĩa,
   giữ yêu cầu chưa gửi hết thân, công cụ reset mật khẩu. Mọi ca đều ĐỎ trên v5.0.0 và phải XANH từ v5.1.0.
   Cách dùng: node tests/test-doc-lap.mjs [PORT=3213] */
import { spawn, spawnSync } from "child_process";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync, chmodSync, mkdirSync, rmdirSync } from "fs";
import { tmpdir } from "os";
import net from "net";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const LOCAL = path.join(ROOT, "Chạy nội bộ"), NAS = path.join(ROOT, "Chạy trên NAS");
const PORT = Number(process.argv[2]) || 3213;
const B = "http://localhost:" + PORT;
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const J = JSON.stringify;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const api = (p, o = {}, t) => fetch(B + p, { ...o, headers: { "Content-Type": "application/json", ...(t ? { Authorization: "Bearer " + t } : {}), ...(o.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const clone = (x) => JSON.parse(J(x));

/* Yêu cầu "giữ thân": gửi đầu HTTP + Content-Length trước, thân gửi sau — mô phỏng máy trạm mạng chậm. */
function giuYeuCau(method, pathq, headers, bodyBuf, token) {
  const sock = net.connect(PORT, "127.0.0.1");
  let out = ""; let resolve; const done = new Promise((r) => { resolve = r; });
  sock.setEncoding("latin1");
  sock.on("data", (d) => { out += d; });
  sock.on("end", () => { const m = /^HTTP\/1\.[01] (\d{3})/.exec(out); const i = out.indexOf("\r\n\r\n"); let body = {}; try { body = JSON.parse(Buffer.from(out.slice(i + 4), "latin1").toString("utf8")); } catch {} resolve({ status: m ? Number(m[1]) : 0, body }); });
  sock.on("error", () => resolve({ status: 0, body: {} }));
  const head = [method + " " + pathq + " HTTP/1.1", "Host: localhost:" + PORT, "Connection: close", "Content-Length: " + bodyBuf.length,
    ...(token ? ["Authorization: Bearer " + token] : []), ...Object.entries(headers || {}).map(([k, v]) => k + ": " + v)].join("\r\n") + "\r\n\r\n";
  const ready = new Promise((r) => sock.once("connect", () => { sock.write(head); setTimeout(r, 150); }));
  return { ready, send: () => sock.write(bodyBuf), done };
}

/* ── dựng máy chủ riêng ── */
const tmp = mkdtempSync(path.join(tmpdir(), "tda-doclap-"));
const DATA = path.join(tmp, "data"); mkdirSync(DATA, { recursive: true });
const srv = spawn(process.execPath, [path.join(LOCAL, "server.js")], { env: { ...process.env, DATA_DIR: DATA, PORT: String(PORT), SETUP_CODE: "TEST123" }, stdio: "ignore" });
const cleanup = () => { try { srv.kill(); } catch {} try { rmSync(tmp, { recursive: true, force: true }); } catch {} };
process.on("exit", cleanup);
let up = false;
for (let i = 0; i < 40 && !up; i++) { try { const r = await fetch(B + "/api/config"); up = r.ok; } catch {} if (!up) await sleep(400); }
ok("máy chủ riêng khởi động (chưa có tài khoản)", up);
if (!up) { console.log("\nKẾT QUẢ: " + pass + " pass, " + fail + " fail"); process.exit(1); }

/* ══ 1. F01: đua khi cài đặt lần đầu ══ */
{
  const cho = giuYeuCau("POST", "/api/setup", { "Content-Type": "application/json" }, Buffer.from(J({ name: "Ke doi cho", email: "doi@doclap.vn", password: "matkhau123", code: "SAI" })));
  await cho.ready;
  const legit = await api("/api/setup", { method: "POST", body: J({ name: "Chu that", email: "boss@doclap.vn", password: "matkhau123", code: "TEST123" }) });
  ok("chủ sở hữu thật cài đặt -> 200", legit.status === 200 && !!legit.body.token, legit.status + " " + J(legit.body).slice(0, 80));
  cho.send(); const r2 = await cho.done;
  ok("F01: yêu cầu setup giữ sẵn (mã sai) gửi thân SAU khi đã có chủ -> bị từ chối", r2.status === 403, r2.status + " " + J(r2.body).slice(0, 80));
  const accs = JSON.parse(readFileSync(path.join(DATA, "accounts.json"), "utf8"));
  ok("F01: accounts.json vẫn chỉ có chủ sở hữu thật", accs.length === 1 && accs[0].email === "boss@doclap.vn", J(accs.map((a) => a.email)));
  const r3 = await api("/api/setup", { method: "POST", body: J({ name: "x", email: "y@doclap.vn", password: "matkhau123", code: "TEST123" }) });
  ok("setup lần hai (kể cả đúng mã cũ) -> 403 already_setup", r3.status === 403, r3.status);
}
const login = async (e, pw = "matkhau123") => (await api("/api/login", { method: "POST", body: J({ email: e, password: pw }) })).body.token;
const OWNER = await login("boss@doclap.vn");
const mk = (p) => api("/api/accounts", { method: "POST", body: J({ password: "matkhau123", ...p }) }, OWNER);
await mk({ name: "DL nhan vien", email: "nv@doclap.vn", dept: "Site" });
await mk({ name: "DL teamlead trong", email: "tl@doclap.vn", dept: "Site", isTeamlead: true, canAssign: true });
await mk({ name: "DL teamlead ngoai", email: "tl2@doclap.vn", dept: "Site", isTeamlead: true, canAssign: true });
await mk({ name: "DL QS", email: "qs@doclap.vn", dept: "QS", canViewFinance: true, canEditFinance: true });
const NV = await login("nv@doclap.vn"), TL2 = await login("tl2@doclap.vn"), QS = await login("qs@doclap.vn");
const accs = (await api("/api/accounts", {}, OWNER)).body.accounts; const idOf = (em) => (accs.find((a) => a.email === em) || {}).id;
const nvId = idOf("nv@doclap.vn"), tlId = idOf("tl@doclap.vn"), qsId = idOf("qs@doclap.vn");
const doc = async (t) => JSON.parse((await api("/api/kv?key=pm_shared_v3", {}, t)).body.value || "{}");
const luu = (t, st) => api("/api/kv", { method: "POST", body: J({ key: "pm_shared_v3", value: J(st) }) }, t);
const T = (id, pid, over = {}) => ({ id, projectId: pid, sectionId: "S_" + pid, status: "todo", approver: "teamlead", title: "Viec " + id, description: "", priority: "medium", assignees: [], primaryAssigneeId: null, workdone: 0, tags: [], completed: false, subtasks: [], comments: [], startDate: "2026-09-01", dueDate: "2026-09-05", duration: 5, milestone: false, dependsOn: [], reminderLead: null, reminderSentKey: "", recur: "none", recurSpawned: false, createdAt: 1, order: 0, ...over });
const goc = { rev: 1, projects: [{ id: "p", name: "DL du an P", color: "#0a0", siteLoggers: [nvId], members: [nvId, tlId, qsId] }, { id: "q", name: "DL du an Q", color: "#00a" }],
  sections: [{ id: "S_p", projectId: "p", name: "GD", order: 0 }, { id: "S_q", projectId: "q", name: "GD", order: 0 }],
  tasks: [T("t", "p", { title: "Hop tuan", recur: "weekly", status: "done", completed: true, workdone: 100, approvedBy: "Ai do", assignees: [nvId], primaryAssigneeId: nvId }),
          T("t2", "p", { title: "Kiem tra thang", recur: "monthly", assignees: [nvId], primaryAssigneeId: nvId }),
          T("t3", "q", { assignees: [nvId], primaryAssigneeId: nvId })],
  history: [], dailyReports: [], trash: [] };
let r = await luu(OWNER, goc); ok("dựng dữ liệu nền (rev 1)", r.status === 200, r.status + J(r.body));
const ownerSave = async (mut) => { const st = await doc(OWNER); const out = mut(st) || st; out.rev = st.rev + 1; const rr = await luu(OWNER, out); if (rr.status !== 200) console.log("   (owner save " + rr.status + " " + J(rr.body).slice(0, 120) + ")"); return rr; };

/* ══ 2. F02 / F04: thiếu rev, id trùng ══ */
{
  const st = await doc(OWNER); const khongRev = clone(st); delete khongRev.rev; khongRev.tasks[2].workdone = 20;
  r = await luu(OWNER, khongRev);
  ok("F02: khối dữ liệu KHÔNG có rev -> 400 missing_rev, không ghi", r.status === 400 && r.body.error === "missing_rev" && (await doc(OWNER)).tasks[2].workdone === 0, r.status + " " + J(r.body).slice(0, 80));
  const trung = clone(await doc(OWNER)); trung.rev++; trung.tasks.unshift({ ...clone(trung.tasks.find((x) => x.id === "t3")), title: "Ban trung id" });
  r = await luu(OWNER, trung);
  const sau = await doc(OWNER);
  ok("F04: hai việc cùng id -> 400 bad_shape, máy chủ vẫn chỉ có một bản", r.status === 400 && sau.tasks.filter((x) => x.id === "t3").length === 1, r.status + " " + J(r.body).slice(0, 80));
  const thieu = clone(sau); thieu.rev++; thieu.tasks.push({ ...T("", "p"), id: "" });
  r = await luu(OWNER, thieu);
  ok("F04: việc không có id -> 400 bad_shape", r.status === 400, r.status);
}

/* ══ 3. F03: nhánh việc lặp ══ */
{
  let st = await doc(NV); st.rev++;
  const src = st.tasks.find((x) => x.id === "t"); src.recurSpawned = true;
  st.tasks.push({ ...clone(src), id: "gia1", recurSpawned: false, status: "done", completed: true, workdone: 100, approvedBy: "Tu duyet", description: "noi dung la" });
  r = await luu(NV, st);
  ok("F03: nhân viên giả việc lặp 'đã hoàn thành 100%' -> 403", r.status === 403 && !(await doc(OWNER)).tasks.some((x) => x.id === "gia1"), r.status + " " + J(r.body).slice(0, 100));
  st = await doc(NV); st.rev++;
  const src2 = st.tasks.find((x) => x.id === "t2"); src2.recurSpawned = true;   // nguồn CHƯA xong
  st.tasks.push({ ...clone(src2), id: "gia2", recurSpawned: false, status: "todo", workdone: 0, completed: false, approvedBy: "", comments: [], startDate: "2026-10-01", dueDate: "2026-10-05" });
  r = await luu(NV, st);
  ok("F03: sinh việc lặp từ nguồn CHƯA hoàn thành -> 403", r.status === 403, r.status + " " + J(r.body).slice(0, 100));
  st = await doc(NV); st.rev++;
  const src3 = st.tasks.find((x) => x.id === "t"); src3.recurSpawned = true;
  st.tasks.push({ ...clone(src3), id: "thatlap", recurSpawned: false, status: "todo", completed: false, completedAt: null, approvedBy: "", workdone: 0, reminderSentKey: "", comments: [], actualStart: "", actualFinish: "", startDate: "2026-09-08", dueDate: "2026-09-12", createdAt: Date.now() });
  r = await luu(NV, st);
  ok("F03: sinh việc lặp ĐÚNG mẫu (todo, 0%, sao chép nguồn đã xong) -> 200", r.status === 200 && (await doc(OWNER)).tasks.some((x) => x.id === "thatlap" && x.status === "todo"), r.status + " " + J(r.body).slice(0, 100));
  r = await ownerSave((st2) => { const nguon = st2.tasks.find((x) => x.id === "thatlap"); nguon.status = "done"; nguon.completed = true; nguon.workdone = 100; nguon.approvedBy = "Chu"; });
  ok("(chủ duyệt xong việc lặp -> 200)", r.status === 200, r.status + J(r.body).slice(0, 80));
  st = await doc(NV); st.rev++;
  const n2 = st.tasks.find((x) => x.id === "thatlap"); n2.recurSpawned = true;
  st.tasks.push({ ...clone(n2), id: "lapdoiDuAn", recurSpawned: false, status: "todo", completed: false, completedAt: null, approvedBy: "", workdone: 0, comments: [], actualStart: "", actualFinish: "", projectId: "q", sectionId: "S_q", startDate: "2026-09-15", dueDate: "2026-09-19" });
  r = await luu(NV, st);
  ok("F03: việc lặp sinh ra đổi sang dự án khác -> 403", r.status === 403, r.status + " " + J(r.body).slice(0, 100));
}

/* ══ 4. N01 / N02: tài chính ══ */
{
  const getF = async (t) => (await api("/api/finance", {}, t)).body;
  let f = await getF(OWNER);
  f.boq = { p: { items: [{ id: "i", ten: "A", donVi: "m", laNhom: false, khoiLuong: 1, donGia: 1, taskIds: [] }], kys: [] }, q: { items: [{ id: "j", ten: "B", donVi: "m", laNhom: false, khoiLuong: 1, donGia: 1, taskIds: [] }], kys: [] } };
  r = await api("/api/finance", { method: "POST", body: J({ ...f, expectedRev: f.rev }) }, OWNER); ok("(dựng BOQ p, q)", r.status === 200, r.status + J(r.body).slice(0, 80));
  const cu = clone(await getF(QS));                       // QS tải lúc rev r0
  const moi = clone(cu); moi.boq.q.items[0].donGia = 2;
  r = await api("/api/finance", { method: "POST", body: J({ ...moi, expectedRev: moi.rev }) }, OWNER); ok("(chủ sửa dự án Q -> rev tăng)", r.status === 200, r.status);
  const cuA = clone(cu); cuA.boq.p.items[0].donGia = 3;
  r = await api("/api/finance", { method: "POST", body: J({ ...cuA, expectedRev: cu.rev }) }, QS);
  let f2 = await getF(OWNER);
  ok("N02: QS sửa P bằng bản cũ (Q đã bị người khác đổi, QS không đụng Q) -> 200, giữ cả P=3 lẫn Q=2", r.status === 200 && f2.boq.p.items[0].donGia === 3 && f2.boq.q.items[0].donGia === 2, r.status + " " + J(r.body).slice(0, 80) + " P=" + f2.boq.p.items[0].donGia + " Q=" + f2.boq.q.items[0].donGia);
  const cuQ = clone(cu); cuQ.boq.q.items[0].donGia = 5;
  r = await api("/api/finance", { method: "POST", body: J({ ...cuQ, expectedRev: cu.rev }) }, QS);
  ok("N02: cùng bản cũ mà sửa đúng Q (người khác vừa đổi) -> 409 conflict nêu tên Q", r.status === 409 && J(r.body.projects) === J(["q"]), r.status + " " + J(r.body).slice(0, 80));
  f2 = await getF(OWNER);
  r = await api("/api/finance", { method: "POST", body: J({ ...cuQ, expectedRev: 1e300 }) }, OWNER);
  const f3 = await getF(OWNER);
  ok("N01: expectedRev 'tương lai' (1e300) -> 409, không đưa Q về bản cũ", r.status === 409 && f3.boq.q.items[0].donGia === 2, r.status + " Q=" + f3.boq.q.items[0].donGia);
  r = await api("/api/finance", { method: "POST", body: J({ ...f2, expectedRev: 1.5 }) }, OWNER);
  ok("N01: expectedRev không nguyên -> 400", r.status === 400, r.status);
  r = await api("/api/finance", { method: "POST", body: J({ ...f2, expectedRev: -1 }) }, OWNER);
  ok("N01: expectedRev âm -> 400", r.status === 400, r.status);
  r = await api("/api/finance", { method: "POST", body: J({ ...f2, expectedRev: f2.rev }) }, OWNER);
  ok("lưu bình thường với đúng rev -> 200", r.status === 200, r.status);
}

/* ══ 5. F05: tải tệp giữ thân trong lúc duyệt / hai tệp song song ══ */
{
  r = await api("/api/sitelogs", { method: "POST", body: J({ projectId: "p", projectName: "DL du an P", date: "2026-09-06", work: "Doc lap", trangThai: "danop" }) }, NV);
  const lid = r.body.log && r.body.log.id; ok("(nv lập nhật ký)", !!lid, J(r.body).slice(0, 80));
  const up = giuYeuCau("POST", "/api/sitelogs/photo?logId=" + lid + "&filename=a.png", { "Content-Type": "image/png" }, Buffer.from("PNG_GIA_10"), NV);
  await up.ready;
  r = await api("/api/sitelogs/approve", { method: "POST", body: J({ id: lid, duyet: true }) }, OWNER); ok("(chủ duyệt nhật ký trong lúc ảnh đang tải)", r.status === 200, r.status + J(r.body).slice(0, 80));
  up.send(); const ur = await up.done;
  const lg = (await api("/api/sitelogs?projectId=p", {}, OWNER)).body.logs.find((x) => x.id === lid);
  ok("F05: ảnh tải xong SAU khi duyệt -> 409 sitelog_locked, nhật ký vẫn 'đã duyệt' còn tên người duyệt", ur.status === 409 && lg.trangThai === "daduyet" && !!lg.duyetBoi && (lg.photos || []).length === 0, ur.status + " " + lg.trangThai + " " + (lg.duyetBoi || "-") + " photos=" + (lg.photos || []).length);
  r = await api("/api/records", { method: "POST", body: J({ projectId: "p", projectName: "DL du an P", date: "2026-09-06", type: "BB", note: "song song" }) }, NV);
  const rid = r.body.record && r.body.record.id; ok("(nv lập biên bản)", !!rid, J(r.body).slice(0, 80));
  const a = giuYeuCau("POST", "/api/records/file?recordId=" + rid + "&filename=a.txt", { "Content-Type": "text/plain" }, Buffer.from("FILE A"), NV);
  const b = giuYeuCau("POST", "/api/records/file?recordId=" + rid + "&filename=b.txt", { "Content-Type": "text/plain" }, Buffer.from("FILE B"), NV);
  await a.ready; await b.ready;
  a.send(); const ra = await a.done; b.send(); const rb = await b.done;
  const rec = (await api("/api/records?projectId=p", {}, OWNER)).body.records.find((x) => x.id === rid);
  ok("F05: hai tệp biên bản tải song song -> giữ đủ 2 tệp", ra.status === 200 && rb.status === 200 && rec.files.length === 2, ra.status + "/" + rb.status + " files=" + rec.files.length);
}

/* ══ 6. F06: ghi đĩa hỏng phải báo lỗi, không được 'lưu giả' ══ */
{
  const DJ = path.join(DATA, "data.json"); const truoc = readFileSync(DJ, "utf8");
  mkdirSync(DJ + ".tmp"); chmodSync(DJ, 0o444);            // ghi .tmp hỏng (là thư mục) + ghi thẳng hỏng (chỉ đọc)
  let st = await doc(OWNER); st.rev++; st.tasks[2].title = "Chua luu duoc";
  r = await luu(OWNER, st);
  const trongLucHong = await doc(OWNER);
  chmodSync(DJ, 0o644); try { rmdirSync(DJ + ".tmp"); } catch {}
  ok("F06: không ghi được đĩa -> 507 write_failed, API không trả giá trị 'đã lưu'", r.status === 507 && r.body.error === "write_failed" && trongLucHong.tasks[2].title !== "Chua luu duoc", r.status + " " + J(r.body).slice(0, 100) + " title=" + trongLucHong.tasks[2].title);
  ok("F06: đĩa vẫn giữ nguyên bản trước", readFileSync(DJ, "utf8") === truoc);
  st = await doc(OWNER); st.rev++; st.tasks[2].title = "Luu lai duoc";
  r = await luu(OWNER, st);
  ok("sau khi đĩa ghi lại được -> 200, dữ liệu mới có mặt", r.status === 200 && (await doc(OWNER)).tasks[2].title === "Luu lai duoc", r.status + J(r.body).slice(0, 80));
}

/* ══ 7. F07: phạm vi hồ sơ khi bị gỡ quyền / dự án vào thùng rác ══ */
{
  r = await api("/api/records", { method: "POST", body: J({ projectId: "p", projectName: "DL du an P", date: "2026-09-05", type: "BB", note: "cua nv" }) }, NV);
  const rid = r.body.record.id;
  await ownerSave((st) => { st.projects.find((x) => x.id === "p").members = [tlId]; });   // gỡ nv khỏi dự án
  r = await api("/api/records/delete", { method: "POST", body: J({ id: rid, reason: "thu" }) }, NV);
  const con = (await api("/api/records?projectId=p", {}, OWNER)).body.records.some((x) => x.id === rid);
  ok("F07a: người lập đã bị gỡ khỏi dự án xóa biên bản -> 403, hồ sơ còn nguyên", r.status === 403 && con, r.status + " con=" + con);
  await ownerSave((st) => { st.projects.find((x) => x.id === "p").members = [nvId, tlId, qsId]; });
  const truoc = (await api("/api/records?projectId=p", {}, TL2)).body.records || [];
  ok("(Teamlead ngoài dự án giới hạn thấy 0 hồ sơ khi dự án còn hoạt động)", truoc.length === 0, String(truoc.length));
  await ownerSave((st) => { const pr = st.projects.find((x) => x.id === "p"); st.trash = [{ id: "p", name: pr.name, deletedAt: Date.now(), deletedBy: "chu", project: pr, sections: st.sections.filter((s) => s.projectId === "p"), tasks: st.tasks.filter((x) => x.projectId === "p") }, ...st.trash]; st.projects = st.projects.filter((x) => x.id !== "p"); st.sections = st.sections.filter((s) => s.projectId !== "p"); st.tasks = st.tasks.filter((x) => x.projectId !== "p"); });
  const sauRac = (await api("/api/records?projectId=p", {}, TL2)).body.records || [];
  const sauRac2 = (await api("/api/records?projectId=p&trash=1", {}, TL2)).body.records || [];
  ok("F07b: dự án vào thùng rác -> Teamlead ngoài dự án vẫn KHÔNG thấy hồ sơ của nó", sauRac.length === 0 && sauRac2.length === 0, sauRac.length + "/" + sauRac2.length);
  const chuThay = (await api("/api/records?projectId=p", {}, OWNER)).body.records || [];
  ok("(Chủ sở hữu vẫn thấy hồ sơ của dự án trong thùng rác)", chuThay.length >= 1, String(chuThay.length));
  await ownerSave((st) => { const e = st.trash.find((x) => x.id === "p"); st.projects.push(e.project); st.sections.push(...e.sections); st.tasks.push(...e.tasks); st.trash = st.trash.filter((x) => x.id !== "p"); });
  ok("(khôi phục dự án p)", (await doc(OWNER)).projects.some((x) => x.id === "p"));
}

/* ══ 8. N06: thông báo lọc theo phạm vi hiện tại ══ */
{
  await ownerSave((st) => { const t3 = st.tasks.find((x) => x.id === "t3"); t3.assignees = []; t3.primaryAssigneeId = null; const pr = st.projects.find((x) => x.id === "q"); pr.members = [nvId, tlId]; });
  await ownerSave((st) => { const t3 = st.tasks.find((x) => x.id === "t3"); t3.title = "Viec bi mat cua Q"; t3.assignees = [nvId]; t3.primaryAssigneeId = nvId; });   // giao việc -> thông báo
  let n = (await api("/api/notifications", {}, NV)).body.items || [];
  ok("(nv có thông báo giao việc của dự án q)", n.some((x) => x.projectId === "q"), J(n.map((x) => x.text)).slice(0, 160));
  await ownerSave((st) => { const pr = st.projects.find((x) => x.id === "q"); pr.members = [tlId]; const t3 = st.tasks.find((x) => x.id === "t3"); t3.assignees = []; t3.primaryAssigneeId = null; });
  n = (await api("/api/notifications", {}, NV)).body.items || [];
  ok("N06: sau khi bị gỡ khỏi dự án q -> /api/notifications không còn trả thông báo của q", !n.some((x) => x.projectId === "q"), J(n.map((x) => x.text)).slice(0, 160));
  await ownerSave((st) => { const pr = st.projects.find((x) => x.id === "q"); delete pr.members; });
}

/* ══ 9. /api/feedback có giới hạn tần suất ══ */
{
  let last = 0;
  for (let i = 0; i < 11; i++) { const rr = await api("/api/feedback", { method: "POST", body: J({ text: "gop y " + i, view: "test" }) }, NV); last = rr.status; }
  ok("góp ý lần thứ 11 trong một giờ -> 429", last === 429, String(last));
}

/* ══ 10. F08: reset-password.js vô hiệu phiên cũ ══ */
{
  const me0 = await api("/api/me", {}, NV); ok("(token nv đang dùng được)", me0.status === 200, me0.status);
  const rs = spawnSync(process.execPath, [path.join(LOCAL, "reset-password.js"), "nv@doclap.vn", "MatKhauMoi123"], { encoding: "utf8", env: { ...process.env, DATA_DIR: DATA } });
  ok("(công cụ reset chạy xong, mã 0)", rs.status === 0, (rs.stdout + rs.stderr).slice(-200));
  const me1 = await api("/api/me", {}, NV);
  ok("F08: token cũ sau khi reset mật khẩu bằng công cụ -> 401", me1.status === 401, String(me1.status));
  const tokMoi = await login("nv@doclap.vn", "MatKhauMoi123");
  ok("mật khẩu mới đăng nhập được", !!tokMoi);
  const doi = await api("/api/password", { method: "POST", body: J({ oldPassword: "MatKhauMoi123", newPassword: "MatKhauMoi456" }) }, tokMoi);
  const meSau = await api("/api/me", {}, tokMoi);
  ok("đổi mật khẩu trong app: phiên hiện tại vẫn dùng được", doi.status === 200 && meSau.status === 200, doi.status + "/" + meSau.status);
}

/* ══ 11. Kiểm tĩnh: đóng gói, Docker, cập nhật, PWA, lockfile ══ */
{
  const { skip } = await import(pathToFileURL(path.join(ROOT, "build", "loai-tru.mjs")).href);
  const bi = ["data-saoluu-20260906-2200/accounts.json", "accounts.json", "accounts.json.bak-2026-09-06", "sessions.json", "tls/key.pem", "tls/server.pfx", "data/x.json", ".env.local", "snapshots/2026-09-06/data.json", "security.log"];
  const giu = ["server.js", "public/app.js", "package.json", "reset-password.js", "Cập nhật phiên bản (Windows).bat"];
  ok("N05: bộ đóng gói loại mọi tên tệp nhạy cảm (" + bi.length + " mẫu)", bi.every((x) => skip(x, true)), bi.filter((x) => !skip(x, true)).join(", "));
  ok("N05: bộ đóng gói vẫn giữ tệp chương trình", giu.every((x) => !skip(x, true)), giu.filter((x) => skip(x, true)).join(", "));
  for (const dir of [LOCAL, NAS]) {
    const html = readFileSync(path.join(dir, "public", "index.html"), "utf8");
    const inline = /<script(?![^>]*\bsrc=)[^>]*>/i.test(html);
    ok("N03: " + path.basename(dir) + "/index.html không còn script nội tuyến (CSP script-src 'self' chặn), đăng ký PWA qua sw-register.js", !inline && /sw-register\.js\?v=[0-9a-f]{8}/.test(html) && existsSync(path.join(dir, "public", "sw-register.js")), inline ? "còn <script> nội tuyến" : "thiếu sw-register.js?v=hash");
    const pkg = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8")), lock = JSON.parse(readFileSync(path.join(dir, "package-lock.json"), "utf8"));
    ok("F11: " + path.basename(dir) + " package-lock.json ghi đúng version " + pkg.version, lock.version === pkg.version && lock.packages && lock.packages[""] && lock.packages[""].version === pkg.version, lock.version);
  }
  const sh = readFileSync(path.join(NAS, "cap-nhat.sh"), "utf8");
  ok("N04: cap-nhat.sh hướng dẫn 'docker compose up -d --build' (restart không nạp mã mới)", sh.includes("Docker:   docker compose up -d --build") && !sh.includes("Docker:   docker compose restart"));
  const df = readFileSync(path.join(NAS, "Dockerfile"), "utf8");
  ok("F11: Dockerfile dùng Node còn hỗ trợ (24)", /^FROM node:24-alpine/m.test(df), df.split("\n")[0]);
  ok("F12: có .dockerignore loại data / data-saoluu / .env", existsSync(path.join(NAS, ".dockerignore")) && ["data", "data-saoluu", ".env"].every((k) => readFileSync(path.join(NAS, ".dockerignore"), "utf8").includes(k)));
  ok("F12: healthcheck thử cả HTTPS lẫn HTTP", /https:\/\/localhost:3000/.test(df) && /http:\/\/localhost:3000/.test(df));
  const csp = (await fetch(B + "/")).headers.get("content-security-policy") || "";
  ok("CSP vẫn giữ script-src 'self' (không nới unsafe-inline)", /script-src[^;]*'self'/.test(csp) && !/script-src[^;]*unsafe-inline/.test(csp), csp.slice(0, 120));
}

console.log("\nKẾT QUẢ: " + pass + " pass, " + fail + " fail");
cleanup();
process.exit(fail ? 1 : 0);
