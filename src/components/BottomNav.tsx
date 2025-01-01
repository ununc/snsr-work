import { NavLink, useNavigate } from "react-router-dom";
import {
  Calendar,
  ListTodo,
  BookUser,
  NotebookPen,
  Megaphone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useEffect } from "react";
import { useServiceWorkerStore } from "@/stores/serviceWorkerStore";
import { UpdatePrompt } from "./UpdatePrompt";
import { NotificationPermissionButton } from "./NotificationPermissionButton";
import { useGlobalStore } from "@/stores/global.store";

export const BottomNav = () => {
  const navigate = useNavigate();
  const { menuList } = useGlobalStore();
  const { showUpdatePrompt, initGetRegister } = useServiceWorkerStore();

  const parentItems = menuList?.filter((item) => !item.owner);
  const getChildItems = (parentId: string) => {
    return menuList
      ?.filter((item) => item.owner === parentId)
      .sort((a, b) => a.order - b.order);
  };

  const handleItemClick = (string: string) => {
    navigate(`/board/${string}`);
  };

  useEffect(() => {
    initGetRegister();
  }, []);

  return (
    <div className="shrink-0 pb-4">
      <nav className="w-full bg-white border-t-2 border-gray-200 relative">
        {showUpdatePrompt ? <UpdatePrompt /> : <NotificationPermissionButton />}
        <div className="flex justify-around items-center">
          <NavLink
            to="/news"
            className={({ isActive }) =>
              `w-full pt-3  flex flex-col items-center  ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`
            }
          >
            <Megaphone size={22} />
          </NavLink>

          <NavLink
            to="/programme"
            className={({ isActive }) =>
              `w-full pt-3  flex flex-col items-center  ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`
            }
          >
            <ListTodo size={22} />
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `w-full pt-3  flex flex-col items-center  ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`
            }
          >
            <Calendar size={22} />
          </NavLink>

          <NavLink
            to="/address"
            className={({ isActive }) =>
              `w-full pt-3  flex flex-col items-center  ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`
            }
          >
            <BookUser size={22} />
          </NavLink>

          {parentItems?.length ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full pt-3  flex flex-col items-center text-gray-600 hover:text-blue-600 focus:outline-none">
                <NotebookPen size={22} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 space-y-1 p-2 max-h-96 overflow-y-scroll"
              >
                {parentItems.map((parent) => (
                  <React.Fragment key={parent.id}>
                    <DropdownMenuLabel className="font-thin text-xs border-b bg-gray-100">
                      {parent.name}
                    </DropdownMenuLabel>
                    {getChildItems(parent.id)?.map((child) => (
                      <DropdownMenuItem
                        key={child.id}
                        onClick={() => handleItemClick(child.description)}
                        className="pl-4 font-bold cursor-pointer"
                      >
                        {child.name}
                      </DropdownMenuItem>
                    ))}
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <></>
          )}
        </div>
      </nav>
      <div className="w-full h-safe-bottom" />
    </div>
  );
};
