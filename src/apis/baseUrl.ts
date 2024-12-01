import axios from "axios";

export const baseUrl = "/api";
export const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
