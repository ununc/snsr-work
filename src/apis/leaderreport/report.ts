import { apiClient } from "../baseUrl";

export interface Leaders {
  leaderName: string;
  leaderPid: string;
}

export interface Attendance {
  id: string;
  memberName: string;
  memberPid: string | null;
  attendanceDate: Date;
  status: "NO" | "WORSHIP" | "CELL" | "ALL";
  leaderName: string;
  leaderPid: string;
  daechung: boolean;
  lifeSharing: string;
  faith: string;
  notes: string;
}

export type SimpleAttendance = Pick<
  Attendance,
  | "leaderPid"
  | "leaderName"
  | "memberPid"
  | "memberName"
  | "status"
  | "lifeSharing"
  | "faith"
  | "notes"
  | "daechung"
>;

export const getReportsByDate = async (
  daechung: boolean,
  date: string
): Promise<Leaders[]> => {
  const { data } = await apiClient.get(`attendance/search/${daechung}/${date}`);
  return data;
};

export const getOneReports = async (
  daechung: boolean,
  date: string,
  leaderPid: string
): Promise<Attendance[]> => {
  const { data } = await apiClient.get(
    `attendance/search/${daechung}/${date}/${leaderPid}`
  );
  return data;
};

export const createReport = async (
  attendances: Attendance[]
): Promise<Leaders[]> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const backend = attendances.map(({ id, ...rest }) => rest);
  const { data } = await apiClient.post("attendance/bulk", backend);
  return data;
};

export const updateReport = async (
  attendances: Attendance[]
): Promise<Leaders[]> => {
  const { data } = await apiClient.patch("attendance", attendances);
  return data;
};
