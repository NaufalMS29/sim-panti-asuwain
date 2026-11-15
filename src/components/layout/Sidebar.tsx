"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Baby,
  HeartHandshake,
  HandCoins,
  Wallet,
  Package,
  CalendarDays,
  Newspaper,
  UserCircle,
  X,
  Building2,
  GraduationCap,
  FileText,
} from "lucide-react";
import { NavMenuItem, SidebarIconKey } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";

const ICON_MAP: Record<
  SidebarIconKey,
  React.ComponentType<{ className?: string }>
> = {
  dashboard: LayoutDashboard,
  users: Users,
  pengurus: ShieldCheck,
  anak: Baby,
  alumni: GraduationCap,
  donatur: HeartHandshake,
  donasi: HandCoins,
  keuangan: Wallet,
  inventaris: Package,
  kegiatan: CalendarDays,
  berita: Newspaper,
  profil: UserCircle,
  berkas: FileText,
};

interface SidebarProps {
  menus: NavMenuItem[];
  role: RoleName;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ menus, role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay Gelap untuk Layar Mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Brand Panti */}
        <div className="h-16 px-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-gray-900">
                SIM Panti Asuhan
              </p>
              <p className="text-[11px] font-medium text-blue-700">
                Asuwain Timor
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badge Peran Aktif */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            Hak Akses Aktif
          </p>
          <span className="mt-1 inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {role}
          </span>
        </div>

        {/* Daftar Menu Dinamis */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menus.map((item) => {
            const Icon = ICON_MAP[item.icon] || LayoutDashboard;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-700 text-white shadow-xs"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-200 text-[11px] text-gray-400 text-center">
          &copy; 2026 Panti Asuhan Asuwain Timor
        </div>
      </aside>
    </>
  );
}
