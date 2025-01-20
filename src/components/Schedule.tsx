import { ScheduleEvent } from "@/apis/calendar/calendar";
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { EventEditForm } from "./page/ScheduleForm";

interface ScheduleProps {
  events: ScheduleEvent[];
  currentDate: string; // YYYY-MM 형식
  onMonthChange: (newDate: string) => void;
  canWrite: boolean;
  setCreateHandler?: (handler: () => void) => void;
  requestSchedule: (state: boolean, schedule: ScheduleEvent) => Promise<void>;
}

interface ProcessedEvent extends ScheduleEvent {
  startDay: number;
  period: number;
  row?: number;
  isTransparent?: boolean;
}

const initVal = {
  id: "",
  title: "",
  content: "",
  startDate: "",
  endDate: "",
  hostGroup: "",
  relativeGroup: [],
  color: "",
};

export const Schedule: React.FC<ScheduleProps> = ({
  events,
  currentDate,
  onMonthChange,
  canWrite,
  setCreateHandler,
  requestSchedule,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(
    null
  );
  const touchStartRef = useRef<number | null>(null);
  const [year, month] = currentDate.split("-").map(Number);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const [newEvent, setNewEvent] = useState<ScheduleEvent | null>(null);

  const handleCreate = () => {
    setNewEvent(initVal);
    setIsDrawerOpen(true);
  };

  const handleEdit = () => {
    if (selectedEvent) {
      setNewEvent(selectedEvent);
    }
  };

  const handleRequestEvent = async (event: ScheduleEvent) => {
    let state = true;
    if (selectedEvent) {
      state = false;
    }
    await requestSchedule(state, event);
    handleDrawerClose();
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedEvent(null);
      setNewEvent(null);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDrawerOpen) return;
    touchStartRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDrawerOpen) return;
    if (touchStartRef.current === null) return;

    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStartRef.current - touchEnd;

    if (Math.abs(diff) > 50) {
      changeMonth(diff > 0 ? 1 : -1);
    }

    touchStartRef.current = null;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const changeMonth = useCallback(
    (increment: number) => {
      let newMonth = month + increment;
      let newYear = year;

      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }

      onMonthChange(`${newYear}-${String(newMonth).padStart(2, "0")}`);
    },
    [year, month, onMonthChange]
  );

  const processEvents = (events: ScheduleEvent[]) => {
    // 1. 기본 이벤트 처리
    const processed = events
      .map((event) => {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        const currentMonthStart = new Date(year, month - 1, 1);
        const currentMonthEnd = new Date(year, month, 0, 23, 59, 59);

        // 날짜 비교를 위해 시간을 통일
        const normalizedStart = new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate()
        );
        const normalizedEnd = new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate()
        );
        const normalizedMonthStart = new Date(
          currentMonthStart.getFullYear(),
          currentMonthStart.getMonth(),
          currentMonthStart.getDate()
        );
        const normalizedMonthEnd = new Date(
          currentMonthEnd.getFullYear(),
          currentMonthEnd.getMonth(),
          currentMonthEnd.getDate()
        );

        if (
          normalizedEnd < normalizedMonthStart ||
          normalizedStart > normalizedMonthEnd
        ) {
          return null;
        }

        const displayStart =
          start < currentMonthStart ? currentMonthStart : start;
        const displayEnd =
          end > currentMonthEnd ? new Date(year, month, 0, 23, 59, 59) : end;

        const startDay = displayStart.getDate();
        const dayDiff =
          Math.floor(
            (displayEnd.getTime() - displayStart.getTime()) / (1000 * 3600 * 24)
          ) + 1;

        return {
          ...event,
          startDay,
          period: dayDiff,
        };
      })
      .filter((event): event is ProcessedEvent => event !== null);

    // 2. TR 이벤트가 있는 날짜 찾기
    const trDays = new Set<number>();
    processed.forEach((event) => {
      if (event.color === "tr") {
        for (
          let day = event.startDay;
          day < event.startDay + event.period;
          day++
        ) {
          trDays.add(day);
        }
      }
    });

    // 3. 영향받는 날짜 범위 찾기
    const affectedDays = new Set<number>();
    processed.forEach((event) => {
      let needsShift = false;
      for (
        let day = event.startDay;
        day < event.startDay + event.period;
        day++
      ) {
        if (trDays.has(day)) {
          needsShift = true;
          break;
        }
      }
      if (needsShift) {
        for (
          let day = event.startDay;
          day < event.startDay + event.period;
          day++
        ) {
          affectedDays.add(day);
        }
      }
    });

    // 4. 투명 이벤트 추가
    const transparentEvents: ProcessedEvent[] = [];
    affectedDays.forEach((day) => {
      if (!trDays.has(day)) {
        transparentEvents.push({
          id: `transparent-${day}`,
          title: "",
          content: "",
          startDate: new Date(year, month - 1, day).toISOString(),
          endDate: new Date(year, month - 1, day).toISOString(),
          color: "transparent",
          hostGroup: "",
          relativeGroup: [],
          startDay: day,
          period: 1,
          isTransparent: true,
        });
      }
    });

    // 5. 모든 이벤트 병합 및 row 할당
    const allEvents = [...processed, ...transparentEvents];
    const eventRows = new Map<number, string>();
    const eventToRow = new Map<string, number>();

    // 이벤트를 시작일과 기간으로 정렬
    allEvents.sort((a, b) => {
      if (a.startDay === b.startDay) {
        return b.period - a.period;
      }
      return a.startDay - b.startDay;
    });

    // Row 할당
    allEvents.forEach((event) => {
      if (event.isTransparent) {
        for (
          let day = event.startDay;
          day < event.startDay + event.period;
          day++
        ) {
          eventRows.set(day * 100 + 0, event.id as string);
        }
        eventToRow.set(event.id as string, 0);
        return;
      }

      let startRow = event.color === "tr" ? 0 : 1;
      while (true) {
        let canUseRow = true;
        for (
          let day = event.startDay;
          day < event.startDay + event.period;
          day++
        ) {
          if (eventRows.has(day * 100 + startRow)) {
            canUseRow = false;
            break;
          }
        }

        if (canUseRow) {
          for (
            let day = event.startDay;
            day < event.startDay + event.period;
            day++
          ) {
            eventRows.set(day * 100 + startRow, event.id as string);
          }
          eventToRow.set(event.id as string, startRow);
          break;
        }
        startRow++;
      }
    });

    // 6. 최종 정렬
    return {
      events: allEvents.sort((a, b) => {
        const rowA = eventToRow.get(a.id as string) ?? 0;
        const rowB = eventToRow.get(b.id as string) ?? 0;
        if (rowA === rowB) {
          return a.startDay - b.startDay;
        }
        return rowA - rowB;
      }),
      trDays, // TR 이벤트가 있는 날짜 Set도 함께 반환
    };
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const { events: processedEvents, trDays } = processEvents(events);
    const totalWeeks = Math.ceil((daysInMonth + firstDay) / 7);

    const getEventsForDay = (day: number) => {
      return processedEvents.filter((event) => {
        return day >= event.startDay && day < event.startDay + event.period;
      });
    };

    const weeks = [];
    let days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      const isFirstWeek = weeks.length === 0;
      const isLastColumn = (i + 1) % 7 === 0;

      days.push(
        <div
          key={`empty-${i}`}
          className={`h-full ${!isFirstWeek ? "border-t" : ""} ${
            !isLastColumn ? "border-r" : ""
          }`}
        />
      );
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const dayOfWeek = (firstDay + day - 1) % 7;
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      const isFirstWeek = weeks.length === 0;
      const isLastColumn = dayOfWeek === 6;
      const hasTR = trDays.has(day);

      days.push(
        <div
          key={day}
          className={`relative h-full ${!isFirstWeek ? "border-t" : ""} ${
            !isLastColumn ? "border-r" : ""
          }`}
        >
          <div
            className={`p-1 ${
              isSunday || hasTR
                ? "text-red-600"
                : isSaturday
                ? "text-blue-600"
                : ""
            }`}
          >
            {day}
          </div>
          <div className="absolute inset-0 pt-7 pb-1">
            <div className="relative h-full overflow-y-auto">
              <div className="absolute w-full">
                {dayEvents.map((event) => {
                  if (event.isTransparent) {
                    return (
                      <div
                        key={`${event.id}-${day}`}
                        className="relative w-full mb-1"
                        style={{ height: "20px" }}
                      >
                        <div
                          className="h-full"
                          style={{ backgroundColor: "transparent" }}
                        />
                      </div>
                    );
                  }

                  const isFirstDay = day === event.startDay;
                  const isLastDay = day === event.startDay + event.period - 1;
                  const isFirstDayOfMonth =
                    new Date(event.startDate).getDate() === day &&
                    new Date(event.startDate).getMonth() === month - 1 &&
                    new Date(event.startDate).getFullYear() === year;

                  return (
                    <div
                      key={`${event.id}-${day}`}
                      className="relative w-full mb-1"
                      style={{ height: "20px" }}
                    >
                      <div
                        className={`h-full flex items-center transition-opacity duration-200 ${
                          event.color !== "tr"
                            ? "hover:opacity-80 cursor-pointer"
                            : ""
                        }`}
                        style={{
                          backgroundColor: event.color,
                          borderRadius:
                            isFirstDay && isLastDay
                              ? "0.25rem"
                              : isFirstDay
                              ? "0.25rem 0 0 0.25rem"
                              : isLastDay
                              ? "0 0.25rem 0.25rem 0"
                              : "0",
                        }}
                        onClick={() =>
                          event.color !== "tr" && handleEventClick(event)
                        }
                      >
                        {(isFirstDay || isFirstDayOfMonth) && (
                          <span className="text-[10px] font-medium pl-0.5 truncate block">
                            {event.title}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );

      if (days.length === 7) {
        weeks.push(
          <div key={weeks.length} className="grid grid-cols-7 h-full">
            {days}
          </div>
        );
        days = [];
      }
    }

    // Fill in any remaining days
    while (days.length > 0 && days.length < 7) {
      const isFirstWeek = weeks.length === 0;
      const isLastColumn = days.length === 6;

      days.push(
        <div
          key={`empty-end-${days.length}`}
          className={`h-full ${!isFirstWeek ? "border-t" : ""} ${
            !isLastColumn ? "border-r" : ""
          }`}
        />
      );
    }

    if (days.length > 0) {
      weeks.push(
        <div key={weeks.length} className="grid grid-cols-7 h-full">
          {days}
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {weeks.map((week, index) => (
          <div key={index} style={{ height: `${100 / totalWeeks}%` }}>
            {week}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (setCreateHandler) {
      setCreateHandler(() => handleCreate);
    }
  }, [setCreateHandler]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="select-none h-full flex flex-col"
    >
      <div className="flex-1">{renderCalendar()}</div>

      {(selectedEvent || newEvent) && (
        <Drawer
          open={isDrawerOpen}
          onOpenChange={(open) => !open && handleDrawerClose()}
        >
          {newEvent ? (
            <EventEditForm
              event={newEvent}
              onSubmit={handleRequestEvent}
              onCancel={handleDrawerClose}
            />
          ) : (
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader className="mt-5">
                  <DrawerTitle>{selectedEvent?.title}</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pt-3">
                  <p className="text-sm mb-4 whitespace-pre-wrap">
                    {selectedEvent?.content}
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      기간: {selectedEvent?.startDate} -{" "}
                      {selectedEvent?.endDate}
                    </p>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 mt-4">
                    <p>담당: {selectedEvent?.hostGroup}</p>
                    <p>요청: {selectedEvent?.relativeGroup?.join(", ")}</p>
                  </div>
                </div>
                <DrawerFooter className="mt-5 mb-12">
                  <div className="flex items-center justify-between gap-3">
                    {canWrite && (
                      <Button className="flex-1" onClick={handleEdit}>
                        수정
                      </Button>
                    )}
                    <DrawerClose asChild>
                      <Button variant="outline" className="flex-1">
                        닫기
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </div>
            </DrawerContent>
          )}
        </Drawer>
      )}
    </div>
  );
};
