console.log('Welcome');

self.addEventListener('push', (event) => {
  const promiseChain = self.registration.showNotification('Web Push', event.data.json());
  event.waitUntil(promiseChain);
});
