import { apiClient } from "../baseUrl";

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

export const autoLogin = async (): Promise<boolean> => {
  const { data } = await apiClient.get("auth/validate");
  return data.isValid;
};

export const getAdress = async ({
  daechung,
  sarang,
}: {
  daechung: boolean;
  sarang: string;
}) => {
  const { data } = await apiClient.get("auth/adress", {
    params: {
      daechung,
      sarang,
    },
  });
  return data;
};
