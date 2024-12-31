import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MonthSelectorProps {
  width?: string;
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
}

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "날짜 선택";

  const [year, month] = dateStr.split("-");
  return `${year}년 ${month}월`;
};

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedDate,
  setSelectedDate,
  width = "w-40",
}) => {
  const [dates, setDates] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const generateDates = (baseDate: Date): string[] => {
    const result: string[] = [];
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() - 2); // Start from 2 months before

    for (let i = 0; i < 5; i++) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      result.push(`${year}-${month}`);
      date.setMonth(date.getMonth() + 1);
    }
    return result;
  };

  useEffect(() => {
    const now = new Date();
    const dates = generateDates(now);
    setDates(dates);

    if (!selectedDate) {
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      setSelectedDate(`${year}-${month}`);
    }
  }, [selectedDate, setSelectedDate]);

  const movePage = (direction: "prev" | "next"): void => {
    const baseDate = new Date();
    const [year, month] = dates[2].split("-").map((num) => parseInt(num));
    baseDate.setFullYear(year);
    baseDate.setMonth(month - 1);

    if (direction === "prev") {
      baseDate.setMonth(baseDate.getMonth() - 5);
    } else {
      baseDate.setMonth(baseDate.getMonth() + 5);
    }

    setDates(generateDates(baseDate));
  };

  const handleSelect = (date: string) => {
    setSelectedDate(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={width}>
          {formatDate(selectedDate)}
        </Button>
      </PopoverTrigger>

      <PopoverContent className={width + " p-0"} align="start">
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            className="w-full justify-center py-1 rounded-none"
            onClick={() => movePage("prev")}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>

          <div className="w-full">
            {dates.map((date, index) => (
              <Button
                key={`${date}${index}`}
                variant={selectedDate === date ? "default" : "ghost"}
                className="w-full justify-center py-2 my-1 rounded-none"
                onClick={() => handleSelect(date)}
              >
                {formatDate(date)}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            className="w-full justify-center py-1 rounded-none"
            onClick={() => movePage("next")}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
