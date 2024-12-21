import { useTokenStore } from "@/stores/token.store";
import { useUserStore } from "@/stores/userInfo.store";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export const AccountLayout = () => {
  const { user } = useUserStore();
  const { token } = useTokenStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (token && user) {
      navigate("/news");
    }
  }, []);
  return (
    <div className="h-full">
      <Outlet />
    </div>
  );
};
