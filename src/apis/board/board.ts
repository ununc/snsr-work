import { apiClient } from "../baseUrl";

interface CreateBoardDto {
  title: string; // 1-200자 길이의 문자열
  content: string; // 비어있지 않은 문자열
  authorId: string; // UUID 형식의 문자열
  isTemplate: boolean;
  boardId: string;
  onlyAuthorCanModify?: boolean; // 선택적 필드
}

export interface ResponseBoardDto {
  authorName?: string;
  title: string;
  id: string;
  createdAt: string;
  isTemplate: boolean;
  authorId: string;
}

export interface BoardAllFiled extends CreateBoardDto, ResponseBoardDto {
  modifierId?: string;
}

export interface PagiReponse {
  items: ResponseBoardDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const createBoard = async (payload: CreateBoardDto): Promise<void> => {
  await apiClient.post("boards", payload);
  //   return data;
};

export const getBoards = async (
  boardId: string
): Promise<ResponseBoardDto[]> => {
  const { data } = await apiClient.get("boards", {
    params: {
      boardId,
    },
  });
  return data;
};

export const getBoard = async (id: string): Promise<BoardAllFiled> => {
  const { data } = await apiClient.get(`boards/${id}`);
  return data;
};

export const editBoard = async (
  payload: BoardAllFiled
): Promise<BoardAllFiled> => {
  const { data } = await apiClient.put(`boards/${payload.id}`, payload);
  return data;
};

export const deleteBoard = async (
  id: string,
  userId: string
): Promise<BoardAllFiled> => {
  const { data } = await apiClient.delete(`boards/${id}`, {
    params: {
      userId,
    },
  });
  return data;
};

// 전체 보드의 템플릿 요청
export const getBoardTemplates = async (
  boardId: string
): Promise<ResponseBoardDto[]> => {
  const { data } = await apiClient.get("boards/temp", {
    params: {
      boardId,
    },
  });
  return data;
};

// 해당 월의 보드 요청
export const getBoardsSplit = async (
  boardId: string,
  page: number,
  limit: number
): Promise<PagiReponse> => {
  const { data } = await apiClient.get(`boards/split/${boardId}`, {
    params: {
      page,
      limit,
    },
  });
  return data;
};
