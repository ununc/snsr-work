import { apiClient } from "../baseUrl";

export const sendSubscription = async (subscription: PushSubscription) => {
  const { data } = await apiClient.post("push/subscribe", subscription);
  console.log(data);
  return data;
};
