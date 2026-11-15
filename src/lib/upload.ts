import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export type UploadFolder =
  | "berkas-anak"
  | "bukti-donasi"
  | "nota-kas"
  | "kegiatan"
  | "legalitas";

export async function saveUploadedFile(
  file: File,
  folder: UploadFolder,
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name) || ".bin";
  const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, uniqueName), buffer);

  return `/uploads/${folder}/${uniqueName}`;
}

export async function deleteUploadedFile(
  publicPath: string | null | undefined,
) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;

  const fullPath = path.join(process.cwd(), "public", publicPath);
  try {
    await fs.unlink(fullPath);
  } catch {
    // Abaikan jika file fisik sudah tidak ada
  }
}
