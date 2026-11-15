import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { JenisBerkas } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AnakBerkasDetail, OwnBerkasSummary } from "../types/berkas-anak.types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "berkas-anak");

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function formatDateIndo(dateVal: Date | string): string {
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function sanitizeFileName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getAnakWithBerkas(
  id_anak: number,
): Promise<AnakBerkasDetail | null> {
  const anak = await prisma.anak_panti.findUnique({
    where: { id_anak },
    include: {
      berkas_anak: {
        orderBy: { id_berkas: "desc" },
      },
      alumni: {
        select: {
          id_alumni: true,
          tahun_lulus: true,
        },
      },
    },
  });

  if (!anak) return null;

  return {
    id_anak: anak.id_anak,
    nama_anak: anak.nama_anak,
    nik: anak.nik,
    tempat_lahir: anak.tempat_lahir,
    tanggal_lahir: formatDateIndo(anak.tanggal_lahir),
    jenis_kelamin: String(anak.jenis_kelamin),
    status_anak: String(anak.status_anak),
    tanggal_masuk: formatDateIndo(anak.tanggal_masuk),
    berkas: anak.berkas_anak.map((b) => ({
      id_berkas: b.id_berkas,
      id_anak: b.id_anak,
      jenis_berkas: String(b.jenis_berkas),
      nama_file: b.nama_berkas,
      file_path: b.file_path,
    })),
    alumni: anak.alumni
      ? {
          id_alumni: anak.alumni.id_alumni,
          tahun_lulus: anak.alumni.tahun_lulus,
        }
      : null,
  };
}

export async function getOwnBerkasByUserId(
  id_user: number,
): Promise<OwnBerkasSummary | null> {
  const anak = await prisma.anak_panti.findUnique({
    where: { id_user },
    include: {
      berkas_anak: {
        orderBy: { id_berkas: "desc" },
      },
      alumni: {
        select: {
          id_alumni: true,
          tahun_lulus: true,
        },
      },
    },
  });

  if (!anak) return null;

  return {
    id_anak: anak.id_anak,
    nama_anak: anak.nama_anak,
    nik: anak.nik,
    status_anak: String(anak.status_anak),
    is_alumni: Boolean(anak.alumni),
    tahun_lulus: anak.alumni?.tahun_lulus ?? null,
    berkas: anak.berkas_anak.map((b) => ({
      id_berkas: b.id_berkas,
      id_anak: b.id_anak,
      jenis_berkas: String(b.jenis_berkas),
      nama_file: b.nama_berkas,
      file_path: b.file_path,
    })),
  };
}

export async function uploadBerkasAnakRecord(params: {
  id_anak: number;
  jenis_berkas: string;
  customNamaFile?: string;
  file: File;
}) {
  const { id_anak, jenis_berkas, customNamaFile, file } = params;

  const validJenisList = Object.values(JenisBerkas) as string[];
  if (!validJenisList.includes(jenis_berkas)) {
    throw new Error("Kategori jenis berkas tidak valid.");
  }

  const anak = await prisma.anak_panti.findUnique({
    where: { id_anak },
    select: { id_anak: true },
  });
  if (!anak) {
    throw new Error("Data anak panti tidak ditemukan.");
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      "Format file tidak didukung. Gunakan PDF, JPG, PNG, atau WEBP.",
    );
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Ukuran file wajib antara 1 KB hingga maksimal 5 MB.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name) || ".pdf";
  const baseName = sanitizeFileName(path.basename(file.name, ext)) || "dokumen";
  const storedFileName = `anak-${id_anak}-${Date.now()}-${baseName}${ext.toLowerCase()}`;
  const diskPath = path.join(UPLOAD_DIR, storedFileName);
  const publicUrlPath = `/uploads/berkas-anak/${storedFileName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(diskPath, buffer);

  const displayNamaBerkas =
    customNamaFile && customNamaFile.trim() !== ""
      ? customNamaFile.trim()
      : file.name;

  await prisma.berkas_anak.create({
    data: {
      id_anak,
      jenis_berkas: jenis_berkas as JenisBerkas,
      nama_berkas: displayNamaBerkas,
      file_path: publicUrlPath,
    },
  });
}

export async function deleteBerkasAnakRecord(id_berkas: number) {
  const berkas = await prisma.berkas_anak.findUnique({
    where: { id_berkas },
  });

  if (!berkas) {
    throw new Error("Berkas dokumen tidak ditemukan.");
  }

  await prisma.berkas_anak.delete({
    where: { id_berkas },
  });

  if (berkas.file_path.startsWith("/uploads/berkas-anak/")) {
    const fileName = path.basename(berkas.file_path);
    const diskPath = path.join(UPLOAD_DIR, fileName);
    try {
      await unlink(diskPath);
    } catch {
      // Abaikan jika file fisik sudah tidak ada di disk
    }
  }

  return berkas.id_anak;
}
