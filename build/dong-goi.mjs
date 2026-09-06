/* Đóng gói 2 bản phân phối thành zip trong thư mục "files" (cạnh thư mục repo).
   Cách dùng:  cd build && npm run dong-goi
   Tự loại: thư mục data, .env, *.log, *.bak, *.tmp, node_modules — TRỪ nodemailer của
   bản "Chạy nội bộ" (người dùng chỉ nhấp đúp file .bat, không ai bảo họ npm install).
   Dùng adm-zip để tên file tiếng Việt giữ nguyên dấu khi giải nén (Compress-Archive
   của PowerShell và tar.exe của Windows đều làm hỏng tên có dấu). */
import AdmZip from "adm-zip";
import { readdirSync, statSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const OUT = path.join(root, "..", "files");

/* Bản NAS không cần kèm thư viện vì Dockerfile tự chạy "npm ci --omit=dev" khi build. */
import { skip as loaiTru } from "./loai-tru.mjs";
let kemThuVien = false;
/* N05 (re-audit 06/09): danh sách loại trừ nằm ở loai-tru.mjs (có test riêng) — chặn cả data-saoluu-*, accounts.json ở gốc,
   *.bak-<ngày>, tls/, snapshots/... phòng khi đóng gói từ thư mục đã từng vận hành hoặc đã chạy script cập nhật. */
const skip = (rel) => loaiTru(rel, kemThuVien);

function collect(dir, base, out) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(base, full);
    if (skip(rel)) continue;
    if (statSync(full).isDirectory()) collect(full, base, out);
    else out.push({ full, rel });
  }
  return out;
}

for (const [folder, zipName] of [["Chạy trên NAS", "tram-du-an-nas"], ["Chạy nội bộ", "tram-du-an-noi-bo"]]) {
  const src = path.join(root, folder);
  kemThuVien = folder === "Chạy nội bộ";
  const files = collect(src, src, []);
  const zip = new AdmZip();
  for (const f of files) zip.addLocalFile(f.full, path.dirname(f.rel.split(path.sep).join("/")) === "." ? "" : path.dirname(f.rel.split(path.sep).join("/")));
  zip.addLocalFile(path.join(root, "CHANGELOG.md"), ""); // lịch sử phiên bản đi kèm gói giao khách
  const dest = path.join(OUT, zipName + ".zip");
  zip.writeZip(dest);
  console.log("  ✔ " + zipName + ".zip — " + (files.length + 1) + " file");
}
console.log("\n  Zip nằm trong: " + OUT + "\n");
