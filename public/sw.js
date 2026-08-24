const CACHE = "econo-mizi-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Não intercepta API/Supabase — só assets estáticos do próprio app.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Nunca mexer em chamadas externas (Supabase Auth/API)
  if (url.origin !== self.location.origin) return;

  // Não cachear HTML/navegação — evita app “preso” em versão antiga
  if (request.mode === "navigate" || request.destination === "document") {
    return;
  }

  const isStatic =
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname.startsWith("/_next/static/");

  if (!isStatic) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;

      try {
        const response = await fetch(request);
        if (response && response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        return (
          cached ||
          new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
          })
        );
      }
    })
  );
});
