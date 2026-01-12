export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function sendNotification(title, body, tag = 'general') {
  if (Notification.permission === 'granted') {
    const options = {
      body,
      icon: '/pwa-192x192.png', // Ensure this path is correct
      vibrate: [200, 100, 200],
      tag, // Prevents duplicate notifications with same tag
      requireInteraction: true,
    };
    
    // Check if we are in a Service Worker context (PWA)
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, options);
      });
    } else {
      // Fallback to standard web notification
      new Notification(title, options);
    }
  }
}
