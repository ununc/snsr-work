import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";
import { autoLogin } from "@/apis/auth/login";
import { useUserStore } from "@/stores/userInfo.store";
import { useTokenStore } from "@/stores/token.store";

export const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { loadUser, clearUser } = useUserStore();
  const { token, loadToken, clearToken } = useTokenStore();
  useEffect(() => {
    const checkLogin = async () => {
      try {
        if (!token) {
          loadToken();
          loadUser();
          const response = await autoLogin();
          setIsAuthenticated(response);
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        clearToken();
        clearUser();
        setIsAuthenticated(false);
      }
    };
    checkLogin();
  }, []);

  if (isAuthenticated === null) return <div></div>;

  return isAuthenticated ? (
    <div className="h-full">
      <div className="h-[calc(100%-80px)]">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  ) : (
    <Navigate to="/account/login" replace />
  );
};
