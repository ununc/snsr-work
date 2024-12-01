import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";
import { autoLogin } from "@/apis/auth/login";
import { useUserStore } from "@/stores/userInfo.store";

export const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { loadUser } = useUserStore();
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await autoLogin();
        setIsAuthenticated(response);
        loadUser();
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkLogin();
  }, [loadUser]);

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
