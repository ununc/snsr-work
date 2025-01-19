import { BoardName, Posts, PostTextMatcher } from "@/api-models/post";
import type { Liturgy } from "@/api-models/sub";
import { deleteImage, getDownloadUrl, uploadImage } from "@/apis/minio/images";
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

interface LiturgyWithoutImages {
  preach: string;
  bibleVerses: string;
  continuity: string;
  hymn: string;
  images?: {
    id: string;
    file?: File;
    preview: string;
    uploadUrl?: string;
    objectName: string;
  }[];
}

const initValue: LiturgyWithoutImages = {
  preach: "",
  bibleVerses: "",
  continuity: "",
  hymn: "",
  images: [],
};

export const LiturgyPage = ({ boardId }: { boardId: BoardName }) => {
  const [boardState, setBoardState] = useState<
    "list" | "detail" | "create" | "edit"
  >("list");
  const [boardList, setBoardList] = useState<Posts[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Posts | null>(null);
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
      const uploadPromises: Promise<void>[] = [];
      newContent.images?.forEach((image) => {
        if (image.objectName && image.file) {
          uploadPromises.push(
            uploadImage(image.uploadUrl as string, image.file)
          );
        }
      });
      await Promise.all(uploadPromises);
      const transformedContent = {
        ...newContent,
        images: newContent.images
          ? newContent.images.map((img) => img.objectName).filter(Boolean)
          : [],
      };

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
    const newContent = deepCopy(selectedBoard.content as LiturgyWithoutImages);
    setNewContent(newContent);
    setSelectedNewContentDate(new Date(selectedBoard.targetDate));
    setBoardState("edit");
  };

  const handleClickRequestEdit = async () => {
    if (!userInfo?.pid || !selectedBoard || isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const uploadPromises: Promise<void>[] = [];
      const deletePromises: Promise<void>[] = [];

      const originalContent = selectedBoard.content as LiturgyWithoutImages;
      const modifiedContent = newContent;

      // Handle image changes
      const originalImages = originalContent.images || [];
      const modifiedImages = modifiedContent.images || [];

      originalImages.forEach((originalImage) => {
        const imageStillExists = modifiedImages.some(
          (modifiedImage) => modifiedImage.id === originalImage.id
        );
        if (!imageStillExists) {
          deletePromises.push(deleteImage(originalImage.objectName));
        }
      });

      modifiedImages.forEach((modifiedImage) => {
        if (modifiedImage.file && modifiedImage.uploadUrl) {
          uploadPromises.push(
            uploadImage(modifiedImage.uploadUrl, modifiedImage.file)
          );
        }
      });
      const transformedContent = {
        ...modifiedContent,
        images: modifiedImages.map((img) => img.objectName).filter(Boolean),
      };

      await Promise.all([...uploadPromises, ...deletePromises]);

      const editedPost = await updatePost(userInfo.pid, {
        ...selectedBoard,
        boardName: boardId,
        targetDate: selectedNewContentDate?.toLocaleDateString("fr-CA"),
        content: transformedContent,
      });

      setBoardList((prev) =>
        prev.map((item) => (item.id === editedPost.id ? editedPost : item))
      );

      setSelectedBoard({ ...selectedBoard, content: newContent } as Posts);
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

  const handleItemDetail = async (post: Posts) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const content = post.content as Liturgy;
      if (content?.images?.length) {
        const downloadUrls = await Promise.all(
          content.images.map((objectName) => getDownloadUrl(objectName))
        );

        (post.content as LiturgyWithoutImages).images = downloadUrls.map(
          (preview, index) => ({
            id: Math.random().toString(36).substring(4),
            preview,
            objectName: content.images![index],
          })
        );
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
            onSubmit={(data: LiturgyWithoutImages) => {
              setNewContent(data);
            }}
            userPID={userInfo!.pid}
          />
        );
      case "detail":
        if (selectedBoard) {
          return (
            <LiturgyForm
              initialData={selectedBoard.content as LiturgyWithoutImages}
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
                      <span>{(post.content as Liturgy).preach}</span>
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
