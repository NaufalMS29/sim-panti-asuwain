import {
  InventarisBarangItem,
  KondisiInventarisType,
  LogistikHabisPakaiItem,
} from "../types/inventaris.types";

export const LOW_STOCK_THRESHOLD = 5;

export const KATEGORI_LOGISTIK_PRESETS = [
  "Sembako & Kebutuhan Dapur",
  "Perlengkapan Mandi & Kebersihan",
  "Kesehatan & Obat-obatan",
  "ATK & Perlengkapan Sekolah",
  "Sandang & Perlengkapan Anak",
  "Donasi / Umum",
];

export const LOKASI_INVENTARIS_PRESETS = [
  "Gudang Utama (Belum Ditempatkan)",
  "Ruang Belajar & Perpustakaan",
  "Asrama Putra",
  "Asrama Putri",
  "Ruang Makan & Dapur",
  "Kantor Pengurus",
  "Aula & Mushola",
];

export function formatKondisiLabel(kondisi: KondisiInventarisType): string {
  switch (kondisi) {
    case "baik":
      return "Baik";
    case "rusak_ringan":
      return "Rusak Ringan";
    case "rusak_berat":
      return "Rusak Berat";
  }
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export function exportInventarisCsv(items: InventarisBarangItem[]): void {
  if (items.length === 0) return;

  const headers = [
    "No",
    "Kode Inventaris",
    "Nama Barang",
    "Jumlah Unit",
    "Kondisi",
    "Lokasi Penyimpanan",
    "Tanggal Perolehan",
    "Sumber",
    "Kode Donasi",
    "Keterangan",
  ];

  const rows = items.map((item, idx) =>
    [
      idx + 1,
      item.kode_inventaris,
      item.nama_barang,
      item.jumlah,
      formatKondisiLabel(item.kondisi),
      item.lokasi_penyimpanan,
      item.tgl_perolehan_display,
      item.is_auto_donasi ? "Donasi Terverifikasi" : "Pengadaan Mandiri",
      item.kode_donasi || "-",
      item.keterangan || "-",
    ]
      .map(escapeCsvCell)
      .join(","),
  );

  const csvContent = `\uFEFF${[headers.map(escapeCsvCell).join(","), ...rows].join("\r\n")}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const todayStr = new Date().toISOString().split("T")[0];
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `daftar-inventaris-panti-${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportLogistikCsv(items: LogistikHabisPakaiItem[]): void {
  if (items.length === 0) return;

  const headers = [
    "No",
    "Nama Barang",
    "Kategori",
    "Sisa Stok",
    "Satuan",
    "Status Stok",
    "Pembaruan Terakhir",
  ];

  const rows = items.map((item, idx) =>
    [
      idx + 1,
      item.nama_barang,
      item.kategori,
      item.stok_jumlah,
      item.satuan,
      item.stok_jumlah === 0
        ? "HABIS"
        : item.stok_jumlah <= LOW_STOCK_THRESHOLD
          ? "MENIPIS"
          : "AMAN",
      item.updated_at_display,
    ]
      .map(escapeCsvCell)
      .join(","),
  );

  const csvContent = `\uFEFF${[headers.map(escapeCsvCell).join(","), ...rows].join("\r\n")}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const todayStr = new Date().toISOString().split("T")[0];
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `stok-logistik-panti-${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
