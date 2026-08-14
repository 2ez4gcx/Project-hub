/* Đóng gói 2 bản phân phối thành zip trong thư mục "files" (cạnh thư mục repo).
   Cách dùng:  cd build && npm run dong-goi
   Tự loại: thư mục data, .env, *.log, *.bak, *.tmp, node_modules.
   Dùng adm-zip để tên file tiếng Việt giữ nguyên dấu khi giải nén (Compress-Archive
   của PowerShell và tar.exe của Windows đều làm hỏng tên có dấu). */
import AdmZip from "adm-zip";
import { readdirSync, statSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const OUT = path.join(root, "..", "files");

const skip = (rel) => {
  const r = rel.split(path.sep).join("/");
  return r === ".env" || r.startsWith("data/") || r.startsWith("node_modules/")
    || r.endsWith(".log") || r.endsWith(".bak") || r.endsWith(".tmp");
};

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
  const files = collect(src, src, []);
  const zip = new AdmZip();
  for (const f of files) zip.addLocalFile(f.full, path.dirname(f.rel.split(path.sep).join("/")) === "." ? "" : path.dirname(f.rel.split(path.sep).join("/")));
  const dest = path.join(OUT, zipName + ".zip");
  zip.writeZip(dest);
  console.log("  ✔ " + zipName + ".zip — " + files.length + " file");
}
console.log("\n  Zip nằm trong: " + OUT + "\n");
