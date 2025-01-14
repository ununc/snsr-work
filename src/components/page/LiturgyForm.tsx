import React, { useState, ChangeEvent, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageIcon, TrashIcon, Calendar } from "lucide-react";
import { getPresignedUrl } from "@/apis/minio/images";
import { ImageViewer } from "./ImageViewr";

interface ImageItem {
  id: string;
  file?: File;
  preview: string;
  uploadUrl?: string;
  objectName: string;
}

interface LiturgyWithoutImages {
  preach: string;
  bibleVerses: string;
  continuity: string;
  hymn: string;
  images?: ImageItem[];
  targetDate?: string;
}

const initValue: LiturgyWithoutImages = {
  preach: "",
  bibleVerses: "",
  continuity: "",
  hymn: "",
  images: [],
};

interface LiturgyFormProps {
  initialData: LiturgyWithoutImages;
  onSubmit: (data: LiturgyWithoutImages) => void;
  userPID: string;
  readonly?: boolean;
}

export const LiturgyForm: React.FC<LiturgyFormProps> = ({
  initialData = initValue,
  onSubmit,
  userPID,
  readonly = false,
}) => {
  const [formData, setFormData] = useState<LiturgyWithoutImages>(initialData);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!readonly) {
      onSubmit(formData);
    }
  }, [formData, onSubmit, readonly]);

  const handleChange = (
    field: keyof LiturgyWithoutImages,
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (readonly) return;
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (readonly) return;
    const files = e.target.files;
    if (!files) return;

    try {
      const newImages: ImageItem[] = await Promise.all(
        Array.from(files).map(async (file) => {
          const { url, objectName } = await getPresignedUrl(userPID, file.name);
          return {
            id: Math.random().toString(36).substring(4),
            file,
            preview: URL.createObjectURL(file),
            uploadUrl: url,
            objectName: objectName,
          };
        })
      );

      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
      }));
    } catch (error) {
      console.error("Error getting presigned URLs:", error);
    }
  };

  const removeImage = (imageId: string) => {
    if (readonly) return;
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((img) => img.id !== imageId),
    }));
  };

  const handleImageClick = (imageIndex: number) => {
    if (readonly && formData.images?.length) {
      setSelectedImageIndex(imageIndex);
      setViewerOpen(true);
    }
  };

  const calculateRows = (text: string) => {
    if (!text) return 1;
    return (text.match(/\n/g) || []).length + 1;
  };

  return (
    <div className="space-y-6 mb-6">
      {formData.targetDate && (
        <div className="flex items-center pb-4 gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{formData.targetDate}</span>
        </div>
      )}

      <div className="mb-4">
        <Label className="mb-2 block">말씀 제목</Label>
        <Input
          placeholder="사랑으로 세우는 공동체"
          value={formData.preach}
          onChange={(e) => handleChange("preach", e)}
          readOnly={readonly}
          className={readonly ? "bg-gray-50" : ""}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">말씀 구절</Label>
        <Input
          placeholder="마태복음 22장 34절~40절"
          value={formData.bibleVerses}
          onChange={(e) => handleChange("bibleVerses", e)}
          readOnly={readonly}
          className={readonly ? "bg-gray-50" : ""}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">설교 콘티</Label>
        <Textarea
          placeholder="시편 96:5-6"
          value={formData.continuity}
          onChange={(e) => handleChange("continuity", e)}
          rows={calculateRows(formData.continuity)}
          readOnly={readonly}
          className={readonly ? "bg-gray-50" : ""}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">적용 찬양</Label>
        <Input
          placeholder="하나님의 부르심"
          value={formData.hymn}
          onChange={(e) => handleChange("hymn", e)}
          readOnly={readonly}
          className={readonly ? "bg-gray-50" : ""}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Label className="mb-0">참고 이미지</Label>
          {!readonly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.getElementById("image-upload");
                if (input) {
                  input.click();
                }
              }}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              이미지 추가
            </Button>
          )}
          <input
            id="image-upload"
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div className="space-y-6">
          {formData.images?.map((img, imgIndex) => (
            <div
              key={img.id}
              className="relative border rounded-lg overflow-hidden"
              onClick={() => handleImageClick(imgIndex)}
            >
              <img
                src={img.preview}
                alt="Preview"
                className="w-full h-96 object-contain"
              />
              {!readonly && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute p-2 top-2 right-2 rounded-full"
                  onClick={() => removeImage(img.id)}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {readonly && formData.images && (
        <ImageViewer
          images={formData.images}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          initialIndex={selectedImageIndex}
        />
      )}
    </div>
  );
};
