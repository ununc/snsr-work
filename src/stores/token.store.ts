import { create } from "zustand";

interface TokenStore {
  token: string;
  setToken: (token: string) => void;
  setPersistToken: (token: string) => void;
  clearToken: () => void;
  loadToken: () => void;
}

export const useTokenStore = create<TokenStore>((set) => ({
  token: "",
  setToken: (token) => {
    set({ token });
  },
  setPersistToken: (token) => {
    localStorage.setItem("snsr-token", token);
    set({ token });
  },
  clearToken: () => {
    localStorage.removeItem("snsr-token");
    set({ token: "" });
  },
  loadToken: () => {
    const token = localStorage.getItem("snsr-token");
    if (token) {
      set({ token });
    }
  },
}));
