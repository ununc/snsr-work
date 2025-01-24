import { type Posts, PostTextMatcher } from "@/api-models/post";
import type { ILiturgyForm, ManagedContent } from "@/api-models/sub";
import {
  downloadMultipleFiles,
  handleDelete,
  handleMultipleUpload,
} from "@/apis/minio";
import { createPost, getPostList, updatePost } from "@/apis/posts/posts";
import { LiturgyForm } from "@/components/page/LiturgyForm";
import { MonthController } from "@/components/post/MonthController";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createEditState } from "@/etc/routeWord";
import { useToast } from "@/hooks/use-toast";
import { useGlobalStore } from "@/stores/global.store";
import { deepCopy } from "@/util/deepCopy";
import { Book, Clock } from "lucide-react";
import { useRef, useState } from "react";

const initValue: ILiturgyForm = {
  preach: "",
  bibleVerses: "",
  continuity: "",
  hymn: "",
  images: [],
};

export const LiturgyPage = ({ boardId }: { boardId: "liturgy" }) => {
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
      const objectNameList: string[] = [];
      const FileList: File[] = [];

      for (let i = 0; i < newContent.images.length; i++) {
        const file = newContent.images[i]?.file;
        if (file) {
          objectNameList.push(newContent.images[i].objectName);
          FileList.push(file);
        }
      }

      const transformedContent = {
        ...newContent,
        images: objectNameList,
      };

      await handleMultipleUpload(FileList);
      const createdPost = await createPost(userInfo.pid, {
        boardName: boardId,
        targetDate: selectedNewContentDate?.toLocaleDateString("fr-CA"),
        content: transformedContent,
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

  const handleClickEdit = () => {
    if (!selectedBoard?.targetDate) return;
    const newContent = deepCopy(
      selectedBoard.content as Partial<ILiturgyForm> as ILiturgyForm
    );
    setNewContent(newContent);
    setSelectedNewContentDate(new Date(selectedBoard.targetDate));
    setBoardState("edit");
  };

  const handleClickRequestEdit = async () => {
    if (!userInfo?.pid || !selectedBoard || isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const originalContent = selectedBoard.content
        .images as Partial<ManagedContent> as ManagedContent[];

      const deletePromises: Promise<void>[] = [];

      originalContent?.forEach((originalImage) => {
        const imageStillExists = newContent.images.some(
          (modifiedImage) => modifiedImage.id === originalImage.id
        );
        if (!imageStillExists) {
          deletePromises.push(handleDelete(originalImage.objectName));
        }
      });

      const uploadFile = newContent.images
        .map((image) => image.file)
        .filter((item) => item) as File[];

      const transformedContent = {
        ...newContent,
        images: newContent.images
          .map((img) => img.objectName)
          .filter((name) => name),
      };

      await Promise.allSettled([
        handleMultipleUpload(uploadFile),
        ...deletePromises,
      ]);
      const editedPost = await updatePost(userInfo.pid, {
        ...selectedBoard,
        boardName: boardId,
        targetDate: selectedNewContentDate?.toLocaleDateString("fr-CA"),
        content: transformedContent,
      });

      setBoardList((prev) =>
        prev.map((item) => (item.id === editedPost.id ? editedPost : item))
      );

      setSelectedBoard({
        ...selectedBoard,
        content: newContent,
      } as Partial<ILiturgyForm> as Posts<typeof boardId>);
      setBoardState("detail");
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

  const handleItemDetail = async (post: Posts<typeof boardId>) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const objectNameList = post.content.images;

      if (objectNameList?.length) {
        const items = await downloadMultipleFiles(objectNameList);
        const target = post.content as Partial<ILiturgyForm> as ILiturgyForm;
        target.images = items.map((item, index) => ({
          id: Math.random().toString(36).substring(4),
          preview: window.URL.createObjectURL(item),
          objectName: objectNameList[index],
          file: undefined,
        }));
      }

      setSelectedBoard(post);
      setBoardState("detail");
    } catch {
      toast({
        title: "게시글 가져오기 실패",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      isProcessingRef.current = false;
    }
  };

  const renderContent = () => {
    switch (boardState) {
      case "create":
      case "edit":
        return (
          <LiturgyForm
            initialData={newContent}
            onSubmit={(data: ILiturgyForm) => {
              setNewContent(data);
            }}
            userPID={userInfo!.pid}
          />
        );
      case "detail":
        if (selectedBoard) {
          return (
            <LiturgyForm
              initialData={
                selectedBoard.content as Partial<ILiturgyForm> as ILiturgyForm
              }
              onSubmit={() => {}}
              userPID={userInfo!.pid}
              readonly
            />
          );
        }
        return <div>선택한 게시물 정보가 없습니다.</div>;
      default:
        return (
          <div className="space-y-2.5">
            {boardList.map((post) => (
              <Card
                key={post.id}
                className="w-full transition-all hover:shadow-md cursor-pointer"
                onClick={() => handleItemDetail(post)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center text-lg font-medium">
                      <span>{post.targetDate} 예배 스크립트</span>
                    </div>

                    <div className="flex items-center pl-2 text-gray-600">
                      <Book className="w-4 h-4 mr-2" />
                      <span>{post.content.preach}</span>
                    </div>

                    <div className="flex justify-end items-center pt-2 border-t text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        작성일:{" "}
                        {new Date(post.createdAt).toLocaleDateString("fr-CA")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
    }
  };

  const canWrite = getCanWriteByDescription(boardId);

  return (
    <div className="page-wrapper">
      <div className="h-4 flex items-center mb-4">
        <Label className="text-xl font-bold">
          {boardState === "detail" && selectedBoard?.targetDate}{" "}
          {PostTextMatcher[boardId]} {createEditState[boardState]}
        </Label>
      </div>

      <div className="page-body mb-2 px-0.5">{renderContent()}</div>

      <MonthController
        boardState={boardState}
        initDate={selectedListDate}
        setBoardState={setBoardState}
        canEdit={selectedBoard?.createdId === userInfo?.pid}
        canWrite={canWrite}
        initRequestDate={selectedNewContentDate}
        handleClickEdit={handleClickEdit}
        handleClickCreate={handleClickCreate}
        handleClickRequestEdit={handleClickRequestEdit}
        handleClickRequestCreate={handleClickRequestCreate}
        changeYearMonth={changeYearMonth}
        changeRequestYearMonth={changeRequestYearMonth}
      />
    </div>
  );
};
