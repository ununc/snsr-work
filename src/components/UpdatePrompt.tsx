import { useServiceWorkerStore } from "@/stores/serviceWorkerStore";
import { useState } from "react";

export const UpdatePrompt = () => {
  const { updateLater, updateNow } = useServiceWorkerStore();
  const [isLoading, setLoading] = useState(false);

  return (
    <div className="absolute w-full -top-24 bg-white">
      <div className="p-2 gap-2 flex flex-col justify-between items-center">
        {isLoading ? (
          <div className="h-32">업데이트 처리중 ...</div>
        ) : (
          <>
            <p className="pl-2">업데이트하시겠습니까?</p>
            <div className="flex w-full justify-center items-center gap-4">
              <button
                onClick={() => {
                  setLoading(true);
                  updateNow().then(() => {
                    setLoading(false);
                    updateLater();
                  });
                }}
                className="px-4 py-1 bg-blue-100 text-blue-500 rounded"
              >
                업데이트
              </button>

              <button
                onClick={() => {
                  updateLater();
                }}
                className="px-4 py-1 border border-blue-100 text-blue-500 rounded"
              >
                다음에
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
