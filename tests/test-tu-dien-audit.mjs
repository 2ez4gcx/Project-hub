/* Kiểm tra TĨNH (không cần máy chủ) — sinh ra từ "Kiểm tra toàn bộ" 06/09, để mọi trường/mã/nhãn mới
   thêm sau này đều bị ép có bản dịch và có projectId:
   1. mọi thực thể + tên trường mà server.js ghi vào nhật ký kiểm toán phải có trong auditEntity / auditField (vi + en)
   2. mọi action lịch sử client ghi (log({ action })) phải có nhãn trong t.act (vi + en)
   3. mọi mục lịch sử client ghi phải mang projectId hoặc taskId, trừ các mục về tài khoản (member_*)
   4. mọi mã lỗi máy chủ có message tiếng Việt phải có bản dịch e_* (trừ mã hai nghĩa đã bị cấm dịch)
   Cách dùng: node tests/test-tu-dien-audit.mjs */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "Chạy nội bộ");
const jsx = readFileSync(path.join(ROOT, "ProjectManager.jsx"), "utf8");
const srv = readFileSync(path.join(ROOT, "server.js"), "utf8");
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };

// trích đối tượng T bằng cân ngoặc
const start = jsx.indexOf("const T = {");
let i = start + "const T = ".length, depth = 0, end = -1, inStr = null;
for (; i < jsx.length; i++) { const c = jsx[i]; if (inStr) { if (c === "\\") { i++; continue; } if (c === inStr) inStr = null; continue; } if (c === '"' || c === "'" || c === "`") { inStr = c; continue; } if (c === "{") depth++; else if (c === "}") { depth--; if (depth === 0) { end = i + 1; break; } } }
const T = new Function("return (" + jsx.slice(start + "const T = ".length, end) + ");")();
const vi = T.vi, en = T.en;

// 1. thực thể + trường audit
const entities = new Set([...srv.matchAll(/add\("(\w+)"/g)].map((m) => m[1]).concat([...srv.matchAll(/entity: "(\w+)"/g)].map((m) => m[1])));
ok("mọi thực thể audit máy chủ ghi có bản dịch vi + en (" + [...entities].join(", ") + ")", [...entities].every((e) => vi.auditEntity[e] && en.auditEntity[e]), [...entities].filter((e) => !vi.auditEntity[e] || !en.auditEntity[e]).join(", "));
const fields = new Set();
for (const m of srv.matchAll(/add\("\w+",\s*[^,]+,\s*(?:[^,()]+|\([^)]*\))+,\s*("([^"]+)"|[^,]+)/g)) {
  if (m[2]) fields.add(m[2]); else { const lit = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]); lit.forEach((s) => fields.add(s)); }
}
const FIELDS = srv.match(/const FIELDS = \[([^\]]+)\]/); if (FIELDS) [...FIELDS[1].matchAll(/"(\w+)"/g)].forEach((x) => fields.add(x[1]));
for (const m of srv.matchAll(/field: ([^,\n]+),/g)) for (const s of m[1].matchAll(/"([^"]+)"/g)) fields.add(s[1]);
const tra = (o, f) => (o.auditField && f in o.auditField) || (o.field && f in o.field);
const thieuF = [...fields].filter((f) => !tra(vi, f) || !tra(en, f));
ok("mọi tên trường audit máy chủ ghi có bản dịch vi + en (" + fields.size + " trường)", thieuF.length === 0, "thiếu: " + thieuF.join(", "));

// 2. action lịch sử client
const acts = new Set([...jsx.matchAll(/action: "([a-z_]+)"/g)].map((m) => m[1]).concat([...jsx.matchAll(/action: [a-zA-Z.]+ \? "([a-z_]+)" : "([a-z_]+)"/g)].flatMap((m) => [m[1], m[2]])));
const thieuA = [...acts].filter((a) => !vi.act[a] || !en.act[a]);
ok("mọi action lịch sử client có nhãn t.act vi + en (" + acts.size + " action)", thieuA.length === 0, "thiếu: " + thieuA.join(", "));

// 3. mục lịch sử phải lọc được theo phạm vi
const thieuP = [];
for (const m of jsx.matchAll(/log\(\{([^}]*)\}\)/g)) { const b = m[1]; if (/action: "member_/.test(b)) continue; if (!/projectId|taskId|\.\.\.base/.test(b)) thieuP.push(b.trim().slice(0, 70)); }
ok("mọi mục lịch sử (trừ member_*) mang projectId / taskId để lọc theo Thành viên dự án", thieuP.length === 0, thieuP.join(" | "));

// 4. mã lỗi có message -> có e_* (trừ mã hai nghĩa bị cấm dịch trong test-song-ngu)
const CAM_DICH = new Set(["locked", "invalid"]);
const coMsg = new Set([...srv.matchAll(/error: "([a-z_]+)", message:/g)].map((m) => m[1]));
const thieuE = [...coMsg].filter((c) => !CAM_DICH.has(c) && !(en["e_" + c] && vi["e_" + c]));
ok("mọi mã lỗi máy chủ có message đều có bản dịch e_* (trừ locked / invalid hai nghĩa)", thieuE.length === 0, "thiếu: " + thieuE.join(", "));

console.log("\nKẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exit(fail ? 1 : 0);
