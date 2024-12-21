import { useGlobalStore } from "@/stores/global.store";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export const AccountLayout = () => {
  const navigate = useNavigate();
  const { token, autoLogin } = useGlobalStore();

  useEffect(() => {
    if (token && autoLogin) {
      navigate("/news");
    }
  }, []);
  return (
    <div className="h-full">
      <Outlet />
    </div>
  );
};
