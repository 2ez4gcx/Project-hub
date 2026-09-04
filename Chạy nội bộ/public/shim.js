/* Cầu nối lưu trữ: nối window.storage -> API máy chủ (/api/kv) để đồng bộ dữ liệu
   công việc/dự án giữa các máy. Token đăng nhập lấy từ localStorage (pm_token). */
(function () {
  function tok() { try { return localStorage.getItem("pm_token"); } catch (e) { return null; } }
  window.storage = {
    async get(key) {
      try {
        var t = tok();
        var r = await fetch("/api/kv?key=" + encodeURIComponent(key), { headers: t ? { Authorization: "Bearer " + t } : {} });
        if (!r.ok) return null;
        var d = await r.json();
        return { value: d && d.value != null ? d.value : null };
      } catch (e) { return null; }
    },
    async set(key, value) {
      try {
        var t = tok();
        var h = { "Content-Type": "application/json" };
        if (t) h.Authorization = "Bearer " + t;
        var r = await fetch("/api/kv", { method: "POST", headers: h, body: JSON.stringify({ key: key, value: value }) });
        if (r.status === 409) return "conflict";
        if (r.status === 403) {
          // Máy chủ TỪ CHỐI thay đổi (vượt quyền) — trả thông báo để app hiển thị.
          try { var d = await r.json(); return { error: (d && d.message) || "Thay đổi bị máy chủ từ chối." }; }
          catch (e) { return { error: "Thay đổi bị máy chủ từ chối." }; }
        }
        return r.ok;
      } catch (e) { return false; }
    }
  };
})();
