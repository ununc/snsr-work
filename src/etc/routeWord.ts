export const pathTextMatcher = {
  manual: "메뉴얼",
  "monthly-report": "월례회 보고",
  "event-plan": "행사 기획",
  "event-result": "행사 결과 보고",
  "newcomer-individual": "개별 보고",
  "newcomer-weekly": "주간 보고",
  "promotion-report": "등반 인원 보고",
  advertisement: "광고 요청",
  "worship-committee": "예배 위원회",
  "worship-script": "예배 스크립트",
};

export type BoardId = keyof typeof pathTextMatcher;

export const createEditState = {
  list: "",
  detail: "",
  create: "생성",
  edit: "수정",
};
