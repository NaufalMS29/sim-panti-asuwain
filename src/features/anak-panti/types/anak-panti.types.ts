export interface KelengkapanBerkasStatus {
  kk: boolean;
  akta: boolean;
  ijazah: boolean;
}

export interface AnakPantiItem {
  id_anak: number;
  id_user: number | null;
  username: string | null;
  nama_anak: string;
  nik: string | null;
  tempat_lahir: string;
  tanggal_lahir_iso: string;
  tanggal_lahir_display: string;
  jenis_kelamin: string;
  status_anak: string;
  tanggal_masuk_iso: string;
  tanggal_masuk_display: string;
  foto: string | null;
  is_alumni: boolean;
  tahun_lulus: number | null;
  berkas_count: number;
  kelengkapan_berkas: KelengkapanBerkasStatus;
}

export interface AnakPantiActionResponse {
  success: boolean;
  message: string;
}
