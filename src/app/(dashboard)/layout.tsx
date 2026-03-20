"use client";

import { Sidebar } from "@/components/layout/Sidebar"; // Will remove in next step
import { NavigationDock } from "@/components/layout/NavigationDock";
import TopBar from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Remove vertical sidebar area */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 pb-32">
          {children}
        </main>
        
        {/* New Pro Max Navigation */}
        <NavigationDock />
      </div>
    </div>
  );
}
