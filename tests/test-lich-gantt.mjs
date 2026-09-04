/* Test logic lịch & đường găng của Gantt (audit 04/09: B1 múi giờ, B4 CPM theo bộ lọc).
   Trích thẳng hàm/thuật toán từ ProjectManager.jsx để chạy không cần trình duyệt.
   Cách dùng:  node tests/test-lich-gantt.mjs */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(path.join(HERE, "..", "Chạy nội bộ", "ProjectManager.jsx"), "utf8");

let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };

// ── lấy isoOf và parseISO thật từ mã nguồn ──
const grab = (name) => {                       // các hàm này viết gọn 1 dòng — lấy nguyên dòng
  const line = SRC.split("\n").find((l) => l.trim().startsWith("function " + name + "("));
  if (!line) throw new Error("không thấy hàm " + name);
  return line.trim();
};
const isoOf = eval("(" + grab("isoOf").replace("function isoOf", "function") + ")");
const DAY_MS = 86400000;

// ═══════════ B1: kéo k ngày phải ra đúng k ngày (múi giờ địa phương) ═══════════
const drag = (isoStart, days) => {
  const d = new Date(isoStart + "T00:00:00");             // đúng cách app dựng ngày (parseISO)
  return isoOf(new Date(d.getTime() + days * DAY_MS));
};
ok("kéo +2 ngày từ 18/10 → 20/10", drag("2026-10-18", 2) === "2026-10-20", drag("2026-10-18", 2));
ok("kéo +12 ngày từ 14/10 → 26/10", drag("2026-10-14", 12) === "2026-10-26", drag("2026-10-14", 12));
ok("kéo −3 ngày từ 01/03 → 26/02", drag("2026-03-01", -3) === "2026-02-26", drag("2026-03-01", -3));
ok("kéo 0 ngày giữ nguyên", drag("2026-10-14", 0) === "2026-10-14", drag("2026-10-14", 0));
ok("qua ranh giới năm: 30/12 +3 → 02/01", drag("2026-12-30", 3) === "2027-01-02", drag("2026-12-30", 3));
let lech = 0;
for (let k = 0; k <= 60; k++) {
  const base = new Date("2026-06-01T00:00:00");
  const want = new Date(base.getTime() + k * DAY_MS);
  if (drag("2026-06-01", k) !== isoOf(want)) lech++;
}
ok("kéo 0..60 ngày đều khớp (không lệch múi giờ)", lech === 0, lech + " trường hợp lệch");
ok("isoOf không dùng toISOString", !grab("isoOf").includes("toISOString"));

// ═══════════ B4 + P2: CPM trên toàn dự án, 4 loại phụ thuộc, độ trễ, lịch làm việc ═══════════
/* Dựng lại ĐÚNG thuật toán trong TimelineView (khối `nen` useMemo) để chạy không cần trình duyệt.
   Nếu sửa CPM trong ProjectManager.jsx thì phải sửa cả ở đây — hai chốt chặn ở cuối tệp
   kiểm rằng mã nguồn vẫn còn 4 loại phụ thuộc và vẫn tính theo ngày làm việc. */
const LOAI_PT = ["FS", "SS", "FF", "SF"];
const chuanDep = (d) => typeof d === "string"
  ? { id: d, type: "FS", lag: 0 }
  : { id: String((d && d.id) || ""), type: LOAI_PT.includes(d && d.type) ? d.type : "FS", lag: Math.round(Number(d && d.lag) || 0) };
const depsCua = (tk) => ((tk && tk.dependsOn) || []).map(chuanDep).filter((d) => d.id);

function cpm(tasks, visibleIds, lich) {
  lich = lich || { ngayNghi: [], ngayLe: [] };            // mặc định trong test: làm cả tuần
  const parse = (x) => (x ? new Date(x + "T00:00:00") : null);
  const allItems = tasks.map((tk) => {
    let a = parse(tk.startDate) || parse(tk.dueDate);
    let b = parse(tk.dueDate) || parse(tk.startDate);
    if (!a || !b) return null;
    if (b < a) b = a;
    return { tk, start: a, end: b };
  }).filter(Boolean).sort((x, y) => x.start - y.start);
  const items = visibleIds ? allItems.filter((it) => visibleIds.has(it.tk.id)) : allItems;
  let min = allItems[0].start, max = allItems[0].end;
  allItems.forEach((it) => { if (it.start < min) min = it.start; if (it.end > max) max = it.end; });
  min = new Date(min.getTime() - 2 * DAY_MS); max = new Date(max.getTime() + 3 * DAY_MS);
  const totalDays = Math.round((max - min) / DAY_MS) + 1;
  const dayOf = (d) => Math.round((d - min) / DAY_MS);

  const nghiTuan = new Set(lich.ngayNghi), ngayLe = new Set(lich.ngayLe);
  const lamViec = new Array(totalDays + 2).fill(true);
  const viTri = new Array(totalDays + 3).fill(0);
  for (let k = 0; k <= totalDays + 1; k++) {
    const d = new Date(min.getTime() + k * DAY_MS);
    const isoNgay = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    lamViec[k] = !nghiTuan.has(d.getDay()) && !ngayLe.has(isoNgay);
    viTri[k + 1] = viTri[k] + (lamViec[k] ? 1 : 0);
  }
  const wOf = (k) => viTri[Math.max(0, Math.min(totalDays + 1, k))];
  const soNgayLam = (a, b) => Math.max(1, wOf(b + 1) - wOf(a));

  const nodeById = {};
  allItems.forEach((it, idx) => {
    const a = dayOf(it.start), b = dayOf(it.end);
    nodeById[it.tk.id] = { i: idx, startDay: a, endDay: b, startW: wOf(a), dur: soNgayLam(a, b), deps: [] };
  });
  allItems.forEach((it) => { nodeById[it.tk.id].deps = depsCua(it.tk).filter((d) => nodeById[d.id]); });
  const succ = {}; Object.keys(nodeById).forEach((id) => { succ[id] = []; });
  Object.keys(nodeById).forEach((id) => nodeById[id].deps.forEach((d) => succ[d.id].push({ id, type: d.type, lag: d.lag })));
  const indeg = {}; Object.keys(nodeById).forEach((id) => { indeg[id] = nodeById[id].deps.length; });
  const topo = []; const q = Object.keys(nodeById).filter((id) => !indeg[id]);
  while (q.length) { const id = q.shift(); topo.push(id); for (const sc of succ[id]) if (--indeg[sc.id] === 0) q.push(sc.id); }
  const hasCycle = topo.length !== allItems.length;
  const es = {}, ef = {}, ls = {}, lf = {}, slack = {}; const violated = new Set();
  if (!hasCycle) {
    const rangBuoc = (d, dur) => {
      if (d.type === "SS") return es[d.id] + d.lag;
      if (d.type === "FF") return ef[d.id] + d.lag - dur;
      if (d.type === "SF") return es[d.id] + d.lag - dur;
      return ef[d.id] + d.lag;
    };
    for (const id of topo) {
      const nd = nodeById[id];
      const som = nd.deps.length ? Math.max(...nd.deps.map((d) => rangBuoc(d, nd.dur))) : -Infinity;
      es[id] = Math.max(nd.startW, som === -Infinity ? 0 : som);
      ef[id] = es[id] + nd.dur;
      for (const d of nd.deps) {
        const p = nodeById[d.id];
        const viPham = d.type === "SS" ? nd.startW < p.startW + d.lag
          : d.type === "FF" ? nd.startW + nd.dur < p.startW + p.dur + d.lag
          : d.type === "SF" ? nd.startW + nd.dur < p.startW + d.lag
          : nd.startW < p.startW + p.dur + d.lag;
        if (viPham) { violated.add(id); break; }
      }
    }
    const projEnd = Math.max(...Object.values(ef));
    for (const id of [...topo].reverse()) {
      const dur = nodeById[id].dur, ss = succ[id];
      ls[id] = ss.length ? Math.min(...ss.map((sc) => sc.type === "SS" ? ls[sc.id] - sc.lag
        : sc.type === "FF" ? ls[sc.id] + nodeById[sc.id].dur - dur - sc.lag
        : sc.type === "SF" ? ls[sc.id] + nodeById[sc.id].dur - sc.lag
        : ls[sc.id] - dur - sc.lag)) : projEnd - dur;
      lf[id] = ls[id] + dur;
      slack[id] = ls[id] - es[id];
    }
  }
  return { critical: Object.keys(slack).filter((id) => slack[id] === 0).sort(), slack,
           hienThi: items.map((it) => it.tk.id).sort(), viPham: [...violated].sort(),
           dur: Object.fromEntries(Object.keys(nodeById).map((id) => [id, nodeById[id].dur])) };
}

const T = (id, s2, e, deps) => ({ id, startDate: s2, dueDate: e, dependsOn: deps || [] });
const chain = [
  T("A", "2026-10-01", "2026-10-05"),
  T("B", "2026-10-06", "2026-10-10", ["A"]),
  T("C", "2026-10-06", "2026-10-07", ["A"]),          // có dự trữ
  T("D", "2026-10-11", "2026-10-15", ["B", "C"]),
];
const full = cpm(chain, null);
ok("không lọc: đường găng = A,B,D", full.critical.join(",") === "A,B,D", full.critical.join(","));
const loc = cpm(chain, new Set(["B", "D"]));
ok("lọc còn B,D: đường găng VẪN là A,B,D", loc.critical.join(",") === "A,B,D", loc.critical.join(","));
ok("lọc còn B,D: chỉ vẽ 2 dòng", loc.hienThi.join(",") === "B,D", loc.hienThi.join(","));
const an = cpm(chain, new Set(["C"]));
ok("lọc còn mỗi C: C vẫn KHÔNG phải việc găng", !an.critical.includes("C"), an.critical.join(","));

// ── P2: dạng cũ (chuỗi id) vẫn hiểu là FS lag 0 ──
const cu = cpm([T("A", "2026-10-01", "2026-10-05"), T("B", "2026-10-06", "2026-10-10", ["A"])], null);
const moiDang = cpm([T("A", "2026-10-01", "2026-10-05"), T("B", "2026-10-06", "2026-10-10", [{ id: "A", type: "FS", lag: 0 }])], null);
ok("phụ thuộc dạng cũ (chuỗi) = dạng mới FS lag 0", JSON.stringify(cu.slack) === JSON.stringify(moiDang.slack));

// ── P2: FS có lag dương (chờ thêm) ──
const lag3 = cpm([T("A", "2026-10-01", "2026-10-05"), T("B", "2026-10-06", "2026-10-10", [{ id: "A", type: "FS", lag: 3 }])], null);
ok("FS lag +3: B đặt sớm hơn ràng buộc -> báo vi phạm lịch", lag3.viPham.includes("B"), JSON.stringify(lag3.viPham));
const lag3ok = cpm([T("A", "2026-10-01", "2026-10-05"), T("B", "2026-10-09", "2026-10-13", [{ id: "A", type: "FS", lag: 3 }])], null);
ok("FS lag +3: B lùi đúng 3 ngày -> không vi phạm", lag3ok.viPham.length === 0, JSON.stringify(lag3ok.viPham));

// ── P2: FS có lead âm (chồng lấn) ──
const lead = cpm([T("A", "2026-10-01", "2026-10-10"), T("B", "2026-10-08", "2026-10-12", [{ id: "A", type: "FS", lag: -3 }])], null);
ok("FS lag −3 (chồng lấn 3 ngày): hợp lệ, không báo vi phạm", lead.viPham.length === 0, JSON.stringify(lead.viPham));

// ── P2: SS — hai việc cùng bắt đầu ──
const ss = cpm([T("A", "2026-10-01", "2026-10-10"), T("B", "2026-10-01", "2026-10-06", [{ id: "A", type: "SS", lag: 0 }])], null);
ok("SS lag 0: cùng ngày bắt đầu -> hợp lệ", ss.viPham.length === 0, JSON.stringify(ss.viPham));
const ssSom = cpm([T("A", "2026-10-05", "2026-10-14"), T("B", "2026-10-01", "2026-10-06", [{ id: "A", type: "SS", lag: 0 }])], null);
ok("SS: việc sau bắt đầu TRƯỚC việc trước -> vi phạm", ssSom.viPham.includes("B"), JSON.stringify(ssSom.viPham));
const ss2 = cpm([T("A", "2026-10-01", "2026-10-10"), T("B", "2026-10-03", "2026-10-08", [{ id: "A", type: "SS", lag: 2 }])], null);
ok("SS lag +2: bắt đầu sau 2 ngày -> hợp lệ", ss2.viPham.length === 0, JSON.stringify(ss2.viPham));

// ── P2: FF — cùng kết thúc ──
const ff = cpm([T("A", "2026-10-01", "2026-10-10"), T("B", "2026-10-05", "2026-10-10", [{ id: "A", type: "FF", lag: 0 }])], null);
ok("FF lag 0: cùng ngày kết thúc -> hợp lệ", ff.viPham.length === 0, JSON.stringify(ff.viPham));
const ffSom = cpm([T("A", "2026-10-01", "2026-10-10"), T("B", "2026-10-01", "2026-10-05", [{ id: "A", type: "FF", lag: 0 }])], null);
ok("FF: việc sau xong TRƯỚC việc trước -> vi phạm", ffSom.viPham.includes("B"), JSON.stringify(ffSom.viPham));

// ── P2: SF ──
const sf = cpm([T("A", "2026-10-05", "2026-10-12"), T("B", "2026-10-01", "2026-10-06", [{ id: "A", type: "SF", lag: 0 }])], null);
ok("SF lag 0: việc sau xong sau khi việc trước bắt đầu -> hợp lệ", sf.viPham.length === 0, JSON.stringify(sf.viPham));

// ── P2: lịch làm việc — Chủ nhật không phải ngày thi công ──
// 05/10/2026 là thứ Hai; 05→11/10 gồm 1 Chủ nhật (11/10)
const camTuan = cpm([T("A", "2026-10-05", "2026-10-11")], null, { ngayNghi: [], ngayLe: [] });
const nghiCN = cpm([T("A", "2026-10-05", "2026-10-11")], null, { ngayNghi: [0], ngayLe: [] });
ok("làm cả tuần: 05→11/10 = 7 ngày", camTuan.dur.A === 7, String(camTuan.dur.A));
ok("nghỉ Chủ nhật: 05→11/10 chỉ còn 6 ngày công", nghiCN.dur.A === 6, String(nghiCN.dur.A));
const nghiLe = cpm([T("A", "2026-10-05", "2026-10-11")], null, { ngayNghi: [0], ngayLe: ["2026-10-07"] });
ok("thêm 1 ngày lễ giữa tuần: còn 5 ngày công", nghiLe.dur.A === 5, String(nghiLe.dur.A));

// ══════ R12 (audit lần 2): mốc không tiêu tốn ngày công ══════
ok("R12 — CPM trong mã nguồn cho mốc dur = 0",
   SRC.includes("dur: it.tk.milestone ? 0 : soNgayLam(a, b)"),
   "không thấy nhánh milestone trong phần dựng nodeById");

// ══════ Nhãn hạn chót: việc ĐÃ XONG thì không còn "quá hạn" ══════
/* Lỗi thật đã gặp: mọi việc đã hoàn thành có hạn chót trong quá khứ đều bị gắn nhãn đỏ
   "Quá hạn" — sai nghiệp vụ (xong rồi thì hết trễ) và làm dự án cũ đỏ rực cả màn hình.
   Nguyên nhân: DueBadge chưa bao giờ được cho biết việc đã xong hay chưa. */
{
  const thanDM = (() => {
    const i = SRC.indexOf("function dueMeta(");
    const j = SRC.indexOf("\n}", i);
    return SRC.slice(i, j + 2);
  })();
  /* dueMeta cần bảng chữ T và today0 -> nạp bản tối giản đủ dùng */
  const today0 = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
  const T = { vi: { overdue: "Quá hạn", today: "Hôm nay", tomorrow: "Ngày mai" } };
  const dueMeta = eval("(" + thanDM.replace("function dueMeta", "function") + ")");

  const truoc = new Date(Date.now() - 10 * DAY_MS);
  const isoTruoc = truoc.getFullYear() + "-" + String(truoc.getMonth() + 1).padStart(2, "0") + "-" + String(truoc.getDate()).padStart(2, "0");
  const m = dueMeta(isoTruoc, "vi");
  ok("hạn chót đã qua -> dueMeta báo overdue", m.overdue === true);
  ok("dueMeta trả về NGÀY THẬT để hiển thị cho việc đã xong",
     m.date === truoc.getDate() + "/" + (truoc.getMonth() + 1), m.date);

  ok("DueBadge nhận biết việc đã xong", /function DueBadge\(\{ iso, lang, done \}\)/.test(SRC));
  ok("việc đã xong KHÔNG tô màu cảnh báo",
     SRC.includes('const mau = done ? "default" : m.overdue ? "error" : m.soon ? "warning" : "default";'));
  const soCho = (SRC.match(/<DueBadge iso=\{task\.dueDate\} lang=\{lang\} done=/g) || []).length;
  const tongCho = (SRC.match(/<DueBadge /g) || []).length;
  ok("MỌI chỗ dùng DueBadge đều truyền trạng thái hoàn thành", soCho === tongCho, soCho + "/" + tongCho + " chỗ");
}

// ── chốt chặn: mã nguồn đang chạy phải còn đúng các thành phần này ──
ok("ProjectManager.jsx có đủ 4 loại phụ thuộc", /LOAI_PT = \["FS", "SS", "FF", "SF"\]/.test(SRC));
ok("CPM trong mã nguồn tính theo ngày làm việc", SRC.includes("const soNgayLam = (a, b)") && SRC.includes("lamViec[k] = !nghiTuan.has"));
ok("CPM trong mã nguồn có ràng buộc SS/FF/SF", SRC.includes('if (d.type === "SS") return es[d.id] + d.lag;') && SRC.includes('if (d.type === "FF") return ef[d.id] + d.lag - dur;'));

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
