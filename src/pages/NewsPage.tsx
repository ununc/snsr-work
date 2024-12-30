import { Label } from "@/components/ui/label";

export const NewsPage = () => {
  // const handleSubmit = async () => {
  //   await sendPushNotificationToAll({
  //     title: "아무렇게나",
  //     body: "이게 내용이다",
  //     data: {
  //       url: "www.naver.com",
  //     },
  //   });
  // };
  return (
    <div className="page-wrapper">
      <div className="h-9 flex items-center mb-4">
        <Label className="text-xl font-bold">대학 청년부 소식</Label>
      </div>
      <div className="page-body"></div>
    </div>
  );
};
