import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { ScheduleEvent } from "@/apis/calendar/calendar";
import { Checkbox } from "../ui/checkbox";

interface EventEditFormProps {
  event: ScheduleEvent;
  onSubmit: (updatedEvent: ScheduleEvent) => void;
  onCancel: () => void;
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

const colorOptions = [
  { label: "토마토 레드", value: "#D50000" },
  { label: "코랄", value: "#E67C73" },
  { label: "오렌지", value: "#F4511E" },
  { label: "옐로우", value: "#F6BF26" },
  { label: "그린", value: "#33B679" },
  { label: "터쿠아즈", value: "#039BE5" },
  { label: "블루", value: "#3F51B5" },
  { label: "퍼플", value: "#7986CB" },
  { label: "그레이", value: "#616161" },
  { label: "라이트 살몬", value: "#FFA07A" },
  { label: "라이트 블루", value: "#ADD8E6" },
  { label: "라이트 씨그린", value: "#20B2AA" },
  { label: "공휴일", value: "tr" },
];

const groupOptions = [
  "전체",
  "대학부",
  "청년부",
  "찬양국",
  "행사국",
  "예배국",
  "미디어국",
  "새가족국",
  "목사님",
  "총괄국",
];

export const EventEditForm: React.FC<EventEditFormProps> = ({
  event,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: event.title,
    content: event.content,
    startDate: event.startDate,
    endDate: event.endDate,
    hostGroup: event.hostGroup,
    relativeGroup: event.relativeGroup,
    color: event.color,
  });

  const [startDateObj, setStartDateObj] = useState<Date | undefined>(
    parseDate(formData.startDate)
  );
  const [endDateObj, setEndDateObj] = useState<Date | undefined>(
    parseDate(formData.endDate)
  );

  const isFormValid = useMemo(() => {
    if (
      formData.color === "tr" &&
      formData.title.trim() &&
      formData.startDate !== "" &&
      formData.endDate !== ""
    ) {
      return true;
    }
    return (
      formData.title.trim() !== "" &&
      formData.content.trim() !== "" &&
      formData.startDate !== "" &&
      formData.endDate !== "" &&
      formData.hostGroup !== "" &&
      formData.relativeGroup.length > 0 &&
      formData.color !== "" &&
      startDateObj !== undefined &&
      endDateObj !== undefined
    );
  }, [formData, startDateObj, endDateObj]);

  const handleDateChange = (
    field: "startDate" | "endDate",
    date: Date | undefined
  ) => {
    if (!date) return;
    if (field === "startDate") {
      setStartDateObj(date);
      if (endDateObj && date > endDateObj) {
        setEndDateObj(undefined);
        setFormData((prev) => ({
          ...prev,
          startDate: formatDate(date),
          endDate: "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          startDate: formatDate(date),
        }));
      }
    } else {
      setEndDateObj(date);
      setFormData((prev) => ({
        ...prev,
        endDate: formatDate(date),
      }));
    }
  };

  const handleRelativeGroupToggle = (group: string) => {
    setFormData((prev) => {
      const newRelativeGroup = prev.relativeGroup.includes(group)
        ? prev.relativeGroup.filter((g) => g !== group)
        : [...prev.relativeGroup, group];
      return {
        ...prev,
        relativeGroup: newRelativeGroup,
      };
    });
  };

  const handleSubmit = () => {
    if (!isFormValid) return;
    onSubmit({
      ...formData,
      id: event.id,
    });
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Label className="mb-2 block">제목</Label>
        <Input
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">내용</Label>
        <Textarea
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          className="min-h-[100px]"
        />
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">색상</Label>
        <Select
          value={formData.color}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, color: value }))
          }
          aria-labelledby="color-select"
        >
          <SelectTrigger>
            <SelectValue placeholder="색상 선택" />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {colorOptions.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: color.value }}
                  />
                  {color.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">시작일</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDateObj ? (
                formatDisplayDate(startDateObj)
              ) : (
                <span>날짜를 선택하세요</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
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
                    return weekdays[
                      date.getDay() === 0 ? 6 : date.getDay() - 1
                    ];
                  },
                }}
                selected={startDateObj}
                onSelect={(date) => {
                  handleDateChange("startDate", date);
                  return false;
                }}
                initialFocus
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">종료일</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDateObj ? (
                formatDisplayDate(endDateObj)
              ) : (
                <span>날짜를 선택하세요</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDateObj}
              onSelect={(date) => handleDateChange("endDate", date)}
              disabled={(date) => date < (startDateObj || new Date())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">담당 그룹</Label>
        <Select
          value={formData.hostGroup}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, hostGroup: value }))
          }
          aria-labelledby="main-group-select"
        >
          <SelectTrigger>
            <SelectValue placeholder="담당 그룹 선택" />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {groupOptions.map((group) => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <Label className="mb-2 block">관련 그룹</Label>
        <div className="border rounded-md p-2">
          <div className="grid grid-flow-col grid-rows-4 auto-cols-fr gap-x-6 gap-y-2 max-w-[900px]">
            {groupOptions.map((group) => (
              <div key={group} className="flex items-center space-x-2">
                <Checkbox
                  id={`group-${group}`}
                  checked={formData.relativeGroup.includes(group)}
                  onCheckedChange={() => handleRelativeGroupToggle(group)}
                />
                <label
                  htmlFor={`group-${group}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {group}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-6">
        <Button
          onClick={handleSubmit}
          className="flex-1"
          disabled={!isFormValid}
        >
          저장
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          취소
        </Button>
      </div>
    </div>
  );
};
