import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";

import {
  createEvent,
  editEvent,
  getEvents,
  ScheduleEvent,
} from "@/apis/calendar/calendar";
import { Schedule } from "@/components/Schedule";
import { YearMonth } from "@/components/select/YearMonth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGlobalStore } from "@/stores/global.store";

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  const [createHandler, setCreateHandler] = useState<(() => void) | null>(null);
  const isProcessingRef = useRef(false);

  const { toast } = useToast();

  const { roleNames } = useGlobalStore();

  const triggerCreate = () => {
    createHandler?.();
  };

  const changeYearMonth = (date: Date) => {
    const now = new Date(date);
    setCurrentDate(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const requestSchedule = async (state: boolean, schedule: ScheduleEvent) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      if (state) {
        const createdEvent = await createEvent(schedule);
        setEvents((prev) => [...prev, createdEvent]);
      } else {
        const updatedEvent = await editEvent(schedule);
        setEvents((prev) =>
          prev.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          )
        );
      }
    } catch {
      toast({
        title: "스케쥴 요청 실패",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      isProcessingRef.current = false;
    }
  };

  const checkPermittedRole = (roleNames: { id: string; name: string }[]) => {
    if (!roleNames.length) return false;
    const directMatches = ["목사님", "대표리더", "관리자"];

    for (const role of roleNames) {
      // 직접 매칭되는 역할들 체크
      if (directMatches.includes(role.name)) {
        return true;
      }

      // '국장' 키워드가 포함된 경우 체크
      if (role.name.includes("국장")) {
        return true;
      }
    }

    return false;
  };

  const canWrite = checkPermittedRole(roleNames ?? []);

  useEffect(() => {
    const fetchEvents = async () => {
      const [year, month] = currentDate.split("-");
      try {
        const eventList = await getEvents(year, month);
        setEvents(eventList);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, [currentDate]);

  return (
    <div className="page-wrapper">
      <div className="h-9 flex items-center">
        <Label className="text-xl font-bold">대학 청년부 일정</Label>
      </div>

      <div className="page-body mb-2 px-0.5">
        <Schedule
          events={events}
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
          canWrite={canWrite}
          setCreateHandler={setCreateHandler}
          requestSchedule={requestSchedule}
        />
      </div>
      <div className="flex justify-between items-center">
        <YearMonth
          changeYearMonth={changeYearMonth}
          initDate={new Date(currentDate)}
        />
        {canWrite && <Button onClick={triggerCreate}>작성하기</Button>}
      </div>
    </div>
  );
};
