import { BoardName, Posts, PostTextMatcher } from "@/api-models/post";
import type { Newcomer } from "@/api-models/sub";
import { deleteImage, getDownloadUrl, uploadImage } from "@/apis/minio/images";
import {
  createPost,
  getBoardAllPostList,
  updatePartOfPost,
} from "@/apis/posts/posts";
import { NewcomerForm } from "@/components/page/NewcomerForm";
import {
  OnlyBoardState,
  OnlyController,
} from "@/components/post/OnlyController";
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
import { deepCopy } from "@/util/deepCopy";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

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
    uploadUrl?: string;
    file?: File;
    preview: string;
    objectName: string;
  };
}

const initValue: Newcomers = {
  leader: "",
  name: "",
  pear: 0,
  phone: "",
  job: "",
  newComer: false,
  baptism: false,
  registrationDate: "",
  registrationReason: "",
  promotionEnd: false,
  churchName: "",
  pastorVisited: false,
  notes: [],
  absence: "",
  climbing: "",
  boardName: "newcomer",
};

const calculateRows = (text: string) => {
  if (!text) return 1;
  return (text.match(/\n/g) || []).length + 1;
};

export const NewcomerPage = ({ boardId }: { boardId: BoardName }) => {
  const [boardState, setBoardState] = useState<OnlyBoardState>("list");
  const [boardList, setBoardList] = useState<Posts[]>([]);
  const [newContent, setNewContent] = useState(initValue);
  const [newEdu, setNewEdu] = useState<string[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("");

  const { userInfo, getCanWriteByDescription } = useGlobalStore();
  const { toast } = useToast();

  const handleClickCreate = () => {
    setNewContent(initValue);
    setBoardState("create");
  };

  const handleStateChange = async (newState: OnlyBoardState, post: Posts) => {
    switch (newState) {
      case "edu":
        setNewEdu((post.content as Newcomers).notes ?? []);
        setNewComment("");
        break;
      case "climbing":
      case "absence":
        setNewComment("");
        break;
    }
    if (newState === "edit") {
      if (!(post.content as Newcomers)?.image) {
        const image = (post.content as Newcomer)?.objectName;
        if (image) {
          const url = await getDownloadUrl(image);
          (post.content as Newcomers).image = {
            preview: url,
            objectName: image,
          };
        }
      }
    }
    setSelectedId(post.id);
    setNewContent({
      ...(post.content as Newcomers),
      name: post.title as string,
      registrationDate: post.targetDate as string,
    });
    setBoardState(newState);
  };

  const createRequest = async () => {
    if (!userInfo?.pid) return;
    let objectName = "";
    if (newContent.image?.uploadUrl && newContent.image?.file) {
      objectName = newContent.image.objectName;
      await uploadImage(newContent.image.uploadUrl, newContent.image.file);
    }

    const item = deepCopy(newContent);
    const title = item.name;
    const targetDate = item.registrationDate;

    delete item.registrationDate;
    delete item.name;
    delete item.image;

    const createdPost = await createPost(userInfo.pid, {
      boardName: boardId,
      title,
      targetDate,
      content: { ...item, objectName },
    });

    setBoardList((prev) => {
      const newList = [createdPost, ...prev];
      return newList.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
    });
  };

  const editRequest = async () => {
    if (!userInfo?.pid) return;
    const imageProcessPromises: Promise<void>[] = [];
    let objectName = (newContent as Newcomer).objectName ?? "";
    if (newContent.image?.uploadUrl && newContent.image?.file) {
      if (objectName) {
        imageProcessPromises.push(
          deleteImage((newContent as Newcomer).objectName as string)
        );
      }
      objectName = newContent.image.objectName;
      imageProcessPromises.push(
        uploadImage(newContent.image.uploadUrl, newContent.image.file)
      );
    }
    await Promise.all(imageProcessPromises);

    const item = deepCopy(newContent);
    const title = item.name;
    const targetDate = item.registrationDate;

    delete item.registrationDate;
    delete item.name;
    delete item.image;

    const editedPost = await updatePartOfPost(userInfo.pid, {
      id: selectedId,
      title,
      targetDate,
      content: { ...item, objectName },
    });

    setBoardList((prev) =>
      prev.map((item) => (item.id === editedPost.id ? editedPost : item))
    );
  };

  const eduRequest = async () => {
    if (!userInfo?.pid) return;

    const item = deepCopy(newContent);

    delete item.registrationDate;
    delete item.name;
    delete item.image;

    const editedPost = await updatePartOfPost(userInfo.pid, {
      id: selectedId,
      boardName: "newcomer",
      content: { ...item, notes: [...newEdu, newComment] },
    });

    setBoardList((prev) =>
      prev.map((item) => (item.id === editedPost.id ? editedPost : item))
    );
  };

  const climbingRequest = async () => {
    if (!userInfo?.pid) return;

    const item = deepCopy(newContent);

    delete item.registrationDate;
    delete item.name;
    delete item.image;

    const editedPost = await updatePartOfPost(userInfo.pid, {
      id: selectedId,
      boardName: "promotion",
      content: { ...item, climbing: newComment, absence: "" },
    });

    setBoardList((prev) => prev.filter((item) => item.id !== editedPost.id));
  };

  const absenceRequest = async () => {
    if (!userInfo?.pid) return;

    const item = deepCopy(newContent);

    delete item.registrationDate;
    delete item.name;
    delete item.image;

    const editedPost = await updatePartOfPost(userInfo.pid, {
      id: selectedId,
      boardName: "absenteeism",
      content: { ...item, climbing: "", absence: newComment },
    });

    setBoardList((prev) => prev.filter((item) => item.id !== editedPost.id));
  };

  const handleRequest = () => {
    try {
      switch (boardState) {
        case "create":
          createRequest();
          break;
        case "edit":
          editRequest();
          break;
        case "edu":
          eduRequest();
          break;
        case "climbing":
          climbingRequest();
          break;
        case "absence":
          absenceRequest();
          break;
      }
      setBoardState("list");
    } catch (error) {
      console.error("Creation failed:", error);
      toast({
        title: "게시글 작성 실패",
        variant: "destructive",
        duration: 2000,
      });
    }
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
      case "create":
      case "edit":
        return (
          <NewcomerForm
            userPID={userInfo?.pid as string}
            initialData={newContent}
            onSubmit={(data) => {
              setNewContent(data);
            }}
          />
        );
      case "edu":
        return (
          <div className="space-y-6 mb-6">
            <div className="mb-4">
              <Label className="mb-2 block">리더 이름</Label>
              <Input value={newContent.leader} readOnly />
            </div>
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div className="col-span-3">
                <Label className="mb-2 block">이름</Label>
                <Input value={newContent?.name} readOnly />
              </div>

              <div className="col-span-2">
                <Label className="mb-2 block">또래</Label>
                <Input value={newContent.pear} readOnly />
              </div>
            </div>
            <div className="space-y-4">
              {newEdu.length < 5 && (
                <div className="space-y-2">
                  <Label>{newEdu.length + 1}주차 ✓</Label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="교육 내용을 입력하세요"
                    className="resize-none"
                    rows={10}
                  />
                </div>
              )}
              {[...newEdu].reverse().map((edu, index) => (
                <div className="space-y-2">
                  <Label>{`${newEdu.length - index}주차`}</Label>
                  <Textarea
                    value={edu}
                    className="resize-none"
                    rows={calculateRows(edu)}
                    readOnly
                  />
                </div>
              ))}
            </div>
          </div>
        );
      case "climbing":
        return (
          <>
            <Label className="text-base pl-1">
              {newContent.leader}: {newContent.name} 등반 처리
            </Label>
            <CardContent className="px-2 py-1">
              <div className="space-y-2">
                <Label>목양 리더에게 전달할 내용</Label>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="등반을 위한 내용을 입력하세요"
                  className="resize-none"
                  rows={10}
                />
              </div>
            </CardContent>
            {[...newEdu].reverse().map((edu, index) => (
              <CardContent key={index} className="px-2 py-1">
                <div className="space-y-2">
                  <Label>{`${newEdu.length - index}주차`}</Label>
                  <Textarea value={edu} className="resize-none" readOnly />
                </div>
              </CardContent>
            ))}
          </>
        );
      case "absence":
        return (
          <>
            <Label className="text-base pl-1">
              {newContent.leader}: {newContent.name} 장결 처리
            </Label>
            <CardContent className="px-2 py-1">
              <div className="space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="장결 이유를 입력하세요"
                  className="resize-none"
                  rows={10}
                />
              </div>
            </CardContent>
          </>
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
                              onClick={() => handleStateChange("edu", post)}
                            >
                              교육 기록
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStateChange("climbing", post)
                              }
                            >
                              등반 처리
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStateChange("absence", post)}
                            >
                              장결 처리
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStateChange("edit", post)}
                            >
                              정보 수정
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

      <OnlyController
        boardState={boardState}
        setBoardState={setBoardState}
        canWrite={canWrite}
        handleClickCreate={handleClickCreate}
        request={handleRequest}
      />
    </div>
  );
};
