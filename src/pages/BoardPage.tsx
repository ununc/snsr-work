import { Label } from "@radix-ui/react-label";
import { Outlet, useMatch } from "react-router-dom";

export const BoardPage = () => {
  const isExactPath = useMatch({ path: "/board", end: true });
  return (
    <div className="pt-6 flex flex-col h-full">
      <div className="px-4">
        {isExactPath ? (
          <>
            <Label className="text-xl font-bold">국장 리더 공간</Label>
            <p className="text-sm text-gray-600 my-4">
              우측 하단 메뉴에서 선택하여 이동
            </p>
          </>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};
