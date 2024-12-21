import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { useServiceWorkerStore } from "@/stores/serviceWorkerStore";
import { sendSubscription } from "@/apis/push/subscribe";

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const NotificationPermissionButton = () => {
  const [permission, setPermission] = useState("default");
  const [loading, setLoading] = useState(false);
  const { initGetRegister } = useServiceWorkerStore();
  useEffect(() => {
    // 현재 알림 권한 상태 확인
    setPermission(Notification.permission);
    // 권한 변경 감지
    navigator.permissions
      ?.query({ name: "notifications" })
      .then((permissionStatus) => {
        permissionStatus.onchange = () => {
          setPermission(Notification.permission);
        };
      });
  }, []);

  const requestNotificationPermission = async () => {
    setLoading(true);

    try {
      // 서비스 워커 지원 확인
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("브라우저가 푸시 알림을 지원하지 않습니다");
      }

      const registration = await initGetRegister();
      // 권한 요청
      const permission = await Notification.requestPermission();
      if (!registration) return;

      setPermission(permission);

      if (permission === "granted") {
        // 서비스워커 등록 확인

        // VAPID 키는 환경변수나 설정에서 가져오기
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        // 푸시 구독
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        // 서버에 구독 정보 전송
        await sendSubscription(subscription);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      }
      setPermission("default");
    } finally {
      setLoading(false);
    }
  };

  const getButtonStyle = () => {
    switch (permission) {
      case "granted":
        return "bg-green-500 hover:bg-green-600";
      case "denied":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  const getButtonText = () => {
    if (loading) return "처리 중...";
    switch (permission) {
      case "granted":
        return "알림 설정됨";
      case "denied":
        return "알림 차단됨";
      default:
        return "알림 설정하기";
    }
  };

  if (permission === "granted") {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2 absolute w-full -top-14">
      <button
        onClick={requestNotificationPermission}
        disabled={loading || permission === "denied"}
        className={`
          flex items-center gap-2 px-4 py-2 
          rounded-lg text-white transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getButtonStyle()}
        `}
      >
        {permission === "granted" ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}
        {getButtonText()}
      </button>
    </div>
  );
};
