/* Test các lỗi còn lại của báo cáo AUDIT LẦN 3 (06/09, v4.2.1) — N1..N4.
   Cả bốn đều nằm trong tính năng "Thành viên dự án" và luồng duyệt nhật ký; 384 ca trước đó
   không có ca nào đi đúng đường lỗi (báo cáo ngày TRỘN dự án với dòng ẩn đứng trước, teamlead
   Site tự mở khóa, lập nhật ký cho dự án mình không thuộc, thùng rác lộ tên dự án ẩn).
   Chạy SAU test-authz.mjs.  Cách dùng: node tests/test-hoi-quy-lan3.mjs [BASE_URL] */
const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const api = (p, o = {}, t) => fetch(B + p, { ...o, headers: { "Content-Type": "application/json", ...(t ? { Authorization: "Bearer " + t } : {}), ...(o.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (e) => (await api("/api/login", { method: "POST", body: JSON.stringify({ email: e, password: "matkhau123" }) })).body.token;

const OWNER = await login("boss@test.vn");
const AN = await login("an@test.vn");        // teamlead (không phải bộ phận Site), thành viên PM3
const doc = async (t) => JSON.parse((await api("/api/kv?key=pm_shared_v3", {}, t)).body.value);
const luu = (t, st) => api("/api/kv", { method: "POST", body: JSON.stringify({ key: "pm_shared_v3", value: JSON.stringify(st) }) }, t);
const anId = (await api("/api/me", {}, AN)).body.user.id;
const audit = async (n = 300) => (await api("/api/audit?limit=" + n, {}, OWNER)).body.entries || [];

// Teamlead bộ phận Site = "Chỉ huy trưởng" theo luật duyệt nhật ký (laCHT). Tạo riêng để không mượn tài khoản bộ khác.
let r = await api("/api/accounts", { method: "POST", body: JSON.stringify({ name: "Cht Site", email: "chtsite@test.vn", password: "matkhau123", dept: "Site", canAssign: true, isTeamlead: true }) }, OWNER);
ok("tạo tài khoản Teamlead bộ phận Site", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 80));
const CHT = await login("chtsite@test.vn");
const chtId = (await api("/api/me", {}, CHT)).body.user.id;
const T = (id, pid, over = {}) => ({ id, projectId: pid, sectionId: "", status: "todo", approver: "teamlead", title: "Viec " + id, description: "", priority: "medium", assignees: [], primaryAssigneeId: null, workdone: 0, tags: [], completed: false, subtasks: [], comments: [], dueDate: "", startDate: "", duration: null, milestone: false, dependsOn: [], assignedAt: null, completedAt: null, reminderLead: null, reminderSentKey: "", recur: "none", createdAt: Date.now(), order: 1, ...over });

/* ══════ Dựng cảnh: PL3 mở · PM3 giới hạn [An] · PZ3 giới hạn [người khác] ══════ */
{
  const st = await doc(OWNER);
  const now = Date.now();
  const moi = { ...st, rev: st.rev + 1,
    projects: [...st.projects,
      { id: "PL3", name: "Du an mo L3", color: "#0a0", createdAt: now },
      { id: "PM3", name: "Du an gioi han cua An", color: "#00a", createdAt: now, members: [anId] },
      { id: "PZ3", name: "Du an an voi An", color: "#a00", createdAt: now, members: ["ai-do"] }],
    tasks: [...st.tasks, T("tv3", "PM3"), T("tz3", "PZ3", { title: "VIEC AN L3" }), T("tl3", "PL3")],
    dailyReports: [...(st.dailyReports || []),
      /* N1: báo cáo của NGƯỜI KHÁC, dòng thuộc dự án ẩn đứng TRƯỚC dòng An thấy được */
      { id: "bcN1", memberId: "ai-do", memberName: "Nguoi khac", dept: "", date: "2026-12-01",
        items: [{ id: "d1", taskId: "tz3", taskTitle: "VIEC AN L3", moTa: "an", pct: 30, vuongMac: "" },
                { id: "d2", taskId: "tv3", taskTitle: "Viec tv3", moTa: "thay", pct: 10, vuongMac: "" }],
        comments: [], submittedAt: now, updatedAt: now },
      /* và một báo cáo dòng ẩn đứng SAU (đường đã đúng từ v4.1.1, giữ để không hồi quy) */
      { id: "bcN1b", memberId: "ai-do", memberName: "Nguoi khac", dept: "", date: "2026-12-02",
        items: [{ id: "e1", taskId: "tv3", taskTitle: "Viec tv3", moTa: "thay", pct: 10, vuongMac: "" },
                { id: "e2", taskId: "tz3", taskTitle: "VIEC AN L3", moTa: "an", pct: 30, vuongMac: "" }],
        comments: [], submittedAt: now, updatedAt: now }] };
  r = await luu(OWNER, moi);
  ok("dựng ba dự án + hai báo cáo ngày trộn dự án", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 80));
}

/* ══════ N1: người bị giới hạn phải LƯU ĐƯỢC dù báo cáo của người khác có dòng ẩn đứng trước ══════ */
{
  const cua = await doc(AN);
  const bc = (cua.dailyReports || []).find((x) => x.id === "bcN1");
  ok("N1 — An chỉ thấy dòng thuộc dự án mình trong báo cáo trộn", !!bc && bc.items.length === 1 && bc.items[0].taskId === "tv3",
     JSON.stringify(bc && bc.items.map((i) => i.taskId)));
  ok("N1 — tên việc của dự án ẩn không lọt ra", !JSON.stringify(cua.dailyReports || []).includes("VIEC AN L3"));

  r = await luu(AN, { ...cua, rev: cua.rev + 1, tasks: cua.tasks.map((x) => x.id === "tv3" ? { ...x, title: "tv3 do An sua" } : x) });
  ok("N1 — An LƯU ĐƯỢC khi báo cáo của người khác có dòng ẩn đứng TRƯỚC (v4.2.1 trả 403)", r.status === 200,
     "HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 90));

  const sau = await doc(OWNER);
  const goc = (sau.dailyReports || []).find((x) => x.id === "bcN1");
  ok("N1 — báo cáo gốc giữ đủ 2 dòng, ĐÚNG thứ tự [ẩn, thấy]", !!goc && goc.items.map((i) => i.id).join(",") === "d1,d2",
     JSON.stringify(goc && goc.items.map((i) => i.id)));
  const goc2 = (sau.dailyReports || []).find((x) => x.id === "bcN1b");
  ok("N1 — báo cáo dòng ẩn đứng sau cũng giữ nguyên thứ tự", !!goc2 && goc2.items.map((i) => i.id).join(",") === "e1,e2",
     JSON.stringify(goc2 && goc2.items.map((i) => i.id)));
  ok("N1 — thay đổi của An được ghi nhận", (sau.tasks.find((x) => x.id === "tv3") || {}).title === "tv3 do An sua");

  /* An sửa báo cáo của CHÍNH MÌNH có xen dòng ẩn: thêm dòng mới -> dòng ẩn vẫn đứng đúng chỗ */
  const cua2 = await doc(AN);
  const now = Date.now();
  const bcAn = { id: "bcAn3", memberId: anId, memberName: "An Teamlead", dept: "", date: "2026-12-03",
    items: [{ id: "a1", taskId: "tv3", taskTitle: "tv3", moTa: "cua An", pct: 20, vuongMac: "" }], comments: [], submittedAt: now, updatedAt: now };
  r = await luu(AN, { ...cua2, rev: cua2.rev + 1, dailyReports: [...(cua2.dailyReports || []), bcAn] });
  ok("An tạo báo cáo ngày của mình", r.status === 200, "HTTP " + r.status);
  // Chủ sở hữu chèn thêm một dòng thuộc dự án ẩn vào ĐẦU báo cáo của An (mô phỏng dữ liệu cũ)
  const st3 = await doc(OWNER);
  r = await luu(OWNER, { ...st3, rev: st3.rev + 1, dailyReports: st3.dailyReports.map((x) => x.id === "bcAn3"
    ? { ...x, items: [{ id: "a0", taskId: "tz3", taskTitle: "VIEC AN L3", moTa: "an", pct: 5, vuongMac: "" }, ...x.items] } : x) });
  const cua3 = await doc(AN);
  r = await luu(AN, { ...cua3, rev: cua3.rev + 1, dailyReports: cua3.dailyReports.map((x) => x.id === "bcAn3"
    ? { ...x, items: [...x.items, { id: "a2", taskId: "tv3", taskTitle: "tv3", moTa: "dong moi", pct: 40, vuongMac: "" }] } : x) });
  ok("N1 — An thêm dòng vào báo cáo của mình có xen dòng ẩn -> lưu được", r.status === 200, "HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 80));
  const st4 = await doc(OWNER);
  const bcAn4 = st4.dailyReports.find((x) => x.id === "bcAn3");
  ok("N1 — dòng ẩn vẫn đứng đầu, dòng mới nối cuối", !!bcAn4 && bcAn4.items.map((i) => i.id).join(",") === "a0,a1,a2",
     JSON.stringify(bcAn4 && bcAn4.items.map((i) => i.id)));
}

/* ══════ N3: người ngoài dự án giới hạn không lập được nhật ký / biên bản ══════ */
{
  r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ projectId: "PM3", projectName: "Du an gioi han cua An", date: "2026-12-05", work: "len" }) }, CHT);
  ok("N3 — Teamlead Site KHÔNG lập được nhật ký cho dự án mình không phải thành viên", r.status === 403, "HTTP " + r.status);
  r = await api("/api/records", { method: "POST", body: JSON.stringify({ projectId: "PM3", projectName: "Du an gioi han cua An", date: "2026-12-05", type: "BB", note: "len" }) }, CHT);
  ok("N3 — ... cũng không lập được biên bản", r.status === 403, "HTTP " + r.status);
  r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ projectId: "PL3", projectName: "Du an mo L3", date: "2026-12-05", work: "ok" }) }, CHT);
  ok("N3 — dự án MỞ thì Teamlead Site vẫn lập được như trước", r.status === 200, "HTTP " + r.status);
  // thêm Cht vào thành viên PM3 -> lập được
  const st = await doc(OWNER);
  await luu(OWNER, { ...st, rev: st.rev + 1, projects: st.projects.map((p) => p.id === "PM3" ? { ...p, members: [anId, chtId] } : p) });
  r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ projectId: "PM3", projectName: "Du an gioi han cua An", date: "2026-12-05", work: "ok" }) }, CHT);
  ok("N3 — được thêm vào thành viên thì lập được", r.status === 200, "HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 80));
  ok("N3 — Chủ sở hữu vẫn lập được cho mọi dự án",
     (await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ projectId: "PZ3", projectName: "Du an an voi An", date: "2026-12-05", work: "chu" }) }, OWNER)).status === 200);
}

/* ══════ N2: mở khóa nhật ký đã duyệt chỉ Chủ sở hữu / Lãnh đạo ══════ */
{
  r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ projectId: "PL3", projectName: "Du an mo L3", date: "2026-12-06", work: "x", trangThai: "danop" }) }, CHT);
  const lid = r.body.log && r.body.log.id;
  ok("Teamlead Site lập + nộp nhật ký", r.status === 200 && !!lid, "HTTP " + r.status);
  r = await api("/api/sitelogs/approve", { method: "POST", body: JSON.stringify({ id: lid, duyet: true }) }, CHT);
  ok("Teamlead Site duyệt được (là Chỉ huy trưởng công trường)", r.status === 200 && r.body.trangThai === "daduyet", "HTTP " + r.status);
  r = await api("/api/sitelogs/approve", { method: "POST", body: JSON.stringify({ id: lid, duyet: false }) }, CHT);
  ok("N2 — Teamlead Site KHÔNG tự mở khóa được bản đã duyệt", r.status === 403, "HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 80));
  const conKhoa = ((await api("/api/sitelogs?projectId=PL3", {}, OWNER)).body.logs || []).find((l) => l.id === lid);
  ok("N2 — bản vẫn ở trạng thái đã duyệt", !!conKhoa && conKhoa.trangThai === "daduyet", conKhoa && conKhoa.trangThai);
  r = await api("/api/sitelogs/approve", { method: "POST", body: JSON.stringify({ id: lid, duyet: false }) }, OWNER);
  ok("N2 — Chủ sở hữu mở khóa được", r.status === 200 && r.body.trangThai === "danop", "HTTP " + r.status);
  const au = await audit();
  ok("N2 — nhật ký kiểm toán có vết DUYỆT nhật ký", au.some((e) => e.entity === "sitelog" && e.field === "duyệt nhật ký" && e.id === lid),
     JSON.stringify(au.filter((e) => e.entity === "sitelog").slice(0, 3)));
  ok("N2 — ... và vết MỞ KHÓA (kèm ai, từ trạng thái nào)", au.some((e) => e.entity === "sitelog" && e.field === "mở khóa nhật ký" && e.id === lid && e.from === "daduyet" && e.to === "danop"));
}

/* ══════ N4: thùng rác không lộ tên dự án giới hạn đã xóa; dự án mở đã xóa vẫn thấy ══════ */
{
  const st = await doc(OWNER);
  const now = Date.now();
  const pz = st.projects.find((p) => p.id === "PZ3"), pl = st.projects.find((p) => p.id === "PL3");
  const moi = { ...st, rev: st.rev + 1,
    projects: st.projects.filter((p) => p.id !== "PZ3" && p.id !== "PL3"),
    tasks: st.tasks.filter((x) => x.projectId !== "PZ3" && x.projectId !== "PL3"),
    trash: [
      { id: "PZ3", name: "TEN DU AN AN DA XOA", deletedAt: now, deletedBy: "Chu So Huu", project: pz, sections: [], tasks: st.tasks.filter((x) => x.projectId === "PZ3") },
      { id: "PL3", name: "Du an mo L3 da xoa", deletedAt: now, deletedBy: "Chu So Huu", project: pl, sections: [], tasks: st.tasks.filter((x) => x.projectId === "PL3") },
      ...(st.trash || [])] };
  r = await luu(OWNER, moi);
  ok("Chủ sở hữu xóa (vào thùng rác) một dự án giới hạn và một dự án mở", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 80));
  const cua = await doc(AN);
  ok("N4 — người ngoài KHÔNG thấy tên dự án giới hạn đã xóa trong thùng rác", !JSON.stringify(cua.trash || []).includes("TEN DU AN AN DA XOA"),
     JSON.stringify((cua.trash || []).map((e) => e.name)));
  ok("N4 — dự án MỞ đã xóa vẫn thấy (để còn khôi phục)", (cua.trash || []).some((e) => e.id === "PL3"),
     JSON.stringify((cua.trash || []).map((e) => e.name)));
  r = await luu(AN, { ...cua, rev: cua.rev + 1 });
  ok("N4 — An lưu bình thường", r.status === 200, "HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 80));
  const sau = await doc(OWNER);
  ok("N4 — mục thùng rác của dự án ẩn KHÔNG bị mất sau khi An lưu", (sau.trash || []).some((e) => e.id === "PZ3") && (sau.trash || []).some((e) => e.id === "PL3"),
     JSON.stringify((sau.trash || []).map((e) => e.id)));
}

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
