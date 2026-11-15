export interface RoleOption {
  id_role: number;
  nama_role: string;
}

export interface UserManagementItem {
  id_user: number;
  role_id: number;
  nama_role: string;
  username: string;
  email: string | null;
  has_password: boolean;
  has_google: boolean;
  linked_name: string | null;
  created_at: string;
}

export interface UserActionResponse {
  success: boolean;
  message: string;
}
