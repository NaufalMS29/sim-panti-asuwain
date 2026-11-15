export type JenisDonasiType = "uang" | "barang";
export type StatusVerifikasiType = "pending" | "terverifikasi" | "ditolak";
export type MetodePembayaranType = "transfer_bank" | "qris" | "tunai";
export type KategoriBarangDonasiType = "habis_pakai" | "inventaris";

export interface DonaturItem {
  id_donatur: number;
  id_user: number | null;
  username: string | null;
  nama_donatur: string;
  email: string | null;
  no_telepon: string | null;
  alamat: string | null;
  tipe_donatur: string;
  frekuensi_donasi: string | null;
  total_transaksi: number;
  total_donasi_uang: number;
}

export interface DonasiUangDetail {
  id_donasi_uang: number;
  nominal: number;
  metode_pembayaran: MetodePembayaranType;
}

export interface DonasiBarangDetail {
  id_donasi_barang: number;
  nama_barang: string;
  kategori_barang: KategoriBarangDonasiType;
  jumlah: number;
  satuan: string;
  nomor_resi_ekspedisi: string | null;
}

export interface DonasiTransactionItem {
  id_donasi: number;
  id_donatur: number | null;
  kode_donasi: string;
  nama_pengirim: string;
  nama_donatur_terdaftar: string | null;
  tanggal_donasi_iso: string;
  tanggal_donasi_display: string;
  jenis_donasi: JenisDonasiType;
  is_anonim: boolean;
  status_verifikasi: StatusVerifikasiType;
  bukti_pembayaran: string | null;
  catatan: string | null;
  verifikator_nama: string | null;
  donasi_uang: DonasiUangDetail | null;
  donasi_barang: DonasiBarangDetail | null;
}

export interface DonaturPortalData {
  profil: DonaturItem;
  riwayat: DonasiTransactionItem[];
}

export interface DonasiActionResponse {
  success: boolean;
  message: string;
}
