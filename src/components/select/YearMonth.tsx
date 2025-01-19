import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface MonthPickerProps {
  changeYearMonth: (value: Date) => void;
  initDate?: Date;
}

export const YearMonth: React.FC<MonthPickerProps> = ({
  changeYearMonth,
  initDate,
}) => {
  const currentDate = new Date();
  // 초기 날짜 설정 로직 수정
  const [selectedDate, setSelectedDate] = useState(initDate || currentDate);
  const [baseDate, setBaseDate] = useState(initDate || currentDate);
  const [open, setOpen] = useState(false);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}년 ${month}월`;
  };

  const generateVisibleDates = () => {
    const dates: Date[] = [];
    for (let i = -2; i <= 2; i++) {
      const newDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i);
      dates.push(newDate);
    }
    return dates;
  };

  const clickBefore = () => {
    setBaseDate((curr) => new Date(curr.getFullYear(), curr.getMonth() - 5));
  };

  const clickAfter = () => {
    setBaseDate((curr) => new Date(curr.getFullYear(), curr.getMonth() + 5));
  };

  const clickDate = (date: Date) => {
    setSelectedDate(date);
    setOpen(false);
  };
  useEffect(() => {
    if (initDate) {
      setSelectedDate(initDate);
      setBaseDate(initDate);
    }
  }, [initDate]);

  useEffect(() => {
    if (!open) {
      setBaseDate(selectedDate);
    }
  }, [open, selectedDate]);

  useEffect(() => {
    changeYearMonth(selectedDate);
  }, [selectedDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-40">
          {formatDate(selectedDate)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0">
        <div className="w-full">
          <Button
            variant="ghost"
            onClick={clickBefore}
            className="w-full justify-center py-1"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>

          <div className="py-1">
            {generateVisibleDates().map((date) => (
              <Button
                key={date.valueOf()}
                variant={
                  `${selectedDate.getFullYear()}-${selectedDate.getMonth()}` ===
                  `${date.getFullYear()}-${date.getMonth()}`
                    ? "secondary"
                    : "ghost"
                }
                className="w-full justify-center py-2 my-0.5"
                onClick={() => clickDate(date)}
              >
                {formatDate(date)}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            onClick={clickAfter}
            className="w-full justify-center py-1"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
