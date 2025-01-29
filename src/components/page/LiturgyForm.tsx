import React, { useState, ChangeEvent, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyIcon, ImageIcon, TrashIcon } from "lucide-react";
import { ImageViewer } from "./ImageViewr";
import type { ILiturgyForm } from "@/api-models/sub";
import imageCompression from "browser-image-compression";
import { getObjectName } from "@/apis/minio";
import { useToast } from "@/hooks/use-toast";

interface LiturgyFormProps {
  initialData: ILiturgyForm;
  onSubmit: (data: ILiturgyForm) => void;
  userPID: string;
  readonly?: boolean;
}

const calculateRows = (text: string) => {
  if (!text) return 1;
  return (text.match(/\n/g) || []).length + 1;
};

export const LiturgyForm: React.FC<LiturgyFormProps> = ({
  initialData,
  onSubmit,
  userPID,
  readonly = false,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toast } = useToast();
  useEffect(() => {
    if (!readonly) {
      onSubmit(formData);
    }
  }, [formData, onSubmit, readonly]);

  useEffect(() => {
    if (readonly) {
      setFormData(initialData);
    }
  }, [readonly, initialData]);

  const handleChange = (
    field: keyof ILiturgyForm,
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
      const newImages = await Promise.all(
        Array.from(files).map(async (file) => {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 1,
            initialQuality: 1,
          });

          const newName = getObjectName(userPID, file.name);

          const renamedFile = new File(
            [compressedFile],
            encodeURIComponent(newName),
            {
              type: compressedFile.type,
            }
          );

          return {
            id: Math.random().toString(36).substring(4),
            file: renamedFile,
            preview: URL.createObjectURL(compressedFile),
            objectName: newName,
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
    if (readonly) {
      setSelectedImageIndex(imageIndex);
      setViewerOpen(true);
    }
  };

  return (
    <div className="space-y-6 mb-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <Label className="mb-2 block">말씀 제목</Label>{" "}
          {readonly && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => {
                navigator.clipboard.writeText(formData.preach);
                toast({
                  title: "복사 완료",
                  description: "말씀 제목이 복사되었습니다.",
                  duration: 2000,
                  className: "top-4 right-4 fixed w-54",
                });
              }}
            >
              <CopyIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Input
          placeholder="사랑으로 세우는 공동체"
          value={formData.preach}
          onChange={(e) => handleChange("preach", e)}
          readOnly={readonly}
          className={readonly ? "bg-gray-50" : ""}
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <Label className="mb-2 block">말씀 구절</Label>
          {readonly && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => {
                navigator.clipboard.writeText(formData.bibleVerses);
                toast({
                  title: "복사 완료",
                  description: "말씀 구절이 복사되었습니다.",
                  duration: 2000,
                  className: "top-4 right-4 fixed w-54",
                });
              }}
            >
              <CopyIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Input
          placeholder="마태복음 22장 34절~40절"
          value={formData.bibleVerses}
          onChange={(e) => handleChange("bibleVerses", e)}
          readOnly={readonly}
          className={readonly ? "bg-gray-50" : ""}
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <Label className="mb-2 block">설교 콘티</Label>
          {readonly && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => {
                navigator.clipboard.writeText(formData.continuity);
                toast({
                  title: "복사 완료",
                  description: "설교 콘티가 복사되었습니다.",
                  duration: 2000,
                  className: "top-4 right-4 fixed w-54",
                });
              }}
            >
              <CopyIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Textarea
          placeholder="시편 96:5-6"
          value={formData.continuity}
          onChange={(e) => handleChange("continuity", e)}
          rows={readonly ? calculateRows(formData.continuity) : 5}
          readOnly={readonly}
          className={readonly ? "bg-gray-50" : ""}
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <Label className="mb-2 block">적용 찬양</Label>
          {readonly && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => {
                navigator.clipboard.writeText(formData.hymn);
                toast({
                  title: "복사 완료",
                  description: "적용 찬양이 복사되었습니다.",
                  duration: 2000,
                  className: "top-4 right-4 fixed w-54",
                });
              }}
            >
              <CopyIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
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
                className="w-full h-72 object-contain"
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
