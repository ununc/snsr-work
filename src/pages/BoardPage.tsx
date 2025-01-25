import {
  BoardAllFiled,
  createBoard,
  deleteBoard,
  editBoard,
  getBoard,
  getBoardsSplit,
  ResponseBoardDto,
} from "@/apis/board/board";
import {
  downloadMultipleFiles,
  handleDelete,
  handleMultipleUpload,
} from "@/apis/minio";
import { EditButton } from "@/components/EditButton";
import { Editor } from "@/components/editor/Editor";
import { PreviewEditor } from "@/components/editor/Preview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { pathTextMatcher } from "@/etc/routeWord";
import { useChangedStringStore } from "@/stores/editor.store";
import { useGlobalStore } from "@/stores/global.store";
import { useImageStore } from "@/stores/tempImage.store";
import { Label } from "@radix-ui/react-label";
import { ChevronRight, Trash2 } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

const init = `{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}`;
type BoardId = keyof typeof pathTextMatcher;

export const BoardPage = ({ boardId }: { boardId: BoardId }) => {
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [list, setList] = useState<ResponseBoardDto[]>([]);

  const [objectNames, setObjectNames] = useState<{
    minioPath: string[];
    tempDown: string[];
  }>({
    minioPath: [],
    tempDown: [],
  });
  const [selectedBoard, setSelectedBoard] = useState<BoardAllFiled | null>(
    null
  );

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const { text } = useChangedStringStore();
  const { pendingImages } = useImageStore();
  const { userInfo, getCanWriteByDescription } = useGlobalStore();
  const [initText, setInitText] = useState("");

  // 리스트 초기화 함수
  const resetList = () => {
    setList([]);
    setPage(1);
    setTotal(0);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTitle(value);
  };

  const objectNameList = (str: string) => {
    const pattern = /"src":"([^"]+)"/g;
    return [...str.matchAll(pattern)].map((match) => match[1]);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const FileList: File[] = [];
      let currentText = text;

      for (const image of pendingImages) {
        if (currentText.includes(image.preview)) {
          currentText = currentText.replace(image.preview, image.objectName);
          FileList.push(image.file as File);
        }
      }

      await handleMultipleUpload(FileList);
      await createBoard({
        title,
        content: currentText,
        isTemplate: false,
        boardId,
        authorId: userInfo?.pid ?? "",
        onlyAuthorCanModify: false,
      });
      resetList();
      await fetchList();
      handleCancel();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClickCreate = () => {
    setInitText("");
    setIsCreate(true);
  };

  const handleCancel = () => {
    if (initText) {
      setSelectedBoard((prev) => {
        if (prev) {
          return {
            ...prev,
            content: initText,
          };
        }
        return null;
      });
    }
    setIsCreate(false);
    setIsEdit(false);
    setTitle("");

    setObjectNames({
      minioPath: [],
      tempDown: [],
    });
  };

  const fetchList = async () => {
    try {
      setIsLoading(true);
      const data = await getBoardsSplit(boardId, page, limit);

      if (page === 1) {
        setList(data.items);
      } else {
        setList((prev) => [...prev, ...data.items]);
      }
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = async (id: string) => {
    const board = await getBoard(id);
    const result = objectNameList(board.content);

    const imageFiles = await downloadMultipleFiles(result);
    const urls = imageFiles.map((file) => window.URL.createObjectURL(file));
    setObjectNames({
      minioPath: result,
      tempDown: urls,
    });

    for (let i = 0; i < result.length; i++) {
      board.content = board.content.replace(result[i], urls[i]);
    }
    setSelectedBoard(board);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const deletePromises: Promise<void>[] = [];
      const FileList: File[] = [];
      let currentText = text;

      for (let i = 0; i < objectNames.tempDown.length; i++) {
        if (currentText.includes(objectNames.tempDown[i])) {
          currentText = currentText.replace(
            objectNames.tempDown[i],
            objectNames.minioPath[i]
          );
        } else {
          deletePromises.push(handleDelete(objectNames.minioPath[i]));
        }
      }

      for (const image of pendingImages) {
        if (currentText.includes(image.preview)) {
          currentText = currentText.replace(image.preview, image.objectName);
          FileList.push(image.file as File);
        }
      }

      if (selectedBoard) {
        await Promise.allSettled([
          handleMultipleUpload(FileList),
          ...deletePromises,
        ]);
        const data = await editBoard({
          ...selectedBoard,
          title,
          content: currentText,
          isTemplate: false,
          modifierId: userInfo?.pid ?? "",
        });
        setSelectedBoard(data);
      }
      resetList();
      await fetchList();
      handleCancel();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBoardResource = async (
    id: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    try {
      const board = await getBoard(id);
      const result = objectNameList(board.content);

      const deletePromises = result.map((objectName) =>
        handleDelete(objectName)
      );
      await Promise.allSettled([
        deleteBoard(id, userInfo?.pid ?? ""),
        ...deletePromises,
      ]);
      resetList();
      await fetchList();
    } catch (error) {
      console.error("Failed to delete board:", error);
    }
  };

  const backToReport = () => {
    setSelectedBoard(null);
  };

  useEffect(() => {
    setIsCreate(false);
    setIsEdit(false);
    resetList();
  }, [boardId]);

  useEffect(() => {
    fetchList();
  }, [page, boardId]);

  useEffect(() => {
    if (isEdit && selectedBoard) {
      setTitle(selectedBoard.title);
    }
  }, [isEdit, selectedBoard]);

  // 개선된 무한 스크롤 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && list.length < total) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [isLoading, total, list.length]);

  const writeRight = getCanWriteByDescription(boardId);

  if (isCreate || isEdit) {
    return (
      <div className="page-wrapper">
        <div className="h-4 flex items-center mb-4">
          <Label className="text-xl font-bold">
            {pathTextMatcher[boardId]} {isEdit ? "수정" : "작성"}
          </Label>
        </div>

        <div className="w-full">
          <Label className="block mb-1">제목</Label>
          <Input value={title} onChange={handleChange} />
        </div>

        <Label className="block mt-2 mb-1">내용</Label>

        <div className="page-body">
          <Editor text={isCreate ? initText : selectedBoard?.content} />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            disabled={loading}
            variant="destructive"
            onClick={handleCancel}
          >
            취소
          </Button>
          <Button
            disabled={loading || text === init}
            onClick={isEdit ? handleUpdate : handleCreate}
          >
            {isEdit ? "수정" : "저장"}
          </Button>
        </div>
      </div>
    );
  }

  if (selectedBoard) {
    return (
      <div className="page-wrapper">
        <CardHeader className="py-0 px-4">
          <CardTitle className="text-2xl">{selectedBoard.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            작성자 {selectedBoard.authorName}
          </div>
        </CardHeader>
        <div className="page-body">
          <PreviewEditor editorState={selectedBoard.content} />
        </div>
        <div className="flex w-full items-center justify-between mt-4">
          <Button
            variant="ghost"
            className="flex justify-start items-center gap-2"
            onClick={backToReport}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            목록으로 돌아가기
          </Button>
          {writeRight && userInfo?.pid === selectedBoard.authorId && (
            <EditButton onClick={() => setIsEdit(true)}>수정</EditButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="h-4 flex items-center mb-4">
        <Label className="text-xl font-bold">{pathTextMatcher[boardId]}</Label>
      </div>

      <div className="page-body space-y-4">
        {list.map((manual, index) => (
          <Card
            key={`${manual.id}${index}`}
            onClick={() => handleCardClick(manual.id)}
            className="hover:bg-gray-50 cursor-pointer"
          >
            <CardHeader className="p-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{manual.title}</CardTitle>
                {userInfo?.pid === manual.authorId && (
                  <button
                    onClick={(event) => deleteBoardResource(manual.id, event)}
                    className="text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              <div className="w-full flex justify-end">
                <CardDescription className="text-sm text-gray-500">
                  {new Date(manual.createdAt).toLocaleDateString()}{" "}
                  {manual.authorName}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}

        {isLoading ? (
          <div className="flex justify-center py-4">
            <span>Loading...</span>
          </div>
        ) : list.length < total ? (
          <div ref={observerTarget} className="h-20" />
        ) : list.length > 0 ? (
          <div className="text-center py-4 text-gray-500">
            모든 데이터를 불러왔습니다
          </div>
        ) : null}
      </div>
      <div className="flex justify-end items-center gap-4">
        {userInfo?.pid && writeRight && (
          <Button onClick={handleClickCreate}>작성하기</Button>
        )}
      </div>
    </div>
  );
};
