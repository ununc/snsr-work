import { apiClient } from "../baseUrl";

interface SongItem {
  url: string;
  lyricOrder: string;
  imageName: string;
  title: string;
  imageFile?: File; // 선택적 속성 추가
  imageTempUrl?: string;
  imageUploadUrl?: string;
}

export interface Song {
  id: string;
  kind: boolean;
  describe: string;
  singdate: Date; // ISO 날짜 문자열로 받을 경우
  createdAt: string; // ISO 날짜 문자열로 받을 경우
  creatorPid: string;
  creatorName: string;
  updatedAt: string; // ISO 날짜 문자열로 받을 경우
  updaterPid: string | null;
  updaterName: string | null;
  songList: SongItem[];
}

type createSong = Omit<
  Song,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "updaterPid"
  | "creatorName"
  | "updaterName"
>;
type editSong = Omit<
  Song,
  "createdAt" | "updatedAt" | "creatorName" | "updaterName"
>;

export const getSongs = async (
  kind: boolean,
  date: string
): Promise<Song[]> => {
  const { data } = await apiClient.get(`songform/${kind}/${date}`);
  return data;
};

export const getSongDetail = async (id: string): Promise<Song> => {
  const { data } = await apiClient.get(`songform/${id}`);
  return data;
};

export const createSongForm = async (payload: createSong) => {
  await apiClient.post("songform", payload);
};

export const editSongForm = async (id: string, payload: editSong) => {
  await apiClient.patch(`songform/${id}`, payload);
};
