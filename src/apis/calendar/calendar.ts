import { apiClient } from "../baseUrl";

export interface ScheduleEvent {
  id?: string;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  hostGroup: string;
  relativeGroup: string[];
  color: string;
}

export const getEvents = async (
  year: string,
  month: string
): Promise<ScheduleEvent[]> => {
  const { data } = await apiClient.get("schedule/monthly", {
    params: {
      year,
      month,
    },
  });
  return data;
};

export const createEvent = async (
  event: ScheduleEvent
): Promise<ScheduleEvent> => {
  delete event.id;
  const { data } = await apiClient.post("schedule", event);
  return data;
};

export const editEvent = async (
  event: ScheduleEvent
): Promise<ScheduleEvent> => {
  const { data } = await apiClient.patch("schedule", event);
  return data;
};
