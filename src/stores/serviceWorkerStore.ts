import { create } from "zustand";

interface ServiceWorkerState {
  registration: ServiceWorkerRegistration | null;
  showUpdatePrompt: boolean;
  updateLater: () => void;
  checkForUpdates: () => Promise<void>;
  updateNow: () => Promise<void>;
  initGetRegister: () => Promise<ServiceWorkerRegistration | undefined | null>;
}

export const useServiceWorkerStore = create<ServiceWorkerState>()(
  (set, get) => ({
    registration: null,
    showUpdatePrompt: false,

    updateLater: () => set({ showUpdatePrompt: false }),
    checkForUpdates: async () => {
      const { registration } = get();
      if (registration) {
        try {
          if (registration.waiting) {
            set({ showUpdatePrompt: true });
            return;
          }
          registration.addEventListener(
            "updatefound",
            () => {
              const newWorker = registration.installing;

              newWorker?.addEventListener(
                "statechange",
                () => {
                  if (newWorker.state === "installed") {
                    set({ showUpdatePrompt: true });
                  }
                },
                { once: true }
              );
            },
            { once: true }
          );

          await registration.update();
          set({ showUpdatePrompt: registration.waiting ? true : false });
        } catch (error) {
          console.error("Error checking for updates:", error);
        }
      }
    },
    updateNow: async () => {
      const { registration } = get();
      if (registration?.waiting) {
        // 새로운 서비스워커에게 skipWaiting 메시지 전송
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        await new Promise((resolve) => {
          registration.addEventListener(
            "activate",
            () => {
              resolve(true);
            },
            { once: true }
          );
        });

        // 업데이트된 컨텐츠를 보여주기 위해 페이지를 새로고침합니다
        window.location.reload();
      }
    },
    initGetRegister: async () => {
      const { registration } = get();
      if (registration) {
        return registration;
      }
      if ("serviceWorker" in navigator) {
        try {
          const register = await navigator.serviceWorker.getRegistration();
          set({ registration: register });
          return register;
        } catch {
          set({ registration: null });
        }
      }
      return null;
    },
  })
);
