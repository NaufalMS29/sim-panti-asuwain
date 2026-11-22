import { AlumniListItem } from "../types/alumni.types";

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export function getBiodataSubline(item: AlumniListItem): string {
  const rec = item as unknown as Record<string, unknown>;
  const jk =
    rec.jenis_kelamin === "L"
      ? "Laki-laki"
      : rec.jenis_kelamin === "P"
        ? "Perempuan"
        : typeof rec.jenis_kelamin === "string"
          ? rec.jenis_kelamin
          : "";
  const tempat = typeof rec.tempat_lahir === "string" ? rec.tempat_lahir : "";
  const tgl =
    typeof rec.tanggal_lahir_display === "string"
      ? rec.tanggal_lahir_display
      : typeof rec.tanggal_lahir === "string"
        ? rec.tanggal_lahir
        : "";
  const ttl = [tempat, tgl].filter(Boolean).join(", ");
  return [jk, ttl].filter(Boolean).join(" • ");
}

export function exportAlumniToCsv(data: AlumniListItem[]): void {
  const headers = [
    "No",
    "Nama Lengkap Alumni",
    "NIK",
    "Tahun Lulus",
    "Pekerjaan / Aktivitas Saat Ini",
    "Kontak / No. HP",
    "Alamat Domisili Sekarang",
  ];

  const rows = data.map((item, idx) =>
    [
      idx + 1,
      item.nama_anak,
      item.nik ? `\t${item.nik}` : "-",
      item.tahun_lulus,
      item.pekerjaan_sekarang || "-",
      item.kontak ? `\t${item.kontak}` : "-",
      item.alamat_sekarang || "-",
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
  link.setAttribute("download", `rekap-data-alumni-${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
