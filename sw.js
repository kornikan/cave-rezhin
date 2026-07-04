// v3 : network-first pour la navigation (evite l'ecran noir du au cache perime),
// cache-first pour le reste (hors-ligne dans la cave)
const CACHE = "cave-rezhin-v6";
const ASSETS = ["./", "./index.html", "./app.js", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-180.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => { c.put("./index.html", copy); });
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit ||
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
    )
  );
});
