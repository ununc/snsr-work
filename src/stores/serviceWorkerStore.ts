import { create } from "zustand";

interface ServiceWorkerState {
  registration: ServiceWorkerRegistration | null;
  showUpdatePrompt: boolean;
  updateLater: () => void;
  checkForUpdates: () => Promise<void>;
  updateNow: () => Promise<void>;
}

const getInitialRegistration = async () => {
  if ("serviceWorker" in navigator) {
    try {
      return await navigator.serviceWorker.getRegistration();
    } catch (error) {
      console.error("Failed to get service worker registration:", error);
      return null;
    }
  }
  return null;
};

export const useServiceWorkerStore = create<ServiceWorkerState>()(
  (set, get) => ({
    registration: null,
    showUpdatePrompt: false,

    updateLater: () => set({ showUpdatePrompt: false }),
    checkForUpdates: async () => {
      const { registration } = get();
      if (registration) {
        await registration.update();
        /*
        브라우저는 서비스 워커 스크립트 파일을 다시 다운로드합니다
        기존에 캐시된 버전과 바이트 단위로 비교합니다
        설치가 완료되면 installed(또는 waiting) 상태가 됩니다
        기존 서비스 워커가 제어하는 페이지들이 모두 닫힐 때까지 새 서비스 워커는 waiting 상태로 대기합니다
        모든 페이지가 닫히면 기존 서비스 워커는 종료되고 새 서비스 워커가 활성화(activate)됩니다    
        */
        registration.addEventListener(
          "updatefound",
          () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener(
              "statechange",
              () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  set({ showUpdatePrompt: true });
                }
              },
              { once: true }
            );
          },
          { once: true }
        );
      } else {
        const register = await getInitialRegistration();
        if (register) {
          set({ registration: register });
        }
      }
    },
    updateNow: async () => {
      const { registration } = get();
      if (registration?.waiting) {
        // 새로운 서비스워커에게 skipWaiting 메시지 전송
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        // 페이지 새로고침
        window.location.reload();
      }
    },
  })
);
