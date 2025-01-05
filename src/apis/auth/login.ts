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
    await apiClient.post("auth/signup", info);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const autoLogin = async (): Promise<boolean> => {
  const { data } = await apiClient.get("auth/validate");
  return data.isValid;
};

export const getNewRoleMenu = async (pid: string) => {
  const { data } = await apiClient.get(`auth/role-menu/${pid}`);
  return data;
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

export const updateRequestUserInfo = async (payload: {
  [key: string]: string | Date | boolean;
}) => {
  const { data } = await apiClient.patch("auth/update-user-info", payload);
  return data;
};

export const passwordChange = async (payload: {
  [key: string]: string | Date | boolean;
}) => {
  await apiClient.patch("auth/change-password", payload);
};
