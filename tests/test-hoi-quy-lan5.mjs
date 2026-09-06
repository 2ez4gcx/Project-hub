/* Test cho "KIỂM TRA TOÀN BỘ" 06/09 (v4.2.3 -> v4.3.0): 15 điểm tìm bằng bất biến + ma trận endpoint.
   Khác các bộ hồi quy trước: mỗi ca ở đây là một ô của ma trận vai trò × phạm vi × trạng thái, và có
   nhóm "bất biến" chạy chung cho mọi vai trò (không rò rỉ, không ghi đè, không từ chối sai).
   Tự tạo tài khoản và dự án riêng (P5*). Cách dùng: node tests/test-hoi-quy-lan5.mjs [BASE_URL] */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const api = (p, o = {}, t) => fetch(B + p, { ...o, headers: { "Content-Type": "application/json", ...(t ? { Authorization: "Bearer " + t } : {}), ...(o.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (e) => (await api("/api/login", { method: "POST", body: JSON.stringify({ email: e, password: "matkhau123" }) })).body.token;
const J = (x) => JSON.stringify(x);
const OWNER = await login("boss@test.vn");
const mk = (p) => api("/api/accounts", { method: "POST", body: J({ password: "matkhau123", ...p }) }, OWNER);
await mk({ name: "QS lan 5", email: "qs5@test.vn", dept: "QS", canViewFinance: true, canEditFinance: true });
await mk({ name: "Teamlead lan 5", email: "tl5@test.vn", dept: "Site", canAssign: true, isTeamlead: true });
await mk({ name: "Nhan vien lan 5", email: "nv5@test.vn", dept: "Site" });
await mk({ name: "Quan ly TK lan 5", email: "mgr5@test.vn", canManageMembers: true });
await mk({ name: "Lanh dao lan 5", email: "ld5@test.vn", isLeader: true, canAssign: true });
const QS = await login("qs5@test.vn"), TL = await login("tl5@test.vn"), NV = await login("nv5@test.vn"), MGR = await login("mgr5@test.vn"), LD = await login("ld5@test.vn");
const accs = (await api("/api/accounts", {}, OWNER)).body.accounts; const idOf = (em) => accs.find((a) => a.email === em).id;
const bossId = idOf("boss@test.vn"), nvId = idOf("nv5@test.vn"), tlId = idOf("tl5@test.vn"), mgrId = idOf("mgr5@test.vn");
const doc = async (t) => JSON.parse((await api("/api/kv?key=pm_shared_v3", {}, t)).body.value);
const luu = (t, st) => api("/api/kv", { method: "POST", body: J({ key: "pm_shared_v3", value: J(st) }) }, t);
const ownerSave = async (mut) => { const st = await doc(OWNER); const r = mut(st); const moi = { ...(r || st), rev: st.rev + 1 }; const res = await luu(OWNER, moi); if (res.status !== 200) console.log("   (owner save " + res.status + " " + J(res.body).slice(0, 100) + ")"); return res; };
const T = (id, pid, over = {}) => ({ id, projectId: pid, sectionId: "S5_" + pid, status: "todo", approver: "teamlead", title: "Viec " + id, description: "", priority: "medium", assignees: [], primaryAssigneeId: null, workdone: 0, tags: [], completed: false, subtasks: [], comments: [], dueDate: "", startDate: "", duration: null, milestone: false, dependsOn: [], assignedAt: null, completedAt: null, reminderLead: null, reminderSentKey: "", recur: "none", createdAt: Date.now(), order: 1, ...over });
const now = Date.now();
const getF = async (t) => (await api("/api/finance", {}, t));
const putF = (t, f) => api("/api/finance", { method: "POST", body: J({ ...f, expectedRev: f.rev }) }, t);

/* ══════ Dựng cảnh: P5A mở (nv5 ghi nhật ký); P5H giới hạn [boss] có việc h1, h2 (h2 trong thùng rác);
          P5X giới hạn đã xóa vào thùng rác + mục lịch sử KHÔNG projectId mang tên nó ══════ */
await ownerSave((st) => {
  st.projects = st.projects.filter((p) => !p.id.startsWith("P5")).concat([
    { id: "P5A", name: "Du an mo lan 5", color: "#0a0", siteLoggers: [nvId] },
    { id: "P5H", name: "Du an an lan 5", color: "#a00", members: [bossId] }]);
  st.sections = st.sections.filter((s) => !String(s.projectId).startsWith("P5")).concat([{ id: "S5_P5A", projectId: "P5A", name: "GD", order: 0 }, { id: "S5_P5H", projectId: "P5H", name: "GD", order: 0 }]);
  st.tasks = st.tasks.filter((x) => !String(x.projectId).startsWith("P5")).concat([T("a1", "P5A"), T("a2", "P5A"), T("h1", "P5H", { title: "VIEC AN L5" })]);
  st.trash = st.trash.filter((e) => !["h2", "P5X"].includes(e.id));
  st.trash.unshift({ id: "h2", kind: "task", name: "VIEC AN DA XOA L5", projectId: "P5H", deletedAt: now, deletedBy: "boss", task: T("h2", "P5H", { title: "VIEC AN DA XOA L5" }) });
  const px = { id: "P5X", name: "Du an an da xoa L5", color: "#000", members: [bossId] };
  st.trash.unshift({ id: "P5X", name: px.name, deletedAt: now, deletedBy: "boss", project: px, sections: [], tasks: [] });
  st.history = st.history.filter((h) => !String(h.id).startsWith("h5_"));
  st.history.unshift({ id: "h5_del", ts: now, actor: "Chu So Huu", action: "project_delete", projectName: "Du an an da xoa L5" });
  st.history.unshift({ id: "h5_purge", ts: now + 1, actor: "Chu So Huu", action: "trash_purge", projectName: "Du an an lan 5", to: "dự án" });
  st.dailyReports = (st.dailyReports || []).filter((r) => !String(r.id).startsWith("rep5"));
  st.dailyReports.push({ id: "rep5boss", memberId: bossId, memberName: "Chu So Huu", dept: "", date: "2026-09-06", items: [
    { id: "r5a", taskId: "h1", taskTitle: "VIEC AN L5", moTa: "dong an", pct: 10, vuongMac: "" },
    { id: "r5b", taskId: "h2", taskTitle: "VIEC AN DA XOA L5", moTa: "dong tro toi viec an trong thung rac", pct: 20, vuongMac: "" },
    { id: "r5c", taskId: "a1", taskTitle: "Viec a1", moTa: "dong mo", pct: 30, vuongMac: "" }], comments: [], submittedAt: now, updatedAt: now });
});
{ const f = (await getF(OWNER)).body;
  f.boq = { ...(f.boq || {}), P5H: { items: [{ id: "L5", stt: "1", ten: "HANG MUC AN L5", donVi: "m3", khoiLuong: 5, donGia: 100, taskIds: [] }], kys: [{ id: "k5H", soKy: 1, denNgay: "2026-09-01", kl: { L5: 5 }, khoa: true }] },
    P5A: { items: [{ id: "A5", stt: "1", ten: "Hang muc mo", donVi: "m2", khoiLuong: 10, donGia: 50, taskIds: [] }], kys: [{ id: "k5A", soKy: 1, denNgay: "2026-09-01", kl: { A5: 4 }, khoa: true }] } };
  f.chiPhi = { ...(f.chiPhi || {}), P5H: [{ id: "cp5H", ngay: "2026-09-01", nhom: "vattu", moTa: "CHI PHI AN L5", soTien: 111 }] };
  const r = await putF(OWNER, f); ok("dựng cảnh tài chính (kỳ khóa ở dự án ẩn P5H và dự án mở P5A)", r.status === 200, r.status + " " + J(r.body)); }

/* ══════ BẤT BIẾN cho từng người ngoài P5H ══════ */
const DAU = ["P5H", "Du an an lan 5", "VIEC AN L5", "VIEC AN DA XOA L5", "Du an an da xoa L5", "HANG MUC AN L5", "CHI PHI AN L5", "dong an", "dong tro toi viec an"];
const anCua = (st) => J({ p: st.projects.find((p) => p.id === "P5H"), t: st.tasks.filter((x) => x.projectId === "P5H"), r: st.trash.filter((e) => e.id === "h2" || e.id === "P5X"), h: st.history.filter((h) => String(h.id).startsWith("h5_")), rep: (st.dailyReports.find((r) => r.id === "rep5boss") || {}).items });
const truoc = anCua(await doc(OWNER));
for (const [ten, tok, tc] of [["qs5 (tài chính)", QS, true], ["tl5 (teamlead Site)", TL, false], ["nv5 (nhân viên)", NV, false]]) {
  const raw = (await api("/api/kv?key=pm_shared_v3", {}, tok)).body.value; const ro = DAU.filter((d) => raw.includes(d));
  ok("I1 " + ten + ": /api/kv không rò rỉ dấu vết P5H / P5X (kể cả lịch sử 'đã xóa dự án' cũ không projectId)", ro.length === 0, "thấy: " + ro.join(", "));
  const st = JSON.parse(raw); st.rev++; const r = await luu(tok, st);
  ok("I3 " + ten + ": lưu không-đổi-gì -> 200", r.status === 200, r.status + " " + J(r.body).slice(0, 120));
  ok("I2 " + ten + ": dữ liệu ẩn còn nguyên sau khi lưu", anCua(await doc(OWNER)) === truoc);
  if (tc) {
    const rf = await getF(tok); const roF = DAU.filter((d) => J(rf.body).includes(d));
    ok("I1-TC " + ten + ": tài chính không rò rỉ", rf.status === 200 && roF.length === 0, rf.status + " " + roF.join(","));
    const rp = await putF(tok, rf.body);
    ok("G1 " + ten + ": lưu tài chính không-đổi-gì -> 200 dù dự án ẩn có kỳ khóa (trước: 403 'đã khóa — không xóa được')", rp.status === 200, rp.status + " " + J(rp.body).slice(0, 120));
    const fo = (await getF(OWNER)).body;
    ok("G1 " + ten + ": kỳ khóa của dự án ẩn còn nguyên (khoa + dgKhoa)", fo.boq.P5H.kys[0].khoa === true && !!fo.boq.P5H.kys[0].dgKhoa, J(fo.boq.P5H.kys[0]).slice(0, 120));
  }
}
{ const f = (await getF(QS)).body; f.boq.P5A.kys = [];
  const r = await putF(QS, f); ok("G1: khóa kỳ vẫn được thực thi trên dự án QS thấy (xóa kỳ khóa P5A -> 403)", r.status === 403 && r.body.error === "period_locked", r.status + " " + J(r.body).slice(0, 100)); }

/* ══════ K1: người bị giới hạn tạo dự án mới ══════ */
{ const st = await doc(TL); st.rev++;
  st.projects.push({ id: "P5M", name: "Du an moi cua tl5", color: "#111" });
  st.sections.push({ id: "S5_P5M", projectId: "P5M", name: "GD1", order: 0 });
  st.tasks.push(T("m1", "P5M"));
  st.history.unshift({ id: "h5_moi", ts: now + 5, actor: "Teamlead lan 5", action: "project_create", projectId: "P5M", projectName: "Du an moi cua tl5" });
  const r = await luu(TL, st); const sau = await doc(OWNER);
  ok("K1: teamlead ngoài P5H tạo dự án mới -> 200", r.status === 200, r.status + " " + J(r.body).slice(0, 120));
  ok("K1: dự án mới CÓ trên máy chủ (trước: 200 nhưng bị ghép rớt)", sau.projects.some((p) => p.id === "P5M"));
  ok("K1: cột + việc + mục lịch sử của dự án mới cũng còn", sau.sections.some((s) => s.id === "S5_P5M") && sau.tasks.some((x) => x.id === "m1") && sau.history.some((h) => h.id === "h5_moi"));
  ok("K1: người tạo tải lại vẫn thấy dự án của mình", (await doc(TL)).projects.some((p) => p.id === "P5M"));
  // không "tạo lại" được dự án ẩn đã xóa bằng id cũ
  const st2 = await doc(TL); st2.rev++; st2.projects.push({ id: "P5X", name: "Gia mao P5X", color: "#000" });
  const r2 = await luu(TL, st2); const sau2 = await doc(OWNER);
  ok("K1: dùng lại id của dự án ẩn đã xóa thì không lọt (thùng rác vẫn giữ bản gốc)", !sau2.projects.some((p) => p.id === "P5X") && sau2.trash.some((e) => e.id === "P5X" && e.name === "Du an an da xoa L5"), r2.status);
}
/* ══════ K25: chuyển việc sang dự án ẩn -> thông báo đúng ══════ */
{ const st = await doc(TL); st.rev++; st.tasks = st.tasks.map((x) => x.id === "a1" ? { ...x, projectId: "P5H" } : x);
  const r = await luu(TL, st); const tk = (await doc(OWNER)).tasks.find((x) => x.id === "a1");
  ok("K25: chuyển việc sang dự án ngoài phạm vi -> 403 nói đúng lý do, việc giữ nguyên chỗ", r.status === 403 && /ngoài phạm vi/.test(r.body.message || "") && tk && tk.projectId === "P5A", r.status + " " + (r.body.message || "")); }

/* ══════ K7: đổi thành viên dự án qua API ══════ */
{ const st = await doc(TL); st.rev++; st.projects = st.projects.map((p) => p.id === "P5A" ? { ...p, members: [tlId] } : p);
  const r = await luu(TL, st); const pj = (await doc(OWNER)).projects.find((p) => p.id === "P5A");
  ok("K7: teamlead đặt members cho dự án qua API -> 403", r.status === 403 && /thành viên/.test(r.body.message || ""), r.status + " " + (r.body.message || ""));
  ok("K7: dự án vẫn mở, nhân viên vẫn thấy", !(pj.members || []).length && (await doc(NV)).projects.some((p) => p.id === "P5A"));
  const s2 = await doc(LD); s2.rev++; s2.projects = s2.projects.map((p) => p.id === "P5A" ? { ...p, members: [bossId, nvId] } : p);
  const r2 = await luu(LD, s2); ok("K7: Lãnh đạo đổi members -> 200", r2.status === 200, r2.status + " " + J(r2.body).slice(0, 100));
  await ownerSave((s) => { s.projects = s.projects.map((p) => p.id === "P5A" ? { ...p, members: [] } : p); }); }

/* ══════ K2: tệp công việc của dự án ẩn với teamlead ngoài dự án ══════ */
{ const up = await fetch(B + "/api/taskfiles/upload?taskId=h1&filename=ghichu.txt", { method: "POST", headers: { Authorization: "Bearer " + TL, "Content-Type": "text/plain" }, body: "tep nguoi ngoai" });
  ok("K2: teamlead ngoài P5H không tải tệp lên việc của P5H (403)", up.status === 403, "HTTP " + up.status);
  const ls = await api("/api/taskfiles?taskId=h1", {}, TL); ok("K2: cũng không liệt kê được", (ls.body.files || []).length === 0, J(ls.body).slice(0, 100));
  const upA = await fetch(B + "/api/taskfiles/upload?taskId=a1&filename=ghichu.txt", { method: "POST", headers: { Authorization: "Bearer " + TL, "Content-Type": "text/plain" }, body: "tep hop le" });
  ok("K2: teamlead vẫn tải tệp lên việc của dự án mở (200)", upA.status === 200, "HTTP " + upA.status);
  const upO = await fetch(B + "/api/taskfiles/upload?taskId=h1&filename=cua-boss.txt", { method: "POST", headers: { Authorization: "Bearer " + OWNER, "Content-Type": "text/plain" }, body: "boss" });
  const dl = await fetch(B + "/api/taskfiles/file?taskId=h1&idx=0", { headers: { Authorization: "Bearer " + TL } });
  ok("K2: không tải xuống được tệp việc ẩn (403)", upO.status === 200 && dl.status === 403, "up " + upO.status + " dl " + dl.status); }

/* ══════ K3: sửa nhật ký theo id với projectId giả ══════ */
{ let r = await api("/api/sitelogs", { method: "POST", body: J({ projectId: "P5H", projectName: "Du an an lan 5", date: "2026-09-03", work: "goc P5H" }) }, OWNER); const idH = r.body.log && r.body.log.id;
  r = await api("/api/sitelogs", { method: "POST", body: J({ id: idH, projectId: "P5A", projectName: "Du an mo", date: "2026-09-03", work: "BI SUA" }) }, NV);
  const l = (await api("/api/sitelogs?projectId=P5H", {}, OWNER)).body.logs.find((x) => x.id === idH);
  ok("K3: gửi id nhật ký dự án ẩn kèm projectId dự án mình -> 403, nội dung giữ nguyên", r.status === 403 && l && l.work === "goc P5H", r.status + " work=" + (l && l.work));
  r = await api("/api/sitelogs", { method: "POST", body: J({ projectId: "P5A", projectName: "Du an mo", date: "2026-09-02", work: "goc" }) }, NV); const idA = r.body.log.id;
  await api("/api/sitelogs/delete", { method: "POST", body: J({ id: idA, reason: "thu" }) }, NV);
  r = await api("/api/sitelogs", { method: "POST", body: J({ id: idA, projectId: "P5A", projectName: "Du an mo", date: "2026-09-02", work: "sua ban da xoa" }) }, NV);
  const lr = (await api("/api/sitelogs?projectId=P5A&trash=1", {}, OWNER)).body.logs.find((x) => x.id === idA);
  ok("K3: nhật ký trong thùng rác không sửa được qua id (409 in_trash)", r.status === 409 && r.body.error === "in_trash" && lr && lr.work === "goc", r.status + " " + J(r.body).slice(0, 80)); }

/* ══════ K5: sửa nhật ký đã duyệt ══════ */
{ let r = await api("/api/sitelogs", { method: "POST", body: J({ projectId: "P5A", projectName: "Du an mo", date: "2026-09-01", work: "ban nop", trangThai: "danop" }) }, NV); const id = r.body.log && r.body.log.id;
  r = await api("/api/sitelogs/approve", { method: "POST", body: J({ id }) }, OWNER);
  r = await api("/api/sitelogs", { method: "POST", body: J({ id, projectId: "P5A", projectName: "Du an mo", date: "2026-09-01", work: "sua sau duyet" }) }, OWNER);
  const l = (await api("/api/sitelogs?projectId=P5A", {}, OWNER)).body.logs.find((x) => x.id === id);
  const tenChu = (await api("/api/me", {}, OWNER)).body.user.name;
  ok("K5: Chủ sở hữu sửa bản đã duyệt -> 200, con dấu giữ, có ghi ai sửa sau duyệt", r.status === 200 && l.trangThai === "daduyet" && l.suaSauDuyetBoi === tenChu && l.suaSauDuyetLuc > 0, r.status + " " + J(l).slice(0, 160));
  let au = (await api("/api/audit?limit=20", {}, OWNER)).body.entries.filter((e) => e.entity === "sitelog" && e.id === id);
  ok("K5: nhật ký kiểm toán có dòng 'sửa nhật ký đã duyệt'", au.some((e) => e.field === "sửa nhật ký đã duyệt"), au.map((e) => e.field).join(", "));
  r = await api("/api/sitelogs", { method: "POST", body: J({ id, projectId: "P5A", projectName: "Du an mo", date: "2026-09-01", work: "sua sau duyet", trangThai: "nhap" }) }, OWNER);
  au = (await api("/api/audit?limit=20", {}, OWNER)).body.entries.filter((e) => e.entity === "sitelog" && e.id === id);
  ok("K5: kéo bản đã duyệt về nháp qua đường lưu cũng có vết 'mở khóa nhật ký'", r.status === 200 && au.some((e) => e.field === "mở khóa nhật ký" && e.to === "nhap"), au.map((e) => e.field + ">" + e.to).join(", ")); }

/* ══════ K4: audit ngân sách / chi phí / đề nghị ══════ */
{ const f = (await getF(OWNER)).body;
  f.nganSach = { ...(f.nganSach || {}), P5A: { vattu: 500 } };
  f.chiPhi = { ...(f.chiPhi || {}), P5A: [{ id: "cp5a", ngay: "2026-09-05", nhom: "vattu", moTa: "Mua xi mang", soTien: 250 }] };
  f.deNghi = { ...(f.deNghi || {}), P5A: { k5A: { tlGiuLai: 5, tlKhauTru: 0, tlVAT: 10, soHieu: "DN-01", ngay: "2026-09-06", ghiChu: "" } } };
  const r = await putF(OWNER, f); const au = (await api("/api/audit?limit=30", {}, OWNER)).body.entries.filter((e) => e.rev === r.body.rev);
  ok("K4: sửa ngân sách có vết (entity nganSach, from 0 -> 500)", au.some((e) => e.entity === "nganSach" && e.field === "sửa ngân sách" && e.to === "500" && e.projectId === "P5A"), au.map((e) => e.entity + "/" + e.field).join(", "));
  ok("K4: ghi chi phí có vết (entity chiPhi, tên khoản, số tiền)", au.some((e) => e.entity === "chiPhi" && e.field === "thêm chi phí" && e.name === "Mua xi mang" && e.to === "250"));
  ok("K4: đề nghị thanh toán có vết (entity deNghi, tên kỳ, trường đổi)", au.some((e) => e.entity === "deNghi" && e.field === "sửa đề nghị thanh toán" && e.name === "Kỳ 1" && /tlVAT=10/.test(e.to)));
  f.rev = r.body.rev; f.chiPhi.P5A = []; f.nganSach.P5A = { vattu: 700 };
  const r2 = await putF(OWNER, f); const au2 = (await api("/api/audit?limit=30", {}, OWNER)).body.entries.filter((e) => e.rev === r2.body.rev);
  ok("K4: xóa chi phí + đổi ngân sách lần nữa đều có vết", au2.some((e) => e.entity === "chiPhi" && e.field === "xóa chi phí") && au2.some((e) => e.entity === "nganSach" && e.from === "500" && e.to === "700")); }

/* ══════ K6: tự cấp quyền ══════ */
{ let r = await api("/api/accounts/update", { method: "POST", body: J({ id: mgrId, canViewFinance: true, canEditFinance: true }) }, MGR);
  const f = await getF(MGR);
  ok("K6: người có quyền Tạo tài khoản KHÔNG tự cấp quyền tài chính cho mình (403 self_caps)", r.status === 403 && r.body.error === "self_caps" && f.status === 403, r.status + " " + J(r.body).slice(0, 80) + " / finance " + f.status);
  r = await api("/api/accounts/update", { method: "POST", body: J({ id: nvId, canAssign: true }) }, MGR);
  ok("K6: vẫn phân quyền được cho người khác (200)", r.status === 200 && r.body.account && r.body.account.canAssign === true, r.status);
  await api("/api/accounts/update", { method: "POST", body: J({ id: nvId, canAssign: false }) }, OWNER);
  r = await api("/api/accounts/update", { method: "POST", body: J({ id: bossId, canAssign: true }) }, OWNER);
  ok("K6: Chủ sở hữu sửa tài khoản của chính mình vẫn 200", r.status === 200, r.status); }

/* ══════ K11: người lập bị loại khỏi dự án ══════ */
{ let r = await api("/api/records", { method: "POST", body: J({ projectId: "P5A", projectName: "Du an mo", date: "2026-09-04", type: "BB", note: "goc" }) }, NV); const rid = r.body.record && r.body.record.id;
  await ownerSave((s) => { s.projects = s.projects.map((p) => p.id === "P5A" ? { ...p, members: [bossId] } : p); });
  r = await api("/api/records/update", { method: "POST", body: J({ id: rid, note: "sua khi da bi loai" }) }, NV);
  const rec = (await api("/api/records?projectId=P5A", {}, OWNER)).body.records.find((x) => x.id === rid);
  ok("K11: người lập đã bị loại khỏi dự án không sửa được biên bản của mình (403)", r.status === 403 && rec && rec.note === "goc", r.status + " note=" + (rec && rec.note));
  await api("/api/records/delete", { method: "POST", body: J({ id: rid, reason: "thu" }) }, OWNER);
  r = await api("/api/records/restore", { method: "POST", body: J({ id: rid }) }, NV);
  ok("K11: cũng không khôi phục được (403)", r.status === 403, r.status);
  await ownerSave((s) => { s.projects = s.projects.map((p) => p.id === "P5A" ? { ...p, members: [] } : p); });
  r = await api("/api/records/restore", { method: "POST", body: J({ id: rid }) }, NV);
  ok("K11: mở lại dự án thì người lập khôi phục được (200)", r.status === 200, r.status + " " + J(r.body).slice(0, 80)); }

/* ══════ K8: dòng báo cáo trỏ tới việc ẩn đã xóa vĩnh viễn ══════ */
{ await ownerSave((s) => { s.trash = s.trash.filter((e) => e.id !== "h2"); });   // xóa vĩnh viễn h2
  const st = await doc(NV); const rep = st.dailyReports.find((r) => r.id === "rep5boss");
  ok("K8: người ngoài không thấy dòng trỏ tới việc ẩn đã xóa vĩnh viễn (chỉ còn dòng mở)", rep && rep.items.length === 1 && rep.items[0].id === "r5c", J(rep && rep.items).slice(0, 160));
  st.rev++; const r = await luu(NV, st); const sau = (await doc(OWNER)).dailyReports.find((x) => x.id === "rep5boss");
  ok("K8: sau khi họ lưu, cả 3 dòng của chủ báo cáo vẫn còn đúng thứ tự", r.status === 200 && sau.items.map((i) => i.id).join(",") === "r5a,r5b,r5c", r.status + " " + sau.items.map((i) => i.id).join(","));
  const stB = await doc(OWNER); const repB = stB.dailyReports.find((r) => r.id === "rep5boss");
  ok("K8: Chủ sở hữu (chủ báo cáo) vẫn thấy đủ dòng của mình", repB.items.length === 3); }

/* ══════ Kiểm tra tĩnh: từ điển ══════ */
{ const HERE = path.dirname(fileURLToPath(import.meta.url));
  const jsx = readFileSync(path.join(HERE, "..", "Chạy nội bộ", "ProjectManager.jsx"), "utf8");
  const start = jsx.indexOf("const T = {"); let i = start + 10, depth = 0, end = -1, inStr = null;
  for (; i < jsx.length; i++) { const c = jsx[i]; if (inStr) { if (c === "\\") { i++; continue; } if (c === inStr) inStr = null; continue; } if (c === '"' || c === "'" || c === "`") { inStr = c; continue; } if (c === "{") depth++; else if (c === "}") { depth--; if (depth === 0) { end = i + 1; break; } } }
  const Td = new Function("return (" + jsx.slice(start + "const T = ".length, end) + ");")();
  ok("S-e: nhật ký đã duyệt và sai mật khẩu hiện tại có mã riêng (không dùng chung 'locked' / 'invalid' hai nghĩa) và có bản dịch", ["e_sitelog_locked", "e_wrong_current_password", "e_in_trash", "e_self_caps"].every((k) => Td.en[k] && Td.vi[k]) && !Td.en.e_locked && !Td.en.e_invalid);
  ok("S-act: 'csv_import' có nhãn lịch sử vi + en", !!Td.vi.act.csv_import && !!Td.en.act.csv_import);
  ok("K4/K5: thực thể + trường audit mới có bản dịch vi + en", ["nganSach", "chiPhi", "deNghi"].every((k) => Td.vi.auditEntity[k] && Td.en.auditEntity[k]) && ["sửa ngân sách", "thêm chi phí", "sửa chi phí", "xóa chi phí", "sửa đề nghị thanh toán", "sửa nhật ký đã duyệt"].every((k) => Td.vi.auditField[k] && Td.en.auditField[k]));
  ok("I1: client gắn projectId cho mục lịch sử 'xóa dự án' và 'xóa vĩnh viễn'", /action: "project_delete", projectId: pid/.test(jsx) && /action: "trash_purge", projectId:/.test(jsx)); }

console.log("\nKẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exit(fail ? 1 : 0);
