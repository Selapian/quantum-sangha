self.addEventListener('push', (event) => {
  console.log("Push signal caught.");

  let notificationTitle = 'Quantum Gong';
  let notificationBody = '⚛️ The bell is ringing...';

  if (event.data) {
    try {
      const payloadData = event.data.json();
      if (payloadData.title) notificationTitle = payloadData.title;
      if (payloadData.body) notificationBody = payloadData.body;
    } catch (e) {
      // Handle fallback string content if needed
    }
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(notificationTitle, {
        body: notificationBody,
        tag: 'gong-alert',
        renotify: true,
        // Using sound parameter (supported on mobile Android channels)
        sound: './gong.mp3'
      }),

      // Desktop audio processing: Opens a brief hidden client window context to fire audio cleanly
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          // If the app window is open or running in standalone mode, tell the window context to play the audio
          clientList[0].postMessage({ command: "play_gong" });
        }
      })
    ])
  );
});
