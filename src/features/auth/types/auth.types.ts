export type RoleName =
  | "Admin"
  | "Pengurus Panti"
  | "Anak Panti"
  | "Donatur Tetap"
  | "Donatur Tidak Tetap";

export interface SessionUser {
  id_user: number;
  username: string;
  email: string | null;
  name: string;
  role: RoleName;
}

export interface AuthActionResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
}

export const ROLE_DASHBOARD_MAP: Record<RoleName, string> = {
  Admin: "/dashboard/admin",
  "Pengurus Panti": "/dashboard/pengurus",
  "Anak Panti": "/dashboard/anak",
  "Donatur Tetap": "/dashboard/donatur",
  "Donatur Tidak Tetap": "/dashboard/donatur",
};

export const DONATUR_ROLES: RoleName[] = [
  "Donatur Tetap",
  "Donatur Tidak Tetap",
];
