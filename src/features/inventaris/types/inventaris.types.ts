export type KondisiInventarisType = "baik" | "rusak_ringan" | "rusak_berat";

export interface InventarisBarangItem {
  id_inventaris: number;
  id_donasi_barang: number | null;
  kode_inventaris: string;
  nama_barang: string;
  jumlah: number;
  kondisi: KondisiInventarisType;
  lokasi_penyimpanan: string;
  tgl_perolehan_iso: string;
  tgl_perolehan_display: string;
  keterangan: string | null;
  kode_donasi: string | null;
  nama_pengirim_donasi: string | null;
  is_auto_donasi: boolean;
}

export interface LogistikHabisPakaiItem {
  id_logistik: number;
  nama_barang: string;
  kategori: string;
  stok_jumlah: number;
  satuan: string;
  updated_at_display: string;
}

export interface LogistikMasukItem {
  id_logistik_masuk: number;
  id_logistik: number;
  id_donasi_barang: number | null;
  nama_barang: string;
  kategori: string;
  satuan: string;
  jumlah_masuk: number;
  tanggal_masuk_iso: string;
  tanggal_masuk_display: string;
  keterangan: string;
  pencatat_nama: string | null;
  kode_donasi: string | null;
  is_auto_donasi: boolean;
}

export interface LogistikKeluarItem {
  id_logistik_keluar: number;
  id_logistik: number;
  nama_barang: string;
  kategori: string;
  satuan: string;
  jumlah_keluar: number;
  tanggal_keluar_iso: string;
  tanggal_keluar_display: string;
  peruntukan: string;
  pencatat_nama: string | null;
}

export interface InventarisLogistikSummary {
  totalJenisAset: number;
  totalUnitAset: number;
  asetBaikUnit: number;
  asetRusakUnit: number;
  totalJenisLogistik: number;
  stokMenipisCount: number;
  stokHabisCount: number;
}

export interface InventarisActionResponse {
  success: boolean;
  message: string;
}
