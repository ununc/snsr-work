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

export const getPostList = async (
  boardName: string,
  month: string
): Promise<Posts[]> => {
  const { data } = await apiClient.get(`space/${boardName}/${month}`);
  return data;
};
