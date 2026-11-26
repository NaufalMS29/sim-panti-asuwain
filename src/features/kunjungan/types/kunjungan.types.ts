export type StatusKunjunganType = "pending" | "disetujui" | "ditolak";

export interface JadwalKunjunganDTO {
  id_kunjungan: number;
  kode_tiket: string;
  nama_pengunjung: string;
  email_pengunjung: string;
  no_telepon: string;
  instansi_organisasi: string | null;
  tujuan_kunjungan: string;
  tanggal_rencana: string; // YYYY-MM-DD
  jam_rencana: string; // HH:mm
  jumlah_rombongan: number;
  status_kunjungan: StatusKunjunganType;
  catatan_pengurus: string | null;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  has_slot_conflict?: boolean; // Indikator antrian bersamaan pada tanggal & jam sama
}

export interface KunjunganActionResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}
