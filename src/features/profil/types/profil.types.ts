import { RoleName } from "@/features/auth/types/auth.types";

export interface PengurusProfilDetail {
  id_pengurus: number;
  nama_pengurus: string;
  jabatan: string;
  no_telepon: string;
  alamat: string;
}

export interface AnakPantiProfilDetail {
  id_anak: number;
  nama_anak: string;
  nik: string | null;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  status_anak: string;
  tanggal_masuk: string;
  foto: string | null;
}

export interface DonaturProfilDetail {
  id_donatur: number | null;
  nama_donatur: string;
  email: string | null;
  no_telepon: string | null;
  alamat: string | null;
  tipe_donatur: string;
  frekuensi_donasi: string | null;
}

export interface UserProfilData {
  id_user: number;
  username: string;
  email: string | null;
  role: RoleName;
  has_password: boolean;
  has_google: boolean;
  is_default_password: boolean;
  created_at: string;
  pengurus: PengurusProfilDetail | null;
  anak_panti: AnakPantiProfilDetail | null;
  donatur: DonaturProfilDetail | null;
}

export interface ProfilActionResponse {
  success: boolean;
  message: string;
}
