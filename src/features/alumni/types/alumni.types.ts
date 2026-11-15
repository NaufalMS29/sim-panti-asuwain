export interface AlumniListItem {
  id_alumni: number;
  id_anak: number;
  nama_anak: string;
  nik: string | null;
  jenis_kelamin: string;
  status_anak: string;
  tanggal_masuk: string;
  tahun_lulus: number;
  pekerjaan_sekarang: string | null;
  alamat_sekarang: string | null;
  kontak: string | null;
}

export interface EligibleAnakOption {
  id_anak: number;
  nama_anak: string;
  nik: string | null;
  status_anak: string;
}

export interface AlumniActionResponse {
  success: boolean;
  message: string;
}
