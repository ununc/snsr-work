import { create } from "zustand";

interface TokenStore {
  token: string;
  setToken: (token: string) => void;
  setPersistToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
  loadToken: () => Promise<string | undefined>;
}

interface Result {
  value: string;
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("token_db", 1);
    request.onerror = (event: Event) => {
      const target = event.target;
      if (!target) return;
      const error = (target as IDBOpenDBRequest).error;
      reject(error || new Error("Unknown IndexedDB error"));
    };

    request.onsuccess = (event: Event) => {
      const target = event.target;
      if (!target) return;
      resolve((target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("token")) {
        db.createObjectStore("token", { keyPath: "accessToken" });
      }
    };
  });
};

const DB = await initDB();

export const useTokenStore = create<TokenStore>((set) => ({
  token: "",
  setToken: (token) => set({ token }),
  setPersistToken: async (token) => {
    return new Promise<void>((resolve, reject) => {
      const tx = DB.transaction(["token"], "readwrite");
      const store = tx.objectStore("token");
      store.clear();
      store.add({ accessToken: token });

      tx.oncomplete = () => {
        set({ token });
        resolve();
      };
      tx.onerror = (event: Event) => {
        const target = event.target;
        if (!target) return;
        const error = (target as IDBOpenDBRequest).error;
        reject(error || new Error("Unknown IndexedDB error"));
      };
    });
  },
  clearToken: async () => {
    return new Promise<void>((resolve, reject) => {
      const tx = DB.transaction("token", "readwrite");
      const store = tx.objectStore("token");
      store.clear();

      tx.oncomplete = () => {
        set({ token: "" });
        resolve();
      };
      tx.onerror = (event: Event) => {
        const target = event.target;
        if (!target) return;
        const error = (target as IDBOpenDBRequest).error;
        reject(error || new Error("Unknown IndexedDB error"));
      };
    });
  },
  loadToken: async () => {
    return new Promise<string | undefined>((resolve) => {
      const tx = DB.transaction(["token"], "readonly");
      const store = tx.objectStore("token");
      const request = store.get("accessToken");
      request.onsuccess = (event: Event) => {
        const target = event.target as IDBRequest<Result | undefined>;
        if (target.result?.value) {
          set({ token: target.result.value });
          resolve(target.result.value);
        } else {
          resolve(undefined);
        }
      };
    });
  },
}));
