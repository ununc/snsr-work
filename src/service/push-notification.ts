const convertVapidKey = (vapidKey: string) => {
  const padding = "=".repeat((4 - (vapidKey.length % 4)) % 4);
  const base64 = (vapidKey + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const subscribePush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertVapidKey("YOUR_VAPID_PUBLIC_KEY"),
    });

    // 백엔드로 구독 정보 전송
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error("Push 구독 실패:", error);
    throw error;
  }
};
