export function formatEnumLabel(val: string): string {
  if (val.toLowerCase() === "ktp") return "KTP";
  return val.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function isPdfFile(filePath: string): boolean {
  return filePath.toLowerCase().split("?")[0].endsWith(".pdf");
}

export const IDENTITAS_CATEGORIES = new Set(["kartu_keluarga", "akta", "ktp"]);
export const PENDIDIKAN_CATEGORIES = new Set(["ijazah", "rapor", "sertifikat"]);
