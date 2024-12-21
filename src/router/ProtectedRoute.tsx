import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";
import { useGlobalStore } from "@/stores/global.store";
import { autoLogin as checkAuth } from "@/apis/auth/login";

export const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { autoLogin } = useGlobalStore();
  useEffect(() => {
    if (autoLogin) {
      const checkLogin = async () => {
        try {
          const response = await checkAuth();
          setIsAuthenticated(response);
        } catch {
          setIsAuthenticated(false);
        }
      };
      checkLogin();
    } else {
      setIsAuthenticated(false);
    }
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
