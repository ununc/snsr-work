import { uploadImage } from "@/apis/minio/images";
import { Editor } from "@/components/editor/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChangedStringStore } from "@/stores/editor.store";
import { useImageStore } from "@/stores/tempImage.store";
import { Label } from "@radix-ui/react-label";
import { ChangeEvent, useState } from "react";

export const ManualCreatePage = () => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const { text } = useChangedStringStore();
  const { pendingImages } = useImageStore();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTitle(value);
  };
  const handleCreate = async () => {
    setLoading(true);
    try {
      const uploadPromises = [];
      let currentText = text;

      for (const image of pendingImages) {
        if (currentText.includes(image.objectUrl)) {
          currentText = currentText.replace(image.objectUrl, image.objectName);
          uploadPromises.push(uploadImage(image.url, image.file));
        }
      }

      await Promise.all(uploadPromises);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const template = "";

  return (
    <div className="h-full p-4 flex flex-col">
      <h1 className="text-2xl font-bold">매뉴얼 작성</h1>

      <Label className="mt-2">제목</Label>
      <Input value={title} onChange={handleChange} />

      <Label className="mt-2">내용</Label>

      <div className="flex-1 min-h-0 mt-1">
        <Editor text={template} />
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <Button variant="outline" disabled={loading}>
          템플릿
        </Button>
        <Button
          disabled={
            loading ||
            text ===
              `{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}`
          }
          onClick={handleCreate}
        >
          생성
        </Button>
      </div>
    </div>
  );
};
