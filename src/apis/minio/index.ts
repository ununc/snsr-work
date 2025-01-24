import { apiClient } from "../baseUrl";

export const getObjectName = (userId: string, fileName: string): string => {
  const sanitizedFileName = fileName
    .replace(/[ㄱ-ㅎㅏ-ㅣ]/g, "") // 한글 자음/모음 제거
    .replace(/[<>:"/\\|?*\s]/g, "_") // URL unsafe 문자와 공백을 _로 변경
    .replace(/_+/g, "_") // 여러 개의 연속된 언더스코어를 하나로 통일
    .replace(/^_+|_+$/g, ""); // 시작과 끝의 언더스코어 제거
  return `users/${userId}/files/${Date.now()}-${sanitizedFileName}`;
};

export const extractFileName = (objectName: string): string => {
  const match = objectName.match(/\/files\/\d+-(.+)$/);
  return match ? match[1] : "";
};

export const handleFileUpload = async (file: File): Promise<void> => {
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  try {
    await apiClient.post(`minio/upload/single`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

export const handleMultipleUpload = async (files: File[]): Promise<void> => {
  if (files.length === 0) return;

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  try {
    await apiClient.post(`minio/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Multiple upload failed:", error);
  }
};

export const handleDelete = async (filename: string) => {
  try {
    await apiClient.delete(`minio/remove/${filename}`);
  } catch (error) {
    console.error("Delete failed:", error);
  }
};

export const downloadSingleFile = async (
  objectName: string
): Promise<Blob | null> => {
  if (!objectName) {
    throw new Error("Object name is required");
  }

  try {
    const { data } = await apiClient.get<DownloadedFile>(
      `minio/download/${objectName}`,
      {
        responseType: "arraybuffer",
        transformResponse: [
          (data) => {
            const text = new TextDecoder().decode(data);
            return JSON.parse(text);
          },
        ],
      }
    );
    return new Blob([new Uint8Array(data.data.data)], { type: data.type });
  } catch (error) {
    console.error("Download failed:", error);
    return null;
  }
};

interface DownloadedFile {
  data: {
    data: number[]; // 또는 Uint8Array
    type: string;
    buffer: boolean;
  };
  type: string;
}

export const downloadMultipleFiles = async (
  objectNames: string[]
): Promise<Blob[]> => {
  if (!objectNames.length) {
    throw new Error("Object names are required");
  }

  try {
    const { data } = await apiClient.post<DownloadedFile[]>(
      `minio/download/files`,
      { objectNames },
      {
        responseType: "arraybuffer",
        transformResponse: [
          (data) => {
            const text = new TextDecoder().decode(data);
            return JSON.parse(text);
          },
        ],
      }
    );

    return data.map((file) => {
      return new Blob([new Uint8Array(file.data.data)], { type: file.type });
    });
  } catch (error) {
    console.error("Multiple download failed:", error);
    return [];
  }
};

export const downloadFile = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// import JSZip from "jszip";

// export const downloadFileListAsZip = async (
//   objectNames: string[],
//   zipFileName: string = "download.zip"
// ): Promise<void> => {
//   if (!objectNames.length) return;

//   try {
//     const blobs = await downloadMultipleFiles(objectNames);
//     const zip = new JSZip();

//     blobs.forEach((blob, index) => {
//       zip.file(objectNames[index], blob);
//     });

//     const zipBlob = await zip.generateAsync({ type: "blob" });
//     downloadFile(zipBlob, zipFileName);
//   } catch (error) {
//     console.error("Zip download failed:", error);
//     throw error;
//   }
// };
