import { Posts, PostTextMatcher } from "@/api-models/post";
import type { Newcomer } from "@/api-models/sub";
import { downloadSingleFile, handleDelete } from "@/apis/minio";
import {
  deletePost,
  getBoardAllPostList,
  updatePartOfPost,
} from "@/apis/posts/posts";
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
import { ChevronRight, Clock, ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Newcomers {
  leader: string;
  name?: string;
  pear: number;
  phone?: string;
  job?: string;
  newComer: boolean;
  churchName?: string;
  pastorVisited: boolean;
  baptism: boolean;
  registrationDate?: string;
  registrationReason?: string;
  promotionEnd: boolean;
  notes?: string[];
  absence?: string;
  climbing?: string;
  boardName: "newcomer" | "absenteeism" | "promotion";
  image?: {
    file?: File;
    preview: string;
    objectName: string;
  };
}

const calculateRows = (text: string) => {
  if (!text) return 1;
  return (text.match(/\n/g) || []).length + 1;
};

export const AbsenteeismPage = ({ boardId }: { boardId: "absenteeism" }) => {
  const [boardState, setBoardState] = useState<"list" | "detail">("list");
  const [boardList, setBoardList] = useState<Posts<typeof boardId>[]>([]);
  const [selectedPost, setSelectedPost] = useState<Posts<
    typeof boardId
  > | null>(null);
  const isProcessingRef = useRef(false);

  const { userInfo, getCanWriteByDescription } = useGlobalStore();
  const { toast } = useToast();

  const handleDetail = async (post: Posts<typeof boardId>) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const objectName = post.content.objectName;

      if (objectName) {
        const temp = post.content as Partial<
          Posts<typeof boardId>
        > as Newcomers;
        if (!temp.image) {
          const item = await downloadSingleFile(objectName);
          temp.image = {
            preview: window.URL.createObjectURL(item!),
            objectName: objectName,
          };
        }
      }
      setSelectedPost(post);
      setBoardState("detail");
    } catch {
      toast({
        title: "요청 실패",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleRestore = async (id: string) => {
    if (!userInfo?.pid || isProcessingRef.current) return;
    isProcessingRef.current = true;
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
    } finally {
      isProcessingRef.current = false;
    }
  };

  const requestDelete = async (post: Posts<typeof boardId>) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const objectName = post.content?.objectName;
      if (objectName) {
        await handleDelete(objectName);
      }
      await deletePost(post.id);
      setBoardList((prev) => prev.filter((item) => item.id !== post.id));
    } catch {
      toast({
        title: "삭제 실패",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleToList = () => {
    setBoardState("list");
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await getBoardAllPostList(boardId);
      setBoardList(result);
    };
    fetchData();
  }, [boardId]);

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
                {(selectedPost?.content as Newcomers)?.image?.preview ? (
                  <img
                    src={(selectedPost?.content as Newcomers).image?.preview}
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
              <Label className="mb-2 block">장결 노트</Label>
              <Textarea
                value={selectedPost?.content?.absence}
                placeholder="장결 이유를 입력하세요"
                className="resize-none"
                rows={calculateRows(selectedPost?.content?.absence ?? "")}
                readOnly
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
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">
                        {content.leader}: {post.title}{" "}
                        {content.pear.toString().substring(2)}또래{" "}
                        {content.notes?.length ?? 0}주차
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
                              onClick={() => handleDetail(post)}
                            >
                              정보 확인
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRestore(post.id)}
                            >
                              복원 처리
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => requestDelete(post)}
                            >
                              삭제 처리
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <div className="flex justify-end items-center pt-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <div className="text-muted-foreground">
                        {post.targetDate}
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
        <Label className="text-xl font-bold">{PostTextMatcher[boardId]}</Label>
      </div>
      <div className="page-body mb-2 px-0.5">{renderContent()}</div>

      {boardState === "detail" && (
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            className="flex justify-start items-center gap-2"
            onClick={handleToList}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            목록으로 돌아가기
          </Button>
        </div>
      )}
    </div>
  );
};
