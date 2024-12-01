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
import { useUserStore } from "@/stores/userInfo.store";
import React from "react";

export const BottomNav = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const parentItems = user?.menuList.filter((item) => !item.owner);
  const getChildItems = (parentId: string) => {
    return user?.menuList
      ?.filter((item) => item.owner === parentId)
      .sort((a, b) => a.order - b.order);
  };

  const handleDropdownClick = () => {
    navigate("/board");
  };

  const handleItemClick = (string: string) => {
    navigate(`/documents/${string}`);
  };

  return (
    <>
      <nav className="w-full bg-white border-t-2 border-gray-200">
        <div className="flex justify-around items-center">
          <NavLink
            to="/news"
            className={({ isActive }) =>
              `w-full pt-3 pb-5 flex flex-col items-center  ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`
            }
          >
            <Megaphone size={22} />
          </NavLink>

          <NavLink
            to="/programme"
            className={({ isActive }) =>
              `w-full pt-3 pb-5 flex flex-col items-center  ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`
            }
          >
            <ListTodo size={22} />
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `w-full pt-3 pb-5 flex flex-col items-center  ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`
            }
          >
            <Calendar size={22} />
          </NavLink>

          <NavLink
            to="/address"
            className={({ isActive }) =>
              `w-full pt-3 pb-5 flex flex-col items-center  ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`
            }
          >
            <BookUser size={22} />
          </NavLink>

          <DropdownMenu>
            <DropdownMenuTrigger
              onPointerDown={handleDropdownClick}
              className="w-full pt-3 pb-5 flex flex-col items-center text-gray-600 hover:text-blue-600"
            >
              <NotebookPen size={22} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 space-y-1 p-2">
              {parentItems?.map((parent) => (
                <React.Fragment key={parent.id}>
                  <DropdownMenuLabel className="font-thin text-xs border-b">
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
        </div>
      </nav>
      <div className="w-full h-safe-bottom" />
    </>
  );
};
