import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ManualPage = () => {
  const navigate = useNavigate();
  const manuals = [
    {
      id: 1,
      title: "시스템 사용 가이드",
      author: "김철수",
      createdAt: "2024-12-12",
    },
  ];
  const canWrite = true;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="w-full h-full p-4">
      {/* 헤더 영역 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">매뉴얼</h1>
        {canWrite && (
          <Button
            size="sm"
            className="flex items-center gap-1"
            onClick={() => navigate("./create")}
          >
            <PlusCircle className="w-4 h-4" />
            작성
          </Button>
        )}
      </div>

      {/* 매뉴얼 리스트 */}
      <div className="space-y-3">
        {manuals.map((manual) => (
          <Card
            key={manual.id}
            className="p-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => navigate(`./${manual.id}`)}
          >
            <div className="space-y-2">
              <h2 className="font-medium text-base line-clamp-2">
                {manual.title}
              </h2>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{manual.author}</span>
                <span>{formatDate(manual.createdAt)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 데이터가 없을 때 표시 */}
      {manuals.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          등록된 매뉴얼이 없습니다.
        </div>
      )}
    </div>
  );
};
