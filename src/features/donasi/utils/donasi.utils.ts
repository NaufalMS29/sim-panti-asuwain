import { DonasiTransactionItem } from "../types/donasi.types";

export const REKENING_PANTI = [
  {
    bank: "Bank BRI",
    nomor: "0234-01-008912-53-4",
    atasNama: "Yayasan Panti Asuhan Asuwain",
  },
  {
    bank: "Bank Mandiri",
    nomor: "181-00-0451920-8",
    atasNama: "Panti Asuhan Asuwain",
  },
];

export const NOMINAL_PRESETS = [50000, 100000, 250000, 500000, 1000000];

export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nominal);
}

export function formatEnumLabel(val: string): string {
  return val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function isPdfFile(filePath: string): boolean {
  return filePath.toLowerCase().split("?")[0].endsWith(".pdf");
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export function exportDonasiTransactionsCsv(
  transactions: DonasiTransactionItem[],
): void {
  if (transactions.length === 0) return;

  const headers = [
    "No",
    "Kode Donasi",
    "Tanggal Donasi",
    "Nama Pengirim",
    "Anonim",
    "Donatur Terdaftar",
    "Jenis Donasi",
    "Nominal Uang (Rp)",
    "Rincian Metode / Barang",
    "Status Verifikasi",
    "Catatan",
  ];

  const rows = transactions.map((tx, idx) => {
    const rincian =
      tx.jenis_donasi === "uang" && tx.donasi_uang
        ? formatEnumLabel(tx.donasi_uang.metode_pembayaran)
        : tx.donasi_barang
          ? `${tx.donasi_barang.nama_barang} (${tx.donasi_barang.jumlah} ${tx.donasi_barang.satuan} - ${formatEnumLabel(tx.donasi_barang.kategori_barang)})`
          : "-";

    return [
      idx + 1,
      tx.kode_donasi,
      tx.tanggal_donasi_display,
      tx.nama_pengirim,
      tx.is_anonim ? "Ya (Hamba Allah)" : "Tidak",
      tx.nama_donatur_terdaftar || "-",
      tx.jenis_donasi.toUpperCase(),
      tx.donasi_uang ? tx.donasi_uang.nominal : 0,
      rincian,
      tx.status_verifikasi.toUpperCase(),
      tx.catatan || "-",
    ]
      .map(escapeCsvCell)
      .join(",");
  });

  const csvContent = `\uFEFF${[headers.map(escapeCsvCell).join(","), ...rows].join("\r\n")}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const todayStr = new Date().toISOString().split("T")[0];
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `rekap-transaksi-donasi-${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
