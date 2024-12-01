import { create } from "zustand";

interface ImageInfo {
  objectName: string;
  url: string;
  file: File;
  base64: string;
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
