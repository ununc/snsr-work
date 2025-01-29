import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DateSelection {
  month: number | null;
  day: number | null;
}

interface MonthDayPickerProps {
  onChange?: (selection: DateSelection) => void;
  defaultValue?: DateSelection;
  className?: string;
}

export const MonthDayPicker: React.FC<MonthDayPickerProps> = ({
  onChange,
  defaultValue = { month: null, day: null },
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    defaultValue.month
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(
    defaultValue.day
  );
  const [showDays, setShowDays] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const months: number[] = Array.from({ length: 12 }, (_, i) => i + 1);

  const getDaysInMonth = (month: number): number => {
    return new Date(2024, month, 0).getDate();
  };

  const handleMonthSelect = (month: number): void => {
    setSelectedMonth(month);
    setShowDays(true);
    setSelectedDay(null);

    onChange?.({ month, day: null });
  };

  const handleDaySelect = (day: number): void => {
    setSelectedDay(day);
    setIsOpen(false);
    setShowDays(false);

    if (selectedMonth) {
      onChange?.({ month: selectedMonth, day });
    }
  };

  const handleBack = (): void => {
    setShowDays(false);
    setSelectedDay(null);
  };

  const handleOpenChange = (open: boolean): void => {
    setIsOpen(open);
    if (!open) {
      setShowDays(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full text-center">
          {selectedMonth && selectedDay
            ? `${selectedMonth}월 ${selectedDay}일`
            : "날짜 선택"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2">
        {!showDays ? (
          // 월 선택 화면
          <div>
            <h3 className="font-medium mb-2 text-center">월</h3>
            <div className="grid grid-cols-3 gap-2">
              {months.map((month) => (
                <Button
                  key={month}
                  variant={selectedMonth === month ? "default" : "outline"}
                  className="h-10"
                  onClick={() => handleMonthSelect(month)}
                >
                  {month}월
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // 일 선택 화면
          <div>
            <div className="flex items-center mb-2">
              <Button
                variant="ghost"
                className="mr-2 h-5 w-5 p-0"
                onClick={handleBack}
              >
                ←
              </Button>
              <h3 className="font-medium text-center flex-1 mr-7">
                {selectedMonth}월
              </h3>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from(
                { length: getDaysInMonth(selectedMonth || 1) },
                (_, i) => i + 1
              ).map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  className="h-8"
                  onClick={() => handleDaySelect(day)}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
