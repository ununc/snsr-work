interface UserInfo {
  pid: string;
  name: string;
  email?: string;
  phone: string;
  birth: Date;
  sarang: string;
  daechung: boolean;
  created_at: Date;
  role_list: { name: string; id: string }[];
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

interface UserState {
  userInfo: UserInfo | null;
  token: string | null;
  autoLogin: boolean;
  setUserData: (userInfo: UserInfo, token: string, autoLogin: boolean) => void;
  updateUserInfo: (newUserInfo: Partial<UserInfo>) => void;
  clearUserData: () => void;
}

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("zustand-store", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("store", "readonly");
        const store = transaction.objectStore("store");
        const getValue = store.get(name);

        getValue.onsuccess = () => resolve(getValue.result || null);
        getValue.onerror = () => reject(getValue.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore("store");
      };
    });
  },

  setItem: async (name: string, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("zustand-store", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("store", "readwrite");
        const store = transaction.objectStore("store");
        const setValue = store.put(value, name);

        setValue.onsuccess = () => resolve();
        setValue.onerror = () => reject(setValue.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore("store");
      };
    });
  },

  removeItem: async (name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("zustand-store", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("store", "readwrite");
        const store = transaction.objectStore("store");
        const deleteValue = store.delete(name);

        deleteValue.onsuccess = () => resolve();
        deleteValue.onerror = () => reject(deleteValue.error);
      };
    });
  },
};

export const useGlobalStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: null,
      token: null,
      autoLogin: false,

      setUserData: (userInfo: UserInfo, token: string, autoLogin: boolean) =>
        set({ userInfo, token, autoLogin }),

      updateUserInfo: (newUserInfo: Partial<UserInfo>) =>
        set((state) => ({
          userInfo: state.userInfo
            ? ({ ...state.userInfo, ...newUserInfo } as UserInfo)
            : null,
        })),

      clearUserData: () =>
        set({ userInfo: null, token: null, autoLogin: false }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        userInfo: state.userInfo,
        token: state.token,
        autoLogin: state.autoLogin,
      }),
    }
  )
);
