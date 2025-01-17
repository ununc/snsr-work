import React, { useState, ChangeEvent, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  FileIcon,
  ImageIcon,
  TrashIcon,
  VideoIcon,
} from "lucide-react";
import { getPresignedUrl } from "@/apis/minio/images";
import { ContentType, Advertisement } from "@/api-models/sub";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ContentViewer } from "./ContentViewer";

interface ContentItem {
  id: string;
  type: ContentType;
  objectPath: string;
  file?: File;
  preview: string;
  uploadUrl?: string;
}
interface Advertisements extends Advertisement {
  contents: ContentItem[];
  title: string;
}

interface AdvertisementsFormProps {
  initialData: Advertisements;
  onSubmit: (data: Advertisements) => void;
  userPID: string;
  readonly?: boolean;
}

const initValue: Advertisements = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  contents: [],
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const parseDate = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
};

export const AdvertisementForm: React.FC<AdvertisementsFormProps> = ({
  initialData = initValue,
  onSubmit,
  userPID,
  readonly = false,
}) => {
  const [formData, setFormData] = useState<Advertisements>(initialData);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedContentIndex, setSelectedContentIndex] = useState(0);

  const [startDateObj, setStartDateObj] = useState<Date | undefined>(
    parseDate(formData.startDate)
  );
  const [endDateObj, setEndDateObj] = useState<Date | undefined>(
    parseDate(formData.endDate)
  );

  useEffect(() => {
    if (!readonly) {
      onSubmit(formData);
    }
  }, [formData, onSubmit, readonly]);

  useEffect(() => {
    if (readonly) {
      setFormData(initialData);
      setStartDateObj(parseDate(initialData.startDate));
      setEndDateObj(parseDate(initialData.endDate));
    }
  }, [readonly, initialData]);

  const handleChange = (
    field: keyof Advertisements,
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (readonly) return;
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleDateChange = (
    field: "startDate" | "endDate",
    date: Date | undefined
  ) => {
    if (readonly) return;

    if (field === "startDate") {
      setStartDateObj(date);
      // 시작일이 종료일보다 나중이면 종료일을 초기화
      if (date && endDateObj && date > endDateObj) {
        setEndDateObj(undefined);
        setFormData((prev) => ({
          ...prev,
          startDate: date ? formatDate(date) : "",
          endDate: "",
        }));
        return;
      }
    } else {
      setEndDateObj(date);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: date ? formatDate(date) : "",
    }));
  };

  const handleContentChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (readonly) return;
    const files = e.target.files;
    if (!files) return;

    try {
      const newContents: ContentItem[] = await Promise.all(
        Array.from(files).map(async (file) => {
          const { url, objectName } = await getPresignedUrl(userPID, file.name);
          let type: ContentType;

          if (file.type.startsWith("image/")) {
            type = ContentType.IMAGE;
          } else if (file.type.startsWith("video/")) {
            type = ContentType.VIDEO;
          } else {
            type = ContentType.DOCUMENT;
          }

          return {
            id: Math.random().toString(36).substring(4),
            type,
            file,
            preview:
              type === ContentType.IMAGE ? URL.createObjectURL(file) : "",
            uploadUrl: url,
            objectPath: objectName,
          };
        })
      );

      setFormData((prev) => ({
        ...prev,
        contents: [...prev.contents, ...newContents],
      }));
    } catch (error) {
      console.error("Error getting presigned URLs:", error);
    }
  };

  const removeContent = (contentId: string) => {
    if (readonly) return;
    setFormData((prev) => ({
      ...prev,
      contents: prev.contents.filter((content) => content.id !== contentId),
    }));
  };

  const handleContentClick = (contentIndex: number) => {
    if (
      readonly &&
      formData.contents[contentIndex].type === ContentType.IMAGE
    ) {
      setSelectedContentIndex(contentIndex);
      setViewerOpen(true);
    }
  };

  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case ContentType.IMAGE:
        return <ImageIcon className="w-4 h-4" />;
      case ContentType.VIDEO:
        return <VideoIcon className="w-4 h-4" />;
      case ContentType.DOCUMENT:
        return <FileIcon className="w-4 h-4" />;
    }
  };

  const calculateRows = (text: string) => {
    if (!text) return 1;
    return (text.match(/\n/g) || []).length + 1;
  };

  return (
    <div className="space-y-6 mb-6">
      <div className="mb-4">
        <Label className="mb-2 block">제목</Label>
        <Input
          placeholder="광고 제목을 입력하세요"
          value={formData.title}
          onChange={(e) => handleChange("title", e)}
          readOnly={readonly}
          className={readonly ? "bg-gray-50" : ""}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">설명</Label>
        <Textarea
          placeholder="상세 내용을 입력하세요"
          value={formData.description}
          onChange={(e) => handleChange("description", e)}
          rows={calculateRows(formData.description)}
          readOnly={readonly}
          className={readonly ? "bg-gray-50" : ""}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">시작일</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${
                readonly ? "bg-gray-50" : ""
              }`}
              disabled={readonly}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDateObj ? (
                formatDisplayDate(startDateObj)
              ) : (
                <span>날짜를 선택하세요</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              formatters={{
                formatCaption: (date) => {
                  return `${date.getFullYear()}년 ${String(
                    date.getMonth() + 1
                  ).padStart(2, "0")}월`;
                },
                formatWeekdayName: (date) => {
                  const weekdays = ["월", "화", "수", "목", "금", "토", "일"];
                  return weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1];
                },
              }}
              selected={startDateObj}
              onSelect={(date) => handleDateChange("startDate", date)}
              disabled={readonly}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">종료일</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${
                readonly ? "bg-gray-50" : ""
              }`}
              disabled={readonly}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDateObj ? (
                formatDisplayDate(endDateObj)
              ) : (
                <span>날짜를 선택하세요</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              formatters={{
                formatCaption: (date) => {
                  return `${date.getFullYear()}년 ${String(
                    date.getMonth() + 1
                  ).padStart(2, "0")}월`;
                },
                formatWeekdayName: (date) => {
                  const weekdays = ["월", "화", "수", "목", "금", "토", "일"];
                  return weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1];
                },
              }}
              selected={endDateObj}
              onSelect={(date) => handleDateChange("endDate", date)}
              disabled={(date) => {
                if (!startDateObj) return false;
                return date < startDateObj;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Label className="mb-0">콘텐츠</Label>
          {!readonly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.getElementById("content-upload");
                if (input) {
                  input.click();
                }
              }}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              파일 추가
            </Button>
          )}
          <input
            id="content-upload"
            type="file"
            className="hidden"
            multiple
            accept="image/*,video/*,application/*"
            onChange={handleContentChange}
          />
        </div>

        <div className="space-y-6">
          {formData.contents.map((content, index) => (
            <div
              key={content.id}
              className="relative border rounded-lg overflow-hidden"
              onClick={() => handleContentClick(index)}
            >
              {content.type === ContentType.IMAGE ? (
                <img
                  src={content.preview}
                  alt="Preview"
                  className="w-full h-96 object-contain"
                />
              ) : (
                <div className="w-full h-28 flex items-center justify-center bg-gray-100">
                  {getContentIcon(content.type)}
                  <span className="ml-2">{content.file?.name}</span>
                </div>
              )}
              {!readonly && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute p-2 top-2 right-2 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeContent(content.id);
                  }}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      {readonly && (
        <ContentViewer
          contents={formData.contents}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          initialIndex={selectedContentIndex}
        />
      )}
    </div>
  );
};
