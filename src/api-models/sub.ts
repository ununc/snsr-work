//
export interface Liturgy {
  preach: string; // 말씀 제목
  bibleVerses: string; // 본문 말씀
  continuity: string; // 콘티
  hymn: string; // 적용 찬양
  images?: string[]; // Optional images
}

//
export interface Advertisement {
  description: string; // 광고 설명
  startDate: string; // 시작 날짜
  endDate: string; // 종료 날짜
  contents: ContentItem[]; // 첨부 파일 목록
}

//
export interface Board {
  substance: string;
  contents: ContentItem[];
}

export enum ContentType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
}

export interface ContentItem {
  type: ContentType; // 콘텐츠 타입 (이미지, 비디오, 문서 등)
  objectPath: string; // 파일 경로
}

//
export interface Congregation {
  man: number;
  women: number;
  online: number;
}

//
export interface Liturgists {
  worship: string;
  sermon: string;
  praise: string;
  specialSong: string;
  subtitle: string;
  video: string;
  sound: string;
  others: string;
}

//
export interface Newcomer {
  leader: string;
  name: string;
  pear: number;
  phone?: string;
  job?: string;
  week: number;
  newComer: boolean;
  baptism: boolean;
  registrationDate: string;
  registrationReason?: string;
  notes?: string[];
  absence?: string;
  climbing?: string;
}

//
export interface SongItem {
  title: string;
  lyrics: string;
  images?: string[];
  link?: string;
}

export interface Praise {
  description: string;
  songs: SongItem[];
}
