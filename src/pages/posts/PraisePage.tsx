import { BoardName, Posts, PostTextMatcher } from "@/api-models/post";
import type { Praise } from "@/api-models/sub";
import { deleteImage, getDownloadUrl, uploadImage } from "@/apis/minio/images";
import { createPost, getPostList, updatePost } from "@/apis/posts/posts";
import { PraiseForm } from "@/components/page/PraiseForm";
import { MonthController } from "@/components/post/MonthController";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createEditState } from "@/etc/routeWord";
import { useGlobalStore } from "@/stores/global.store";
import { deepCopy } from "@/util/deepCopy";
import { Clock } from "lucide-react";
import { useState } from "react";

type SongItemWithoutImages = Omit<Praise, "songs"> & {
  songs: {
    title: string;
    lyrics: string;
    images?: {
      id: string;
      file?: File;
      preview: string;
      uploadUrl?: string;
      objectName: string;
    }[];
    link?: string;
  }[];
};

const initValue: SongItemWithoutImages = {
  description: "", // 말씀 제목
  songs: [
    {
      title: "",
      lyrics: "",
      link: "",
      images: [],
    },
    {
      title: "",
      lyrics: "",
      link: "",
      images: [],
    },
    {
      title: "",
      lyrics: "",
      link: "",
      images: [],
    },
    {
      title: "",
      lyrics: "",
      link: "",
      images: [],
    },
  ],
};

export const PraisePage = ({ boardId }: { boardId: BoardName }) => {
  const [boardState, setBoardState] = useState<
    "list" | "detail" | "create" | "edit"
  >("list");

  const [boardList, setBoardList] = useState<Posts[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Posts | null>(null);

  const [selectedListDate, setSelectedListDate] = useState<Date | null>(null);

  const [newContent, setNewContent] = useState(initValue);
  const [selectedNewContentDate, setSelectedNewContentDate] =
    useState<Date | null>(null);

  const { userInfo, getCanWriteByDescription } = useGlobalStore();

  const changeYearMonth = async (date: Date) => {
    if (selectedListDate?.getMonth() !== date?.getMonth()) {
      setSelectedListDate(date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const result = await getPostList(boardId, `${year}-${month}`);
      setBoardList(result);
    }
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
    setBoardState("create");
  };

  const handleClickRequestCreate = async () => {
    if (!userInfo?.pid) return;
    const uploadPromises: Promise<void>[] = [];

    newContent.songs.forEach((song) => {
      song.images?.forEach((image) => {
        if (image.objectName && image.file) {
          uploadPromises.push(
            uploadImage(image.uploadUrl as string, image.file)
          );
        }
      });
    });
    try {
      const transformedContent = {
        description: newContent.description,
        songs: newContent.songs.map((song) => ({
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

      await Promise.all(uploadPromises);
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
      console.error("요청 실패");
    }
  };

  const handleClickEdit = async () => {
    if (!selectedBoard?.targetDate) return;
    // 선택된 아이템 할당하고
    const newContent = deepCopy(selectedBoard.content as SongItemWithoutImages);
    setNewContent(newContent);
    setSelectedNewContentDate(new Date(selectedBoard.targetDate));
    setBoardState("edit");
  };

  const handleClickRequestEdit = async () => {
    if (!userInfo?.pid || !selectedBoard) return;
    const uploadPromises: Promise<void>[] = [];
    const deletePromises: Promise<void>[] = [];

    const originalContent = selectedBoard.content as SongItemWithoutImages;
    const modifiedContent = newContent as SongItemWithoutImages;

    // 각 song을 순회하면서 이미지 변경사항 확인
    originalContent.songs.forEach((originalSong, songIndex) => {
      const originalImages = originalSong.images || [];
      const modifiedImages = modifiedContent.songs[songIndex].images || [];

      // 원본 이미지 중 수정된 content에 없는 이미지 찾기 (삭제된 이미지)
      if (typeof originalImages[0] === "object") {
        const originalImageObjects = originalImages;
        originalImageObjects.forEach((originalImage) => {
          const imageStillExists = modifiedImages.some(
            (modifiedImage) => modifiedImage.id === originalImage.id
          );
          if (!imageStillExists) {
            // 삭제 대상 이미지 발견
            deletePromises.push(deleteImage(originalImage.objectName));
          }
        });
      }

      // 수정된 content의 이미지 중 새로 추가된 이미지 찾기
      modifiedImages.forEach((modifiedImage) => {
        if (modifiedImage.file && modifiedImage.uploadUrl) {
          // 새로 추가된 이미지 발견
          uploadPromises.push(
            uploadImage(modifiedImage.uploadUrl as string, modifiedImage.file)
          );
        }
      });
    });

    try {
      const transformedContent = {
        description: modifiedContent.description,
        songs: modifiedContent.songs.map((song) => ({
          title: song.title,
          lyrics: song.lyrics,
          link: song.link,
          // images 배열을 objectName만 포함하는 string[]로 변환
          images: song.images
            ? song.images
                .map((img) => img.objectName)
                .filter((name): name is string => !!name)
            : [],
        })),
      };

      // 모든 업로드와 삭제 작업 실행
      await Promise.all([...uploadPromises, ...deletePromises]);

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

      setSelectedBoard({ ...selectedBoard, content: newContent } as Posts);
      setBoardState("detail");
    } catch (error) {
      console.error("Error during edit process:", error);
      // 에러 처리 로직 추가 (예: 에러 메시지 표시)
    }
  };

  const handleItemDetail = async (post: Posts) => {
    const content = post.content as Praise;

    for (let i = 0; i < content.songs.length; i++) {
      const song = content.songs[i];

      // images가 존재하는 경우에만 처리
      if (song.images && song.images.length > 0) {
        // 모든 이미지에 대한 다운로드 URL을 병렬로 가져오기
        const downloadUrlPromises = song.images.map((objectName) =>
          getDownloadUrl(objectName)
        );
        const downloadUrls = await Promise.all(downloadUrlPromises);

        const target = post.content as SongItemWithoutImages;

        // 새로운 Image 객체 배열 생성
        target.songs[i].images = downloadUrls.map((preview, index) => ({
          id: Math.random().toString(36).substring(4),
          preview,
          objectName: song.images![index],
        }));
      }
    }

    setSelectedBoard(post);
    setBoardState("detail");
  };

  const renderContent = () => {
    switch (boardState) {
      case "create":
      case "edit":
        return (
          <PraiseForm
            initialData={newContent}
            onSubmit={(data: SongItemWithoutImages) => {
              setNewContent(data);
            }}
            userPID={userInfo!.pid}
          />
        );
      case "detail":
        if (selectedBoard) {
          return (
            <PraiseForm
              initialData={selectedBoard.content as SongItemWithoutImages}
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
                      <span>{post.targetDate} 찬양 콘티</span>
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
          {PostTextMatcher[boardId]} {createEditState[boardState]}
        </Label>
      </div>

      <div className="page-body mb-2 px-0.5">{renderContent()}</div>

      <MonthController
        boardState={boardState}
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
