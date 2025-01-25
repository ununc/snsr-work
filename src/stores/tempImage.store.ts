import { create } from "zustand";

interface ImageInfo {
  objectName: string; // content에 저장
  file?: File; // 임시 url에 올라갈 파일
  preview: string; // objectName으로 변환을 위한 부분
}

interface ImageState {
  pendingImages: ImageInfo[];
  addPendingImage: (image: ImageInfo) => void;
  clearPendingImages: () => void;
  removePendingImage: (objectName: string) => void;
}

export const useImageStore = create<ImageState>((set) => ({
  pendingImages: [],
  addPendingImage: (image) =>
    set((state) => ({
      pendingImages: [...state.pendingImages, image],
    })),
  clearPendingImages: () => set({ pendingImages: [] }),
  removePendingImage: (objectName) =>
    set((state) => ({
      pendingImages: state.pendingImages.filter(
        (img) => img.objectName !== objectName
      ),
    })),
}));
