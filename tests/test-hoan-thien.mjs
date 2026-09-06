/* Test "HOÀN THIỆN" 06/09 — đợt A (máy chủ): CAS nhật ký/biên bản (F-4), dọn id khi xóa tài khoản, hợp đồng khung (N5),
   gộp mục lịch sử (N6), số biên bản tự cấp + loại biên bản (H6), rev tài chính theo dự án (Q6), dataVersion,
   /api/client-error, /api/feedback, /api/health, /api/audit/tuan, thông báo trong app (U6), quy tắc nghiệm thu (H4), ngày thực tế (P4).
   Tự tạo dữ liệu riêng (P6*, tài khoản ht-*). Cách dùng: node tests/test-hoan-thien.mjs [BASE_URL] */
const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const J = JSON.stringify;
const api = (p, o = {}, t) => fetch(B + p, { ...o, headers: { "Content-Type": "application/json", ...(t ? { Authorization: "Bearer " + t } : {}), ...(o.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (e) => (await api("/api/login", { method: "POST", body: J({ email: e, password: "matkhau123" }) })).body.token;
const OWNER = await login("boss@test.vn");
const mk = (p) => api("/api/accounts", { method: "POST", body: J({ password: "matkhau123", ...p }) }, OWNER);
await mk({ name: "HT nhan vien", email: "ht-nv@test.vn", dept: "Site" });
await mk({ name: "HT teamlead", email: "ht-tl@test.vn", dept: "Site", canAssign: true, isTeamlead: true });
await mk({ name: "HT QC", email: "ht-qc@test.vn", dept: "QC" });
await mk({ name: "HT QS", email: "ht-qs@test.vn", dept: "QS", canViewFinance: true, canEditFinance: true });
await mk({ name: "HT se bi xoa", email: "ht-xoa@test.vn", dept: "Site" });
const NV = await login("ht-nv@test.vn"), TL = await login("ht-tl@test.vn"), QC = await login("ht-qc@test.vn"), QS = await login("ht-qs@test.vn");
const accs = (await api("/api/accounts", {}, OWNER)).body.accounts; const idOf = (em) => (accs.find((a) => a.email === em) || {}).id;
const bossId = idOf("boss@test.vn"), nvId = idOf("ht-nv@test.vn"), tlId = idOf("ht-tl@test.vn"), qcId = idOf("ht-qc@test.vn"), xoaId = idOf("ht-xoa@test.vn");
const doc = async (t) => JSON.parse((await api("/api/kv?key=pm_shared_v3", {}, t)).body.value);
const luu = (t, st) => api("/api/kv", { method: "POST", body: J({ key: "pm_shared_v3", value: J(st) }) }, t);
const ownerSave = async (mut) => { const st = await doc(OWNER); const r = mut(st); const moi = { ...(r || st), rev: st.rev + 1 }; const res = await luu(OWNER, moi); if (res.status !== 200) console.log("   (owner save " + res.status + " " + J(res.body).slice(0, 120) + ")"); return res; };
const T = (id, pid, over = {}) => ({ id, projectId: pid, sectionId: "S6_" + pid, status: "todo", approver: "teamlead", title: "Viec " + id, description: "", priority: "medium", assignees: [], primaryAssigneeId: null, workdone: 0, tags: [], completed: false, subtasks: [], comments: [], dueDate: "", startDate: "", duration: null, milestone: false, dependsOn: [], assignedAt: null, completedAt: null, reminderLead: null, reminderSentKey: "", recur: "none", createdAt: Date.now(), order: 1, ...over });
const getF = async (t) => (await api("/api/finance", {}, t)).body;
const putF = (t, f) => api("/api/finance", { method: "POST", body: J({ ...f, expectedRev: f.rev }) }, t);
const now = Date.now();

/* ══ dựng cảnh ══ */
await ownerSave((st) => {
  st.projects = st.projects.filter((p) => !p.id.startsWith("P6")).concat([
    { id: "P6A", name: "HT du an mo", color: "#0a0", siteLoggers: [nvId] },
    { id: "P6H", name: "HT du an an", color: "#a00", members: [bossId, xoaId] }]);
  st.sections = st.sections.filter((s) => !String(s.projectId).startsWith("P6")).concat([{ id: "S6_P6A", projectId: "P6A", name: "GD", order: 0 }, { id: "S6_P6H", projectId: "P6H", name: "GD", order: 0 }]);
  st.tasks = st.tasks.filter((x) => !String(x.projectId).startsWith("P6")).concat([
    T("h6a1", "P6A", { assignees: [xoaId, nvId], primaryAssigneeId: xoaId }),
    T("h6a2", "P6A", { assignees: [nvId], primaryAssigneeId: nvId, subtasks: [{ id: "s1", title: "con 1", done: false }] }),
    T("h6h1", "P6H")]);
});

/* ══ 1. F-4: CAS nhật ký ══ */
{
  let r = await api("/api/sitelogs", { method: "POST", body: J({ projectId: "P6A", projectName: "HT du an mo", date: "2026-08-01", work: "goc" }) }, NV);
  const id = r.body.log && r.body.log.id; ok("nv lập nhật ký P6A", !!id, J(r.body));
  const l0 = (await api("/api/sitelogs?projectId=P6A", {}, NV)).body.logs.find((x) => x.id === id);
  const moc = l0.updatedAt || l0.createdAt;
  r = await api("/api/sitelogs", { method: "POST", body: J({ id, projectId: "P6A", date: "2026-08-01", work: "sua lan 1", expectedUpdatedAt: moc }) }, OWNER);
  ok("sửa với đúng mốc -> 200", r.status === 200, r.status + J(r.body).slice(0, 80));
  r = await api("/api/sitelogs", { method: "POST", body: J({ id, projectId: "P6A", date: "2026-08-01", work: "sua lan 2 bang ban cu", expectedUpdatedAt: moc }) }, NV);
  const l1 = (await api("/api/sitelogs?projectId=P6A", {}, OWNER)).body.logs.find((x) => x.id === id);
  ok("F-4: sửa bằng bản đã cũ (người khác vừa sửa) -> 409 stale, nội dung người trước còn nguyên", r.status === 409 && r.body.error === "stale" && l1.work === "sua lan 1", r.status + " " + J(r.body).slice(0, 100) + " work=" + l1.work);
  r = await api("/api/sitelogs", { method: "POST", body: J({ id, projectId: "P6A", date: "2026-08-01", work: "khong gui moc" }) }, NV);
  ok("client cũ không gửi mốc vẫn lưu được (tương thích)", r.status === 200, r.status);
}
/* ══ 2. H6: số biên bản tự cấp + loại biên bản ══ */
{
  let r = await api("/api/records", { method: "POST", body: J({ projectId: "P6A", projectName: "HT", date: "2026-08-02", type: "BB", note: "a" }) }, NV);
  ok("biên bản không nhập số -> tự cấp BB-01/2026", r.status === 200 && r.body.record.number === "BB-01/2026", J(r.body));
  const rid = r.body.record.id;
  r = await api("/api/records", { method: "POST", body: J({ projectId: "P6A", projectName: "HT", date: "2026-08-03", type: "BB", note: "b" }) }, NV);
  ok("biên bản thứ hai -> BB-02/2026", r.body.record && r.body.record.number === "BB-02/2026", J(r.body));
  r = await api("/api/records", { method: "POST", body: J({ projectId: "P6A", projectName: "HT", date: "2026-08-03", type: "BB", number: "SO-RIENG", note: "c" }) }, NV);
  ok("nhập số tay thì giữ nguyên", r.body.record && r.body.record.number === "SO-RIENG");
  const recs = (await api("/api/records?projectId=P6A", {}, OWNER)).body.records; const rec0 = recs.find((x) => x.id === rid);
  r = await api("/api/records/update", { method: "POST", body: J({ id: rid, note: "sua", expectedUpdatedAt: (rec0.updatedAt || rec0.createdAt) - 1 }) }, OWNER);
  ok("F-4: sửa biên bản với mốc cũ -> 409 stale", r.status === 409 && r.body.error === "stale", r.status);
  r = await api("/api/settings", { method: "POST", body: J({ recordTypes: ["Biên bản nghiệm thu vật liệu", "  ", 5, "Biên bản họp giao ban"] }) }, OWNER);
  const cfg = (await api("/api/config")).body;
  ok("Chủ sở hữu khai loại biên bản -> /api/config trả đúng danh sách (lọc rác)", r.status === 200 && J(cfg.recordTypes) === J(["Biên bản nghiệm thu vật liệu", "Biên bản họp giao ban"]), J(cfg.recordTypes));
}
/* ══ 3. xóa tài khoản dọn id ══ */
{
  const r = await api("/api/accounts/delete", { method: "POST", body: J({ id: xoaId }) }, OWNER);
  const st = await doc(OWNER); const a1 = st.tasks.find((x) => x.id === "h6a1"); const ph = st.projects.find((p) => p.id === "P6H");
  ok("xóa tài khoản -> gỡ khỏi người được giao, phụ trách chính chuyển sang người còn lại", r.status === 200 && !a1.assignees.includes(xoaId) && a1.primaryAssigneeId === nvId, J({ as: a1.assignees, p: a1.primaryAssigneeId }));
  ok("gỡ khỏi thành viên dự án, dự án vẫn giới hạn (còn Chủ sở hữu)", !ph.members.includes(xoaId) && ph.members.length >= 1, J(ph.members));
  const au = (await api("/api/audit?limit=20", {}, OWNER)).body.entries;
  ok("có vết audit cho lần dọn", au.some((e) => e.id === "h6a1" && e.field === "assignees"), au.slice(0, 5).map((e) => e.entity + "/" + e.field).join(", "));
}
/* ══ 4. N5 hợp đồng khung + Q6 rev theo dự án ══ */
{
  let f = await getF(OWNER);
  f.investorContracts = f.investorContracts.filter((c) => !String(c.id).startsWith("ht")).concat([{ id: "ht-khung", code: "HD khung", value: 100, projectId: "", billed: [], paid: [] }, { id: "ht-an", code: "HD an", value: 200, projectId: "P6H", billed: [], paid: [] }]);
  f.boq = { ...f.boq, P6A: { items: [{ id: "i6a", ten: "Mo", khoiLuong: 10, donGia: 1 }], kys: [] }, P6H: { items: [{ id: "i6h", ten: "An", khoiLuong: 10, donGia: 1 }], kys: [] } };
  let r = await putF(OWNER, f); ok("dựng tài chính", r.status === 200, r.status + J(r.body));
  const fq = await getF(QS);
  ok("N5: QS (ngoài P6H) thấy hợp đồng khung, không thấy hợp đồng P6H", fq.investorContracts.some((c) => c.id === "ht-khung") && !fq.investorContracts.some((c) => c.id === "ht-an"));
  // Q6: owner sửa P6H sau khi QS đã tải; QS sửa P6A với rev cũ -> vẫn 200
  const fo = await getF(OWNER); fo.boq.P6H.items[0].donGia = 7; r = await putF(OWNER, fo); ok("owner sửa P6H (rev tăng)", r.status === 200);
  fq.boq.P6A.items[0].donGia = 3; r = await putF(QS, fq);
  const f2 = await getF(OWNER);
  ok("Q6: QS lưu P6A với rev đã cũ -> 200, thay đổi của owner ở P6H còn nguyên, hợp đồng khung còn", r.status === 200 && f2.boq.P6A.items[0].donGia === 3 && f2.boq.P6H.items[0].donGia === 7 && f2.investorContracts.some((c) => c.id === "ht-khung"), r.status + " " + J(r.body).slice(0, 80) + " A=" + f2.boq.P6A.items[0].donGia + " H=" + f2.boq.P6H.items[0].donGia);
  // QS tải lại, owner sửa P6A, QS sửa P6A với rev cũ -> 409 (xung đột thật) kèm tên dự án
  const fq2 = await getF(QS); const fo2 = await getF(OWNER); fo2.boq.P6A.items[0].donGia = 4; await putF(OWNER, fo2);
  fq2.boq.P6A.items[0].donGia = 5; r = await putF(QS, fq2);
  ok("Q6: cùng sửa một dự án -> 409 conflict, báo dự án nào", r.status === 409 && Array.isArray(r.body.projects) && r.body.projects.includes("P6A"), r.status + " " + J(r.body).slice(0, 80));
  ok("số liệu sau xung đột là của người lưu trước (4)", (await getF(OWNER)).boq.P6A.items[0].donGia === 4);
}
/* ══ 5. dataVersion + client-error + feedback + health + audit/tuan ══ */
{
  const st = await doc(OWNER); ok("khối chung mang dataVersion 6 sau khi lưu", st.dataVersion === 6, String(st.dataVersion));
  let r = await api("/api/client-error", { method: "POST", body: J({ message: "TypeError: x is not a function", stack: "at abc", view: "P6A/list", rev: 1 }) }, NV);
  ok("/api/client-error nhận lỗi trình duyệt -> 200", r.status === 200, r.status);
  r = await api("/api/feedback", { method: "POST", body: J({ text: "   " }) }, NV); ok("góp ý rỗng -> 400", r.status === 400, r.status);
  r = await api("/api/feedback", { method: "POST", body: J({ text: "Muon xuat Excel ky nghiem thu", view: "finance" }) }, NV); ok("góp ý -> 200", r.status === 200, r.status);
  r = await api("/api/health", {}, NV); ok("nhân viên không xem được sức khỏe máy chủ (403)", r.status === 403, r.status);
  r = await api("/api/health", {}, OWNER);
  ok("Chủ sở hữu xem sức khỏe: version, dataBytes, sharedRev, canhBao là mảng", r.status === 200 && r.body.version && r.body.dataBytes > 0 && typeof r.body.sharedRev === "number" && Array.isArray(r.body.canhBao), J(r.body).slice(0, 160));
  r = await api("/api/audit/tuan?ngay=7", {}, OWNER);
  ok("tóm tắt audit 7 ngày: có người, có số thay đổi", r.status === 200 && r.body.tong > 0 && r.body.nguoi.length > 0 && r.body.nguoi[0].so > 0, J(r.body).slice(0, 160));
  r = await api("/api/audit/tuan", {}, NV); ok("nhân viên không xem được tóm tắt (403)", r.status === 403);
}
/* ══ 6. N6: người bị giới hạn gộp mục lịch sử của mình ══ */
{
  let s = await doc(NV); s.rev++; s.history.unshift({ id: "ht-h1", ts: now, actor: "HT nhan vien", action: "task_workdone", projectId: "P6A", taskId: "h6a2", taskTitle: "Viec h6a2", from: "0%", to: "10%" });
  s.tasks = s.tasks.map((x) => x.id === "h6a2" ? { ...x, workdone: 10 } : x);
  let r = await luu(NV, s); ok("nv ghi mục lịch sử mới", r.status === 200, r.status + J(r.body).slice(0, 100));
  s = await doc(NV); s.rev++; s.history = s.history.map((h) => h.id === "ht-h1" ? { ...h, to: "20%", ts: now + 1000 } : h); s.tasks = s.tasks.map((x) => x.id === "h6a2" ? { ...x, workdone: 20 } : x);
  r = await luu(NV, s); const st = await doc(OWNER); const h = st.history.find((x) => x.id === "ht-h1");
  ok("N6: sửa tại chỗ mục đầu của chính mình (gộp 2 phút) được máy chủ nhận", r.status === 200 && h && h.to === "20%", r.status + " to=" + (h && h.to));
}
/* ══ 7. U6 thông báo trong app ══ */
{
  /* v5.1 (N06): thông báo lọc theo phạm vi — giao việc ở dự án nv KHÔNG thuộc (P6H) thì nv không đọc được; dùng dự án mở P6A. */
  await ownerSave((st) => { st.tasks = st.tasks.filter((x) => x.id !== "h6a3").concat([T("h6a3", "P6A", { assignees: [nvId], primaryAssigneeId: nvId, title: "Viec giao qua thong bao" })]); });
  let r = await api("/api/notifications", {}, NV);
  ok("nv được giao việc -> có thông báo 'assign' chưa đọc", r.status === 200 && r.body.items.some((x) => x.type === "assign" && x.taskId === "h6a3") && r.body.unread > 0, J(r.body).slice(0, 160));
  await ownerSave((st) => { st.tasks = st.tasks.map((x) => x.id === "h6h1" ? { ...x, assignees: [nvId], primaryAssigneeId: nvId } : x); });
  r = await api("/api/notifications", {}, NV);
  ok("N06: giao việc ở dự án nv không thuộc -> nv KHÔNG thấy thông báo của dự án đó", !r.body.items.some((x) => x.taskId === "h6h1"), J(r.body.items.map((x) => x.taskId)));
  r = await api("/api/notifications/read", { method: "POST", body: J({ all: true }) }, NV);
  r = await api("/api/notifications", {}, NV); ok("đánh dấu đã đọc hết -> unread 0", r.body.unread === 0, String(r.body.unread));
  r = await api("/api/sitelogs", { method: "POST", body: J({ projectId: "P6A", projectName: "HT du an mo", date: "2026-08-05", work: "nop", trangThai: "danop" }) }, NV);
  const lid = r.body.log && r.body.log.id;
  const ro = await api("/api/notifications", {}, OWNER);
  ok("nv nộp nhật ký -> Chủ sở hữu có thông báo 'sitelog'", ro.body.items.some((x) => x.type === "sitelog" && x.logId === lid), J(ro.body.items.slice(0, 2)));
  const rt = await api("/api/notifications", {}, TL);
  ok("Teamlead Site (dự án mở) cũng nhận", rt.body.items.some((x) => x.type === "sitelog" && x.logId === lid));
  await api("/api/sitelogs/approve", { method: "POST", body: J({ id: lid }) }, OWNER);
  const rn = await api("/api/notifications", {}, NV);
  ok("duyệt xong -> người lập có thông báo 'approved'", rn.body.items.some((x) => x.type === "approved" && x.logId === lid));
}
/* ══ 8. H4 quy tắc nghiệm thu + P4 ngày thực tế ══ */
{
  await ownerSave((st) => { st.projects = st.projects.map((p) => p.id === "P6A" ? { ...p, duyet: { canAnh: false, canViecCon: true, qcIds: [qcId] } } : p); });
  let s = await doc(TL); s.rev++; s.projects = s.projects.map((p) => p.id === "P6A" ? { ...p, duyet: { canAnh: false, canViecCon: false, qcIds: [] } } : p);
  let r = await luu(TL, s); ok("H4: teamlead không đổi được quy tắc nghiệm thu (403)", r.status === 403, r.status);
  s = await doc(NV); s.rev++; s.tasks = s.tasks.map((x) => x.id === "h6a2" ? { ...x, status: "review", workdone: 100 } : x);
  r = await luu(NV, s); ok("H4: còn việc con chưa xong -> gửi duyệt bị chặn (403 có lý do)", r.status === 403 && /việc con/.test(r.body.message || ""), r.status + " " + (r.body.message || ""));
  s = await doc(NV); s.rev++; s.tasks = s.tasks.map((x) => x.id === "h6a2" ? { ...x, subtasks: x.subtasks.map((c) => ({ ...c, done: true })), status: "review", workdone: 100, actualStart: "2026-08-01" } : x);
  r = await luu(NV, s); ok("xong việc con -> gửi duyệt được, người được giao ghi được ngày bắt đầu thực tế (P4)", r.status === 200, r.status + " " + (r.body.message || ""));
  s = await doc(TL); s.rev++; s.tasks = s.tasks.map((x) => x.id === "h6a2" ? { ...x, status: "done", completed: true, completedAt: now } : x);
  r = await luu(TL, s); ok("H4: có QC được chỉ định thì Teamlead không duyệt được (403)", r.status === 403 && /QC/.test(r.body.message || ""), r.status + " " + (r.body.message || ""));
  s = await doc(QC); s.rev++; s.tasks = s.tasks.map((x) => x.id === "h6a2" ? { ...x, status: "done", completed: true, completedAt: now, actualFinish: "2026-08-06" } : x);
  r = await luu(QC, s); const st = await doc(OWNER); const tk = st.tasks.find((x) => x.id === "h6a2");
  ok("QC duyệt được; ngày thực tế được lưu", r.status === 200 && tk.status === "done" && tk.actualStart === "2026-08-01" && tk.actualFinish === "2026-08-06", r.status + " " + J({ s: tk.status, a: tk.actualStart, f: tk.actualFinish }));
  const au = (await api("/api/audit?limit=30", {}, OWNER)).body.entries;
  ok("audit có vết 'actualFinish' cho việc này", au.some((e) => e.id === "h6a2" && e.field === "actualFinish"), au.filter((e) => e.id === "h6a2").map((e) => e.field).join(","));
}
console.log("\nKẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exit(fail ? 1 : 0);
