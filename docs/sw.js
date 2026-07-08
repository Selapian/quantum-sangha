const CACHE_NAME = 'quantum-gong-v22';
const ASSETS = ['./', './index.html', './manifest.json', './gong.mp3'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request)));
});

self.addEventListener('push', (event) => {
  console.log("Push signal caught.");

  let isGongTriggered = false;
  let notificationTitle = 'Quantum Gong';
  let notificationBody = '⚛️ The bell is ringing...';

  // Parse incoming data payload if it exists (Desktop fallback path)
  if (event.data) {
    try {
      const payloadData = event.data.json();
      if (payloadData.ring === "true") {
        isGongTriggered = true;
      }
      if (payloadData.title) notificationTitle = payloadData.title;
      if (payloadData.body) notificationBody = payloadData.body;
    } catch (e) {
      // If payload isn't JSON, check if it's text
      if (event.data.text() === "ring") isGongTriggered = true;
    }
  }

  // Mobile fallback path: If data payload was stripped but a push event arrived, 
  // assume it's our notification event and fire the audio anyway.
  if (!isGongTriggered) {
    isGongTriggered = true; 
  }

  event.waitUntil(
    Promise.all([
      // Only show notification if desktop didn't auto-render it via the notification block
      self.registration.showNotification(notificationTitle, {
        body: notificationBody,
        tag: 'gong-alert',
        renotify: true
      }),

      // Sound Engine Execution Loop
      caches.match('./gong.mp3').then(async (response) => {
        if (!response) return;
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.currentTime = 0;
        return audio.play();
      })
    ])
  );
});
