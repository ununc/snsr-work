const PUBLIC_VAPID_KEY = "여기에_본인의_VAPID_공개키를_넣으세요";

export async function subscribeUserToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;

    // 기존 구독 확인
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      return subscription;
    }

    // 새로운 구독 생성
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
    });

    // 서버에 구독 정보 전송
    // await fetch("/api/push/subscribe", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(subscription),
    // });
    console.log("서버로 구독 전송");

    return subscription;
  } catch (error) {
    console.error("Push subscription failed:", error);
    throw error;
  }
}

// VAPID 키를 Uint8Array로 변환하는 유틸리티 함수
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
