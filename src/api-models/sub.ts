//

export interface ManagedContent {
  id: string;
  file?: File;
  preview: string;
  objectName: string;
  type?: string;
}

export interface Liturgy {
  preach: string; // 말씀 제목
  bibleVerses: string; // 본문 말씀
  continuity: string; // 콘티
  hymn: string; // 적용 찬양
  images?: string[]; // Optional images
}

export interface ILiturgyForm extends Omit<Liturgy, "images"> {
  images: ManagedContent[];
}

//
export interface Advertisement {
  description: string; // 광고 설명
  startDate: string; // 시작 날짜
  endDate: string; // 종료 날짜
  contents: string[]; // 첨부 파일 목록
}

export interface IAdvertisementForm extends Omit<Advertisement, "contents"> {
  contents: ManagedContent[];
  title: string;
}

//
export interface Board {
  substance: string;
  contents: string[];
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
  // name: string;
  pear: number;
  phone?: string;
  job?: string;
  newComer: boolean;
  baptism: boolean;
  // registrationDate: string;
  churchName?: string;
  pastorVisited: boolean;
  registrationReason?: string;
  notes?: string[];
  absence?: string;
  climbing?: string;
  objectName?: string;
  promotionEnd?: boolean;
}

//
export interface SongItem {
  title: string;
  lyrics: string;
  images?: string[];
  link?: string;
}

export const KINDS = ["찬양", "특송", "봉헌", "끝송"] as const;

export type PraiseKind = (typeof KINDS)[number];

export interface Praise {
  kind: PraiseKind;
  description: string;
  songs: SongItem[];
}

export interface IPraiseForm extends Omit<Praise, "songs"> {
  songs: {
    id: string;
    title: string;
    lyrics: string;
    link?: string;
    images?: ManagedContent[];
  }[];
}
