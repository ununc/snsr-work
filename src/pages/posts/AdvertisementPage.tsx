import { BoardName, Posts, PostTextMatcher } from "@/api-models/post";
import type { Advertisement, ContentType } from "@/api-models/sub";
import { deleteImage, getDownloadUrl, uploadImage } from "@/apis/minio/images";
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
import { useState } from "react";

interface ContentItem {
  id: string;
  type: ContentType;
  objectPath: string;
  file?: File;
  preview: string;
  uploadUrl?: string;
}

interface Advertisements extends Advertisement {
  contents: ContentItem[];
  title: string;
}

const initValue: Advertisements = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  contents: [],
};

export const AdvertisementPage = ({ boardId }: { boardId: BoardName }) => {
  const [boardState, setBoardState] = useState<
    "list" | "detail" | "create" | "edit"
  >("list");

  const [boardList, setBoardList] = useState<Posts[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Posts | null>(null);
  const [selectedListDate, setSelectedListDate] = useState<Date | null>(null);
  const [newContent, setNewContent] = useState(initValue);

  const { userInfo, getCanWriteByDescription } = useGlobalStore();
  const { toast } = useToast();
  const isEmpty = (advertisement: Advertisements): boolean => {
    const fieldsToCheck: (keyof Omit<Advertisements, "contents">)[] = [
      "title",
      "description",
      "startDate",
      "endDate",
    ];

    return fieldsToCheck.some((field) => advertisement[field].trim() === "");
  };

  const changeYearMonth = async (date: Date) => {
    if (selectedListDate?.getMonth() !== date?.getMonth()) {
      setSelectedListDate(date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const result = await getAdvertisementList(`${year}-${month}`);
      setBoardList(result);
    }
  };

  const changeRequestYearMonth = () => {};

  const handleClickCreate = () => {
    setNewContent(initValue);
    setBoardState("create");
  };

  const handleClickRequestCreate = async () => {
    if (!userInfo?.pid) return;
    if (isEmpty(newContent)) {
      toast({
        title: "빈 필드가 존재합니다.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    const uploadPromises: Promise<void>[] = [];

    // 모든 컨텐츠에 대한 업로드 처리
    newContent.contents.forEach((content) => {
      if (content.uploadUrl && content.file) {
        uploadPromises.push(uploadImage(content.uploadUrl, content.file));
      }
    });

    try {
      const transformedContent = {
        description: newContent.description,
        startDate: newContent.startDate,
        endDate: newContent.endDate,
        contents: newContent.contents
          .filter((item) => item.objectPath)
          .map((content) => ({
            type: content.type,
            objectPath: content.objectPath,
          })),
      };

      await Promise.all(uploadPromises);
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
    }
  };

  const handleClickEdit = async () => {
    if (!selectedBoard) return;
    const newContent = deepCopy(selectedBoard.content as Advertisements);
    setNewContent({ ...newContent, title: selectedBoard.title as string });
    setBoardState("edit");
  };

  const handleClickRequestEdit = async () => {
    if (!userInfo?.pid || !selectedBoard) return;
    if (isEmpty(newContent)) {
      toast({
        title: "빈 필드가 존재합니다.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    const uploadPromises: Promise<void>[] = [];
    const deletePromises: Promise<void>[] = [];

    const originalContent = selectedBoard.content as Advertisement;
    const modifiedContent = newContent;

    // 삭제된 컨텐츠 처리
    originalContent.contents.forEach((original) => {
      const contentStillExists = modifiedContent.contents.some(
        (content) => content.objectPath === original.objectPath
      );
      if (!contentStillExists) {
        deletePromises.push(deleteImage(original.objectPath));
      }
    });

    // 새로운 컨텐츠 업로드 처리
    modifiedContent.contents.forEach((content) => {
      if (content.file && content.uploadUrl) {
        uploadPromises.push(uploadImage(content.uploadUrl, content.file));
      }
    });

    try {
      const transformedContent = {
        description: modifiedContent.description,
        startDate: modifiedContent.startDate,
        endDate: modifiedContent.endDate,
        contents: modifiedContent.contents
          .filter((item) => item.objectPath)
          .map((content) => ({
            type: content.type,
            objectPath: content.objectPath,
          })),
      };

      await Promise.all([...uploadPromises, ...deletePromises]);

      const editedPost = await updatePost(userInfo.pid, {
        ...selectedBoard,
        boardName: boardId,
        title: modifiedContent.title,
        content: transformedContent,
      });

      setBoardList((prev) =>
        prev.map((item) => (item.id === editedPost.id ? editedPost : item))
      );

      setSelectedBoard({ ...selectedBoard, content: newContent } as Posts);
      setBoardState("detail");
    } catch (error) {
      console.error("광고 수정 실패:", error);
    }
  };

  const handleItemDetail = async (post: Posts) => {
    const content = post.content as Advertisement;

    // contents 배열의 각 항목에 대해 다운로드 URL 가져오기
    if (content.contents && content.contents.length > 0) {
      const downloadUrlPromises = content.contents.map((object) =>
        getDownloadUrl(object.objectPath)
      );
      const downloadUrls = await Promise.all(downloadUrlPromises);

      // 새로운 ContentItem 배열 생성
      const newContents: ContentItem[] = downloadUrls.map((preview, index) => ({
        id: Math.random().toString(36).substring(4),
        type: content.contents[index].type, // 파일 확장자로 타입 추정
        objectPath: content.contents[index].objectPath,
        preview,
      }));

      const contentWithPreviews = {
        ...content,
        contents: newContents,
      };

      setSelectedBoard({
        ...post,
        content: contentWithPreviews,
      });
    } else {
      setSelectedBoard(post);
    }
    setBoardState("detail");
  };

  const renderContent = () => {
    switch (boardState) {
      case "create":
      case "edit":
        return (
          <AdvertisementForm
            initialData={newContent}
            onSubmit={(data: Advertisements) => {
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
                ...(selectedBoard.content as Advertisements),
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
              const content = post.content as Advertisements;
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
