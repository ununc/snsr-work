import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "@/components/Calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEvents } from "@/apis/calendar/calendar";

type Event = {
  id: number;
  year: number;
  month: number;
  day: number;
  period: number;
  title: string;
  content: string;
  target_group: number;
  write_group: number;
  writer: string;
};

export const CalendarPage = () => {
  const currentDate = new Date();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const touchStartY = useRef<number | null>(null);

  const minYear = currentYear - 1;
  const maxYear = currentYear + 1;
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartY.current) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    // 50px 이상의 스와이프만 처리
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // 위로 스와이프: 다음 달
        if (month === 12) {
          // 다음 연도가 최대 연도를 넘지 않을 때만 변경
          if (year < maxYear) {
            setYear(year + 1);
            setMonth(1);
          }
        } else {
          setMonth(month + 1);
        }
      } else {
        // 아래로 스와이프: 이전 달
        if (month === 1) {
          // 이전 연도가 최소 연도보다 크거나 같을 때만 변경
          if (year > minYear) {
            setYear(year - 1);
            setMonth(12);
          }
        } else {
          setMonth(month - 1);
        }
      }
    }
    touchStartY.current = null;
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const getEvent = async () => {
      try {
        const response = await getEvents({ year, month });
        setEvents(response);
      } catch {
        setEvents([]);
      }
    };
    getEvent();
  }, [year, month]);

  return (
    <div className="page-wrapper">
      <div className="h-9 flex items-center">
        <Label className="text-xl font-bold">대학 청년부 일정</Label>
      </div>
      <div className="flex gap-4 mb-4 mt-2">
        <div className="flex items-center gap-2">
          <Label>연도:</Label>
          <Select
            value={year.toString()}
            onValueChange={(value) => setYear(Number(value))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label>월:</Label>
          <Select
            value={month.toString()}
            onValueChange={(value) => setMonth(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {m}월
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className="page-body"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Calendar year={year} month={month} events={events} />
      </div>
    </div>
  );
};
