import React, { useState, ChangeEvent, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TrashIcon, ImageIcon } from "lucide-react";
import { getPresignedUrl } from "@/apis/minio/images";

interface SongItem {
  id: string;
  file?: File;
  preview: string;
  uploadUrl?: string;
  objectName: string;
}

interface Song {
  title: string;
  lyrics: string;
  images?: SongItem[];
  link?: string;
}

interface SongItemWithoutImages {
  description: string;
  songs: Song[];
}

const initValue: SongItemWithoutImages = {
  description: "",
  songs: [
    {
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
}

export const PraiseForm: React.FC<PraiseFormProps> = ({
  initialData = initValue,
  onSubmit,
  userPID,
}) => {
  const [formData, setFormData] = useState<SongItemWithoutImages>(initialData);

  useEffect(() => {
    onSubmit(formData);
  }, [formData, onSubmit]);

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
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
    setFormData((prev) => ({
      ...prev,
      songs: [...prev.songs, { title: "", lyrics: "", link: "", images: [] }],
    }));
  };

  const removeSong = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      songs: prev.songs.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 mb-6">
      <div className="mb-4">
        <Label className="mb-2 block">콘티 설명</Label>
        <Textarea
          value={formData.description}
          placeholder="인도자 솔로 있습니다."
          rows={6}
          onChange={handleDescriptionChange}
        />
      </div>

      {formData.songs.map((song, songIndex) => (
        <div key={songIndex} className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">곡 {songIndex + 1}</h3>
            {formData.songs.length > 1 && (
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
            <Label className="mb-2 block">제목</Label>
            <Input
              placeholder="곡 제목을 입력하세요"
              value={song.title}
              onChange={(e) =>
                handleSongChange(songIndex, "title", e.target.value)
              }
            />
          </div>

          <div className="mb-4">
            <Label className="mb-2 block">가사</Label>
            <Textarea
              placeholder="가사를 입력하세요"
              value={song.lyrics}
              onChange={(e) =>
                handleSongChange(songIndex, "lyrics", e.target.value)
              }
              rows={4}
            />
          </div>

          <div className="mb-4">
            <Label className="mb-2 block">링크</Label>
            <Input
              placeholder="링크를 입력하세요"
              value={song.link}
              onChange={(e) =>
                handleSongChange(songIndex, "link", e.target.value)
              }
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="mb-0">이미지</Label>
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
              {song.images?.map((img) => (
                <div
                  key={img.id}
                  className="relative border rounded-lg overflow-hidden"
                >
                  <img
                    src={img.preview}
                    alt="Preview"
                    className="w-full h-96 object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute p-2 top-2 right-2 rounded-full"
                    onClick={() => removeImage(songIndex, img.id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-4">
        <Button type="button" variant="outline" onClick={addSong}>
          곡 추가하기
        </Button>
      </div>
    </div>
  );
};
