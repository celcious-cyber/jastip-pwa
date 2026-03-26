const CACHE_NAME = 'jastip-app-v2'; // Naikkan versi ke v2
const OFFLINE_URL = '/offline.html';

const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  OFFLINE_URL, // Daftarkan halaman offline di sini
  '/logo192.png',
  '/logo512.png'
];

// Install: Simpan halaman offline ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Fetch: Logika untuk menampilkan halaman offline
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});