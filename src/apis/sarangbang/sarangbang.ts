import { apiClient } from "../baseUrl";

export interface Sarangbang {
  id: string;
  sarang: string;
  daechung: boolean;
  leaderName: string;
  leaderPid: string;
  members: Array<{ name: string; pid: string | null }>;
}

export const getSarangbangByPid = async (pid: string): Promise<Sarangbang> => {
  const { data } = await apiClient.get(`sarangbang/leader/${pid}`);
  return data;
};
