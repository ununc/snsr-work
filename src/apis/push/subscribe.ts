import { apiClient } from "../baseUrl";

export const sendSubscription = async (subscription: PushSubscription) => {
  const { data } = await apiClient.post("push/subscribe", subscription);
  return data;
};

interface PushNotificationDto {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

export const sendPushNotificationToAll = async (
  notification: PushNotificationDto
) => {
  try {
    const { data } = await apiClient.post("/push/send-all", notification);
    console.log("push all", data);
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
};
