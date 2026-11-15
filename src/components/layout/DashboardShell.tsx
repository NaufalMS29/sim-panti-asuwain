"use client";

import { useState, ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { NavMenuItem } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";

interface DashboardShellProps {
  menus: NavMenuItem[];
  user: {
    name: string;
    username: string;
    role: RoleName;
  };
  children: ReactNode;
}

export function DashboardShell({ menus, user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Sidebar
        menus={menus}
        role={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar user={user} onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
