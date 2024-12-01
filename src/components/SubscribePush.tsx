import { usePushNotification } from "../hooks/usePushNotification";

export const SubscribePush = () => {
  const { isSubscribed, setupPushNotification } = usePushNotification();

  if (isSubscribed) return null;

  return (
    <div className="absolute w-full px-4 -top-10">
      <div className="flex justify-center items-center  border-2 rounded-lg border-blue-100">
        <button className="w-full" onClick={setupPushNotification}>
          Push 알림 받기
        </button>
      </div>
    </div>
  );
};
