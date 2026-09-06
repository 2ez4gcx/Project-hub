/* PWA: đăng ký service worker (N03, re-audit 06/09). Trước đây đoạn này nằm nội tuyến trong index.html và bị chính
   CSP của máy chủ (script-src 'self') chặn, nên chế độ mở khi mất mạng chưa từng chạy. Chỉ đăng ký trong ngữ cảnh an
   toàn (HTTPS hoặc localhost); bản HTTP trong LAN bỏ qua, không lỗi. */
(function () {
  if (!("serviceWorker" in navigator)) return;
  if (!(location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) return;
  navigator.serviceWorker.register("sw.js").catch(function () {});
})();
