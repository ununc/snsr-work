import { Button } from "../ui/button";
import { YearMonth } from "../select/YearMonth";
import { ChevronRight } from "lucide-react";
import { YearMonthLoadDay } from "../select/YearMonthLoadDay";

export type BoardState = "list" | "detail" | "create" | "edit";

interface IProps {
  boardState: BoardState;
  setBoardState: React.Dispatch<React.SetStateAction<BoardState>>;
  canEdit: boolean;
  canWrite: boolean;
  handleClickEdit: () => void;
  handleClickCreate: () => void;
  handleClickRequestEdit: () => void;
  handleClickRequestCreate: () => void;
  changeYearMonth: (date: Date) => void;
  changeRequestYearMonth: (date: Date) => void;
  initRequestDate?: Date | null;
  noDetail?: boolean;
  noDateCreateEdit?: boolean;
  initDate?: Date;
}

export const MonthController = ({
  boardState,
  setBoardState,
  canEdit,
  canWrite,
  handleClickEdit,
  handleClickRequestEdit,
  handleClickRequestCreate,
  changeYearMonth,
  changeRequestYearMonth,
  handleClickCreate,
  initRequestDate,
  noDetail = false,
  noDateCreateEdit = false,
  initDate,
}: IProps) => {
  const handleClickCancelCreate = () => {
    setBoardState("list");
  };

  const handleClickCancelEdit = () => {
    if (noDetail) {
      setBoardState("list");
    } else {
      setBoardState("detail");
    }
  };

  const handleClickCancel = () => {
    if (boardState === "create") {
      handleClickCancelCreate();
    } else {
      handleClickCancelEdit();
    }
  };

  const handleClickRequest = () => {
    if (boardState === "create") {
      handleClickRequestCreate();
    } else {
      handleClickRequestEdit();
    }
  };

  switch (boardState) {
    case "detail":
      return (
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            className="flex justify-start items-center gap-2"
            onClick={handleClickCancelCreate}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            목록으로 돌아가기
          </Button>
          {canEdit && <Button onClick={handleClickEdit}>수정하기</Button>}
        </div>
      );
    case "edit":
    case "create":
      return (
        <div className="flex justify-between items-center">
          {noDateCreateEdit ? (
            <div></div>
          ) : (
            <YearMonthLoadDay
              changeDate={changeRequestYearMonth}
              initDate={initRequestDate}
            />
          )}
          <div className="flex justify-end items-center gap-2">
            <Button onClick={handleClickCancel} variant="destructive">
              취소
            </Button>
            <Button onClick={handleClickRequest}>
              {boardState === "create" ? "생성" : "저장"}
            </Button>
          </div>
        </div>
      );
    default:
      return (
        <div className="flex justify-between items-center">
          <YearMonth changeYearMonth={changeYearMonth} initDate={initDate} />
          {canWrite && <Button onClick={handleClickCreate}>작성하기</Button>}
        </div>
      );
  }
};
