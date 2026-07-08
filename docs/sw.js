const CACHE_NAME = 'quantum-gong-v17';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './gong.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request)));
});

// SILENT PUSH CHANNEL: Intercepts ntfy.sh background signal while phone is closed
self.addEventListener('push', (event) => {
  console.log("Background token event detected. Audio rendering engine triggered.");
  
  event.waitUntil(
    caches.match('./gong.mp3').then(async (response) => {
      if (!response) return;
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Reset head tracker to zero so overlapping cron triggers play cleanly
      audio.currentTime = 0;
      
      // Forces playback directly on the hardware path while phone is closed
      return audio.play().catch(err => console.log("Hardware playback error:", err));
    })
  );
});
