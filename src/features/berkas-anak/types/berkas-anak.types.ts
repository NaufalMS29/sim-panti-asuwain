export interface BerkasAnakItem {
  id_berkas: number;
  id_anak: number;
  jenis_berkas: string;
  nama_file: string;
  file_path: string;
}

export interface AnakBerkasDetail {
  id_anak: number;
  nama_anak: string;
  nik: string | null;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  status_anak: string;
  tanggal_masuk: string;
  berkas: BerkasAnakItem[];
  alumni: {
    id_alumni: number;
    tahun_lulus: number;
  } | null;
}

export interface OwnBerkasSummary {
  id_anak: number;
  nama_anak: string;
  nik: string | null;
  status_anak: string;
  is_alumni: boolean;
  tahun_lulus: number | null;
  berkas: BerkasAnakItem[];
}

export interface BerkasAnakActionResponse {
  success: boolean;
  message: string;
}
