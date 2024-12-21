import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
interface CalendarEvent {
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
}

interface Holiday {
  year: number;
  month: number;
  day: number;
  name: string;
}

const KOREAN_HOLIDAYS: Holiday[] = [
  { year: 2024, month: 1, day: 1, name: "신정" },
  { year: 2024, month: 2, day: 9, name: "설날 연휴" },
  { year: 2024, month: 2, day: 10, name: "설날" },
  { year: 2024, month: 2, day: 11, name: "설날 연휴" },
  { year: 2024, month: 2, day: 12, name: "대체공휴일" },
  { year: 2024, month: 3, day: 1, name: "삼일절" },
  { year: 2024, month: 5, day: 5, name: "어린이날" },
  { year: 2024, month: 5, day: 6, name: "대체공휴일" },
  { year: 2024, month: 5, day: 15, name: "석가탄신일" },
  { year: 2024, month: 6, day: 6, name: "현충일" },
  { year: 2024, month: 8, day: 15, name: "광복절" },
  { year: 2024, month: 9, day: 16, name: "추석 연휴" },
  { year: 2024, month: 9, day: 17, name: "추석" },
  { year: 2024, month: 9, day: 18, name: "추석 연휴" },
  { year: 2024, month: 10, day: 3, name: "개천절" },
  { year: 2024, month: 10, day: 9, name: "한글날" },
  { year: 2024, month: 12, day: 25, name: "크리스마스" },

  { year: 2025, month: 1, day: 1, name: "신정" },
  { year: 2025, month: 1, day: 28, name: "설날 연휴" },
  { year: 2025, month: 1, day: 29, name: "설날" },
  { year: 2025, month: 1, day: 30, name: "설날 연휴" },
  { year: 2025, month: 3, day: 1, name: "삼일절" },
  { year: 2025, month: 3, day: 3, name: "대체공휴일" },
  { year: 2025, month: 5, day: 5, name: "어린이날" },
  { year: 2025, month: 5, day: 6, name: "석가탄신일" },
  { year: 2025, month: 6, day: 6, name: "현충일" },
  { year: 2025, month: 8, day: 15, name: "광복절" },
  { year: 2025, month: 10, day: 3, name: "개천절" },
  { year: 2025, month: 10, day: 5, name: "추석 연휴" },
  { year: 2025, month: 10, day: 6, name: "추석" },
  { year: 2025, month: 10, day: 7, name: "추석 연휴" },
  { year: 2025, month: 10, day: 8, name: "추석(대체공휴일)" },
  { year: 2025, month: 10, day: 9, name: "한글날" },
  { year: 2025, month: 12, day: 25, name: "크리스마스" },

  { year: 2026, month: 1, day: 1, name: "신정(양력설)" },
  { year: 2026, month: 2, day: 16, name: "설날 연휴" },
  { year: 2026, month: 2, day: 17, name: "설날" },
  { year: 2026, month: 2, day: 18, name: "설날 연휴" },
  { year: 2026, month: 3, day: 1, name: "3·1절" },
  { year: 2026, month: 3, day: 2, name: "대체공휴일(3·1절)" },
  { year: 2026, month: 5, day: 5, name: "어린이날" },
  { year: 2026, month: 5, day: 24, name: "부처님 오신날" },
  { year: 2026, month: 5, day: 25, name: "대체공휴일(부처님 오신날)" },
  { year: 2026, month: 6, day: 6, name: "현충일" },
  { year: 2026, month: 8, day: 15, name: "광복절" },
  { year: 2026, month: 8, day: 17, name: "대체공휴일(광복절)" },
  { year: 2026, month: 9, day: 24, name: "추석 연휴" },
  { year: 2026, month: 9, day: 25, name: "추석" },
  { year: 2026, month: 9, day: 26, name: "추석 연휴" },
  { year: 2026, month: 10, day: 3, name: "개천절" },
  { year: 2026, month: 10, day: 5, name: "대체공휴일(개천절)" },
  { year: 2026, month: 10, day: 9, name: "한글날" },
  { year: 2026, month: 12, day: 25, name: "크리스마스" },

  { year: 2027, month: 1, day: 1, name: "신정(양력설)" },
  { year: 2027, month: 2, day: 6, name: "설날 연휴" },
  { year: 2027, month: 2, day: 7, name: "설날" },
  { year: 2027, month: 2, day: 8, name: "설날 연휴" },
  { year: 2027, month: 2, day: 9, name: "대체공휴일(설날)" },
  { year: 2027, month: 3, day: 1, name: "3·1절" },
  { year: 2027, month: 3, day: 3, name: "21대 대통령선거" },
  { year: 2027, month: 5, day: 5, name: "어린이날" },
  { year: 2027, month: 5, day: 13, name: "부처님 오신날" },
  { year: 2027, month: 6, day: 6, name: "현충일" },
  { year: 2027, month: 8, day: 15, name: "광복절" },
  { year: 2027, month: 8, day: 16, name: "대체공휴일(광복절)" },
  { year: 2027, month: 9, day: 14, name: "추석 연휴" },
  { year: 2027, month: 9, day: 15, name: "추석" },
  { year: 2027, month: 9, day: 16, name: "추석 연휴" },
  { year: 2027, month: 10, day: 3, name: "개천절" },
  { year: 2027, month: 10, day: 4, name: "대체공휴일(개천절)" },
  { year: 2027, month: 10, day: 9, name: "한글날" },
  { year: 2027, month: 10, day: 11, name: "대체공휴일(한글날)" },
  { year: 2027, month: 12, day: 25, name: "크리스마스" },
  { year: 2027, month: 12, day: 27, name: "대체공휴일(크리스마스)" },

  { year: 2028, month: 1, day: 1, name: "신정(양력설)" },
  { year: 2028, month: 1, day: 26, name: "설날 연휴" },
  { year: 2028, month: 1, day: 27, name: "설날" },
  { year: 2028, month: 1, day: 28, name: "설날 연휴" },
  { year: 2028, month: 3, day: 1, name: "3·1절" },
  { year: 2028, month: 4, day: 12, name: "23대 국회의원 선거" },
  { year: 2028, month: 5, day: 2, name: "부처님 오신날" },
  { year: 2028, month: 5, day: 5, name: "어린이날" },
  { year: 2028, month: 6, day: 6, name: "현충일" },
  { year: 2028, month: 8, day: 15, name: "광복절" },
  { year: 2028, month: 10, day: 2, name: "추석 연휴" },
  { year: 2028, month: 10, day: 3, name: "개천절" },
  { year: 2028, month: 10, day: 3, name: "추석" },
  { year: 2028, month: 10, day: 4, name: "추석 연휴" },
  { year: 2028, month: 10, day: 5, name: "대체공휴일(개천절)" },
  { year: 2028, month: 10, day: 9, name: "한글날" },
  { year: 2028, month: 12, day: 25, name: "크리스마스" },
];

interface CalendarProps {
  events: CalendarEvent[];
  year: number;
  month: number;
}

const COLORS = [
  "bg-blue-100 hover:bg-blue-200",
  "bg-green-100 hover:bg-green-200",
  "bg-purple-100 hover:bg-purple-200",
  "bg-orange-100 hover:bg-orange-200",
  "bg-pink-100 hover:bg-pink-200",
];

export const Calendar = ({ events, year, month }: CalendarProps) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const getHolidaysForDay = (day: number) => {
    return KOREAN_HOLIDAYS.filter(
      (holiday) =>
        holiday.year === year && holiday.month === month && holiday.day === day
    );
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const eventGroups = events.reduce(
    (groups: { [key: string]: number }, event) => {
      const key = `${event.day}-${event.period}`;
      if (!(key in groups)) {
        groups[key] = Object.keys(groups).length % COLORS.length;
      }
      return groups;
    },
    {}
  );

  const getEventsForDay = (day: number) => {
    return events
      .filter(
        (event) =>
          event.year === year &&
          event.month === month &&
          day >= event.day &&
          day < event.day + event.period
      )
      .sort((a, b) => a.day - b.day || a.id - b.id);
  };

  const getWeeksInMonth = (year: number, month: number) => {
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInMonth = getDaysInMonth(year, month);
    return Math.ceil((firstDay + daysInMonth) / 7);
  };

  // 이벤트의 라인 위치를 계산하는 함수
  const calculateEventLines = () => {
    const eventLines = new Map<number, number>();
    const timeSlots: { [day: number]: boolean[] } = {};

    // 모든 날짜에 대해 사용 가능한 라인 배열 초기화
    for (let i = 1; i <= daysInMonth; i++) {
      timeSlots[i] = [];
    }

    // 이벤트를 시작일 순으로 정렬
    const sortedEvents = [...events]
      .filter((event) => event.year === year && event.month === month)
      .sort((a, b) => a.day - b.day || a.id - b.id);

    sortedEvents.forEach((event) => {
      // 이벤트가 차지하는 모든 날짜에서 사용 가능한 가장 낮은 라인 찾기
      let lineIndex = 0;
      let foundLine = false;

      while (!foundLine) {
        foundLine = true;
        // 이벤트 기간 동안 해당 라인이 사용 가능한지 확인
        for (let day = event.day; day < event.day + event.period; day++) {
          if (!timeSlots[day]) continue;
          if (timeSlots[day][lineIndex]) {
            foundLine = false;
            break;
          }
        }
        if (!foundLine) {
          lineIndex++;
        }
      }

      // 찾은 라인에 이벤트 배치
      for (let day = event.day; day < event.day + event.period; day++) {
        if (!timeSlots[day]) continue;
        timeSlots[day][lineIndex] = true;
      }
      eventLines.set(event.id, lineIndex);
    });

    return eventLines;
  };

  const renderCalendar = () => {
    const days = [];
    let currentWeek = [];
    const eventLines = calculateEventLines();

    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(
        <div key={`empty-${i}`} className="h-full min-h-20 p-1" />
      );
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayEvents = getEventsForDay(i);
      const holidays = getHolidaysForDay(i);
      const dayIndex = (i + firstDay - 1) % 7;
      const isWeekend = dayIndex === 0 || dayIndex === 6;
      const isHoliday = holidays.length > 0;

      const dateColor = isWeekend || isHoliday ? "text-red-600" : "";

      currentWeek.push(
        <div key={i} className="h-full min-h-16 relative cursor-pointer">
          <div className="px-1">
            <div className={`text-sm ${dateColor}`}>{i}</div>
            {holidays.map((holiday) => (
              <div
                key={`holiday-${holiday.name}`}
                className="text-[10px] font-medium"
              >
                {holiday.name}
              </div>
            ))}
          </div>
          <div className="relative">
            {dayEvents.map((event: CalendarEvent) => {
              const isFirstDay = i === event.day;
              const isFirstDayOfWeek = (i + firstDay - 1) % 7 === 0;
              const colorIndex = eventGroups[`${event.day}-${event.period}`];
              const lineHeight = eventLines.get(event.id) || 0;

              return (
                <div
                  key={`${event.id}-${i}`}
                  className="absolute left-0 right-0"
                  style={{
                    top: `${lineHeight * 1.5}rem`,
                    height: "1.5rem",
                  }}
                >
                  <button
                    className={`
                      absolute inset-0 text-left mb-1
                      ${COLORS[colorIndex]}
                      ${!isFirstDay && "pl-0"}
                    `}
                    onClick={() => setSelectedEvent(event)}
                  >
                    {(isFirstDay || isFirstDayOfWeek) && (
                      <div className="pl-0.5 text-[10px] font-medium whitespace-nowrap overflow-hidden">
                        {event.title}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );

      if ((i + firstDay) % 7 === 0 || i === daysInMonth) {
        while (currentWeek.length < 7) {
          currentWeek.push(
            <div
              key={`empty-end-${currentWeek.length}`}
              className="h-full min-h-16 p-1"
            />
          );
        }

        days.push(
          <div key={i} className="grid grid-cols-7 divide-x h-full">
            {currentWeek}
          </div>
        );
        currentWeek = [];
      }
    }

    return days;
  };

  const weeksInMonth = getWeeksInMonth(year, month);

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(
      2,
      "0"
    )}`;
  };

  const getDateRange = (event: CalendarEvent) => {
    const startDate = formatDate(event.year, event.month, event.day);
    const endDate = formatDate(
      event.year,
      event.month,
      event.day + event.period - 1
    );
    return event.period > 1 ? `${startDate} ~ ${endDate}` : startDate;
  };
  return (
    <div>
      <div
        className={`divide-y h-[calc(100dvh-13rem)] grid grid-rows-[repeat(${weeksInMonth},1fr)]`}
      >
        {renderCalendar()}
      </div>

      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent>
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-2">
                <p className="whitespace-pre-wrap">{selectedEvent.content}</p>
                <div className="text-sm text-gray-600">
                  <p>기간: {getDateRange(selectedEvent)}</p>
                  <p>담당: {selectedEvent.target_group}</p>
                  <p>요청: {selectedEvent.write_group}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
