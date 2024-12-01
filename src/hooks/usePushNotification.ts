import { useState, useCallback } from "react";
import {
  checkNotificationPermission,
  isPushSupported,
} from "../utils/push-utils";
import { subscribePush } from "../service/push-notification";

interface PushNotificationError {
  message: string;
  code?: string;
}

export const usePushNotification = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<PushNotificationError | null>(null);

  const setupPushNotification = useCallback(async () => {
    try {
      if (!isPushSupported()) {
        throw new Error("Push 알림이 지원되지 않는 브라우저입니다.");
      }

      const hasPermission = await checkNotificationPermission();
      if (!hasPermission) {
        throw new Error("Push 알림 권한이 거부되었습니다.");
      }

      await subscribePush();
      setIsSubscribed(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("알 수 없는 오류가 발생했습니다."));
      }
      setIsSubscribed(false);
    }
  }, []);

  return { isSubscribed, error, setupPushNotification };
};
