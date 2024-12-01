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

export const getPresignedUrl = async (userId: string, fileName: string) => {
  const { data } = await apiClient.post("minio/presigned-url", {
    userId,
    fileName,
  });
  console.log(data);
  return data;
};

export const uploadImage = async (url: string, file: File) => {
  const { data } = await axios.put(url, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
  return data;
};

export const getDownloadUrl = async (filePath: string) => {
  const encodedFilePath = encodeURIComponent(filePath);
  const { data } = await apiClient.get(`minio/file/${encodedFilePath}`);
  return data;
};
