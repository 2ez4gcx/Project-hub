/* Build public/app.js từ ProjectManager.jsx (nguồn chuẩn: "Chạy nội bộ/ProjectManager.jsx").
   Cách dùng:  cd build && npm install && npm run build
   Kết quả được ghi vào public/app.js của CẢ HAI bản (nội bộ + NAS), và
   ProjectManager.jsx cũng được đồng bộ sang bản NAS để hai bản luôn giống nhau. */
import { build } from "esbuild";
import { copyFileSync, readFileSync } from "fs";
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
const kb = Math.round(readFileSync(out).length / 1024);
console.log("\n  ✔ Đã build app.js (" + kb + " KB) và chép vào cả hai bản (nội bộ + NAS).\n");
