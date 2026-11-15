export type JenisKasType = "pemasukan" | "pengeluaran";

export interface KategoriKasOption {
  id_kategori_kas: number;
  nama_kategori: string;
  jenis_kas: JenisKasType;
}

export interface TransaksiKasItem {
  id_transaksi_kas: number;
  id_pengurus: number | null;
  id_user: number | null;
  id_kategori_kas: number;
  id_donasi_uang: number | null;
  jenis_transaksi: JenisKasType;
  nama_kategori: string;
  nominal: number;
  tanggal_transaksi_iso: string;
  tanggal_transaksi_display: string;
  keterangan: string;
  file_nota: string | null;
  pencatat_nama: string | null;
  kode_donasi: string | null;
  metode_pembayaran: string | null;
  is_auto_donasi: boolean;
}

export interface KeuanganSummary {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoAkhir: number;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  pemasukanDariDonasi: number;
}

export interface KeuanganActionResponse {
  success: boolean;
  message: string;
}
