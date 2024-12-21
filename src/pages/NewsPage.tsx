import { sendPushNotificationToAll } from "@/apis/push/subscribe";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const NewsPage = () => {
  const handleSubmit = async () => {
    await sendPushNotificationToAll({
      title: "아무렇게나",
      body: "이게 내용이다",
      data: {
        url: "www.naver.com",
      },
    });
  };
  return (
    <div className="pt-6 flex flex-col h-full">
      <div className="px-4">
        <Label className="text-xl font-bold">대학 청년부 소식</Label>
        <div> 03</div>
        <Button onClick={handleSubmit}>알림</Button>
      </div>
    </div>
  );
};
