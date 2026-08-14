/* Build public/app.js từ ProjectManager.jsx (nguồn chuẩn: "Chạy nội bộ/ProjectManager.jsx").
   Cách dùng:  cd build && npm install && npm run build
   Kết quả được ghi vào public/app.js của CẢ HAI bản (nội bộ + NAS), và
   ProjectManager.jsx cũng được đồng bộ sang bản NAS để hai bản luôn giống nhau. */
import { build } from "esbuild";
import { copyFileSync, readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import path from "path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const LOCAL = path.join(root, "Chạy nội bộ");
const NAS = path.join(root, "Chạy trên NAS");
const out = path.join(here, "app.out.js");

await build({
  entryPoints: [path.join(here, "entry.jsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2019"],
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  nodePaths: [path.join(here, "node_modules")],
  outfile: out,
  logLevel: "info",
});

copyFileSync(out, path.join(LOCAL, "public", "app.js"));
copyFileSync(out, path.join(NAS, "public", "app.js"));
copyFileSync(path.join(LOCAL, "ProjectManager.jsx"), path.join(NAS, "ProjectManager.jsx"));
copyFileSync(path.join(LOCAL, "public", "shim.js"), path.join(NAS, "public", "shim.js"));

// Đóng dấu HASH NỘI DUNG vào ?v= trong index.html — app.js/app.css được cache 1 năm
// (immutable), nên nếu quên đổi ?v= sau khi build thì người dùng vẫn chạy bản CŨ.
// Tự động hóa để không bao giờ quên.
const h8 = (p) => createHash("md5").update(readFileSync(p)).digest("hex").slice(0, 8);
const appHash = h8(out);
const shimHash = h8(path.join(LOCAL, "public", "shim.js"));
const cssHash = h8(path.join(LOCAL, "public", "app.css"));
for (const dir of [LOCAL, NAS]) {
  const ip = path.join(dir, "public", "index.html");
  let html = readFileSync(ip, "utf8");
  html = html.replace(/app\.js\?v=[^"']*/g, "app.js?v=" + appHash)
             .replace(/shim\.js\?v=[^"']*/g, "shim.js?v=" + shimHash)
             .replace(/app\.css(\?v=[^"']*)?/g, "app.css?v=" + cssHash);
  writeFileSync(ip, html);
}
const kb = Math.round(readFileSync(out).length / 1024);
console.log("\n  ✔ Đã build app.js (" + kb + " KB, hash " + appHash + ") và chép vào cả hai bản (nội bộ + NAS).");
console.log("  ✔ index.html đã cập nhật ?v= theo hash nội dung (app.js, shim.js, app.css).\n");
