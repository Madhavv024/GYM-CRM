import { useState } from "react";
import { Outlet } from "react-router-dom";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  function handleSidebarNavigate() {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={handleSidebarNavigate}
      />

      <div
        className={`min-w-0 transition-[padding] duration-300 ${
          isSidebarOpen ? "lg:pl-[248px]" : "lg:pl-0"
        }`}
      >
        <Topbar onMenuClick={() => setIsSidebarOpen((current) => !current)} />

        <main className="mx-auto w-full max-w-[1720px] p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}