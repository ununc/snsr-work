import { create } from "zustand";

interface TextState {
  text: string;
  setText: (objectName: string) => void;
  clearText: () => void;
}

// changedString store 정의
export const useChangedStringStore = create<TextState>((set) => ({
  text: "",
  setText: (newText: string) => set({ text: newText }),
  clearText: () => set({ text: "" }),
}));
