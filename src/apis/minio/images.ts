import axios from "axios";
import { apiClient } from "../baseUrl";

export const getPresignedUrl = async (userId: string, fileName: string) => {
  const { data } = await apiClient.post("minio/presigned-url", {
    userId,
    fileName,
  });
  return data;
};

export const uploadImage = async (url: string, file: File) => {
  await axios.put(url, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
};

export const getDownloadUrl = async (filePath: string) => {
  if (!filePath) return undefined;
  const encodedFilePath = encodeURIComponent(filePath);
  const { data } = await apiClient.get(`minio/file/${encodedFilePath}`);
  return data.url;
};

export const deleteImage = async (filePath: string) => {
  if (!filePath) return undefined;
  const encodedFilePath = encodeURIComponent(filePath);
  await apiClient.delete(`minio/file/${encodedFilePath}`);
};
