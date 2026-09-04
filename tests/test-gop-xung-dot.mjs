/* Test GỘP KHI XUNG ĐỘT (audit 04/09: U5).
   Trước đây gặp 409 là app tải lại và BỎ HẾT thao tác đang gõ. Nay gộp theo từng bản ghi.
   Hàm gopBaChieu được lấy thẳng từ mã nguồn đang chạy, không chép lại.
   Cách dùng: node tests/test-gop-xung-dot.mjs */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(path.join(HERE, "..", "Chạy nội bộ", "ProjectManager.jsx"), "utf8");
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };

const than = (() => {
  const i = SRC.indexOf("function gopBaChieu(");
  if (i < 0) throw new Error("không thấy hàm gopBaChieu trong ProjectManager.jsx");
  const j = SRC.indexOf("\n}", i);
  return SRC.slice(i, j + 2);
})();
const gopBaChieu = eval("(" + than.replace("function gopBaChieu", "function") + ")");

const T = (id, extra) => ({ id, title: "Việc " + id, workdone: 0, ...extra });
const lay = (r, id) => r.ket.find((x) => x.id === id);
const ids = (r) => r.ket.map((x) => x.id).sort().join(",");

// ── chỉ mình tôi sửa -> giữ bản của tôi ──
{
  const goc = [T("a"), T("b")];
  const toi = [T("a", { workdone: 50 }), T("b")];
  const ho = [T("a"), T("b")];
  const r = gopBaChieu(goc, toi, ho);
  ok("chỉ tôi sửa -> thay đổi của tôi được giữ", lay(r, "a").workdone === 50, JSON.stringify(lay(r, "a")));
  ok("không báo xung đột", r.xungDot.length === 0);
}

// ── chỉ họ sửa -> giữ bản máy chủ ──
{
  const goc = [T("a")];
  const toi = [T("a")];
  const ho = [T("a", { workdone: 80 })];
  const r = gopBaChieu(goc, toi, ho);
  ok("chỉ họ sửa -> giữ bản máy chủ", lay(r, "a").workdone === 80, JSON.stringify(lay(r, "a")));
}

// ── mỗi người sửa một bản ghi khác nhau -> giữ CẢ HAI (điều quan trọng nhất) ──
{
  const goc = [T("a"), T("b")];
  const toi = [T("a", { workdone: 50 }), T("b")];
  const ho = [T("a"), T("b", { workdone: 30 })];
  const r = gopBaChieu(goc, toi, ho);
  ok("hai người sửa hai việc khác nhau -> GIỮ CẢ HAI thay đổi",
     lay(r, "a").workdone === 50 && lay(r, "b").workdone === 30,
     JSON.stringify(r.ket));
  ok("không có xung đột nào", r.xungDot.length === 0);
}

// ── cả hai cùng sửa một bản ghi -> nhường máy chủ, báo đúng bản ghi đó ──
{
  const goc = [T("a")];
  const toi = [T("a", { workdone: 50 })];
  const ho = [T("a", { workdone: 90 })];
  const r = gopBaChieu(goc, toi, ho);
  ok("cùng sửa một việc -> giữ bản máy chủ", lay(r, "a").workdone === 90);
  ok("báo đúng 1 mục xung đột", r.xungDot.length === 1 && r.xungDot[0].id === "a", JSON.stringify(r.xungDot));
}

// ── tôi tạo mới -> phải được thêm vào ──
{
  const goc = [T("a")];
  const toi = [T("a"), T("moi")];
  const ho = [T("a"), T("cuaHo")];
  const r = gopBaChieu(goc, toi, ho);
  ok("việc tôi vừa tạo KHÔNG bị mất", ids(r) === "a,cuaHo,moi", ids(r));
}

// ── tôi xóa, họ không đụng -> xóa thật ──
{
  const goc = [T("a"), T("b")];
  const toi = [T("a")];
  const ho = [T("a"), T("b")];
  const r = gopBaChieu(goc, toi, ho);
  ok("tôi xóa một việc -> việc đó bị xóa", ids(r) === "a", ids(r));
}

// ── tôi xóa nhưng họ vừa sửa -> giữ lại (không xóa mất công của người khác) ──
{
  const goc = [T("a"), T("b")];
  const toi = [T("a")];
  const ho = [T("a"), T("b", { workdone: 70 })];
  const r = gopBaChieu(goc, toi, ho);
  ok("tôi xóa nhưng họ vừa sửa -> GIỮ LẠI bản của họ", !!lay(r, "b") && lay(r, "b").workdone === 70, ids(r));
}

// ── họ xóa, tôi sửa -> tôn trọng việc xóa (không hồi sinh) ──
{
  const goc = [T("a"), T("b")];
  const toi = [T("a"), T("b", { workdone: 40 })];
  const ho = [T("a")];
  const r = gopBaChieu(goc, toi, ho);
  ok("họ xóa còn tôi sửa -> không hồi sinh bản ghi đã xóa", ids(r) === "a", ids(r));
}

// ── không ai sửa gì -> kết quả y hệt máy chủ ──
{
  const goc = [T("a"), T("b")];
  const r = gopBaChieu(goc, [T("a"), T("b")], [T("a"), T("b")]);
  ok("không ai sửa -> giữ nguyên", ids(r) === "a,b" && r.xungDot.length === 0);
}

// ── mảng rỗng / thiếu không làm vỡ ──
{
  const r = gopBaChieu(null, undefined, [T("a")]);
  ok("chịu được dữ liệu rỗng", ids(r) === "a" && r.xungDot.length === 0);
}

// ── tình huống thật: tôi tick 3 việc, họ đổi tên 1 dự án khác -> không mất gì ──
{
  const goc = [T("t1"), T("t2"), T("t3"), T("t4")];
  const toi = [T("t1", { workdone: 100 }), T("t2", { workdone: 100 }), T("t3", { workdone: 100 }), T("t4")];
  const ho = [T("t1"), T("t2"), T("t3"), T("t4", { title: "Việc t4 (đổi tên)" })];
  const r = gopBaChieu(goc, toi, ho);
  ok("tôi tick 3 việc + họ sửa việc thứ 4 -> giữ đủ cả 4 thay đổi",
     lay(r, "t1").workdone === 100 && lay(r, "t2").workdone === 100 && lay(r, "t3").workdone === 100
     && lay(r, "t4").title.includes("đổi tên"), JSON.stringify(r.ket));
}

// ══════ R5 (audit lần 2): lịch sử gộp KHÔNG được sắp lại theo thời gian ══════
/* Máy chủ đòi đúng khuôn [mục MỚI của tôi] + [nguyên văn lịch sử máy chủ]. Nếu client sort
   theo ts thì khi tôi thao tác TRƯỚC nhưng lưu SAU người kia, mục của tôi rơi xuống giữa,
   máy chủ trả 403 và cả lần gộp mất trắng — đúng cảnh "gõ xong mất" mà U5 định chữa. */
{
  const than = (() => {
    const i = SRC.indexOf("const gopKhiXungDot = async (cuaToi) => {");
    const j = SRC.indexOf("const pullRemote = async (force)", i);
    return SRC.slice(i, j);
  })();
  ok("R5 — hàm gộp KHÔNG còn sắp lại lịch sử theo ts", !than.includes(".sort("),
     than.includes(".sort(") ? "vẫn còn .sort( trong hàm gộp" : "không còn sort");
  ok("R5 — lịch sử gộp theo khuôn [mục mới của tôi] + [lịch sử máy chủ]",
     than.includes("[...cuaToiMoi, ...(cuaHo.history || [])]"), "không thấy khuôn mong đợi");

  /* mô phỏng đúng tình huống báo cáo nêu: mục của TÔI cũ hơn mục mới nhất của HỌ */
  const cuaHo = [{ id: "ho2", ts: 2000 }, { id: "ho1", ts: 1000 }];
  const cuaToi = [{ id: "toi1", ts: 1500 }, { id: "ho1", ts: 1000 }];   // tôi thao tác lúc 1500, họ lưu lúc 2000
  const idsHo = new Set(cuaHo.map((x) => x.id));
  const cuaToiMoi = cuaToi.filter((x) => x && !idsHo.has(x.id));
  const gop = [...cuaToiMoi, ...cuaHo].slice(0, 500);
  ok("R5 — mục của tôi (ts cũ hơn) VẪN đứng đầu sau khi gộp", gop[0].id === "toi1", JSON.stringify(gop.map((x) => x.id)));
  ok("R5 — mục đầu của máy chủ giữ nguyên vị trí ngay sau đó (luật 6)",
     gop[1].id === "ho2" && gop[2].id === "ho1", JSON.stringify(gop.map((x) => x.id)));
}

// ── chốt chặn: mã nguồn vẫn gọi hàm gộp khi gặp 409 ──
ok("mã nguồn dùng gộp khi xung đột, không tải lại bỏ hết",
   SRC.includes('if (resKv === "conflict") { gopKhiXungDot(payload); }'));

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
