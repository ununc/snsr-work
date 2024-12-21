import { create } from "zustand";

interface User {
  pid: string;
  name: string;
  email?: string;
  phone: string;
  birth: Date;
  sarang: string;
  daechung: boolean;
  created_at: Date;
  group_list: { name: string; id: string }[];
  menuList: {
    id: string;
    name: string;
    description: string;
    order: number;
    owner: string;
    can_write: boolean;
  }[];
  autoLogin: boolean;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  setPersistUser: (user: User) => void;
  clearUser: () => void;
  loadUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => {
    set({ user });
  },
  setPersistUser: (user) => {
    localStorage.setItem("user-storage", JSON.stringify({ user }));
    set({ user });
  },
  clearUser: () => {
    localStorage.removeItem("user-storage");
    set({ user: null });
  },
  loadUser: () => {
    const state = localStorage.getItem("user-storage");
    if (!state) return;
    const data = JSON.parse(state);
    set({ user: data.state.user });
  },
}));
