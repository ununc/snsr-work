import { Outlet } from "react-router-dom";

export const AccountLayout = () => {
  return (
    <div className="h-full">
      <Outlet />
    </div>
  );
};
