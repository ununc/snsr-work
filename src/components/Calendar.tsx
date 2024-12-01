import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// 한국 공휴일 데이터
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

  // 2025년 공휴일
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
  { year: 2025, month: 10, day: 9, name: "한글날" },
  { year: 2025, month: 12, day: 25, name: "크리스마스" },
];

interface CalendarProps {
  events: CalendarEvent[];
  year: number;
  month: number;
  onCreateEvent?: (event: Omit<CalendarEvent, "id">) => void;
}

const COLORS = [
  "bg-blue-100 hover:bg-blue-200",
  "bg-green-100 hover:bg-green-200",
  "bg-purple-100 hover:bg-purple-200",
  "bg-orange-100 hover:bg-orange-200",
  "bg-pink-100 hover:bg-pink-200",
];

const GROUP_OPTIONS = [1, 2, 3, 4, 5];

export const Calendar = ({
  events,
  year,
  month,
  onCreateEvent,
}: CalendarProps) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, "id">>({
    year,
    month,
    day: 1,
    period: 1,
    title: "",
    content: "",
    target_group: 1,
    write_group: 1,
    writer: "",
  });

  const init = () => {
    return {
      year,
      month,
      day: 1,
      period: 1,
      title: "",
      content: "",
      target_group: 1,
      write_group: 1,
      writer: "",
    };
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setNewEvent({
      ...init(),
      day,
    });
    setShowCreateDialog(true);
  };

  const handleCreateSubmit = () => {
    onCreateEvent?.(newEvent);
    setShowCreateDialog(false);
    setSelectedDay(null);
  };

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
    return events.filter(
      (event) =>
        event.year === year &&
        event.month === month &&
        day >= event.day &&
        day < event.day + event.period
    );
  };

  const getWeeksInMonth = (year: number, month: number) => {
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInMonth = getDaysInMonth(year, month);
    return Math.ceil((firstDay + daysInMonth) / 7);
  };

  const renderCalendar = () => {
    const days = [];
    let currentWeek = [];

    const calculateEventPositions = (dayEvents: CalendarEvent[]) => {
      const positions = new Map<number, number>();
      const occupied = new Set<number>();

      dayEvents.forEach((event) => {
        let height = 0;
        while (occupied.has(height)) {
          height += 1.5;
        }
        positions.set(event.id, height);
        occupied.add(height);
      });

      return positions;
    };

    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(
        <div key={`empty-${i}`} className="h-full min-h-24 p-1" />
      );
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayEvents = getEventsForDay(i);
      const holidays = getHolidaysForDay(i);
      const positions = calculateEventPositions(dayEvents);
      const dayIndex = (i + firstDay - 1) % 7;
      const isWeekend = dayIndex === 0 || dayIndex === 6;
      const isHoliday = holidays.length > 0;

      const dateColor = isWeekend || isHoliday ? "text-red-600" : "";

      currentWeek.push(
        <div
          key={i}
          className="h-full min-h-24 relative cursor-pointer"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const isEventClick = target.closest("button");
            if (!isEventClick) {
              handleDayClick(i);
            }
          }}
        >
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
          <div
            className="relative"
            style={{
              height: `${
                Math.max(...Array.from(positions.values()), -1) + 1
              }rem`,
            }}
          >
            {dayEvents.map((event: CalendarEvent) => {
              const isFirstDay = i === event.day;
              const isFirstDayOfWeek = (i + firstDay - 1) % 7 === 0;
              const colorIndex = eventGroups[`${event.day}-${event.period}`];

              return (
                <div
                  key={`${event.id}-${i}`}
                  className="absolute left-0 right-0"
                  style={{
                    top: `${positions.get(event.id)}rem`,
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
              className="h-full min-h-24 p-1"
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
  return (
    <div className="h-full">
      <div
        className={`divide-y h-full grid grid-rows-[repeat(${weeksInMonth},1fr)]`}
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
                  <p>기간: {selectedEvent.period}일</p>
                  <p>담당 그룹: {selectedEvent.target_group}</p>
                  <p>작성 그룹: {selectedEvent.write_group}</p>
                  <p>작성자: {selectedEvent.writer}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              일정 생성 {year} - {month} - {selectedDay}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={newEvent.content}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, content: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="period">기간 (일)</Label>
              <Input
                id="period"
                type="number"
                min="1"
                value={newEvent.period}
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    period: parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="target-group">담당 그룹</Label>
              <Select
                value={String(newEvent.target_group)}
                onValueChange={(value) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    target_group: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_OPTIONS.map((group) => (
                    <SelectItem key={group} value={String(group)}>
                      그룹 {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="write-group">작성 그룹</Label>
              <Select
                value={String(newEvent.write_group)}
                onValueChange={(value) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    write_group: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_OPTIONS.map((group) => (
                    <SelectItem key={group} value={String(group)}>
                      그룹 {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="writer">작성자</Label>
              <Input
                id="writer"
                value={newEvent.writer}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, writer: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateSubmit}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
