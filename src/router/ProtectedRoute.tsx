import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";
import { autoLogin as checkAuth } from "@/apis/auth/login";

export const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await checkAuth();
        setIsAuthenticated(response);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkLogin();
  }, []);

  if (isAuthenticated === null) return <div></div>;

  return isAuthenticated ? (
    <div className="h-full flex flex-col">
      <div className="flex flex-1 relative overflow-hidden">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  ) : (
    <Navigate to="/account/login" replace />
  );
};
