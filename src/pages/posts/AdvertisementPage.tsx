import { Posts, PostTextMatcher } from "@/api-models/post";
import type { IAdvertisementForm, ManagedContent } from "@/api-models/sub";
import {
  downloadMultipleFiles,
  handleDelete,
  handleMultipleUpload,
} from "@/apis/minio";
import {
  createPost,
  getAdvertisementList,
  updatePost,
} from "@/apis/posts/posts";
import { AdvertisementForm } from "@/components/page/AdvertisementForm";
import { MonthController } from "@/components/post/MonthController";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createEditState } from "@/etc/routeWord";
import { useToast } from "@/hooks/use-toast";
import { useGlobalStore } from "@/stores/global.store";
import { deepCopy } from "@/util/deepCopy";
import { Clock } from "lucide-react";
import { useRef, useState } from "react";

const initValue: IAdvertisementForm = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  contents: [],
};

export const AdvertisementPage = ({
  boardId,
}: {
  boardId: "advertisement";
}) => {
  const [boardState, setBoardState] = useState<
    "list" | "detail" | "create" | "edit"
  >("list");

  const [boardList, setBoardList] = useState<Posts<typeof boardId>[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Posts<
    typeof boardId
  > | null>(null);
  const [selectedListDate, setSelectedListDate] = useState<Date>(new Date());
  const [newContent, setNewContent] = useState(initValue);
  const isProcessingRef = useRef(false);

  const { userInfo, getCanWriteByDescription } = useGlobalStore();
  const { toast } = useToast();

  const isEmpty = (advertisement: IAdvertisementForm): boolean => {
    const fieldsToCheck: (keyof Omit<IAdvertisementForm, "contents">)[] = [
      "title",
      "description",
      "startDate",
      "endDate",
    ];

    return fieldsToCheck.some((field) => advertisement[field].trim() === "");
  };

  const changeYearMonth = async (date: Date) => {
    setSelectedListDate(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const result = await getAdvertisementList(`${year}-${month}`);
    setBoardList(result);
  };

  const changeRequestYearMonth = () => {};

  const handleClickCreate = () => {
    setNewContent(initValue);
    setBoardState("create");
  };

  const handleClickRequestCreate = async () => {
    if (isEmpty(newContent)) {
      toast({
        title: "빈 필드가 존재합니다.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (!userInfo?.pid || isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const objectNameList: string[] = [];
      const FileList: File[] = [];

      for (let i = 0; i < newContent.contents.length; i++) {
        const file = newContent.contents[i]?.file;
        if (file) {
          objectNameList.push(newContent.contents[i].objectName);
          FileList.push(file);
        }
      }
      const transformedContent = {
        description: newContent.description,
        startDate: newContent.startDate,
        endDate: newContent.endDate,
        contents: newContent.contents
          .map((content) => content.objectName)
          .filter((item) => item),
      };

      await handleMultipleUpload(FileList);
      const createdPost = await createPost(userInfo.pid, {
        boardName: boardId,
        title: newContent.title,
        content: transformedContent,
      });

      setBoardList((prev) => {
        const newList = [createdPost, ...prev];
        return newList.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB;
        });
      });
      setBoardState("list");
    } catch (error) {
      console.error("광고 생성 실패:", error);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleClickEdit = () => {
    if (!selectedBoard) return;
    const newContent = deepCopy(
      selectedBoard.content as Partial<
        Posts<typeof boardId>
      > as IAdvertisementForm
    );
    setNewContent({ ...newContent, title: selectedBoard.title as string });
    setBoardState("edit");
  };

  const handleClickRequestEdit = async () => {
    if (isEmpty(newContent)) {
      toast({
        title: "빈 필드가 존재합니다.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    if (!userInfo?.pid || !selectedBoard || isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const originalContent = selectedBoard.content
        .contents as Partial<ManagedContent> as ManagedContent[];

      const deletePromises: Promise<void>[] = [];

      originalContent?.forEach((originalImage) => {
        const imageStillExists = newContent.contents.some(
          (modifiedImage) => modifiedImage.id === originalImage.id
        );
        if (!imageStillExists) {
          deletePromises.push(handleDelete(originalImage.objectName));
        }
      });

      const uploadFile = newContent.contents
        .map((image) => image.file)
        .filter((item) => item) as File[];

      const transformedContent = {
        description: newContent.description,
        startDate: newContent.startDate,
        endDate: newContent.endDate,
        contents: newContent.contents
          .map((content) => content.objectName)
          .filter((item) => item),
      };

      await Promise.allSettled([
        handleMultipleUpload(uploadFile),
        ...deletePromises,
      ]);

      const editedPost = await updatePost(userInfo.pid, {
        ...selectedBoard,
        boardName: boardId,
        title: newContent.title,
        content: transformedContent,
      });

      setBoardList((prev) =>
        prev.map((item) => (item.id === editedPost.id ? editedPost : item))
      );

      setSelectedBoard({
        ...selectedBoard,
        title: newContent.title,
        content: newContent,
      } as Partial<IAdvertisementForm> as Posts<typeof boardId>);
      setBoardState("detail");
    } catch (error) {
      console.error("광고 수정 실패:", error);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleItemDetail = async (post: Posts<typeof boardId>) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const objectNameList = post.content.contents;

      if (objectNameList?.length && typeof objectNameList[0] === "string") {
        const items = await downloadMultipleFiles(objectNameList);
        const target = post.content as Partial<
          Posts<typeof boardId>
        > as IAdvertisementForm;
        target.contents = items.map((item, index) => ({
          id: Math.random().toString(36).substring(4),
          preview: window.URL.createObjectURL(item),
          objectName: objectNameList[index],
          file: undefined,
          type: item.type,
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
          <AdvertisementForm
            initialData={newContent}
            onSubmit={(data: IAdvertisementForm) => {
              setNewContent(data);
            }}
            userPID={userInfo!.pid}
          />
        );
      case "detail":
        if (selectedBoard) {
          return (
            <AdvertisementForm
              initialData={{
                ...(selectedBoard.content as Partial<
                  Posts<typeof boardId>
                > as IAdvertisementForm),
                title: selectedBoard.title as string,
              }}
              onSubmit={() => {}}
              userPID={userInfo!.pid}
              readonly
            />
          );
        }
        return <div>선택한 광고 정보가 없습니다.</div>;
      default:
        return (
          <div className="space-y-2.5">
            {boardList.map((post) => {
              const content = post.content;
              return (
                <Card
                  key={post.id}
                  className="w-full transition-all hover:shadow-md cursor-pointer"
                  onClick={() => handleItemDetail(post)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center text-lg font-medium">
                        <span>{post.title}</span>
                      </div>
                      <div className="flex justify-end items-center pt-2 border-t text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          적용 기간: {content.startDate} ~ {content.endDate}
                        </span>
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

  const canWrite = getCanWriteByDescription(boardId);

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
        canEdit={selectedBoard?.createdId === userInfo?.pid}
        canWrite={canWrite}
        initRequestDate={null}
        handleClickEdit={handleClickEdit}
        handleClickCreate={handleClickCreate}
        handleClickRequestEdit={handleClickRequestEdit}
        handleClickRequestCreate={handleClickRequestCreate}
        changeYearMonth={changeYearMonth}
        changeRequestYearMonth={changeRequestYearMonth}
        noDateCreateEdit
      />
    </div>
  );
};
