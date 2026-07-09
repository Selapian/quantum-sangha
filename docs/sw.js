self.addEventListener('push', (event) => {
  console.log("Push signal caught.");

  let notificationTitle = 'Quantum Gong';
  let notificationBody = '⚛️ The bell is ringing...';

  if (event.data) {
    try {
      const payloadData = event.data.json();
      if (payloadData.title) notificationTitle = payloadData.title;
      if (payloadData.body) notificationBody = payloadData.body;
    } catch (e) {}
  }

  // Define notification options for both iOS and Android
  const notificationOptions = {
    body: notificationBody,
    tag: 'gong-alert',
    renotify: true,
    // Setting silent to false tells both operating systems to use 
    // their respective system-default notification sounds.
    silent: false,
    sound: 'default'
  };

  const notificationPromise = self.registration.showNotification(notificationTitle, notificationOptions);

  // Keep this active so that if the app IS open on screen, 
  // it still plays your custom HTML5 gong audio smoothly.
  const clientMessagePromise = self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((clientList) => {
      for (const client of clientList) {
        client.postMessage({ command: "play_gong" });
      }
    });

  event.waitUntil(Promise.all([notificationPromise, clientMessagePromise]));
});
