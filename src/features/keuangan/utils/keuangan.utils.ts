import { TransaksiKasItem } from "../types/keuangan.types";

export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nominal);
}

export function isPdfFile(filePath: string): boolean {
  return filePath.toLowerCase().split("?")[0].endsWith(".pdf");
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export function exportKeuanganCsv(transactions: TransaksiKasItem[]): void {
  if (transactions.length === 0) return;

  const headers = [
    "No",
    "Tanggal",
    "Jenis Kas",
    "Kategori",
    "Sumber Pencatatan",
    "Kode Donasi Terkait",
    "Nominal (Rp)",
    "Keterangan",
    "Pengurus Pencatat",
  ];

  const rows = transactions.map((tx, idx) =>
    [
      idx + 1,
      tx.tanggal_transaksi_display,
      tx.jenis_transaksi.toUpperCase(),
      tx.nama_kategori,
      tx.is_auto_donasi ? "Otomatis dari Donasi" : "Input Manual Kas",
      tx.kode_donasi || "-",
      tx.jenis_transaksi === "pemasukan" ? tx.nominal : -tx.nominal,
      tx.keterangan,
      tx.pencatat_nama || "-",
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
  link.setAttribute("download", `buku-kas-panti-${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
