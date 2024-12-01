import { getDownloadUrl, uploadImage } from "@/apis/minio/images";
import { Editor } from "@/components/editor/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChangedStringStore } from "@/stores/editor.store";
import { useImageStore } from "@/stores/tempImage.store";
import { Label } from "@radix-ui/react-label";
import { ChangeEvent, useState } from "react";

export const ManualCreatePage = () => {
  const [title, setTitle] = useState("");
  const { text } = useChangedStringStore();
  const { pendingImages } = useImageStore();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTitle(value);
  };
  const handleCreate = () => {
    let data = text;
    pendingImages.forEach((image) => {
      uploadImage(image.url, image.file);
      data = data.replace(image.base64, image.objectName);
    });
    console.log(data);
  };

  const test = async () => {
    // image.objectName 을 통해 getDownloadUrl을 만들고 결과를 image.objectName과 replace하여 사용자에게 보여준다...
    const data = await getDownloadUrl(
      "users/0f7042ca-4a07-49f6-909e-69fc9e537ba8/files/1734192733020-hcsb-qrcode.png"
    );
    console.log(data);
  };
  return (
    <div className="h-full p-4 flex flex-col">
      <h1 className="text-2xl font-bold">매뉴얼 작성</h1>

      <Label className="mt-2">제목</Label>
      <Input value={title} onChange={handleChange} />

      <Label className="mt-2">내용</Label>

      <div className="flex-1 min-h-0 mt-1">
        <Editor />
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <Button variant="outline" onClick={test}>
          템플릿
        </Button>
        <Button onClick={handleCreate}>생성</Button>
      </div>
    </div>
  );
};
