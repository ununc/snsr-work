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

          // updatefound 이벤트 리스너 등록
          const updateFoundPromise = new Promise((resolve) => {
            registration.addEventListener(
              "updatefound",
              () => {
                const newWorker = registration.installing;

                if (!newWorker) {
                  resolve(false);
                  return;
                }

                newWorker.addEventListener(
                  "statechange",
                  () => {
                    if (newWorker.state === "installed") {
                      set({ showUpdatePrompt: true });
                      resolve(true);
                    }
                  },
                  { once: true }
                );
              },
              { once: true }
            );
          });

          // 일정 시간 후에도 업데이트가 없으면 종료
          const timeoutPromise = new Promise((resolve) =>
            setTimeout(() => resolve(false), 270000)
          );
          // 새로운 업데이트 확인
          await registration.update();

          await Promise.race([updateFoundPromise, timeoutPromise]);
        } catch (error) {
          console.error("Error checking for updates:", error);
        }
      }
    },
    updateNow: async () => {
      const { registration } = get();
      if (registration?.waiting) {
        try {
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
        } catch (error) {
          console.error("Error during update:", error);
        }
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
