import { type Posts, PostTextMatcher } from "@/api-models/post";
import type { IPraiseForm } from "@/api-models/sub";
import {
  downloadMultipleFiles,
  handleDelete,
  handleMultipleUpload,
} from "@/apis/minio";
import { createPost, getPostList, updatePost } from "@/apis/posts/posts";
import { PraiseForm } from "@/components/page/PraiseForm";
import { MonthController } from "@/components/post/MonthController";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createEditState } from "@/etc/routeWord";
import { useToast } from "@/hooks/use-toast";
import { useGlobalStore } from "@/stores/global.store";
import { deepCopy } from "@/util/deepCopy";
import { Clock } from "lucide-react";
import { useRef, useState } from "react";

const initValue: IPraiseForm = {
  kind: "찬양",
  description: "", // 말씀 제목
  songs: Array(4)
    .fill(null)
    .map(() => ({
      id: Math.random().toString(36).substring(4), // 고유 id 생성
      title: "",
      lyrics: "",
      link: "",
      images: [],
    })),
};

export const PraisePage = ({ boardId }: { boardId: "praise" }) => {
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

  const { toast } = useToast();
  const { userInfo, getCanWriteByDescription } = useGlobalStore();

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
      const filteredSong = newContent.songs.filter(
        (song) => song.title && song.lyrics
      );
      const uploadPromises: File[] = [];

      filteredSong.forEach((song) => {
        song.images?.forEach((image) => {
          if (image.file) {
            uploadPromises.push(image.file);
          }
        });
      });

      const transformedContent = {
        kind: newContent.kind,
        description: newContent.description,
        songs: filteredSong.map((song) => ({
          title: song.title,
          lyrics: song.lyrics,
          link: song.link,
          images: song.images
            ? song.images
                .map((img) => img.objectName)
                .filter((name): name is string => !!name)
            : [],
        })),
      };

      await handleMultipleUpload(uploadPromises);
      const createdPost = await createPost(userInfo.pid, {
        boardName: boardId,
        targetDate: selectedNewContentDate?.toLocaleDateString("fr-CA"),
        content: transformedContent,
      });
      setBoardList((prev) => {
        // 새 게시물을 포함한 전체 배열 생성
        const newList = [createdPost, ...prev];

        // targetDate 기준으로 정렬
        return newList.sort((a, b) => {
          // 문자열 날짜를 Date 객체로 변환하여 비교
          const dateA = new Date(a.targetDate as string).getTime();
          const dateB = new Date(b.targetDate as string).getTime();
          return dateA - dateB; // 오름차순 정렬
        });
      });
      setBoardState("list");
    } catch {
      toast({
        title: "생성 실패",
        duration: 2000,
        variant: "destructive",
      });
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleClickEdit = () => {
    if (!selectedBoard?.targetDate) return;
    // 선택된 아이템 할당하고
    const newContent = deepCopy(selectedBoard.content as IPraiseForm);
    setNewContent(newContent);
    setSelectedNewContentDate(new Date(selectedBoard.targetDate));
    setBoardState("edit");
  };

  const handleClickRequestEdit = async () => {
    if (!userInfo?.pid || !selectedBoard || isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const filteredSong = newContent.songs.filter(
        (song) => song.title && song.lyrics
      );

      const uploadFile: File[] = [];
      const deletePromises: Promise<void>[] = [];

      const originalContent = selectedBoard.content as IPraiseForm;

      originalContent.songs.forEach((originalSong) => {
        // 수정된 content에서 해당 id를 가진 song을 찾음
        const modifiedSong = filteredSong.find(
          (song) => song.id === originalSong.id
        );

        // song이 삭제된 경우 - 모든 이미지 삭제
        if (!modifiedSong && originalSong.images?.length) {
          originalSong.images.forEach((image) => {
            deletePromises.push(handleDelete(image.objectName));
          });
          return;
        }

        // song이 존재하는 경우 - 이미지 비교
        if (modifiedSong && originalSong.images?.length) {
          originalSong.images.forEach((originalImage) => {
            const imageStillExists = modifiedSong.images?.some(
              (modifiedImage) => modifiedImage.id === originalImage.id
            );
            if (!imageStillExists) {
              // 이미지가 삭제된 경우
              deletePromises.push(handleDelete(originalImage.objectName));
            }
          });
        }
      });

      filteredSong.forEach((modifiedSong) => {
        modifiedSong.images?.forEach((image) => {
          if (image.file) {
            uploadFile.push(image.file);
          }
        });
      });

      const transformedContent = {
        kind: newContent.kind,
        description: newContent.description,
        songs: filteredSong.map((song) => ({
          id: song.id,
          title: song.title,
          lyrics: song.lyrics,
          link: song.link,
          images: song.images
            ? song.images.map((img) => img.objectName).filter((name) => name)
            : [],
        })),
      };

      // 모든 업로드와 삭제 작업 실행
      await Promise.allSettled([
        handleMultipleUpload(uploadFile),
        ...deletePromises,
      ]);

      // 게시글 업데이트
      const editedPost = await updatePost(userInfo.pid, {
        ...selectedBoard,
        boardName: boardId,
        targetDate: selectedNewContentDate?.toLocaleDateString("fr-CA"),
        content: transformedContent,
      });

      // 게시글 목록 업데이트
      setBoardList((prev) =>
        prev.map((item) => (item.id === editedPost.id ? editedPost : item))
      );

      setSelectedBoard({ ...selectedBoard, content: newContent } as Posts<
        typeof boardId
      >);
      setBoardState("detail");
    } catch {
      toast({
        title: "수정 실패",
        duration: 2000,
        variant: "destructive",
      });
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleItemDetail = async (post: Posts<typeof boardId>) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const content = post.content;

      for (let i = 0; i < content.songs.length; i++) {
        const song = content.songs[i];

        if (song.images?.length && typeof song.images[0] === "string") {
          // 이미지 다운
          const objectNames = song.images.map((objectName) => objectName);
          const items = await downloadMultipleFiles(objectNames);

          const target = post.content as IPraiseForm;

          // 새로운 Image 객체 배열 생성
          target.songs[i].images = items.map((item, index) => ({
            id: Math.random().toString(36).substring(4),
            preview: window.URL.createObjectURL(item),
            objectName: objectNames[index],
            file: undefined,
          }));
        }
      }
      setSelectedBoard(post);
      setBoardState("detail");
    } catch {
      console.error("가져오기 실패");
    } finally {
      isProcessingRef.current = false;
    }
  };

  const renderContent = () => {
    switch (boardState) {
      case "create":
      case "edit":
        return (
          <PraiseForm
            initialData={newContent}
            onSubmit={(data) => {
              setNewContent(data);
            }}
            userPID={userInfo!.pid}
          />
        );
      case "detail":
        if (selectedBoard) {
          return (
            <PraiseForm
              initialData={selectedBoard.content as IPraiseForm}
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
                      <span>
                        {post.targetDate} {post.content.kind} 콘티
                      </span>
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
          {boardState === "detail"
            ? selectedBoard?.content?.kind
            : PostTextMatcher[boardId]}{" "}
          {createEditState[boardState]}
        </Label>
      </div>

      <div className="page-body mb-2 px-0.5">{renderContent()}</div>

      <MonthController
        boardState={boardState}
        initDate={selectedListDate}
        setBoardState={setBoardState}
        canEdit={canWrite}
        // canEdit={selectedBoard?.createdId === userInfo?.pid}
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
