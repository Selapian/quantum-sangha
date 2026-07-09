self.addEventListener('push', (event) => {
  let notificationTitle = 'Quantum Gong';
  let notificationBody = '⚛️ The bell is ringing...';

  if (event.data) {
    try {
      const payloadData = event.data.json();
      if (payloadData.title) notificationTitle = payloadData.title;
      if (payloadData.body) notificationBody = payloadData.body;
    } catch (e) {}
  }

  // Detect if the user is on iOS inside the Service Worker
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent || '');

  const notificationPromise = self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    tag: 'gong-alert',
    renotify: true,
    // CRITICAL: iOS MUST NOT be silent, otherwise it will never make a sound when closed.
    // Android/Desktop remain silent because they play the custom MP3 via the window.
    silent: !isIOS, 
    sound: isIOS ? 'default' : null
  });

  const clientMessagePromise = self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((clientList) => {
      for (const client of clientList) {
        client.postMessage({ command: "play_gong" });
      }
    });

  event.waitUntil(Promise.all([notificationPromise, clientMessagePromise]));
});
