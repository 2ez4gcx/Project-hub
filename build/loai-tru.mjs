/* Danh sách LOẠI TRỪ khi đóng gói (N05, re-audit 06/09): tách ra tệp riêng để tests/test-doc-lap.mjs kiểm được.
   Nguyên tắc: gói phát hành chỉ mang mã chương trình. Mọi thứ do MÁY ĐÃ VẬN HÀNH sinh ra — dữ liệu, bản sao lưu
   của script cập nhật, phiên đăng nhập, chứng chỉ, log, tệp .bak — đều không được theo zip dù đóng gói từ thư mục nào. */
const TEN_NHAY_CAM = /^(accounts|sessions|finance|records|sitelogs|taskfiles|notifications|sched-state|config)\.json(\..*)?$/i;

export function skip(rel, kemThuVien) {
  const r = String(rel).split("\\").join("/");
  const ten = r.split("/").pop();
  if (r === "node_modules" || r.startsWith("node_modules/"))
    return !(kemThuVien && (r === "node_modules" || r.startsWith("node_modules/nodemailer")));
  if (r === "data" || r.startsWith("data/")) return true;                       // dữ liệu thật
  if (/^data-saoluu/i.test(r) || /^data-\d/.test(r)) return true;               // bản sao lưu do script cập nhật tạo
  if (r === "snapshots" || r.startsWith("snapshots/")) return true;
  if (r === "tls" || r.startsWith("tls/")) return true;                          // chứng chỉ, khóa
  if (r === "task-uploads" || r.startsWith("task-uploads/") || r === "uploads" || r.startsWith("uploads/") || r === "nhatky-thi-cong" || r.startsWith("nhatky-thi-cong/")) return true;
  if (ten === ".env" || ten.startsWith(".env.")) return true;
  if (TEN_NHAY_CAM.test(ten)) return true;                                       // accounts.json, accounts.json.bak-2026..., sessions.json ở bất kỳ đâu
  if (/\.(log|bak|tmp|pem|pfx|key|crt|jsonl)$/i.test(ten) || /\.bak[-.]/i.test(ten)) return true;
  return false;
}
