import { apiClient } from "../baseUrl";
import { CreatePost, Posts } from "@/api-models/post";

export const createPost = async (
  pid: string,
  payload: CreatePost
): Promise<Posts> => {
  const { data } = await apiClient.post(`space/${pid}`, payload);
  return data;
};

export const updatePost = async (
  pid: string,
  payload: CreatePost
): Promise<Posts> => {
  const { data } = await apiClient.patch(`space/${pid}`, payload);
  return data;
};

export const updatePartOfPost = async (
  pid: string,
  payload: { [key: string]: unknown }
): Promise<Posts> => {
  const { data } = await apiClient.patch(`space/${pid}`, payload);
  return data;
};

export const getPostList = async (
  boardName: string,
  month: string
): Promise<Posts[]> => {
  const { data } = await apiClient.get(`space/${boardName}/${month}`);
  return data;
};

export const getBoardAllPostList = async (
  boardName: string
): Promise<Posts[]> => {
  const { data } = await apiClient.get(`space/${boardName}`);
  return data;
};

export const getPromotionPostList = async (
  done: boolean = false
): Promise<Posts[]> => {
  const { data } = await apiClient.get(`space/promooffer/${done}`);
  return data;
};

export const getAdvertisementList = async (month: string): Promise<Posts[]> => {
  const { data } = await apiClient.get(`space/advertisement/range/${month}`);
  return data;
};

export const deletePost = async (id: string): Promise<void> => {
  await apiClient.delete(`space/${id}`);
};
