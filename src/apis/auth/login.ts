import axios from "axios";
import { baseUrl } from "../baseUrl";

const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export interface Credentials {
  id: string;
  password: string;
}

export const login = async (credentials: Credentials) => {
  try {
    const { data } = await apiClient.post("auth/signin", credentials);
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

interface SignUpForm {
  id: string;
  password: string;
  name: string;
  email: string | null;
  phone: string;
  birth: string;
  sarang: string;
  daechung: boolean;
}

export const signup = async (info: SignUpForm) => {
  try {
    const { data } = await apiClient.post("auth/signup", info);
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

export const autoLogin = async () => {
  const { data } = await apiClient.get("auth/validate");
  return data.isValid;
};
