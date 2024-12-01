import axios from "axios";
import { baseUrl } from "../baseUrl";

const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

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
