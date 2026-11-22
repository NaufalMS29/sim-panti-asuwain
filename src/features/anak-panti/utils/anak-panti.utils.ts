import { AnakPantiItem } from "../types/anak-panti.types";

export function formatEnumLabel(val: string): string {
  if (val === "L") return "Laki-laki";
  if (val === "P") return "Perempuan";
  return val.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function isBerkasUtamaLengkap(item: AnakPantiItem): boolean {
  return (
    item.kelengkapan_berkas.kk &&
    item.kelengkapan_berkas.akta &&
    item.kelengkapan_berkas.ijazah
  );
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export function exportAnakPantiToCsv(data: AnakPantiItem[]): void {
  const headers = [
    "No",
    "Nama Lengkap",
    "NIK",
    "Username Portal",
    "Jenis Kelamin",
    "Tempat Lahir",
    "Tanggal Lahir",
    "Kategori Sosial",
    "Status Kepengasuhan",
    "Tanggal Masuk Panti",
    "Kartu Keluarga (KK)",
    "Akta Kelahiran",
    "Ijazah",
    "Ringkasan Dokumen Utama",
    "Total File Terunggah",
  ];

  const rows = data.map((item, idx) => {
    const primaryCount = [
      item.kelengkapan_berkas.kk,
      item.kelengkapan_berkas.akta,
      item.kelengkapan_berkas.ijazah,
    ].filter(Boolean).length;

    const statusKepengasuhan = item.is_alumni
      ? `Alumni${item.tahun_lulus ? ` (${item.tahun_lulus})` : ""}`
      : "Anak Asuh Aktif";

    return [
      idx + 1,
      item.nama_anak,
      item.nik ? `\t${item.nik}` : "-",
      item.username || "-",
      formatEnumLabel(item.jenis_kelamin),
      item.tempat_lahir,
      item.tanggal_lahir_display,
      formatEnumLabel(item.status_anak),
      statusKepengasuhan,
      item.tanggal_masuk_display,
      item.kelengkapan_berkas.kk ? "Lengkap" : "Belum Ada",
      item.kelengkapan_berkas.akta ? "Lengkap" : "Belum Ada",
      item.kelengkapan_berkas.ijazah ? "Lengkap" : "Belum Ada",
      primaryCount === 3
        ? "Lengkap (3/3)"
        : `Belum Lengkap (${primaryCount}/3)`,
      item.berkas_count,
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
  link.setAttribute("download", `rekap-data-anak-panti-${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
