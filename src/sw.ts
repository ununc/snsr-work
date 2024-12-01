/// <reference lib="webworker" />

import { precacheAndRoute, PrecacheEntry } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope & typeof globalThis;

declare global {
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: Array<string | PrecacheEntry>;
  }
}

interface PushNotificationPayload {
  title: string;
  body: string;
  url: string;
}

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  const payload: PushNotificationPayload = event.data.json();
  const { title, body, url } = payload;

  const notificationPromise = self.registration.showNotification(title, {
    body: body,
    icon: "/icons/android-chrome-192x192.svg",
    badge: "/icons/apple-touch-icon.svg",
    data: url,
    vibrate: [200, 100, 200],
  } as ExtendedNotificationOptions);

  event.waitUntil(notificationPromise);
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  if (event.notification.data) {
    const urlToOpen = event.notification.data as string;
    const windowPromise = self.clients.openWindow(urlToOpen);
    event.waitUntil(windowPromise);
  }
});
