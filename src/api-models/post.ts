import {
  Advertisement,
  Board,
  Congregation,
  Liturgists,
  Liturgy,
  Newcomer,
  Praise,
} from "./sub";

export const PostTextMatcher = {
  liturgy: "예배 스크립트",
  praise: "찬양 콘티",
  anthem: "특송 콘티",
  liturgists: "예배 위원회",
  congregation: "예배 인원",
  advertisement: "광고 요청",
  planning: "행사 기획",
  outcome: "행사 결과 보고",
  newcomer: "새신자 보고",
  absenteeism: "장결자 보고",
  promotion: "등반 인원 보고",
  manual: "메뉴얼",
  Monthly: "월례회 보고",
};

export type BoardName = keyof typeof PostTextMatcher;

interface ContentMap {
  liturgy: Liturgy;
  praise: Praise;
  anthem: Praise;
  liturgists: Liturgists;
  congregation: Congregation;
  advertisement: Advertisement;
  planning: Board;
  outcome: Board;
  newcomer: Newcomer;
  absenteeism: Newcomer;
  promotion: Newcomer;
  manual: Board;
  Monthly: Board;
}

// Discriminated union type for post creation
export interface CreatePost {
  title?: string;
  targetDate?: string;
  boardName: BoardName;
  content: ContentMap[BoardName];
}

export interface Posts extends CreatePost {
  id: string;
  createdId: string;
  createdAt: Date;
  updatedId?: string;
  updatedAt?: Date;
}
