import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";
import { autoLogin } from "@/apis/auth/login";
import { useUserStore } from "@/stores/userInfo.store";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
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
  }, []);

  return isAuthenticated ? (
    <div className="flex flex-col h-full">
      <div className="flex-1">{children}</div>
      <BottomNav />
    </div>
  ) : (
    <Navigate to="/account/login" replace />
  );
};
