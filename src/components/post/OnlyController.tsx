import { Button } from "../ui/button";

export type OnlyBoardState =
  | "list"
  | "create"
  | "edu"
  | "absence"
  | "climbing"
  | "edit";

interface IProps {
  boardState: OnlyBoardState;
  setBoardState: React.Dispatch<React.SetStateAction<OnlyBoardState>>;
  canWrite: boolean;
  handleClickCreate: () => void;
  request: () => void;
}

const text = {
  create: "생성",
  edu: "내용 저장",
  absence: "장결 처리",
  climbing: "등반 처리",
  edit: "저장",
};

export const OnlyController = ({
  boardState,
  setBoardState,
  canWrite,
  handleClickCreate,
  request,
}: IProps) => {
  const handleClickCancel = () => {
    setBoardState("list");
  };

  const handleClickRequest = () => {
    request();
  };

  switch (boardState) {
    case "list":
      return (
        <div className="flex justify-between items-center">
          <div></div>
          {canWrite && <Button onClick={handleClickCreate}>작성하기</Button>}
        </div>
      );
    default:
      return (
        <div className="flex justify-end items-center gap-2">
          <Button onClick={handleClickCancel} variant="destructive">
            취소
          </Button>
          <Button onClick={handleClickRequest}>{text[boardState]}</Button>
        </div>
      );
  }
};
