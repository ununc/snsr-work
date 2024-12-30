import { Card, CardContent } from "./ui/card";
import { X } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { useEffect } from "react";
import { Song } from "@/apis/song/song";
import { deleteImage, getPresignedUrl } from "@/apis/minio/images";

interface SongItemCardProps {
  item: Song["songList"][0];
  displayOrder: number;
  onUpdate?: (index: number, updatedItem: Song["songList"][0]) => void;
  onDelete?: (index: number) => void;
  canDelete?: boolean;
  isReadOnly?: boolean;
  pid: string;
}

export const SongItemCard = ({
  item,
  displayOrder,
  onUpdate,
  onDelete,
  canDelete,
  isReadOnly = false,
  pid,
}: SongItemCardProps) => {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("허용된 이미지 형식이 아닙니다. (jpeg, png, gif, webp)");
      return;
    }
    const { url, objectName } = await getPresignedUrl(pid, item.imageName);
    const objectUrl = URL.createObjectURL(file);
    onUpdate?.(displayOrder - 1, {
      ...item,
      imageName: objectName,
      imageFile: file,
      imageTempUrl: objectUrl,
      imageUploadUrl: url,
    });
  };

  const handleRemoveImage = async () => {
    if (item.imageTempUrl) {
      URL.revokeObjectURL(item.imageTempUrl);
    }
    await deleteImage(item.imageName);
    onUpdate?.(displayOrder - 1, {
      ...item,
      imageName: "",
      imageFile: undefined,
      imageTempUrl: undefined,
      imageUploadUrl: undefined,
    });
  };

  useEffect(() => {
    return () => {
      if (item.imageTempUrl) {
        URL.revokeObjectURL(item.imageTempUrl);
      }
    };
  }, [item.imageTempUrl]);

  if (isReadOnly) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-2">
            <div>
              <h3 className="mb-2">{displayOrder} 번째 찬양</h3>
              <div className="text-lg font-semibold">{item.title}</div>
            </div>
            <div>
              <h3 className="mb-2">가사 순서:</h3>
              <textarea
                value={item.lyricOrder}
                readOnly
                className="w-full min-h-[100px] p-2 border rounded-md"
              />
            </div>
            <div>
              <h3 className="mb-2">이미지:</h3>
              <div className="bg-gray-100 p-4 rounded-md">
                {item.imageTempUrl && (
                  <div className="relative">
                    <img
                      src={item.imageTempUrl}
                      alt={item.imageName}
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="">URL:</h3>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline truncate"
              >
                링크 이동
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 relative">
        {canDelete && (
          <button
            onClick={() => onDelete?.(displayOrder - 1)}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700"
          >
            <X size={20} />
          </button>
        )}
        <div className="grid gap-4">
          <h3 className="mb-2">{displayOrder} 번째 찬양</h3>
          <div>
            <Label className="mb-2 block">제목</Label>
            <input
              type="text"
              value={item.title}
              onChange={(e) =>
                onUpdate?.(displayOrder - 1, { ...item, title: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <Label className="mb-2 block">가사 순서</Label>
            <textarea
              value={item.lyricOrder}
              onChange={(e) =>
                onUpdate?.(displayOrder - 1, {
                  ...item,
                  lyricOrder: e.target.value,
                })
              }
              className="w-full min-h-[100px] p-2 border rounded-md"
            />
          </div>
          <div>
            <Label className="mb-2 block">이미지</Label>
            <div className="relative">
              {item.imageTempUrl || item.imageName ? (
                <div className="relative">
                  <img
                    src={item.imageTempUrl || item.imageName}
                    alt={item.imageName}
                    className="max-w-full h-auto rounded mb-2"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="w-full p-2 border rounded-md"
                />
              )}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">URL</Label>
            <input
              type="text"
              value={item.url}
              onChange={(e) =>
                onUpdate?.(displayOrder - 1, { ...item, url: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
