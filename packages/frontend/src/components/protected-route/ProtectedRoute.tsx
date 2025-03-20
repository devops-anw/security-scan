"use client";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, status } = useAuthSession();
  const router = useRouter();
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router]);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  if (status === "loading") {
    return <LoadingIndicator />;
  }

  if (status === "authenticated") {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isVisible={isSidebarVisible} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pt-20 sm:pt-16">
            {children}
          </main>
        </div>
      </div>
    );
  }
  return null;
}
