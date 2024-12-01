import { apiClient } from "../baseUrl";

interface SelectDuration {
  year: number;
  month: number;
}

export const getEvents = async ({ year, month }: SelectDuration) => {
  const { data } = await apiClient.get("calendar", {
    params: {
      year,
      month,
    },
  });
  return data;
};
