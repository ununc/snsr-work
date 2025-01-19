import React, { useState, ChangeEvent, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TrashIcon, ImageIcon, CopyIcon } from "lucide-react";
import { getPresignedUrl } from "@/apis/minio/images";
import { ImageViewer } from "./ImageViewr";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SongItem {
  id: string;
  file?: File;
  preview: string;
  uploadUrl?: string;
  objectName: string;
}

interface Song {
  id: string;
  title: string;
  lyrics: string;
  images?: SongItem[];
  link?: string;
}

interface SongItemWithoutImages {
  kind: "찬양" | "특송" | "봉헌" | "끝송";
  description: string;
  songs: Song[];
}

const initValue: SongItemWithoutImages = {
  kind: "찬양",
  description: "",
  songs: [
    {
      id: Math.random().toString(36).substring(4),
      title: "",
      lyrics: "",
      link: "",
      images: [],
    },
  ],
};

interface PraiseFormProps {
  initialData?: SongItemWithoutImages;
  onSubmit: (data: SongItemWithoutImages) => void;
  userPID: string;
  readonly?: boolean;
}

const KINDS = ["찬양", "특송", "봉헌", "끝송"] as const;

const calculateRows = (text: string) => {
  if (!text) return 1;
  const row = (text.match(/\n/g) || []).length + 1;
  if (row > 12) return 12;
  return row;
};

export const PraiseForm: React.FC<PraiseFormProps> = ({
  initialData = initValue,
  onSubmit,
  userPID,
  readonly = false,
}) => {
  const [formData, setFormData] = useState<SongItemWithoutImages>(initialData);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedSongIndex, setSelectedSongIndex] = useState(0);
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

  const handleKindChange = (kind: (typeof KINDS)[number]) => {
    if (readonly) return;
    setFormData((prev) => ({
      ...prev,
      kind,
    }));
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (readonly) return;
    setFormData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  const handleSongChange = (
    index: number,
    field: keyof Song,
    value: string
  ) => {
    if (readonly) return;
    setFormData((prev) => ({
      ...prev,
      songs: prev.songs.map((song, i) =>
        i === index ? { ...song, [field]: value } : song
      ),
    }));
  };

  const handleImageChange = async (
    songIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (readonly) return;
    const files = e.target.files;
    if (!files) return;

    try {
      const newImages: SongItem[] = await Promise.all(
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
        songs: prev.songs.map((song, i) => {
          if (i !== songIndex) return song;
          return {
            ...song,
            images: [...(song.images || []), ...newImages],
          };
        }),
      }));
    } catch (error) {
      console.error("Error getting presigned URLs:", error);
    }
  };

  const removeImage = (songIndex: number, imageId: string) => {
    if (readonly) return;
    setFormData((prev) => ({
      ...prev,
      songs: prev.songs.map((song, i) => {
        if (i !== songIndex) return song;
        return {
          ...song,
          images: (song.images || []).filter((img) => img.id !== imageId),
        };
      }),
    }));
  };

  const addSong = () => {
    if (readonly) return;
    setFormData((prev) => ({
      ...prev,
      songs: [
        ...prev.songs,
        {
          id: Math.random().toString(36).substring(4),
          title: "",
          lyrics: "",
          link: "",
          images: [],
        },
      ],
    }));
  };

  const removeSong = (index: number) => {
    if (readonly) return;
    setFormData((prev) => ({
      ...prev,
      songs: prev.songs.filter((_, i) => i !== index),
    }));
  };

  const handleImageClick = (songIndex: number, imageIndex: number) => {
    if (readonly) {
      setSelectedSongIndex(songIndex);
      setSelectedImageIndex(imageIndex);
      setViewerOpen(true);
    }
  };

  return (
    <div className="space-y-6 mb-6">
      {!readonly && (
        <div className="mb-6">
          <Label className="mb-2 block">종류</Label>
          <div className="flex gap-2 flex-wrap">
            {KINDS.map((kind) => (
              <Badge
                key={kind}
                variant={formData.kind === kind ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90"
                onClick={() => handleKindChange(kind)}
              >
                {kind}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <Label className="mb-2 block">콘티 설명</Label>
        <Textarea
          value={formData.description}
          placeholder="인도자 솔로 있습니다."
          rows={6}
          onChange={handleDescriptionChange}
          readOnly={readonly}
          className={readonly ? "bg-gray-50" : ""}
        />
      </div>

      {formData.songs.map((song, songIndex) => (
        <div key={songIndex} className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">곡 {songIndex + 1}</h3>
            {!readonly && formData.songs.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeSong(songIndex)}
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label>제목</Label>
              {readonly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => {
                    navigator.clipboard.writeText(song.title);
                    toast({
                      title: "복사 완료",
                      description: "제목이 클립보드에 복사되었습니다.",
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
              placeholder="곡 제목을 입력하세요"
              value={song.title}
              onChange={(e) =>
                handleSongChange(songIndex, "title", e.target.value)
              }
              readOnly={readonly}
              className={readonly ? "bg-gray-50" : ""}
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label>가사</Label>
              {readonly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => {
                    navigator.clipboard.writeText(song.lyrics);
                    toast({
                      title: "복사 완료",
                      description: "가사가 클립보드에 복사되었습니다.",
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
              placeholder="가사를 입력하세요"
              value={song.lyrics}
              onChange={(e) =>
                handleSongChange(songIndex, "lyrics", e.target.value)
              }
              rows={readonly ? calculateRows(song.lyrics) : 8}
              readOnly={readonly}
              className={readonly ? "bg-gray-50" : ""}
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label>링크</Label>
              {readonly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => {
                    navigator.clipboard.writeText(song.link || "");
                    toast({
                      title: "복사 완료",
                      description: "링크가 클립보드에 복사되었습니다.",
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
              placeholder="링크를 입력하세요"
              value={song.link}
              onChange={(e) =>
                handleSongChange(songIndex, "link", e.target.value)
              }
              readOnly={readonly}
              className={readonly ? "bg-gray-50" : ""}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="mb-0">이미지</Label>
              {!readonly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.getElementById(
                      `image-upload-${songIndex}`
                    );
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
                id={`image-upload-${songIndex}`}
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(songIndex, e)}
              />
            </div>

            <div className="space-y-6">
              {song.images?.map((img, imgIndex) => (
                <div
                  key={img.id}
                  className="relative border rounded-lg overflow-hidden"
                  onClick={() => handleImageClick(songIndex, imgIndex)}
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
                      onClick={() => removeImage(songIndex, img.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {!readonly && (
        <div className="flex justify-center mt-4">
          <Button type="button" variant="outline" onClick={addSong}>
            곡 추가하기
          </Button>
        </div>
      )}
      {readonly && formData.songs[selectedSongIndex]?.images && (
        <ImageViewer
          images={formData.songs[selectedSongIndex].images || []}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          initialIndex={selectedImageIndex}
        />
      )}
    </div>
  );
};
