self.addEventListener('install', (e) =>
  e.waitUntil(
    caches
      .open(NAME)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  ),
);

self.addEventListener('activate', (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith('ecos-app-') && k !== NAME).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);

self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url),
    scope = new URL(self.registration.scope);
  if (
    e.request.method !== 'GET' ||
    u.origin !== scope.origin ||
    !u.pathname.startsWith(scope.pathname)
  )
    return;

  const rel = './' + u.pathname.slice(scope.pathname.length);
  if (!ASSETS.includes(rel)) return;

  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) {
          const clone = r.clone();
          caches.open(NAME).then((c) => c.put(e.request, clone));
        }
        return r;
      })
      .catch(() => caches.match(e.request)),
  );
});
