"use client";

import { useState } from "react";
import { Outlet } from "react-router-dom";

import { DashboardSidebar } from "@/components/shared/sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar (NO SCROLL) */}
      <DashboardSidebar collapsed={sidebarCollapsed} />

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Header (NO SCROLL) */}
        <DashboardHeader
          sidebarOpen={!sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        />

        {/* Scrollable Feed Area */}
        <main
          style={{ scrollbarWidth: "none" }}
          className="flex-1 overflow-y-auto mb-4 flex justify-center"
        >
          <div className="w-full max-w-xl mx-auto px-4 py-6 ">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Right Panel (NO SCROLL) */}
      <aside className="hidden lg:flex w-120 flex-col border-l px-6 py-6">
        <p className="text-sm text-muted-foreground">Suggestions coming soon</p>
      </aside>
    </div>
  );
};

export default DashboardLayout;
