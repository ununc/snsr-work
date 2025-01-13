import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface YearMonthDayProps {
  changeDate: (value: Date) => void;
  initDate?: Date | null;
}

export const YearMonthLoadDay: React.FC<YearMonthDayProps> = ({
  changeDate,
  initDate,
}) => {
  const getInitialDate = (): Date => {
    if (initDate) return initDate;

    const today = new Date();
    const dayOfWeek = today.getDay();

    // 오늘이 일요일이면 오늘, 아니면 다음 일요일
    if (dayOfWeek === 0) return today;

    const daysUntilNextSunday = 7 - dayOfWeek;
    return new Date(
      today.getTime() + daysUntilNextSunday * 24 * 60 * 60 * 1000
    );
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [baseDate, setBaseDate] = useState(selectedDate);
  const [open, setOpen] = useState(false);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}년 ${month}월 ${day}일`;
  };

  // 해당 월의 모든 일요일 구하기
  const getSundaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const sundays: Date[] = [];
    let current = new Date(firstDay);

    // 첫 번째 일요일 찾기
    while (current.getDay() !== 0) {
      current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
    }

    // 월의 모든 일요일 수집
    while (current <= lastDay) {
      sundays.push(new Date(current));
      current = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return sundays;
  };

  const generateVisibleDates = () => {
    return getSundaysInMonth(baseDate);
  };

  const clickBefore = () => {
    setBaseDate((curr) => new Date(curr.getFullYear(), curr.getMonth() - 1));
  };

  const clickAfter = () => {
    setBaseDate((curr) => new Date(curr.getFullYear(), curr.getMonth() + 1));
  };

  const clickDate = (date: Date) => {
    setSelectedDate(date);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {
      setBaseDate(selectedDate);
    }
  }, [open, selectedDate]);

  useEffect(() => {
    changeDate(selectedDate);
  }, [selectedDate, changeDate]);

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
                  selectedDate.getDate() === date.getDate() &&
                  selectedDate.getMonth() === date.getMonth()
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
