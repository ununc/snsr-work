/* eslint-disable @typescript-eslint/no-explicit-any */
import { BoardName, Posts, PostTextMatcher } from "@/api-models/post";
import type { Liturgy } from "@/api-models/sub";
import { deleteImage, getDownloadUrl, uploadImage } from "@/apis/minio/images";
import { createPost, getPostList, updatePost } from "@/apis/posts/posts";
import { type ImageFile, ImageList } from "@/components/ImageList";
import { MonthController } from "@/components/post/MonthController";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEditState } from "@/etc/routeWord";
import { useToast } from "@/hooks/use-toast";
import { useGlobalStore } from "@/stores/global.store";
import { deepCopy } from "@/util/deepCopy";
import { Book, Calendar, Clock } from "lucide-react";
import { useState } from "react";

type LiturgyWithoutImages = Omit<Liturgy, "images">;

const initValue: LiturgyWithoutImages = {
  preach: "", // 말씀 제목
  bibleVerses: "", // 본문 말씀
  continuity: "", // 콘티
  hymn: "", // 적용 찬양
};

export const LiturgyPage = ({ boardId }: { boardId: BoardName }) => {
  const [boardState, setBoardState] = useState<
    "list" | "detail" | "create" | "edit"
  >("list");

  const [boardList, setBoardList] = useState<Posts[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Posts | null>(null);

  const [selectedListDate, setSelectedListDate] = useState<Date | null>(null);

  const [newContent, setNewContent] = useState(initValue);
  const [selectedNewContentDate, setSelectedNewContentDate] =
    useState<Date | null>(null);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  const { userInfo, getCanWriteByDescription } = useGlobalStore();
  const { toast } = useToast();

  const isEmptyExist = (): boolean => {
    const filed = ["말씀 제목", "말씀 구절", "설교 콘티", "적용 찬양"];
    const values = Object.values(newContent);
    for (let i = 0; i < values.length; i++) {
      if (!values[i]) {
        toast({
          title: `${filed[i]}이 비있습니다.`,
          variant: "destructive",
          duration: 2000,
          className: "top-4 right-4 fixed w-54",
        });
        return true;
      }
    }
    return false;
  };

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
    setImageFiles([]);
    setBoardState("create");
  };

  const handleClickRequestCreate = async () => {
    if (!userInfo?.pid) return;
    if (isEmptyExist()) return;
    const uploadPromises = [];

    for (const image of imageFiles) {
      if (image.file) {
        uploadPromises.push(uploadImage(image.objectName, image.file));
      }
    }
    try {
      await Promise.all(uploadPromises);
      const createdPost = await createPost(userInfo.pid, {
        boardName: boardId,
        targetDate: selectedNewContentDate?.toLocaleDateString("fr-CA"),
        content: {
          ...newContent,
          images: imageFiles.map((image) => image.objectName),
        },
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
    const newContent = deepCopy(selectedBoard.content as Liturgy);
    if (newContent?.images?.length) {
      setImageFiles(newContent?.images as any);
    } else {
      setImageFiles([]);
    }
    setNewContent(newContent);
    setSelectedNewContentDate(new Date(selectedBoard.targetDate));
    setBoardState("edit");
  };

  const handleClickRequestEdit = async () => {
    if (!userInfo?.pid) return;
    if (isEmptyExist()) return;

    const uploadPromises = [];
    for (const image of imageFiles) {
      if (image.file) {
        uploadPromises.push(uploadImage(image.objectName, image.file));
      }
    }
    const deletePromise = [];
    const images = (selectedBoard?.content as any).images;
    if (images?.length) {
      for (const img of images) {
        const result = imageFiles?.find((element) => element.id === img.id);
        if (!result) {
          deletePromise.push(deleteImage(img.objectName));
        }
      }
    }
    await Promise.all([...uploadPromises, ...deletePromise]);

    const editedPost = await updatePost(userInfo.pid, {
      ...selectedBoard,
      boardName: boardId,
      targetDate: selectedNewContentDate?.toLocaleDateString("fr-CA"),
      content: {
        ...newContent,
        images: imageFiles.map((image) => image.objectName),
      },
    });
    setBoardList((prev) =>
      prev.map((item) => (item.id === editedPost.id ? editedPost : item))
    );
    await handleItemDetail(editedPost);
  };

  const handleChangeValue = (
    field: string,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewContent((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleItemDetail = async (post: Posts) => {
    const content = post.content as Liturgy;
    if (content?.images?.length) {
      const downloadUrl = [];
      for (const image of content.images) {
        downloadUrl.push(getDownloadUrl(image));
      }
      const result = await Promise.all(downloadUrl);

      (post.content as { [key: string]: any }).images = result.map(
        (url, index) => ({
          id: Math.random().toString(36).substring(4),
          preview: url,
          objectName: content.images![index],
        })
      );
    }
    setSelectedBoard(post);
    setBoardState("detail");
  };

  const calculateRows = (text: string) => {
    if (!text) return 1;
    // 줄바꿈 문자(\n)의 개수를 세고 1을 더합니다 (마지막 줄)
    return (text.match(/\n/g) || []).length + 1;
  };

  const renderContent = () => {
    switch (boardState) {
      case "create":
      case "edit":
        return (
          <>
            <div className="mb-4">
              <Label className="mb-2 block">말씀 제목</Label>
              <Input
                placeholder="사랑으로 세우는 공동체"
                value={newContent.preach}
                onChange={(e) => handleChangeValue("preach", e)}
              />
            </div>
            <div className="mb-4">
              <Label className="mb-2 block">말씀 구절</Label>
              <Input
                placeholder="마태복음 22장 34절~40절"
                value={newContent.bibleVerses}
                onChange={(e) => handleChangeValue("bibleVerses", e)}
              />
            </div>
            <div className="mb-4">
              <Label className="mb-2 block">설교 콘티</Label>
              <Textarea
                value={newContent.continuity}
                placeholder="시편 96:5-6"
                rows={6}
                onChange={(e) => handleChangeValue("continuity", e)}
              />
            </div>
            <div className="mb-4">
              <Label className="mb-2 block">적용 찬양</Label>
              <Input
                value={newContent.hymn}
                placeholder="하나님의 부르심"
                onChange={(e) => handleChangeValue("hymn", e)}
              />
            </div>
            <div className="mb-4">
              <Label className="mb-2 block">참고 이미지</Label>
              <ImageList
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
                userPID={userInfo!.pid}
              />
            </div>
          </>
        );
      case "detail":
        if (selectedBoard) {
          const content = selectedBoard.content as Liturgy;
          return (
            <>
              <div className="flex items-center pb-4 gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{selectedBoard.targetDate}</span>
              </div>

              <div className="mb-4">
                <Label className="mb-2 block">말씀 제목</Label>
                <Input readOnly value={content.preach} />
              </div>

              <div className="mb-4">
                <Label className="mb-2 block">말씀 구절</Label>
                <Input readOnly value={content.bibleVerses} />
              </div>

              <div className="mb-4">
                <Label className="mb-2 block">설교 콘티</Label>
                <Textarea
                  readOnly
                  value={content.continuity}
                  className=" resize-none"
                  rows={calculateRows(content.continuity)}
                />
              </div>

              <div className="mb-4">
                <Label className="mb-2 block">적용 찬양</Label>
                <Input readOnly value={content.hymn} />
              </div>
              <div className="grid gap-4">
                {(content.images as any)?.map((img: ImageType) => (
                  <div
                    key={img.id}
                    className="relative w-full border rounded-lg overflow-hidden"
                  >
                    <img
                      src={img.preview}
                      alt="Preview"
                      className="w-full h-96 object-contain"
                    />
                  </div>
                ))}
              </div>
            </>
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

interface ImageType {
  id: string;
  preview: string;
}
