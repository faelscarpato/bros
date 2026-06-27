const CACHE = "bros-shell-v1";
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try { await cache.addAll(["/", "/manifest.webmanifest"]); } catch (_) {}
    self.skipWaiting();
  })());
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put("/", fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(CACHE);
        return (await cache.match("/")) || Response.error();
      }
    })());
    return;
  }
  if (/\.(js|css|woff2?|png|svg|jpg|jpeg|webp|ico)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return cached || Response.error();
      }
    })());
  }
});
