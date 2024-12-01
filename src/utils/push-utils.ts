export const checkNotificationPermission = async () => {
  if (!("Notification" in window)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const isPushSupported = () => {
  return "serviceWorker" in navigator && "PushManager" in window;
};
