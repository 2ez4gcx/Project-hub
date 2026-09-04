/* Test các lỗi hồi quy của báo cáo AUDIT LẦN 2 (04/09 chiều) — R1..R12.
   Báo cáo lần 2 ghi rõ 243 ca cũ KHÔNG phủ ba đường lỗi R1, R2, R5 (R13). Tệp này khóa lại
   đúng những đường đó để chúng không quay lại.
   Chạy SAU test-authz.mjs.  Cách dùng: node tests/test-hoi-quy-lan2.mjs [BASE_URL] */
const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const api = (p, o = {}, t) => fetch(B + p, { ...o, headers: { "Content-Type": "application/json", ...(t ? { Authorization: "Bearer " + t } : {}), ...(o.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (e) => (await api("/api/login", { method: "POST", body: JSON.stringify({ email: e, password: "matkhau123" }) })).body.token;

const OWNER = await login("boss@test.vn");
const AN = await login("an@test.vn");        // teamlead
const doc = async (t) => JSON.parse((await api("/api/kv?key=pm_shared_v3", {}, t)).body.value);
const luu = (t, st) => api("/api/kv", { method: "POST", body: JSON.stringify({ key: "pm_shared_v3", value: JSON.stringify(st) }) }, t);
const fin = async (t) => (await api("/api/finance", {}, t)).body;
const anMe = (await api("/api/me", {}, AN)).body.user;
const anId = anMe.id, anTen = anMe.name;      // luật 6: mục lịch sử phải ghi đúng tên tài khoản
const audit = async (n = 500) => (await api("/api/audit?limit=" + n, {}, OWNER)).body.entries || [];

/* ══════ R1: người bị giới hạn phạm vi vẫn phải LƯU ĐƯỢC khi có lịch sử của dự án ẩn ══════ */
{
  let st = await doc(OWNER);
  st = { ...st, rev: st.rev + 1,
    projects: [...st.projects.map((p) => p.id === "P1" ? { ...p, members: [anId] } : p),
               { id: "PZ", name: "Du an ngoai pham vi", color: "#000", createdAt: Date.now(), members: ["ai-do"] },
               { id: "PR3", name: "Du an test tai chinh", color: "#111", createdAt: Date.now(), members: [anId] }],
    history: [
      { id: "hz1", ts: Date.now(), actor: "Chu So Huu", action: "task_create", projectId: "PZ", projectName: "Du an ngoai pham vi", taskTitle: "Viec an 1" },
      { id: "hz2", ts: Date.now() - 500, actor: "Chu So Huu", action: "task_create", projectId: "PZ", projectName: "Du an ngoai pham vi", taskTitle: "Viec an 2" },
      { id: "hp1", ts: Date.now() - 1000, actor: "Chu So Huu", action: "task_create", projectId: "P1", projectName: "Du an 1", taskTitle: "Viec thay duoc" },
      ...(st.history || [])] };
  let r = await luu(OWNER, st);
  ok("dựng dự án giới hạn + lịch sử của dự án ẩn", r.status === 200, r.status);

  const cua = await doc(AN);
  ok("R1 — An KHÔNG thấy lịch sử của dự án ngoài phạm vi",
     !(cua.history || []).some((h) => h.projectId === "PZ"), JSON.stringify((cua.history || []).map((h) => h.projectId)));

  const t1 = cua.tasks.find((x) => x.projectId === "P1");
  const moi = { id: "h_an_1", ts: Date.now(), actor: anTen, action: "task_field", field: "title", projectId: "P1", taskTitle: "Doi ten" };
  r = await luu(AN, { ...cua, rev: cua.rev + 1,
    tasks: cua.tasks.map((x) => x.id === t1.id ? { ...x, title: "Ten An dat" } : x),
    history: [moi, ...(cua.history || [])] });
  ok("R1 — người trong phạm vi LƯU ĐƯỢC dù máy chủ có lịch sử ẩn", r.status === 200,
     "HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 90));

  const sau = await doc(OWNER);
  ok("R1 — thay đổi của An được ghi nhận", (sau.tasks.find((x) => x.id === t1.id) || {}).title === "Ten An dat");
  ok("R1 — lịch sử của dự án ẩn KHÔNG bị mất", (sau.history || []).filter((h) => h.projectId === "PZ").length === 2,
     JSON.stringify((sau.history || []).filter((h) => h.projectId === "PZ").map((h) => h.id)));
  ok("R1 — mục lịch sử mới của An nằm đầu danh sách", (sau.history || [])[0] && sau.history[0].id === "h_an_1",
     (sau.history || [])[0] && sau.history[0].id);
  ok("R1 — dự án ẩn còn nguyên", (sau.projects || []).some((p) => p.id === "PZ"));
}

/* ══════ R8a: tài chính theo phạm vi dự án — đọc bị lọc, ghi KHÔNG xóa phần ẩn ══════ */
{
  const f0 = await fin(OWNER);
  let r = await api("/api/finance", { method: "POST", body: JSON.stringify({ ...f0, boq: { ...f0.boq,
    PR3: { items: [{ id: "p3a", ten: "Cong tac trong pham vi", donVi: "m3", khoiLuong: 10, donGia: 1000, taskIds: [] }], kys: [] },
    PZ: { items: [{ id: "pza", ten: "SO LIEU MAT", donVi: "m3", khoiLuong: 99, donGia: 9999999, taskIds: [] }], kys: [] } },
    expectedRev: f0.rev }) }, OWNER);
  ok("lập BOQ cho cả dự án trong và ngoài phạm vi", r.status === 200, r.status);

  await api("/api/accounts/update", { method: "POST", body: JSON.stringify({ id: anId, canViewFinance: true }) }, OWNER);
  const AN2 = await login("an@test.vn");
  const fa = await fin(AN2);
  ok("R8a — người ngoài dự án KHÔNG đọc được BOQ của dự án giới hạn",
     !Object.keys(fa.boq || {}).includes("PZ"), JSON.stringify(Object.keys(fa.boq || {})));

  // An lưu phần mình thấy -> phần ẩn phải còn nguyên
  r = await api("/api/finance", { method: "POST", body: JSON.stringify({ ...fa,
    boq: { ...fa.boq, PR3: { ...fa.boq.PR3, items: [{ ...fa.boq.PR3.items[0], khoiLuong: 20 }] } }, expectedRev: fa.rev }) }, AN2);
  ok("R8a — An lưu được phần mình thấy", r.status === 200, "HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 70));
  const fo = await fin(OWNER);
  ok("R8a — BOQ CỦA DỰ ÁN ẨN KHÔNG BỊ XÓA sau khi An lưu", !!(fo.boq && fo.boq.PZ && fo.boq.PZ.items.length === 1),
     JSON.stringify(Object.keys(fo.boq || {})));
  ok("R8a — thay đổi của An vẫn được ghi", Number(fo.boq.PR3.items[0].khoiLuong) === 20);
}

/* ══════ R3 + R4: khóa kỳ nghiệm thu ══════ */
{
  let f = await fin(OWNER);
  let r = await api("/api/finance", { method: "POST", body: JSON.stringify({ ...f, boq: { ...f.boq,
    PR3: { items: [{ id: "k1a", stt: "1", ten: "Be tong mong", donVi: "m3", khoiLuong: 100, donGia: 1000000, taskIds: [] }],
           kys: [{ id: "ky1", soKy: 1, denNgay: "2026-09-30", kl: { k1a: 20 } }] } }, expectedRev: f.rev }) }, OWNER);
  ok("lập BOQ + kỳ 1", r.status === 200, r.status);

  f = await fin(OWNER);
  r = await api("/api/finance", { method: "POST", body: JSON.stringify({ ...f,
    boq: { ...f.boq, PR3: { ...f.boq.PR3, kys: [{ ...f.boq.PR3.kys[0], khoa: true }] } }, expectedRev: f.rev }) }, OWNER);
  ok("khóa kỳ 1", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 120));
  f = await fin(OWNER);
  ok("R3 — máy chủ CHỤP đơn giá khi khóa (dgKhoa)", !!(f.boq.PR3.kys[0].dgKhoa && f.boq.PR3.kys[0].dgKhoa.k1a === 1000000),
     JSON.stringify(f.boq.PR3.kys[0].dgKhoa));
  ok("R4 — có vết KHÓA KỲ trong nhật ký kiểm toán",
     (await audit()).some((e) => e.field === "khóa kỳ"), "các field boq gần đây: " + JSON.stringify((await audit()).filter((e) => e.entity === "boq").slice(0, 5).map((e) => e.field)));

  // đổi đơn giá khi kỳ đã khóa: giá trị kỳ đã chốt KHÔNG được đổi theo
  r = await api("/api/finance", { method: "POST", body: JSON.stringify({ ...f,
    boq: { ...f.boq, PR3: { ...f.boq.PR3, items: [{ ...f.boq.PR3.items[0], donGia: 1500000 }] } }, expectedRev: f.rev }) }, OWNER);
  f = await fin(OWNER);
  ok("R3 — đơn giá đã chốt của kỳ khóa KHÔNG đổi theo đơn giá hiện hành",
     f.boq.PR3.kys[0].dgKhoa.k1a === 1000000,
     "dgKhoa=" + f.boq.PR3.kys[0].dgKhoa.k1a + " donGia hiện hành=" + f.boq.PR3.items[0].donGia);

  // các thao tác khác trên kỳ đã khóa đều bị chặn
  const thu = async (mo, patch) => {
    const g = await fin(OWNER);
    const rr = await api("/api/finance", { method: "POST", body: JSON.stringify({ ...g,
      boq: { ...g.boq, PR3: patch(g.boq.PR3) }, expectedRev: g.rev }) }, OWNER);
    ok(mo, rr.status === 403, "HTTP " + rr.status + " " + JSON.stringify(rr.body).slice(0, 70));
  };
  await thu("R3 — kỳ khóa: KHÔNG sửa được khối lượng", (b) => ({ ...b, kys: [{ ...b.kys[0], kl: { k1a: 99 } }] }));
  await thu("R3 — kỳ khóa: KHÔNG đổi được ngày chốt kỳ", (b) => ({ ...b, kys: [{ ...b.kys[0], denNgay: "2026-12-31" }] }));
  await thu("R3 — kỳ khóa: KHÔNG xóa được hạng mục đã nghiệm thu", (b) => ({ ...b, items: [] }));
  await thu("R3 — kỳ khóa: KHÔNG sửa được đơn giá đã chốt", (b) => ({ ...b, kys: [{ ...b.kys[0], dgKhoa: { k1a: 1 } }] }));
  await thu("R4 — mở khóa KHÔNG ghi lý do thì bị từ chối", (b) => ({ ...b, kys: [{ ...b.kys[0], khoa: false }] }));

  /* R2: thao tác bị từ chối KHÔNG được để lại vết */
  const truoc = (await audit()).length;
  const g = await fin(OWNER);
  const rr = await api("/api/finance", { method: "POST", body: JSON.stringify({ ...g,
    boq: { ...g.boq, PR3: { ...g.boq.PR3, kys: [{ ...g.boq.PR3.kys[0], kl: { k1a: 777 } }] } }, expectedRev: g.rev }) }, OWNER);
  const sau = await audit();
  const veKL = sau.slice(0, sau.length - truoc).filter((e) => e.field === "khoiLuongKy");
  ok("R2 — thay đổi BỊ TỪ CHỐI thì KHÔNG có vết trong nhật ký kiểm toán",
     rr.status === 403 && veKL.length === 0,
     "HTTP " + rr.status + ", vết khoiLuongKy thêm mới: " + veKL.length);

  // mở khóa có lý do -> được, và có vết
  const g2 = await fin(OWNER);
  const r2 = await api("/api/finance", { method: "POST", body: JSON.stringify({ ...g2,
    boq: { ...g2.boq, PR3: { ...g2.boq.PR3, kys: [{ ...g2.boq.PR3.kys[0], khoa: false, moKhoaLyDo: "CDT tra lai de tinh lai" }] } }, expectedRev: g2.rev }) }, OWNER);
  ok("R4 — mở khóa CÓ lý do thì được", r2.status === 200, "HTTP " + r2.status + " " + JSON.stringify(r2.body).slice(0, 70));
  const au = await audit();
  const mk = au.find((e) => e.field === "mở khóa kỳ");
  ok("R4 — vết mở khóa ghi kèm lý do", !!(mk && String(mk.to).includes("CDT tra lai")), mk && mk.to);
}

/* ══════ R7: luồng duyệt nhật ký thi công ══════ */
{
  // An phải là người được chỉ định lập nhật ký, và phải là NGƯỜI LẬP, thì mới tới được
  // luật khóa (nếu không sẽ dừng ở 403 "không được phân công" / "chỉ người tạo mới xóa").
  const st0 = await doc(OWNER);
  await luu(OWNER, { ...st0, rev: st0.rev + 1,
    projects: st0.projects.map((p) => p.id === "P1" ? { ...p, siteLoggers: [anId] } : p) });
  const AN0 = await login("an@test.vn");
  let r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ projectId: "P1", projectName: "Du an 1", date: "2026-11-01", work: "x" }) }, AN0);
  const lid = r.body.log.id;
  ok("An lập được nhật ký sau khi được chỉ định", r.status === 200, "HTTP " + r.status);
  r = await api("/api/sitelogs/approve", { method: "POST", body: JSON.stringify({ id: lid, duyet: true }) }, OWNER);
  ok("R7a — KHÔNG duyệt được nhật ký còn ở trạng thái Nháp", r.status === 409 && r.body.error === "not_submitted",
     "HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 70));

  r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ id: lid, projectId: "P1", projectName: "Du an 1", date: "2026-11-01", work: "x", trangThai: "danop" }) }, AN0);
  r = await api("/api/sitelogs/approve", { method: "POST", body: JSON.stringify({ id: lid, duyet: true }) }, OWNER);
  ok("R7a — nộp rồi thì duyệt được", r.status === 200 && r.body.trangThai === "daduyet", "HTTP " + r.status);

  const up = await fetch(B + "/api/sitelogs/photo?logId=" + lid + "&filename=x.jpg", { method: "POST", headers: { Authorization: "Bearer " + AN0, "Content-Type": "image/jpeg" }, body: "AAAA" });
  ok("R7b — KHÔNG thêm được ảnh vào nhật ký đã duyệt", up.status === 409, "HTTP " + up.status);

  const del = await api("/api/sitelogs/delete", { method: "POST", body: JSON.stringify({ id: lid, reason: "thu" }) }, AN0);
  ok("R7c — người lập KHÔNG xóa được nhật ký đã duyệt", del.status === 409, "HTTP " + del.status + " " + JSON.stringify(del.body).slice(0, 60));

  const delO = await api("/api/sitelogs/delete", { method: "POST", body: JSON.stringify({ id: lid, reason: "lap nham" }) }, OWNER);
  ok("R7c — Chủ sở hữu vẫn xóa được bản đã duyệt", delO.status === 200, "HTTP " + delO.status);
}

/* ══════ R6: khôi phục hồ sơ từ thùng rác ══════ */
{
  let r = await api("/api/records", { method: "POST", body: JSON.stringify({ projectId: "P1", projectName: "Du an 1", date: "2026-11-02", type: "Bien ban hien truong", note: "Ho so quan trong" }) }, OWNER);
  const rid = r.body.record.id;
  await api("/api/records/delete", { method: "POST", body: JSON.stringify({ id: rid, reason: "xoa nham" }) }, OWNER);
  const rac = (await api("/api/records?projectId=P1&trash=1", {}, OWNER)).body.records || [];
  ok("R6 — hồ sơ đã xóa nằm trong thùng rác", rac.some((x) => x.id === rid));
  r = await api("/api/records/restore", { method: "POST", body: JSON.stringify({ id: rid }) }, OWNER);
  ok("R6 — KHÔI PHỤC được biên bản từ thùng rác", r.status === 200, "HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 60));
  const thuong = (await api("/api/records?projectId=P1", {}, OWNER)).body.records || [];
  ok("R6 — biên bản trở lại danh sách thường, còn nguyên nội dung",
     thuong.some((x) => x.id === rid && x.note === "Ho so quan trong"));

  // nhật ký: khôi phục và chặn trùng ngày
  const l1 = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ projectId: "P1", projectName: "Du an 1", date: "2026-11-03", work: "ban goc" }) }, OWNER);
  await api("/api/sitelogs/delete", { method: "POST", body: JSON.stringify({ id: l1.body.log.id, reason: "x" }) }, OWNER);
  await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ projectId: "P1", projectName: "Du an 1", date: "2026-11-03", work: "ban moi" }) }, OWNER);
  r = await api("/api/sitelogs/restore", { method: "POST", body: JSON.stringify({ id: l1.body.log.id }) }, OWNER);
  ok("R6 — khôi phục nhật ký khi ngày đó đã có bản khác -> báo rõ 409",
     r.status === 409 && r.body.error === "log_exists", "HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 80));
}

/* ══════ R9: báo cáo ngày không lộ việc của dự án ngoài phạm vi ══════ */
{
  const st = await doc(OWNER);
  const viecAn = { id: "tz1", projectId: "PZ", sectionId: "", status: "todo", approver: "teamlead", title: "VIEC MAT KHONG DUOC LO",
    description: "", priority: "medium", assignees: [], primaryAssigneeId: null, workdone: 0, tags: [], completed: false,
    subtasks: [], comments: [], dueDate: "", startDate: "", duration: null, milestone: false, dependsOn: [],
    assignedAt: null, completedAt: null, reminderLead: null, reminderSentKey: "", recur: "none", createdAt: Date.now(), order: 900 };
  const bc = { id: "bc1", memberId: "ai-do", memberName: "Nguoi khac", dept: "", date: "2026-11-04",
    items: [{ id: "i1", taskId: "tz1", taskTitle: "VIEC MAT KHONG DUOC LO", moTa: "lam gi do", pct: 50, vuongMac: "" }],
    comments: [], submittedAt: Date.now(), updatedAt: Date.now() };
  let r = await luu(OWNER, { ...st, rev: st.rev + 1, tasks: [...st.tasks, viecAn], dailyReports: [...(st.dailyReports || []), bc] });
  ok("dựng báo cáo ngày có dòng thuộc dự án ẩn", r.status === 200, r.status);

  const cua = await doc(AN);
  const loRa = JSON.stringify(cua.dailyReports || []).includes("VIEC MAT KHONG DUOC LO");
  ok("R9 — tên việc của dự án ngoài phạm vi KHÔNG lọt vào báo cáo ngày", !loRa,
     JSON.stringify((cua.dailyReports || []).map((x) => (x.items || []).map((i) => i.taskTitle))));

  // An lưu -> dòng ẩn của báo cáo phải còn nguyên
  r = await luu(AN, { ...cua, rev: cua.rev + 1 });
  const sau = await doc(OWNER);
  const conDong = ((sau.dailyReports || []).find((x) => x.id === "bc1") || {}).items || [];
  ok("R9 — dòng báo cáo thuộc dự án ẩn KHÔNG bị mất khi người ngoài lưu",
     conDong.some((i) => i.taskId === "tz1"), JSON.stringify(conDong.map((i) => i.taskId)));
}

/* ══════ R10: nhật ký kiểm toán không cắt im lặng ══════ */
{
  const st = await doc(OWNER);
  const nhieu = [];
  for (let i = 0; i < 340; i++) nhieu.push({ ...st.tasks[0], id: "mass" + i, title: "Nhap hang loat " + i, projectId: "P1" });
  const truoc = (await audit(1000)).length;
  const r = await luu(OWNER, { ...st, rev: st.rev + 1, tasks: [...st.tasks, ...nhieu] });
  ok("nhập hàng loạt 340 việc", r.status === 200, r.status);
  const sau = await audit(1000);
  const moi = sau.slice(0, sau.length - truoc);
  ok("R10 — có dòng tổng kết cho phần vượt trần, không cắt im lặng",
     moi.some((e) => e.entity === "batch" && /thay đổi cùng lượt/.test(String(e.to || ""))),
     "dòng mới: " + moi.length + ", entity batch: " + moi.filter((e) => e.entity === "batch").length);
}

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
