import React from "react";
import { usePWAUpdate } from "../hooks/usePWAUpdate";

export const UpdatePrompt: React.FC = () => {
  const { needRefresh, update } = usePWAUpdate();

  if (!needRefresh) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-blue-500 text-white w-full">
      <p>새로운 버전이 있습니다. 업데이트하시겠습니까?</p>
      <button
        onClick={() => update()}
        className="px-4 py-2 bg-white text-blue-500 rounded"
      >
        업데이트
      </button>
    </div>
  );
};
