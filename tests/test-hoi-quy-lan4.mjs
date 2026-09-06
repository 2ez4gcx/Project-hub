/* Test các lỗi cạnh của báo cáo AUDIT LẦN 4 (06/09, v4.2.2) — F1..F4.
   Ba lỗi nằm ở đúng vùng "Thành viên dự án" vừa vá ở v4.2.2, ở các cạnh mà 28 ca của lần 3 không
   đi: dự án giới hạn chỉ còn trong thùng rác, dòng báo cáo không có id, dòng trỏ tới việc đã xóa.
   Chạy SAU test-hoi-quy-lan3.mjs.  Cách dùng: node tests/test-hoi-quy-lan4.mjs [BASE_URL] */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const api = (p, o = {}, t) => fetch(B + p, { ...o, headers: { "Content-Type": "application/json", ...(t ? { Authorization: "Bearer " + t } : {}), ...(o.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (e) => (await api("/api/login", { method: "POST", body: JSON.stringify({ email: e, password: "matkhau123" }) })).body.token;

const OWNER = await login("boss@test.vn");
const AN = await login("an@test.vn");        // teamlead, thành viên P1 — người "bị giới hạn" trong các ca dưới
const doc = async (t) => JSON.parse((await api("/api/kv?key=pm_shared_v3", {}, t)).body.value);
const luu = (t, st) => api("/api/kv", { method: "POST", body: JSON.stringify({ key: "pm_shared_v3", value: JSON.stringify(st) }) }, t);
const anId = (await api("/api/me", {}, AN)).body.user.id;
const T = (id, pid, over = {}) => ({ id, projectId: pid, sectionId: "", status: "todo", approver: "teamlead", title: "Viec " + id, description: "", priority: "medium", assignees: [], primaryAssigneeId: null, workdone: 0, tags: [], completed: false, subtasks: [], comments: [], dueDate: "", startDate: "", duration: null, milestone: false, dependsOn: [], assignedAt: null, completedAt: null, reminderLead: null, reminderSentKey: "", recur: "none", createdAt: Date.now(), order: 1, ...over });
const now = Date.now();

/* ══════ Dựng cảnh: PZ4 giới hạn [người khác] đang sống, có việc tz4 và việc tz4del đã xóa;
          PZ5 giới hạn đã xóa vào thùng rác (kèm việc tz5 bên trong); P1 giới hạn [An] có việc tv4 ══════ */
{
  const st = await doc(OWNER);
  const tz4del = T("tz4del", "PZ4", { title: "VIEC AN DA XOA L4" });
  const tz5 = T("tz5", "PZ5", { title: "VIEC TRONG DU AN DA XOA L4" });
  const moi = { ...st, rev: st.rev + 1,
    projects: [...st.projects.filter((p) => p.id !== "PZ4").map((p) => p.id === "P1" ? { ...p, members: [anId] } : p),
      { id: "PZ4", name: "Du an an L4", color: "#a00", createdAt: now, members: ["ai-do"] }],
    tasks: [...st.tasks.filter((x) => !["tz4", "tv4"].includes(x.id)), T("tz4", "PZ4", { title: "VIEC AN L4" }), T("tv4", "P1")],
    trash: [
      { id: "tz4del", kind: "task", name: tz4del.title, projectId: "PZ4", deletedAt: now, deletedBy: "Chu So Huu", task: tz4del },
      { id: "PZ5", name: "TEN DU AN AN DA XOA L4", deletedAt: now, deletedBy: "Chu So Huu",
        project: { id: "PZ5", name: "TEN DU AN AN DA XOA L4", color: "#000", members: ["ai-do"] }, sections: [], tasks: [tz5] },
      ...(st.trash || []).filter((e) => e.id !== "tz4del" && e.id !== "PZ5")],
    dailyReports: [...(st.dailyReports || []).filter((x) => !["bcF2", "bcF3"].includes(x.id)),
      /* F2: báo cáo của người khác có dòng KHÔNG id xen giữa dòng ẩn và dòng có id */
      { id: "bcF2", memberId: "ai-do", memberName: "Nguoi khac", dept: "", date: "2026-12-10",
        items: [{ id: "f1", taskId: "tz4", taskTitle: "VIEC AN L4", moTa: "an", pct: 30, vuongMac: "" },
                { taskId: "tv4", taskTitle: "Viec tv4", moTa: "dong khong id", pct: 10, vuongMac: "" },
                { id: "f3", taskId: "tv4", taskTitle: "Viec tv4", moTa: "co id", pct: 20, vuongMac: "" }],
        comments: [], submittedAt: now, updatedAt: now },
      /* F3: dòng trỏ tới việc ĐÃ XÓA của dự án ẩn (mục thùng rác) và việc nằm TRONG dự án đã xóa */
      { id: "bcF3", memberId: "ai-do", memberName: "Nguoi khac", dept: "", date: "2026-12-11",
        items: [{ id: "g1", taskId: "tz4del", taskTitle: "VIEC AN DA XOA L4", moTa: "an-da-xoa", pct: 30, vuongMac: "" },
                { id: "g2", taskId: "tz5", taskTitle: "VIEC TRONG DU AN DA XOA L4", moTa: "an-trong-du-an-da-xoa", pct: 30, vuongMac: "" },
                { id: "g3", taskId: "tv4", taskTitle: "Viec tv4", moTa: "thay", pct: 10, vuongMac: "" }],
        comments: [], submittedAt: now, updatedAt: now }] };
  const r = await luu(OWNER, moi);
  ok("dựng cảnh F2/F3 (dự án ẩn sống + việc đã xóa + dự án ẩn đã xóa)", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 80));
}

/* ══════ F2: dòng không id ══════ */
{
  const cua = await doc(AN);
  const bc = (cua.dailyReports || []).find((x) => x.id === "bcF2");
  ok("F2 — An thấy đúng 2 dòng mở (dòng không id + dòng có id), không thấy dòng ẩn",
     !!bc && bc.items.length === 2 && bc.items.every((i) => i.taskId === "tv4"), JSON.stringify(bc && bc.items.map((i) => i.moTa)));
  const r = await luu(AN, { ...cua, rev: cua.rev + 1, tasks: cua.tasks.map((x) => x.id === "tv4" ? { ...x, title: "tv4 do An sua L4" } : x) });
  ok("F2 — An LƯU ĐƯỢC dù báo cáo của người khác có dòng không id (v4.2.2 trả 403)", r.status === 200,
     "HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 90));
  const sau = await doc(OWNER);
  const goc = (sau.dailyReports || []).find((x) => x.id === "bcF2");
  ok("F2 — báo cáo gốc giữ đủ 3 dòng đúng thứ tự, không nhân đôi dòng không id",
     !!goc && goc.items.map((i) => i.moTa).join("|") === "an|dong khong id|co id", JSON.stringify(goc && goc.items.map((i) => i.moTa)));
  ok("F2 — thay đổi của An được ghi nhận", (sau.tasks.find((x) => x.id === "tv4") || {}).title === "tv4 do An sua L4");
}

/* ══════ F3: dòng trỏ tới việc đã xóa ══════ */
{
  const cua = await doc(AN);
  const bc = (cua.dailyReports || []).find((x) => x.id === "bcF3");
  ok("F3 — dòng trỏ tới việc ĐÃ XÓA của dự án ẩn không lộ ra", !!bc && !bc.items.some((i) => i.taskId === "tz4del"),
     JSON.stringify(bc && bc.items.map((i) => i.taskId)));
  ok("F3 — dòng trỏ tới việc TRONG dự án ẩn đã xóa không lộ ra", !!bc && !bc.items.some((i) => i.taskId === "tz5"),
     JSON.stringify(bc && bc.items.map((i) => i.taskId)));
  ok("F3 — không tên việc ẩn nào lọt vào khối dữ liệu của An",
     !JSON.stringify(cua).includes("VIEC AN DA XOA L4") && !JSON.stringify(cua).includes("VIEC TRONG DU AN DA XOA L4"));
  const r = await luu(AN, { ...cua, rev: cua.rev + 1 });
  ok("F3 — An lưu bình thường", r.status === 200, "HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 80));
  const sau = await doc(OWNER);
  const goc = (sau.dailyReports || []).find((x) => x.id === "bcF3");
  ok("F3 — hai dòng ẩn vẫn còn nguyên trên máy chủ, đúng thứ tự", !!goc && goc.items.map((i) => i.id).join(",") === "g1,g2,g3",
     JSON.stringify(goc && goc.items.map((i) => i.id)));
}

/* ══════ F1: dự án giới hạn chỉ còn trong thùng rác thì phạm vi vẫn phải bật ══════ */
{
  // Tắt giới hạn của MỌI dự án đang sống (nhớ lại để trả về) — chỉ còn PZ5 (đã xóa) là có thành viên.
  const st = await doc(OWNER);
  const goc = Object.fromEntries(st.projects.map((p) => [p.id, p.members || []]));
  let r = await luu(OWNER, { ...st, rev: st.rev + 1, projects: st.projects.map((p) => ({ ...p, members: [] })) });
  ok("bỏ giới hạn mọi dự án đang sống (chỉ còn dự án giới hạn đã xóa)", r.status === 200, r.status);
  const cua = await doc(AN);
  ok("F1 — người ngoài KHÔNG thấy dự án giới hạn đã xóa trong thùng rác (v4.2.2: phạm vi tắt hẳn, thấy cả 999 việc)",
     !(cua.trash || []).some((e) => e.id === "PZ5") && !JSON.stringify(cua).includes("TEN DU AN AN DA XOA L4"),
     JSON.stringify((cua.trash || []).map((e) => e.name)));
  ok("F1 — dự án mở vẫn thấy bình thường", (cua.projects || []).some((p) => p.id === "P1"));
  r = await luu(AN, { ...cua, rev: cua.rev + 1 });
  ok("F1 — An lưu bình thường", r.status === 200, "HTTP " + r.status + " " + JSON.stringify(r.body).slice(0, 80));
  const sau = await doc(OWNER);
  ok("F1 — mục thùng rác của dự án giới hạn KHÔNG bị mất sau khi An lưu", (sau.trash || []).some((e) => e.id === "PZ5"));
  r = await luu(OWNER, { ...sau, rev: sau.rev + 1, projects: sau.projects.map((p) => ({ ...p, members: goc[p.id] || [] })) });
  ok("trả lại giới hạn cho các dự án", r.status === 200, r.status);
}

/* ══════ F4: từ điển audit đủ tên trường máy chủ ghi ══════ */
{
  const JSX = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "Chạy nội bộ", "ProjectManager.jsx"), "utf8");
  const khoi = [...JSX.matchAll(/auditField: \{([^}]*)\}/g)].map((m) => m[1]);
  const can = ["members", "siteLoggers", "lich", "baseline", "name", "khóa kỳ", "mở khóa kỳ", "duyệt nhật ký", "mở khóa nhật ký"];
  ok("F4 — từ điển audit có 2 khối (vi, en)", khoi.length === 2, String(khoi.length));
  for (const k of can) ok("F4 — cả hai ngôn ngữ dịch trường '" + k + "'", khoi.every((b) => b.includes(k + ":") || b.includes("\"" + k + "\":")));
  const ent = [...JSX.matchAll(/auditEntity: \{([^}]*)\}/g)].map((m) => m[1]);
  ok("F4 — thực thể 'batch' có tên hiển thị", ent.length === 2 && ent.every((b) => b.includes("batch:")));
}

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
