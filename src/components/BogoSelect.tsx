import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const BogoSelect = ({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [currentPageStart, setCurrentPageStart] = useState<Date>(() => {
    const startDate = new Date(selectedDate);
    startDate.setDate(selectedDate.getDate() - 14); // 선택된 날짜 기준 2주 전부터 시작
    return startDate;
  });

  // 날짜를 YYYY년 MM월 DD일 형식으로 포맷팅
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}년 ${month}월 ${day}일`;
  };

  // 현재 페이지의 5개 일요일 날짜를 가져오기
  const getCurrentPageDates = (): Date[] => {
    const dates: Date[] = [];
    const currentDate = new Date(currentPageStart);

    for (let i = 0; i < 5; i++) {
      while (currentDate.getDay() !== 0) {
        // 다음 일요일을 찾음
        currentDate.setDate(currentDate.getDate() + 1);
      }
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // 이전/다음 페이지로 이동
  const movePage = (direction: "prev" | "next") => {
    const newStart = new Date(currentPageStart);
    if (direction === "prev") {
      newStart.setDate(newStart.getDate() - 28); // 4주 전으로
    } else {
      newStart.setDate(newStart.getDate() + 28); // 4주 후로
    }
    setCurrentPageStart(newStart);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-40">
          {formatDate(selectedDate)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0">
        <div className="flex flex-col">
          <Button
            variant="ghost"
            className="w-full justify-center py-1"
            onClick={() => movePage("prev")}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>

          <div className="py-1">
            {getCurrentPageDates().map((date) => (
              <Button
                key={date.toISOString()}
                variant={
                  selectedDate.toDateString() === date.toDateString()
                    ? "secondary"
                    : "ghost"
                }
                className="w-full justify-center py-2 my-0.5"
                onClick={() => {
                  setSelectedDate(date);
                  setIsOpen(false);
                }}
              >
                {formatDate(date)}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            className="w-full justify-center py-1"
            onClick={() => movePage("next")}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
