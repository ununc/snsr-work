import { create } from "zustand";

interface LoaderState {
  loadingCount: number;
  isLoading: boolean;
  increaseCount: () => void;
  decreaseCount: () => void;
}

export const useLoaderStore = create<LoaderState>((set) => ({
  loadingCount: 0,
  isLoading: false,
  increaseCount: () =>
    set((state) => ({
      loadingCount: state.loadingCount + 1,
      isLoading: true,
    })),
  decreaseCount: () =>
    setTimeout(() => {
      set((state) => ({
        loadingCount: state.loadingCount - 1,
        isLoading: state.loadingCount - 1 > 0,
      }));
    }, 350),
}));
