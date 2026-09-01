// Custom Service Worker for JÀMM AK XÉEWAL Push Notifications
// Ce fichier gère uniquement les événements push et les clics sur notifications.
// Le cache PWA Angular (ngsw-worker.js) est géré séparément en production.

// Écouter les événements "push"
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const notification = data.notification || {};

  const title = notification.title || 'JÀMM AK XÉEWAL';
  const options = {
    body: notification.body || '',
    icon: notification.icon || '/assets/icons/icon-192x192.png',
    badge: notification.badge || '/assets/icons/icon-72x72.png',
    vibrate: notification.vibrate || [100, 50, 100],
    sound: notification.sound || 'default',
    data: notification.data || { url: '/' },
    tag: 'jamm-notification', // Évite les doublons
    renotify: true,           // Rejoue la sonnerie même si le tag existe déjà
    requireInteraction: false, // Se ferme automatiquement après quelques secondes
    actions: [
      { action: 'open', title: 'Voir', icon: '/assets/icons/icon-72x72.png' },
      { action: 'close', title: 'Fermer' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      // Envoyer au client Angular pour mettre à jour la cloche / badge
      return clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        for (const client of windowClients) {
          client.postMessage({
            type: 'NEW_NOTIFICATION',
            notification: {
              title,
              body: options.body,
              url: options.data?.url || '/',
              timestamp: new Date().getTime(),
              read: false
            }
          });
        }
      });
    })
  );
});

// Écouter les clics sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : '/';
  
  const absoluteUrl = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si une fenêtre de l'app est déjà ouverte, la mettre en avant et naviguer
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(absoluteUrl);
          return;
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(absoluteUrl);
      }
    })
  );
});
