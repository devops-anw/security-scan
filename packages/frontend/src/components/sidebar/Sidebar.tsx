"use client";
import { useState } from "react";
import SidebarLink from "./SidebarLink";
import { usePathname } from "next/navigation";
import {
  AppWindow,
  CircleHelpIcon,
  DownloadIcon,
  House,
  ListTodo,
  LogsIcon,
  RecycleIcon,
  ServerIcon,
  ShieldPlusIcon,
  User,
  Users,
  Wrench,
} from "lucide-react";
import RoleBasedRoute from "../role-based-route/RoleBasedRoute";
import { sidebarTexts } from "@/texts/common/sidebar";
import LogoImage from "../common/LogoImage";
import { ForwardArrowMenuIcon } from "../ui/forward-arrow-menu-icon";
import { BackwardArrowMenuIcon } from "../ui/backward-arrow-menu-icon";

const iconStyle = {
  width: "20px",
  height: "20px",
  strokeWidth: "2",
};

export default function Sidebar({ isVisible }: { isVisible: boolean }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <aside
      className={`bg-white ${
        isCollapsed ? "w-[4.5rem]" : "w-64"
      } min-h-screen shadow-sm
        ${
          isVisible
            ? "translate-x-0 right-0"
            : "translate-x-full sm:translate-x-0 sm:block hidden"
        }
        fixed sm:relative sm:h-auto h-full top-16 sm:top-0 z-50 transition-all duration-300 ease-in-out`}
    >
      <div
        className={`items-center justify-center border-b border-gray-200 p-6 bg-white transition-all duration-300 ease-in-out hidden sm:flex   ${
          isCollapsed ? "justify-center" : "justify-start"
        } `}
      >
        <a href={pathname} onClick={() => window.location.reload()}>
          {!isCollapsed && <LogoImage />}
        </a>
        <div
          className="cursor-pointer hidden sm:block"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ForwardArrowMenuIcon className="text-red-600 w-6 h-6" />
          ) : (
            <BackwardArrowMenuIcon className="text-gray-500 w-6 h-6" />
          )}
        </div>
      </div>

      <nav className="space-y-2 mt-2 p-4">
        <RoleBasedRoute allowedRoles={["Platform Admin"]}>
          <SidebarLink
            href="/admin/approval-signup-request"
            icon={<ListTodo style={iconStyle} />}
            text={sidebarTexts.approvalRequests}
            active={pathname === "/admin/approval-signup-request"}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            href="/admin/users"
            icon={<Users style={iconStyle} />}
            text={sidebarTexts.users}
            active={pathname === "/admin/users"}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            href="/admin/agent-binary"
            icon={<ShieldPlusIcon style={iconStyle} />}
            text={sidebarTexts.agentBinary}
            active={pathname === "/admin/agent-binary"}
            isCollapsed={isCollapsed}
          />
        </RoleBasedRoute>

        <RoleBasedRoute allowedRoles={["Org Admin"]}>
          <SidebarLink
            href="/dashboard"
            icon={<House style={iconStyle} />}
            text={sidebarTexts.dashboard}
            active={pathname === "/dashboard"}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            href="/org-profile"
            icon={<User style={iconStyle} />}
            text={sidebarTexts.orgProfile}
            active={pathname === "/org-profile"}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            href="/device-monitor"
            icon={<ServerIcon style={iconStyle} />}
            text={sidebarTexts.deviceMonitor}
            active={pathname === "/device-monitor"}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            href="/application"
            icon={<AppWindow style={iconStyle} />}
            text={sidebarTexts.applications}
            active={pathname === "/application"}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            href="/activity-logs"
            icon={<LogsIcon style={iconStyle} />}
            text={sidebarTexts.activityLogs}
            active={pathname === "/activity-logs"}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            href="/recovery"
            icon={<RecycleIcon style={iconStyle} />}
            text={sidebarTexts.recovery}
            active={pathname === "/recovery"}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            href="/agent-download"
            icon={<DownloadIcon style={iconStyle} />}
            text={sidebarTexts.agentDownload}
            active={pathname === "/agent-download"}
            isCollapsed={isCollapsed}
          />
          <div className="hidden">
            <SidebarLink
              href="/tools"
              icon={<Wrench style={iconStyle} />}
              text={sidebarTexts.tools}
              active={pathname === "/tools"}
              isCollapsed={isCollapsed}
            />
          </div>
          <SidebarLink
            href="/help"
            icon={<CircleHelpIcon style={iconStyle} />}
            text={sidebarTexts.help}
            active={pathname === "/help"}
            isCollapsed={isCollapsed}
          />
        </RoleBasedRoute>
      </nav>
    </aside>
  );
}
