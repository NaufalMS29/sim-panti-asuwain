import { ROLE_DASHBOARD_MAP, RoleName } from "@/features/auth/types/auth.types";

export type Permission =
  // Manajemen Akun & Pengurus
  | "users:manage"
  | "pengurus:view"
  | "pengurus:manage"
  // Data Anak Panti
  | "anak_panti:view"
  | "anak_panti:create"
  | "anak_panti:update"
  | "anak_panti:delete"
  // Donatur & Transaksi Donasi
  | "donatur:view"
  | "donasi:view_all"
  | "donasi:view_own"
  | "donasi:create"
  | "donasi:verify"
  // Keuangan & Inventaris Panti
  | "keuangan:view"
  | "keuangan:manage"
  | "inventaris:view"
  | "inventaris:manage"
  // Kegiatan & Berita
  | "kegiatan:view"
  | "kegiatan:manage"
  | "berita:view"
  | "berita:manage"
  // Profil Pribadi
  | "profil:view_own"
  // Berkas Anak Panti
  | "berkas:view_own";

const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  Admin: [
    "users:manage",
    "pengurus:view",
    "pengurus:manage",
    "anak_panti:view",
    "anak_panti:create",
    "anak_panti:update",
    "anak_panti:delete",
    "donatur:view",
    "donasi:view_all",
    "donasi:verify",
    "keuangan:view",
    "keuangan:manage",
    "inventaris:view",
    "inventaris:manage",
    "kegiatan:view",
    "kegiatan:manage",
    "berita:view",
    "berita:manage",
    "profil:view_own",
  ],
  "Pengurus Panti": [
    "pengurus:view",
    "anak_panti:view",
    "anak_panti:create",
    "anak_panti:update",
    "donatur:view",
    "donasi:view_all",
    "donasi:verify",
    "keuangan:view",
    "keuangan:manage",
    "inventaris:view",
    "inventaris:manage",
    "kegiatan:view",
    "kegiatan:manage",
    "berita:view",
    "berita:manage",
    "profil:view_own",
  ],
  "Anak Panti": [
    "kegiatan:view",
    "berita:view",
    "berkas:view_own",
    "profil:view_own",
  ],
  "Donatur Tetap": [
    "donasi:view_own",
    "donasi:create",
    "kegiatan:view",
    "berita:view",
    "profil:view_own",
  ],
  "Donatur Tidak Tetap": [
    "donasi:view_own",
    "donasi:create",
    "kegiatan:view",
    "berita:view",
    "profil:view_own",
  ],
};

export function can(
  role: RoleName | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function assertPermission(
  role: RoleName | undefined,
  permission: Permission,
): void {
  if (!can(role, permission)) {
    throw new Error("Akses ditolak: Anda tidak memiliki izin untuk aksi ini.");
  }
}

export type SidebarIconKey =
  | "dashboard"
  | "users"
  | "pengurus"
  | "anak"
  | "alumni"
  | "donatur"
  | "donasi"
  | "keuangan"
  | "inventaris"
  | "kegiatan"
  | "berita"
  | "profil"
  | "berkas";

export interface NavMenuItem {
  label: string;
  href: string;
  icon: SidebarIconKey;
  permission?: Permission;
  allowedRoles?: RoleName[];
}

const ALL_DASHBOARD_MENUS: NavMenuItem[] = [
  // Beranda Khusus per Role
  {
    label: "Dashboard Admin",
    href: "/dashboard/admin",
    icon: "dashboard",
    allowedRoles: ["Admin"],
  },
  {
    label: "Dashboard Pengurus",
    href: "/dashboard/pengurus",
    icon: "dashboard",
    allowedRoles: ["Pengurus Panti"],
  },
  {
    label: "Dashboard Anak Panti",
    href: "/dashboard/anak",
    icon: "dashboard",
    allowedRoles: ["Anak Panti"],
  },
  {
    label: "Dashboard Donatur",
    href: "/dashboard/donatur",
    icon: "dashboard",
    allowedRoles: ["Donatur Tetap", "Donatur Tidak Tetap"],
  },

  // Modul Bersama (Satu Halaman dengan Policy)
  {
    label: "Manajemen Akun",
    href: "/dashboard/users",
    icon: "users",
    permission: "users:manage",
  },
  {
    label: "Data Pengurus",
    href: "/dashboard/data-pengurus",
    icon: "pengurus",
    permission: "pengurus:view",
  },
  {
    label: "Data Anak Panti",
    href: "/dashboard/data-anak-panti",
    icon: "anak",
    permission: "anak_panti:view",
  },
  {
    label: "Data Alumni",
    href: "/dashboard/data-alumni",
    icon: "alumni",
    permission: "anak_panti:view",
  },
  {
    label: "Data Donatur",
    href: "/dashboard/data-donatur",
    icon: "donatur",
    permission: "donatur:view",
  },
  {
    label: "Kelola Donasi",
    href: "/dashboard/donasi",
    icon: "donasi",
    permission: "donasi:view_all",
  },
  {
    label: "Donasi Saya",
    href: "/dashboard/donasi-saya",
    icon: "donasi",
    permission: "donasi:view_own",
  },
  {
    label: "Keuangan Panti",
    href: "/dashboard/keuangan",
    icon: "keuangan",
    permission: "keuangan:view",
  },
  {
    label: "Inventaris Barang",
    href: "/dashboard/inventaris",
    icon: "inventaris",
    permission: "inventaris:view",
  },
  {
    label: "Jadwal Kegiatan",
    href: "/dashboard/kegiatan",
    icon: "kegiatan",
    permission: "kegiatan:view",
  },
  {
    label: "Berita & Artikel",
    href: "/dashboard/berita",
    icon: "berita",
    permission: "berita:view",
  },
  {
    label: "Berkas Saya",
    href: "/dashboard/berkas-saya",
    icon: "berkas",
    permission: "berkas:view_own",
  },
  {
    label: "Profil Saya",
    href: "/dashboard/profil",
    icon: "profil",
    permission: "profil:view_own",
  },
];

export function getSidebarMenus(role: RoleName): NavMenuItem[] {
  return ALL_DASHBOARD_MENUS.filter((item) => {
    if (item.allowedRoles && !item.allowedRoles.includes(role)) {
      return false;
    }
    if (item.permission && !can(role, item.permission)) {
      return false;
    }
    return true;
  });
}

export function canAccessRoute(role: RoleName, pathname: string): boolean {
  if (pathname === "/dashboard") return true;

  const homePrefixes = Object.values(ROLE_DASHBOARD_MAP);
  const myHome = ROLE_DASHBOARD_MAP[role];
  for (const prefix of homePrefixes) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return prefix === myHome;
    }
  }

  const allowedMenus = getSidebarMenus(role);
  return allowedMenus.some(
    (menu) => pathname === menu.href || pathname.startsWith(`${menu.href}/`),
  );
}
