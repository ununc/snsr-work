import { BoardName, Posts, PostTextMatcher } from "@/api-models/post";
import type { Newcomer } from "@/api-models/sub";
import { getDownloadUrl } from "@/apis/minio/images";
import { getPromotionPostList, updatePartOfPost } from "@/apis/posts/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGlobalStore } from "@/stores/global.store";
import { ChevronRight, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface Newcomers extends Newcomer {
  preview?: string;
}

interface Post extends Posts {
  preview?: string;
  content: Newcomer;
}

const calculateRows = (text: string) => {
  if (!text) return 1;
  return (text.match(/\n/g) || []).length + 1;
};

export const PromotionPage = ({ boardId }: { boardId: BoardName }) => {
  const [boardState, setBoardState] = useState<"list" | "detail">("list");
  const [boardList, setBoardList] = useState<Posts[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [done, setDone] = useState(false);
  const { userInfo, getCanWriteByDescription } = useGlobalStore();
  const { toast } = useToast();

  const handleClickDetail = async (post: unknown) => {
    const objectName = ((post as Posts)?.content as Newcomer)?.objectName;
    if (!(post as Newcomers).preview && objectName) {
      const url = await getDownloadUrl(objectName);
      (post as Newcomers).preview = url;
    }
    setSelectedPost(post as Post);
    setBoardState("detail");
  };

  const handleRestore = async (
    id: string,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    if (!userInfo?.pid) return;
    try {
      await updatePartOfPost(userInfo.pid, {
        id,
        boardName: "newcomer",
      });
      setBoardList((prev) => prev.filter((item) => item.id !== id));
    } catch {
      toast({
        title: "새신자로 복원 실패",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleComplete = async (
    post: Posts,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    if (!userInfo?.pid) return;
    try {
      await updatePartOfPost(userInfo.pid, {
        id: post.id,
        boardName: "promotion",
        content: { ...post.content, promotionEnd: true },
      });
      setBoardList((prev) => prev.filter((item) => item.id !== post.id));
    } catch {
      toast({
        title: "등반 완료 변경 실패",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleToList = () => {
    setBoardState("list");
  };

  const handleChangeList = (done: boolean) => {
    setDone(done);
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await getPromotionPostList(done);
      setBoardList(result);
    };
    fetchData();
  }, [boardId, done]);

  const canWrite = getCanWriteByDescription(boardId);

  const renderContent = () => {
    switch (boardState) {
      case "detail":
        return (
          <div className="space-y-6 mb-6">
            <div className="mb-4">
              <Label className="mb-2 block">리더 이름</Label>
              <Input value={selectedPost?.content.leader} readOnly />
            </div>
            <div className="mb-4">
              <Label className="mb-2 block">새신자 사진</Label>
              <div className="relative border-2 border-dashed rounded-lg h-64 flex items-center justify-center">
                {selectedPost?.preview ? (
                  <img
                    src={selectedPost.preview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2 text-sm text-gray-600">
                      등록된 사진이 없습니다.
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div className="col-span-3">
                <Label className="mb-2 block">이름</Label>
                <Input value={selectedPost?.title} readOnly />
              </div>

              <div className="col-span-2">
                <Label className="mb-2 block">또래</Label>
                <Input value={selectedPost?.content?.pear} readOnly />
              </div>
            </div>

            <div className="mb-4">
              <Label className="mb-2 block">등반 노트</Label>
              <Textarea
                value={selectedPost?.content?.climbing}
                placeholder="장결 이유를 입력하세요"
                className="resize-none"
                rows={calculateRows(selectedPost?.content?.climbing ?? "")}
              />
            </div>

            <div className="mb-4">
              <Label className="mb-2 block">전화번호</Label>
              <Input value={selectedPost?.content?.phone} readOnly />
            </div>

            <div className="mb-4">
              <Label className="mb-2 block">직업</Label>
              <Input value={selectedPost?.content?.job} readOnly />
            </div>

            <div className="grid grid-cols-9 gap-4 mb-4">
              <Badge
                variant="outline"
                className="col-span-2 flex justify-between items-center py-2 text-center"
              >
                {selectedPost?.content?.newComer ? "초신자" : "기신자"}
              </Badge>
              <Badge
                variant="outline"
                className="col-span-3 flex justify-between items-center py-2 text-center"
              >
                세례 {selectedPost?.content?.baptism ? "받음" : "안 받음"}
              </Badge>
              <Badge
                variant="outline"
                className="col-span-4 flex justify-between items-center py-2 text-center"
              >
                목사님 심방{" "}
                {selectedPost?.content?.pastorVisited ? "완료" : "미완료"}
              </Badge>
            </div>

            {!selectedPost?.content?.newComer && (
              <div className="mb-4">
                <Label className="mb-2 block">기존 교회</Label>
                <Input value={selectedPost?.content?.churchName} readOnly />
              </div>
            )}

            <div className="mb-4">
              <Label className="mb-2 block">등록일</Label>
              <Input value={selectedPost?.targetDate} readOnly />
            </div>

            <div className="mb-4">
              <Label className="mb-2 block">등록 경로</Label>
              <Input
                value={selectedPost?.content?.registrationReason}
                readOnly
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-2.5">
            {boardList.map((post) => {
              const content = post.content as Newcomer;
              return (
                <Card
                  key={post.id}
                  className="w-full hover:shadow-md transition-shadow"
                  onClick={() => handleClickDetail(post)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">
                        {post.title} {content.pear.toString().substring(2)}또래
                        (담당자: {content.leader})
                      </div>
                      {canWrite && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              관리
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className=" min-w-20"
                          >
                            <DropdownMenuItem
                              onClick={(event) => handleRestore(post.id, event)}
                            >
                              복원 처리
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(event) => handleComplete(post, event)}
                            >
                              완료 처리
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
        <Label className="text-xl font-bold">{PostTextMatcher[boardId]}</Label>
      </div>
      <div className="page-body mb-2 px-0.5">{renderContent()}</div>

      {boardState === "detail" ? (
        <div className="flex justify-start items-center">
          <Button
            variant="ghost"
            className="flex justify-start items-center gap-2"
            onClick={handleToList}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            목록으로 돌아가기
          </Button>
        </div>
      ) : (
        <div className="flex justify-end items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex justify-start items-center gap-2"
              >
                {done ? "등반 완료 인원" : "등반 진행 인원"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="min-w-32">
              <DropdownMenuItem
                className="cursor-pointer justify-center"
                onClick={() => handleChangeList(false)}
              >
                등반 진행 인원
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer justify-center"
                onClick={() => handleChangeList(true)}
              >
                등반 완료 인원
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
