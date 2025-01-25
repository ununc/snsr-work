import { useGlobalStore } from "@/stores/global.store";
import axios from "axios";

export const baseUrl = "/api";
export const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const getToken = () => {
  return useGlobalStore.getState().token;
};

// 요청 인터셉터 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(new Error(error));
  }
);
