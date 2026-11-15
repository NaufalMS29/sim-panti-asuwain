"use client";

import { useTransition } from "react";
import { Menu, LogOut, Loader2 } from "lucide-react";
import { logoutAction } from "@/features/auth/actions/auth.actions";
import { RoleName } from "@/features/auth/types/auth.types";

interface NavbarProps {
  user: {
    name: string;
    username: string;
    role: RoleName;
  };
  onOpenSidebar: () => void;
}

export function Navbar({ user, onOpenSidebar }: NavbarProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Buka menu navigasi"
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Sistem Informasi Manajemen Panti
          </h2>
          <p className="text-xs text-gray-500 hidden sm:block">
            Selamat datang kembali,{" "}
            <span className="font-medium text-gray-800">{user.name}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden md:block">
          <p className="text-xs font-semibold text-gray-900">{user.name}</p>
          <p className="text-[11px] text-gray-500">@{user.username}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 disabled:opacity-60 transition cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          Keluar
        </button>
      </div>
    </header>
  );
}
