import axios from "axios";
import { apiClient } from "../baseUrl";

export const getPresignedUrl = async (
  userId: string,
  fileName: string
): Promise<{ url: string; objectName: string }> => {
  const { data } = await apiClient.post("minio/presigned-url", {
    userId,
    fileName,
  });
  return data;
};

export const uploadImage = async (url: string, file: File) => {
  try {
    await axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  } catch {
    console.error("File upload Fail");
  }
};

export const getDownloadUrl = async (filePath: string): Promise<string> => {
  const encodedFilePath = encodeURIComponent(filePath);
  const { data } = await apiClient.get(`minio/file/${encodedFilePath}`);
  return data.url;
};

export const deleteImage = async (filePath: string) => {
  if (!filePath) return undefined;
  const encodedFilePath = encodeURIComponent(filePath);
  try {
    await apiClient.delete(`minio/file/${encodedFilePath}`);
  } catch {
    console.error("File not found");
  }
};
