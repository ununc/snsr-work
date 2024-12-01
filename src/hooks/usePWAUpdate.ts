import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

export function usePWAUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | undefined>();

  useEffect(() => {
    const intervalMS = 60 * 60 * 1000; // 1시간마다 체크

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
      },
      onRegistered(registration: ServiceWorkerRegistration | undefined) {
        // 주기적으로 업데이트 체크
        if (registration) {
          setInterval(() => {
            registration.update();
          }, intervalMS);
        }
      },
    });

    setUpdateSW(() => updateSW);
  }, []);

  const update = async () => {
    if (updateSW) {
      await updateSW();
      window.location.reload();
    }
  };

  return {
    needRefresh,
    offlineReady,
    update,
  };
}
