"use client";
import { AiOutlineLogout } from "react-icons/ai";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "../ui/menubar";
import UserAvatar from "../common/UserAvatar";
import LogoImage from "../common/LogoImage";

import { HiOutlineMenu } from "react-icons/hi";
import { Bell, User } from "lucide-react";

export default function Header({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/" ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/api-docs")
  ) {
    return null;
  }

  return (
    <header className="bg-white w-full shadow-sm fixed top-0 z-50">
      <div className="mx-auto py-4 sm:px-6 lg:px-8 flex items-center sm:justify-end justify-between">
        <div className="sm:hidden block">
          <LogoImage />
        </div>
        <div className="flex items-center space-x-1 sm:space-x-4">
          <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 cursor-pointer hover:text-red-700 transition-colors duration-200" />
          <Menubar className="border-none focus:outline-none focus:ring-0">
            <MenubarMenu>
              <MenubarTrigger className="flex items-center focus:outline-none">
                <UserAvatar
                  name={user?.name}
                  height={20}
                  width={20}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                />
                <span className="hidden sm:inline-block text-sm font-medium text-gray-700 ml-2">
                  {user?.name}
                </span>
              </MenubarTrigger>
              <MenubarContent className="w-48 bg-white shadow-lg rounded-md py-1 mt-1">
                <MenubarItem
                  onSelect={() => router.push("/org-profile")}
                  className="px-4 py-2 hover:bg-red-50 cursor-pointer"
                >
                  <User className="mr-2 text-memcryptRed h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Profile</span>
                </MenubarItem>
                <MenubarSeparator className="bg-gray-200" />
                <MenubarItem
                  onSelect={logout}
                  className="px-4 py-2 hover:bg-red-50 cursor-pointer"
                >
                  <AiOutlineLogout className="mr-2 text-memcryptRed h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Logout</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <button className="sm:hidden p-2" onClick={onToggleSidebar}>
            <HiOutlineMenu className="h-8 w-8 text-memcryptRed" />
          </button>
        </div>
      </div>
    </header>
  );
}
