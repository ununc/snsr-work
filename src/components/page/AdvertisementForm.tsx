import React, { useState, ChangeEvent, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Download,
  FileCheck2,
  FileIcon,
  FileSpreadsheetIcon,
  ImageIcon,
  MusicIcon,
  PanelLeftDashed,
  Tablet,
  TrashIcon,
  VideoIcon,
} from "lucide-react";
import type { IAdvertisementForm, ManagedContent } from "@/api-models/sub";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { extractFileName, getObjectName } from "@/apis/minio";
import imageCompression from "browser-image-compression";

interface AdvertisementsFormProps {
  initialData: IAdvertisementForm;
  onSubmit: (data: IAdvertisementForm) => void;
  userPID: string;
  readonly?: boolean;
}

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

const calculateRows = (text: string) => {
  if (!text) return 1;
  return (text.match(/\n/g) || []).length + 1;
};

export const AdvertisementForm: React.FC<AdvertisementsFormProps> = ({
  initialData,
  onSubmit,
  userPID,
  readonly = false,
}) => {
  const [formData, setFormData] = useState(initialData);

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
    field: keyof IAdvertisementForm,
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
      const newContents = await Promise.all(
        Array.from(files).map(async (file) => {
          const newName = getObjectName(userPID, file.name);

          const renamedFile = new File([file], encodeURIComponent(newName), {
            type: file.type,
          });

          if (file.type.includes("image")) {
            const compressedFile = await imageCompression(renamedFile, {
              maxSizeMB: 3,
              maxWidthOrHeight: 1920,
              initialQuality: 0.8,
            });

            return {
              id: Math.random().toString(36).substring(4),
              file: compressedFile,
              preview: URL.createObjectURL(file),
              objectName: newName,
              type: renamedFile.type,
            };
          }

          return {
            id: Math.random().toString(36).substring(4),
            file: renamedFile,
            preview: URL.createObjectURL(file),
            objectName: newName,
            type: renamedFile.type,
          };
        })
      );

      setFormData((prev) => ({
        ...prev,
        contents: [...(prev.contents || []), ...newContents],
      }));
    } catch (error) {
      console.error("Error getting presigned URLs:", error);
    }
  };

  const removeContent = (contentId: string) => {
    const input = document.getElementById("content-upload") as HTMLInputElement;
    if (input) {
      input.value = ""; // Reset the input
    }
    if (readonly) return;
    setFormData((prev) => ({
      ...prev,
      contents: (prev.contents || []).filter(
        (content) => content.id !== contentId
      ),
    }));
  };

  const handleDownload = async (content: ManagedContent) => {
    try {
      const url = content.preview;
      const link = document.createElement("a");
      link.href = url;
      link.download = extractFileName(decodeURIComponent(content.objectName));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const mimeTypeTemplate = (content: ManagedContent) => {
    const type = content.type;
    if (!type) return;
    if (type.includes("image")) {
      return (
        <img
          src={content.preview}
          alt="Preview"
          className="w-full h-96 object-contain"
        />
      );
    } else if (type.includes("video")) {
      return (
        <div className="w-full pl-3 pr-8 h-24 flex items-center justify-start bg-gray-100">
          <VideoIcon className="w-6 h-6" />
          <span className="ml-2">
            {extractFileName(decodeURIComponent(content.objectName))}
          </span>
        </div>
      );
    } // PDF 파일
    else if (type.includes("pdf")) {
      return (
        <div className="w-full pl-3 pr-8 h-24 flex items-center justify-start bg-gray-100">
          <FileCheck2 className="w-6 h-6" />
          <span className="ml-2">
            {extractFileName(decodeURIComponent(content.objectName))}
          </span>
        </div>
      );
    }

    // 오디오 파일
    else if (type.includes("audio")) {
      return (
        <div className="w-full pl-3 pr-8 h-24 flex items-center justify-start bg-gray-100">
          <MusicIcon className="w-6 h-6" />
          <span className="ml-2">
            {extractFileName(decodeURIComponent(content.objectName))}
          </span>
        </div>
      );
    }

    // 워드 문서
    else if (type.includes("msword") || type.includes("wordprocessingml")) {
      return (
        <div className="w-full pl-3 pr-8 h-24 flex items-center justify-start bg-gray-100">
          <Tablet className="w-6 h-6" />
          <span className="ml-2">
            {extractFileName(decodeURIComponent(content.objectName))}
          </span>
        </div>
      );
    }

    // 엑셀 문서
    else if (type.includes("ms-excel") || type.includes("spreadsheetml")) {
      return (
        <div className="w-full pl-3 pr-8 h-24 flex items-center justify-start bg-gray-100">
          <FileSpreadsheetIcon className="w-6 h-6" />
          <span className="ml-2">
            {extractFileName(decodeURIComponent(content.objectName))}
          </span>
        </div>
      );
    }

    // PowerPoint 문서
    else if (
      type.includes("ms-powerpoint") ||
      type.includes("presentationml")
    ) {
      return (
        <div className="w-full pl-3 pr-8 h-24 flex items-center justify-start bg-gray-100">
          <PanelLeftDashed className="w-6 h-6" />
          <span className="ml-2">
            {extractFileName(decodeURIComponent(content.objectName))}
          </span>
        </div>
      );
    } else {
      <div className="w-full h-28 flex items-center justify-start bg-gray-100">
        <FileIcon className="w-4 h-4" />;
        <span className="ml-2">
          {extractFileName(decodeURIComponent(content.objectName))}
        </span>
      </div>;
    }
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
          rows={readonly ? calculateRows(formData.description) : 5}
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
            accept="image/*,video/*,audio/*,application/*"
            onChange={handleContentChange}
          />
        </div>

        <div className="space-y-6">
          {formData.contents.map((content) => (
            <div
              key={content.id}
              className="relative border rounded-lg overflow-hidden"
            >
              {mimeTypeTemplate(content)}
              {readonly ? (
                <Button
                  onClick={() => handleDownload(content)}
                  variant="outline"
                  size="icon"
                  className="bg-white/80 absolute p-2 top-2 right-2"
                >
                  <Download className="h-4 w-4" />
                </Button>
              ) : (
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
    </div>
  );
};
