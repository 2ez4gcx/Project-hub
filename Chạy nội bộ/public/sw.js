/* Trạm Dự Án — service worker tối thiểu (hoàn thiện 06/09).
   Mục đích: mở được ứng dụng khi mất mạng (trang + app.js/app.css/shim.js đã tải) và là nền cho thông báo đẩy sau này.
   Nguyên tắc:
   - KHÔNG BAO GIỜ chặn /api/ (dữ liệu luôn đi thẳng máy chủ; hàng đợi offline do ứng dụng lo).
   - Tài nguyên có ?v=<hash> là bất biến -> cache-first.
   - Trang (index.html) -> network-first, mất mạng thì lấy bản đã cache.
   - Tệp này KHÔNG có danh sách precache, nên không cần đổi khi build; máy chủ trả nó với Cache-Control: no-store. */
var CACHE = "tda-v1";
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.indexOf("/api/") === 0 || url.pathname.endsWith("/sw.js")) return;
  var batBien = url.search.indexOf("v=") !== -1 || /\.(png|ico|json)$/.test(url.pathname);
  if (batBien) {
    e.respondWith(caches.open(CACHE).then(function (c) {
      return c.match(req).then(function (hit) {
        return hit || fetch(req).then(function (r) { if (r && r.ok) c.put(req, r.clone()); return r; });
      });
    }));
    return;
  }
  if (req.mode === "navigate" || url.pathname === "/" || url.pathname.endsWith("/index.html")) {
    e.respondWith(fetch(req).then(function (r) {
      if (r && r.ok) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); donCacheCu(copy.clone()); }); }
      return r;
    }).catch(function () { return caches.match(req).then(function (hit) { return hit || caches.match("/"); }); }));
  }
});
/* Trang mới trỏ tới app.js?v=<hash mới>: bỏ các bản app.js/shim.js/app.css cũ khỏi cache cho gọn. */
function donCacheCu(res) {
  res.text().then(function (html) {
    var giu = (html.match(/(app\.js|shim\.js|app\.css)\?v=[a-f0-9]+/g) || []);
    caches.open(CACHE).then(function (c) {
      c.keys().then(function (keys) {
        keys.forEach(function (k) {
          var m = k.url.match(/(app\.js|shim\.js|app\.css)\?v=[a-f0-9]+/);
          if (m && giu.indexOf(m[0]) === -1) c.delete(k);
        });
      });
    });
  }).catch(function () {});
}
