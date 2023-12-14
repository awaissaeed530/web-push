import './app.element.css';

export class AppElement extends HTMLElement {
  public static observedAttributes = [];
  private readonly publicKey =
    'BJIIYwE4HZchSmh01IZDuuGStGk2-yb6SGvMoCKDe72UZnT-roHvdjmKM-jNZUCjqkaZKW-kNaGhxfyZvQe-0cI';

  constructor() {
    super();
    this.initialize();
  }

  async initialize() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.info('Notification permission granted');
    }

    let serviceWorker = await navigator.serviceWorker.getRegistration(
      '/service-worker.js'
    );
    if (!serviceWorker) {
      serviceWorker = await navigator.serviceWorker.register(
        '/service-worker.js'
      );
      console.info('Service worker successfully registered');

      const subscription = await this.subscribe(serviceWorker);
      console.log(subscription);

      await this.saveSubscription(subscription);
    }
  }

  private urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private subscribe(
    serviceWorker: ServiceWorkerRegistration
  ): Promise<PushSubscription> {
    const options = {
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.publicKey),
    };

    return serviceWorker.pushManager.subscribe(options);
  }

  private async saveSubscription(
    subscription: PushSubscription
  ): Promise<void> {
    await fetch('http://localhost:3000/api/subscription', {
      body: JSON.stringify(subscription),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    console.info('Subscription saved');
  }

  send() {
    fetch('http://localhost:3000/api/send', {
      body: JSON.stringify({
        body: 'This is a web push notification',
        icon: 'https://dashboard.dev.kadicon.de/assets/images/logo.jpg',
        actions: [
          {
            action: 'acknowledge-action',
            type: 'button',
            title: 'Acknowledge',
          },
        ],
      }),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    console.info('Message sent');
  }

  connectedCallback() {
    this.innerHTML = `
      <button id="send-btn">Send</button>
    `;

    const sendButton = this.querySelector('#send-btn');
    sendButton?.addEventListener('click', () => {
      this.send();
    });
  }
}
customElements.define('web-push-root', AppElement);
