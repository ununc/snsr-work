import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, ImageIcon } from "lucide-react";
import { getPresignedUrl } from "@/apis/minio/images";

// 이미지 타입 정의
export interface ImageFile {
  id: string;
  file?: File;
  preview: string;
  uploadUrl?: string;
  objectName: string;
}

interface ImageUploaderProps {
  imageFiles: ImageFile[];
  setImageFiles: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  userPID: string;
}

export const ImageList = ({
  imageFiles,
  setImageFiles,
  userPID,
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: ImageFile[] = [];
      for (const file of e.target.files) {
        const { url, objectName } = await getPresignedUrl(userPID, file.name); // 비동기 처리 대기
        newFiles.push({
          id: Math.random().toString(36).substring(4),
          file,
          preview: URL.createObjectURL(file),
          uploadUrl: url,
          objectName: objectName,
        });
      }
      setImageFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImageFiles((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      return filtered;
    });
  };

  const handleClickUpload = () => {
    fileInputRef?.current?.click();
  };

  return (
    <div className="mb-4 space-y-4">
      <div className="grid gap-4">
        {imageFiles.map((img) => (
          <div key={img.id} className="relative w-full border">
            <img
              src={img.preview}
              alt="Preview"
              className="w-full h-96 object-contain rounded-md"
            />
            <button
              onClick={() => handleRemoveImage(img.id)}
              className="absolute top-4 right-4 p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="relative w-full"
        onClick={handleClickUpload}
      >
        <ImageIcon className="w-4 h-4 mr-2" />
        이미지 선택
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </Button>
    </div>
  );
};
