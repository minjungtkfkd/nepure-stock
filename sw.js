// 네퓨어 재고관리 - 오프라인 실행용 서비스워커
// 인터넷이 되면 최신 파일을 받고, 안 되면 저장해 둔 파일로 실행합니다.
const CACHE = 'nepure-stock-v1';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
               './icon-maskable-192.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
