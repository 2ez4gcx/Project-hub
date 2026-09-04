/* Test nhật ký thi công có cấu trúc + luồng ký duyệt (audit 04/09: P5).
   Chạy SAU test-authz.mjs.  Cách dùng: node tests/test-nhat-ky-cau-truc.mjs [BASE_URL] */
const B = process.argv[2] || process.env.TDA_BASE || "http://localhost:3211";
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log("  ✔ " + name); } else { fail++; console.log("  ✘ FAIL: " + name + (extra ? " — " + extra : "")); } };
const api = (path, opts = {}, tok) => fetch(B + path, { ...opts, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}), ...(opts.headers || {}) } }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const login = async (email) => (await api("/api/login", { method: "POST", body: JSON.stringify({ email, password: "matkhau123" }) })).body.token;

const OWNER = await login("boss@test.vn");
const AN = await login("an@test.vn");            // teamlead
const logs = async (tok) => (await api("/api/sitelogs?projectId=P1", {}, tok)).body.logs || [];
const NGAY = "2026-09-20";

// An là teamlead nhưng chưa được chỉ định lập nhật ký dự án P1 -> thêm vào siteLoggers
const anId = (await api("/api/me", {}, AN)).body.user.id;
{
  const st = JSON.parse((await api("/api/kv?key=pm_shared_v3", {}, OWNER)).body.value);
  const r0 = await api("/api/kv", { method: "POST", body: JSON.stringify({ key: "pm_shared_v3",
    value: JSON.stringify({ ...st, rev: st.rev + 1, projects: st.projects.map((p) => p.id === "P1" ? { ...p, siteLoggers: [anId] } : p) }) }) }, OWNER);
  ok("chỉ định An làm người lập nhật ký dự án P1", r0.status === 200, r0.status);
}

const NOI_DUNG = {
  projectId: "P1", projectName: "Du an 1", date: NGAY,
  weatherAM: "Nắng", weatherPM: "Mưa",
  thoiTiet: { nhietDo: "29–35°C", gioMua: 2.5, gioNgungViec: 1.5 },
  nhanLuc: [{ to: "Tổ cốp pha", soNguoi: 8, gio: 8 }, { to: "Tổ cốt thép", soNguoi: 6, gio: 8 }, { to: "", soNguoi: 0, gio: 0 }],
  thietBi: [{ ten: "Cẩu tháp", soLuong: 1, gio: 6 }, { ten: "Máy trộn", soLuong: 2, gio: 4 }],
  khoiLuong: [{ boqId: "h1", ten: "Bê tông dầm sàn", donVi: "m3", kl: 18.5 }],
  suCo: { co: true, mucDo: "trungbinh", moTa: "Công nhân trượt chân trên giàn giáo ướt", khacPhuc: "Dừng việc, trải lưới chống trượt, họp an toàn 15 phút", nguoiLienQuan: "Nguyễn Văn A" },
  ykienGiamSat: "TVGS yêu cầu bổ sung con kê trước khi đổ bê tông.",
  work: "Đổ bê tông dầm sàn tầng 2",
};

// ── lập nhật ký với đầy đủ mục có cấu trúc ──
let r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify(NOI_DUNG) }, OWNER);
ok("lập nhật ký có bảng nhân lực / máy / khối lượng", r.status === 200, r.status + " " + JSON.stringify(r.body).slice(0, 70));
const lid = r.body.log.id;

let lg = (await logs(OWNER)).find((x) => x.id === lid);
ok("đọc lại được bảng nhân lực (dòng rỗng bị loại)", lg.nhanLuc && lg.nhanLuc.length === 2, JSON.stringify(lg.nhanLuc));
ok("tổng nhân lực cộng được thành số", lg.nhanLuc.reduce((a, x) => a + x.soNguoi, 0) === 14);
ok("bảng máy móc lưu đúng", lg.thietBi.length === 2 && lg.thietBi[0].gio === 6, JSON.stringify(lg.thietBi));
ok("khối lượng là SỐ và gắn được hạng mục BOQ", lg.khoiLuong[0].kl === 18.5 && lg.khoiLuong[0].boqId === "h1", JSON.stringify(lg.khoiLuong));
ok("thời tiết chi tiết (nhiệt độ, giờ mưa, giờ ngừng việc)", lg.thoiTiet.gioMua === 2.5 && lg.thoiTiet.gioNgungViec === 1.5, JSON.stringify(lg.thoiTiet));
ok("sự cố tách riêng khỏi vướng mắc tiến độ", lg.suCo && lg.suCo.co === true && lg.suCo.mucDo === "trungbinh" && lg.suCo.khacPhuc.includes("lưới chống trượt"));
ok("ý kiến TVGS được lưu", lg.ykienGiamSat.includes("con kê"));
ok("trạng thái ban đầu là Nháp", lg.trangThai === "nhap", lg.trangThai);

// ── giá trị bịa đặt bị làm sạch ──
r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ ...NOI_DUNG, id: lid, suCo: { co: true, mucDo: "TAN_THE", moTa: "x" }, nhanLuc: [{ to: "Tổ A", soNguoi: -5, gio: 999 }], thoiTiet: { gioMua: 99 } }) }, OWNER);
ok("lưu lại với dữ liệu ngoài khuôn", r.status === 200, r.status);
lg = (await logs(OWNER)).find((x) => x.id === lid);
ok("mức độ sự cố bịa đặt bị đưa về rỗng", lg.suCo.mucDo === "", "'" + lg.suCo.mucDo + "'");
ok("số người âm bị đưa về 0", lg.nhanLuc[0].soNguoi === 0, String(lg.nhanLuc[0].soNguoi));
ok("giờ mưa bị kẹp về tối đa 24", lg.thoiTiet.gioMua === 24, String(lg.thoiTiet.gioMua));

// ── nộp rồi duyệt ──
r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ ...NOI_DUNG, id: lid, trangThai: "danop" }) }, OWNER);
lg = (await logs(OWNER)).find((x) => x.id === lid);
ok("người lập chuyển sang Đã nộp", lg.trangThai === "danop", lg.trangThai);

r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ ...NOI_DUNG, id: lid, trangThai: "daduyet" }) }, OWNER);
lg = (await logs(OWNER)).find((x) => x.id === lid);
ok("người lập KHÔNG tự đặt trạng thái Đã duyệt qua đường lưu thường", lg.trangThai !== "daduyet", lg.trangThai);

r = await api("/api/sitelogs/approve", { method: "POST", body: JSON.stringify({ id: lid, duyet: true }) }, OWNER);
ok("Chỉ huy trưởng duyệt được", r.status === 200 && r.body.trangThai === "daduyet", JSON.stringify(r.body));
lg = (await logs(OWNER)).find((x) => x.id === lid);
ok("có ghi ai duyệt và khi nào", !!lg.duyetBoi && lg.duyetLuc > 0, JSON.stringify({ duyetBoi: lg.duyetBoi }));

// ── sau khi duyệt thì khóa sửa với người thường ──
r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ ...NOI_DUNG, id: lid, work: "Sửa lén sau khi đã duyệt" }) }, AN);
ok("nhật ký đã duyệt -> teamlead KHÔNG sửa được nữa", r.status === 409 && r.body.error === "locked", r.status + " " + JSON.stringify(r.body).slice(0, 60));
lg = (await logs(OWNER)).find((x) => x.id === lid);
ok("nội dung không bị đổi", !lg.work.includes("Sửa lén"), lg.work);

// ── Chủ sở hữu mở khóa thì sửa lại được ──
r = await api("/api/sitelogs/approve", { method: "POST", body: JSON.stringify({ id: lid, duyet: false }) }, OWNER);
ok("Chủ sở hữu mở khóa được", r.status === 200 && r.body.trangThai === "danop", JSON.stringify(r.body));
r = await api("/api/sitelogs", { method: "POST", body: JSON.stringify({ ...NOI_DUNG, id: lid, work: "Bổ sung sau khi mở khóa" }) }, AN);
ok("mở khóa xong sửa lại được", r.status === 200, r.status);

console.log("\n  KẾT QUẢ: " + pass + " pass, " + fail + " fail");
process.exitCode = fail ? 1 : 0;
