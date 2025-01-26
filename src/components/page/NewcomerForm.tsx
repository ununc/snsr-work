import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import {
  ArrowLeftRight,
  CalendarIcon,
  ImageIcon,
  TrashIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import imageCompression from "browser-image-compression";
import { getObjectName } from "@/apis/minio";

interface Newcomers {
  leader: string;
  name?: string;
  pear: number;
  phone?: string;
  job?: string;
  newComer: boolean;
  churchName?: string;
  baptism: boolean;
  pastorVisited: boolean;
  registrationDate?: string;
  registrationReason?: string;
  notes?: string[];
  absence?: string;
  climbing?: string;
  boardName: "newcomer" | "absenteeism" | "promotion";
  promotionEnd: boolean;
  image?: {
    file?: File;
    preview: string;
    objectName: string;
  };
}
interface NewcomersFormProps {
  initialData: Newcomers;
  onSubmit: (data: Newcomers) => void;
  userPID: string;
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const NewcomerForm: React.FC<NewcomersFormProps> = ({
  initialData,
  onSubmit,
  userPID,
}) => {
  const [formData, setFormData] = useState<Newcomers>(initialData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    onSubmit(formData);
  }, [formData, onSubmit]);

  const handleYearChange = (year: string) => {
    setFormData((prev) => ({
      ...prev,
      pear: parseInt(year),
    }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 48 }, (_, i) => currentYear - i - 17);

  const handleChange = (
    field: keyof Newcomers,
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleToggle = (field: "newComer" | "baptism" | "pastorVisited") => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      registrationDate: date ? formatDate(date) : "",
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
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
      setFormData((prev) => ({
        ...prev,
        image: {
          file: renamedFile,
          preview: URL.createObjectURL(compressedFile),
          objectName: newName,
        },
      }));
    } catch (error) {
      console.error("Error compressing image:", error);
    }
  };

  return (
    <div className="space-y-6 mb-6">
      <div className="mb-4">
        <Label className="mb-2 block">리더 이름</Label>
        <Input
          placeholder="리더 이름을 입력하세요"
          value={formData.leader}
          onChange={(e) => handleChange("leader", e)}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">새신자 사진</Label>
        <div
          className="relative border-2 border-dashed rounded-lg h-64 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {formData.image?.preview ? (
            <div className="relative w-full h-full">
              <img
                src={formData.image.preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute p-2 top-2 right-2 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  if (formData.image?.preview && formData.image?.preview) {
                    URL.revokeObjectURL(formData.image.preview);
                  }
                  setFormData((prev) => ({
                    ...prev,
                    image: undefined,
                  }));
                }}
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2 text-sm text-gray-600">
                클릭하여 사진을 업로드하세요
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="col-span-3">
          <Label className="mb-2 block">이름</Label>
          <Input
            placeholder="새신자 이름을 입력하세요"
            value={formData.name}
            onChange={(e) => handleChange("name", e)}
          />
        </div>

        <div className="col-span-2">
          <Label className="mb-2 block">또래</Label>
          <Select value={`${formData.pear}`} onValueChange={handleYearChange}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {formData.pear ? `${formData.pear} 또래` : "선택 하세요"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-56">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year} 또래
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">전화번호</Label>
        <Input
          placeholder="전화번호를 입력하세요"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e)}
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">직업</Label>
        <Input
          placeholder="직업을 입력하세요"
          value={formData.job}
          onChange={(e) => handleChange("job", e)}
        />
      </div>

      <div className="grid grid-cols-10 gap-4 mb-4">
        <div onClick={() => handleToggle("newComer")} className="col-span-3">
          <Badge
            variant="outline"
            className="w-full flex justify-between items-center py-2 text-center cursor-pointer"
          >
            {formData.newComer ? "초신자" : "기신자"}
            <ArrowLeftRight className="w-4 h-4" />
          </Badge>
        </div>
        <div onClick={() => handleToggle("baptism")} className="col-span-3">
          <Badge
            variant="outline"
            className="w-full flex justify-between items-center py-2 text-center cursor-pointer"
          >
            <div>세례</div>
            {formData.baptism ? "✓" : "✗"}
          </Badge>
        </div>
        <div
          onClick={() => handleToggle("pastorVisited")}
          className="col-span-4"
        >
          <Badge
            variant="outline"
            className="w-full flex justify-between items-center py-2 text-center cursor-pointer"
          >
            <div>목사님 심방</div>
            {formData.pastorVisited ? "✓" : "✗"}
          </Badge>
        </div>
      </div>

      {!formData.newComer && (
        <div className="mb-4">
          <Label className="mb-2 block">기존 교회</Label>
          <Input
            placeholder="교회명을 입력하세요"
            value={formData.churchName}
            onChange={(e) => handleChange("churchName", e)}
          />
        </div>
      )}

      <div className="mb-4">
        <Label className="mb-2 block">등록일</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start items-center text-left font-normal`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.registrationDate ? (
                formData.registrationDate
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
              selected={new Date(formData.registrationDate ?? "")}
              onSelect={(date) => handleDateChange(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">등록 경로</Label>
        <Input
          placeholder="등록 경로를 입력하세요"
          value={formData.registrationReason}
          onChange={(e) => handleChange("registrationReason", e)}
        />
      </div>
    </div>
  );
};
