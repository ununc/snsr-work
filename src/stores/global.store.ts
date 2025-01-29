interface UserInfo {
  pid: string;
  name: string;
  email?: string;
  phone: string;
  birth: string;
  sarang: string;
  daechung: boolean;
  created_at: Date;
  role_list: { name: string; id: string }[];
  profile_image?: string;
  autoLogin: boolean;
}

interface Menu {
  id: string;
  name: string;
  description: string;
  order: number;
  owner: string;
  can_write: boolean;
}

interface Role {
  id: string;
  name: string;
}

interface UserState {
  userInfo: UserInfo | null;
  menuList: Menu[] | null;
  roleNames: Role[] | null;
  token: string | null;
  autoLogin: boolean;
  getCanWriteByDescription: (description: string) => boolean;
  setUserData: (
    userInfo: UserInfo,
    menuList: Menu[],
    roleNames: Role[],
    token: string,
    autoLogin: boolean
  ) => void;
  updateUserInfo: (newUserInfo: UserInfo) => void;
  updateMenuList: (newMenuList: Menu[]) => void;
  updateRoleNames: (newRoleNames: Role[]) => void;
  updateToken: (newToken: string) => void;
  updateAutoLogin: (newAutoLogin: boolean) => void;
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
    (set, get) => ({
      userInfo: null,
      menuList: null,
      roleNames: null,
      token: null,
      autoLogin: false,

      setUserData: (
        userInfo: UserInfo,
        menuList: Menu[],
        roleNames: Role[],
        token: string,
        autoLogin: boolean
      ) => set({ userInfo, menuList, roleNames, token, autoLogin }),
      getCanWriteByDescription: (description: string): boolean => {
        const { menuList } = get();
        const matchingDocument = menuList?.find(
          (doc) => doc.description === description
        );
        return matchingDocument ? matchingDocument.can_write : false;
      },

      updateUserInfo: (newUserInfo: UserInfo) => set({ userInfo: newUserInfo }),
      updateMenuList: (newMenuList: Menu[]) => set({ menuList: newMenuList }),

      updateRoleNames: (newRoleNames: Role[]) =>
        set({ roleNames: newRoleNames }),

      updateToken: (newToken: string) => set({ token: newToken }),

      updateAutoLogin: (newAutoLogin: boolean) =>
        set({ autoLogin: newAutoLogin }),
      clearUserData: () =>
        set({
          userInfo: null,
          menuList: null,
          roleNames: null,
          token: null,
          autoLogin: false,
        }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => storage),
      partialize: (state) =>
        state.autoLogin
          ? {
              userInfo: state.userInfo,
              menuList: state.menuList,
              roleNames: state.roleNames,
              token: state.token,
              autoLogin: state.autoLogin,
            }
          : {
              userInfo: null,
              menuList: null,
              roleNames: null,
              token: null,
              autoLogin: false,
            },
    }
  )
);
