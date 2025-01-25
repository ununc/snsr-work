import { Posts, PostTextMatcher } from "@/api-models/post";
import type { Congregation } from "@/api-models/sub";
import { createPost, getPostList, updatePost } from "@/apis/posts/posts";
import { CongregationForm } from "@/components/page/CongregationForm";
import { MonthController } from "@/components/post/MonthController";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createEditState } from "@/etc/routeWord";
import { useToast } from "@/hooks/use-toast";
import { useGlobalStore } from "@/stores/global.store";
import { deepCopy } from "@/util/deepCopy";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";

const initValue: Congregation = {
  man: 0,
  women: 0,
  online: 0,
};

export const CongregationPage = ({ boardId }: { boardId: "congregation" }) => {
  const [boardState, setBoardState] = useState<
    "list" | "detail" | "create" | "edit"
  >("list");
  const [boardList, setBoardList] = useState<Posts<typeof boardId>[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Posts<
    typeof boardId
  > | null>(null);
  const [selectedListDate, setSelectedListDate] = useState<Date>(new Date());
  const [newContent, setNewContent] = useState(initValue);
  const [selectedNewContentDate, setSelectedNewContentDate] =
    useState<Date | null>(null);
  const isProcessingRef = useRef(false);

  const { userInfo, getCanWriteByDescription } = useGlobalStore();
  const { toast } = useToast();

  const changeYearMonth = async (date: Date) => {
    setSelectedListDate(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const result = await getPostList(boardId, `${year}-${month}`);
    setBoardList(result);
  };

  const changeRequestYearMonth = (date: Date) => {
    if (
      selectedNewContentDate?.getMonth() !== date?.getMonth() ||
      selectedNewContentDate?.getDate() !== date?.getDate()
    ) {
      setSelectedNewContentDate(date);
    }
  };

  const handleClickCreate = () => {
    setNewContent(initValue);
    const date = new Date();
    const currentDay = date.getDay();

    if (currentDay !== 0) {
      const daysUntilSunday = 7 - currentDay;
      date.setDate(date.getDate() + daysUntilSunday);
    }
    setSelectedNewContentDate(date);
    setBoardState("create");
  };

  const handleClickRequestCreate = async () => {
    if (!userInfo?.pid || isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const createdPost = await createPost(userInfo.pid, {
        boardName: boardId,
        targetDate: selectedNewContentDate?.toLocaleDateString("fr-CA"),
        content: newContent,
      });

      setBoardList((prev) => {
        const newList = [createdPost, ...prev];
        return newList.sort((a, b) => {
          const dateA = new Date(a.targetDate as string).getTime();
          const dateB = new Date(b.targetDate as string).getTime();
          return dateA - dateB;
        });
      });
      setBoardState("list");
    } catch (error) {
      console.error("Creation failed:", error);
      toast({
        title: "게시글 작성 실패",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleClickEdit = () => {};

  const handleClickItem = (post: Posts<typeof boardId>) => {
    const newContent = deepCopy(post.content as Congregation);
    setSelectedBoard(post);
    setNewContent(newContent);
    setSelectedNewContentDate(new Date(post.targetDate as string));
    setBoardState("edit");
  };

  const handleClickRequestEdit = async () => {
    if (!userInfo?.pid || !selectedBoard || isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const editedPost = await updatePost(userInfo.pid, {
        ...selectedBoard,
        boardName: boardId,
        targetDate: selectedNewContentDate?.toLocaleDateString("fr-CA"),
        content: newContent,
      });

      setBoardList((prev) =>
        prev.map((item) => (item.id === editedPost.id ? editedPost : item))
      );
      setSelectedBoard(null);
      setBoardState("list");
    } catch (error) {
      console.error("Edit failed:", error);
      toast({
        title: "게시글 수정 실패",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      isProcessingRef.current = false;
    }
  };

  const canWrite = getCanWriteByDescription(boardId);

  const renderContent = () => {
    switch (boardState) {
      case "create":
      case "edit":
        return (
          <CongregationForm
            initialData={newContent}
            onSubmit={(data) => {
              setNewContent(data);
            }}
            userPID={userInfo!.pid}
          />
        );
      default:
        return (
          <div className="space-y-2.5">
            {boardList.map((post) => {
              const content = post.content as Congregation;
              return (
                <Card
                  key={post.id}
                  className="w-full hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-semibold text-muted-foreground">
                        {post.targetDate}
                      </div>
                      <Button
                        size="sm"
                        className="p-0"
                        variant="ghost"
                        onClick={() => handleClickItem(post)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            형제
                          </div>
                          <div className="font-medium truncate">
                            {content.man}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            자매
                          </div>
                          <div className="font-medium truncate">
                            {content.women}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            온라인
                          </div>
                          <div className="font-medium truncate">
                            {content.online}
                          </div>
                        </div>
                      </div>
                      <Separator />

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            현장 인원
                          </div>
                          <div className="font-medium truncate">
                            {content.man + content.women}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            총 인원
                          </div>
                          <div className="font-medium truncate">
                            {content.man + content.women + content.online}
                          </div>
                        </div>

                        <div className="space-y-1"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className="page-wrapper">
      <div className="h-4 flex items-center mb-4">
        <Label className="text-xl font-bold">
          {PostTextMatcher[boardId]} {createEditState[boardState]}
        </Label>
      </div>

      <div className="page-body mb-2 px-0.5">{renderContent()}</div>

      <MonthController
        boardState={boardState}
        initDate={selectedListDate}
        setBoardState={setBoardState}
        canEdit={canWrite}
        canWrite={canWrite}
        initRequestDate={selectedNewContentDate}
        handleClickEdit={handleClickEdit}
        handleClickCreate={handleClickCreate}
        handleClickRequestEdit={handleClickRequestEdit}
        handleClickRequestCreate={handleClickRequestCreate}
        changeYearMonth={changeYearMonth}
        changeRequestYearMonth={changeRequestYearMonth}
        noDetail
      />
    </div>
  );
};
