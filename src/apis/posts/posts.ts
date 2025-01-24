import { apiClient } from "../baseUrl";
import type { BoardName, CreatePost, Posts } from "@/api-models/post";

export const createPost = async <T extends BoardName>(
  pid: string,
  payload: CreatePost<T>
): Promise<Posts<T>> => {
  const { data } = await apiClient.post(`space/${pid}`, payload);
  return data;
};

export const updatePost = async <T extends BoardName>(
  pid: string,
  payload: CreatePost<T>
): Promise<Posts<T>> => {
  const { data } = await apiClient.patch(`space/${pid}`, payload);
  return data;
};

export const updatePartOfPost = async <T extends BoardName>(
  pid: string,
  payload: { [key: string]: unknown }
): Promise<Posts<T>> => {
  const { data } = await apiClient.patch(`space/${pid}`, payload);
  return data;
};

export const getPostList = async <T extends BoardName>(
  boardName: T,
  month: string
): Promise<Posts<T>[]> => {
  const { data } = await apiClient.get(`space/${boardName}/${month}`);
  return data;
};

export const getBoardAllPostList = async <T extends BoardName>(
  boardName: string
): Promise<Posts<T>[]> => {
  const { data } = await apiClient.get(`space/${boardName}`);
  return data;
};

export const getPromotionPostList = async <T extends BoardName>(
  done: boolean = false
): Promise<Posts<T>[]> => {
  const { data } = await apiClient.get(`space/promooffer/${done}`);
  return data;
};

export const getAdvertisementList = async <T extends BoardName>(
  month: string
): Promise<Posts<T>[]> => {
  const { data } = await apiClient.get(`space/advertisement/range/${month}`);
  return data;
};

export const deletePost = async (id: string): Promise<void> => {
  await apiClient.delete(`space/${id}`);
};
