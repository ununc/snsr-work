export const UpdatePrompt = ({ update }: { update: () => Promise<void> }) => {
  return (
    <div className="absolute w-full px-4 -top-10">
      <div className="flex justify-between items-center  border-2 rounded-lg border-blue-100">
        <p className="pl-2">새로운 버전으로 업데이트하시겠습니까?</p>
        <button
          onClick={() => update()}
          className="px-4 py-1 bg-blue-200 text-blue-500 rounded"
        >
          업데이트
        </button>
      </div>
    </div>
  );
};
