import { useServiceWorkerStore } from "@/stores/serviceWorkerStore";

export const UpdatePrompt = () => {
  const { updateLater, updateNow } = useServiceWorkerStore();

  return (
    <div className="absolute w-full -top-24">
      <div className="p-2 gap-2 flex flex-col justify-between items-center  border-2 rounded-lg border-blue-100">
        <p className="pl-2">업데이트하시겠습니까?</p>
        <div className="flex w-full justify-center items-center gap-4">
          <button
            onClick={() => updateNow()}
            className="px-4 py-1 bg-blue-100 text-blue-500 rounded"
          >
            업데이트
          </button>

          <button
            onClick={() => updateLater()}
            className="px-4 py-1 border border-blue-100 text-blue-500 rounded"
          >
            다음에
          </button>
        </div>
      </div>
    </div>
  );
};
