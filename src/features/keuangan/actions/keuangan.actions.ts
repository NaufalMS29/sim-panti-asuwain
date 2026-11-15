"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { can } from "@/lib/rbac";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import { transaksiKasSchema } from "../schemas/keuangan.schema";
import {
  createKategoriKasRecord,
  createManualTransaksiKas,
  deleteManualTransaksiKas,
  updateManualTransaksiKas,
} from "../services/keuangan.service";
import { JenisKasType, KeuanganActionResponse } from "../types/keuangan.types";

const ALLOWED_KAS_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const MAX_KAS_BYTES = 5 * 1024 * 1024; // 5 MB

async function saveKasNotaFile(file: File): Promise<string> {
  if (!ALLOWED_KAS_MIME.has(file.type)) {
    throw new Error(
      "Format nota/bukti kas harus berupa JPG, PNG, WEBP, atau PDF.",
    );
  }
  if (file.size > MAX_KAS_BYTES) {
    throw new Error("Ukuran file lampiran maksimal 5 MB.");
  }

  const ext = path.extname(file.name) || ".jpg";
  const safeFilename = `nota-${Date.now()}-${crypto
    .randomBytes(4)
    .toString("hex")}${ext.toLowerCase()}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "bukti-kas");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, safeFilename), buffer);

  return `/uploads/bukti-kas/${safeFilename}`;
}

function revalidateKeuanganPaths() {
  revalidatePath("/dashboard/keuangan");
  revalidatePath("/dashboard");
}

export async function createKategoriKasAction(
  namaKategori: string,
  jenisKas: JenisKasType,
): Promise<KeuanganActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "keuangan:manage")) {
      return {
        success: false,
        message: "Anda tidak memiliki izin menambah kategori kas.",
      };
    }

    const created = await createKategoriKasRecord(namaKategori, jenisKas);
    revalidateKeuanganPaths();

    return {
      success: true,
      message: `Kategori ${created.jenis_kas} "${created.nama_kategori}" siap digunakan.`,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal menambahkan kategori kas.",
    };
  }
}

export async function createTransaksiKasAction(
  formData: FormData,
): Promise<KeuanganActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "keuangan:manage")) {
      return {
        success: false,
        message: "Anda tidak memiliki izin mengelola kas panti.",
      };
    }

    const parsed = transaksiKasSchema.safeParse({
      jenis_transaksi: String(formData.get("jenis_transaksi") || ""),
      id_kategori_kas: formData.get("id_kategori_kas"),
      nominal: formData.get("nominal"),
      tanggal_transaksi: String(
        formData.get("tanggal_transaksi") ||
          new Date().toISOString().split("T")[0],
      ),
      keterangan: String(formData.get("keterangan") || ""),
    });

    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "Data transaksi kas tidak valid.",
      };
    }

    const fileEntry = formData.get("file_nota");
    const hasFile = fileEntry instanceof File && fileEntry.size > 0;
    const fileNotaPath =
      hasFile && fileEntry instanceof File
        ? await saveKasNotaFile(fileEntry)
        : null;

    await createManualTransaksiKas(parsed.data, user.id_user, fileNotaPath);
    revalidateKeuanganPaths();

    return {
      success: true,
      message: `Transaksi ${parsed.data.jenis_transaksi} berhasil dicatat ke buku kas.`,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal menyimpan transaksi kas.",
    };
  }
}

export async function updateTransaksiKasAction(
  id_transaksi_kas: number,
  formData: FormData,
): Promise<KeuanganActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "keuangan:manage")) {
      return {
        success: false,
        message: "Anda tidak memiliki izin mengelola kas panti.",
      };
    }

    const parsed = transaksiKasSchema.safeParse({
      jenis_transaksi: String(formData.get("jenis_transaksi") || ""),
      id_kategori_kas: formData.get("id_kategori_kas"),
      nominal: formData.get("nominal"),
      tanggal_transaksi: String(formData.get("tanggal_transaksi") || ""),
      keterangan: String(formData.get("keterangan") || ""),
    });

    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "Data transaksi kas tidak valid.",
      };
    }

    const fileEntry = formData.get("file_nota");
    const hasFile = fileEntry instanceof File && fileEntry.size > 0;
    const newFileNotaPath =
      hasFile && fileEntry instanceof File
        ? await saveKasNotaFile(fileEntry)
        : null;

    await updateManualTransaksiKas(
      id_transaksi_kas,
      parsed.data,
      newFileNotaPath,
    );
    revalidateKeuanganPaths();

    return {
      success: true,
      message: "Perubahan transaksi kas berhasil disimpan.",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal memperbarui transaksi kas.",
    };
  }
}

export async function deleteTransaksiKasAction(
  id_transaksi_kas: number,
): Promise<KeuanganActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "keuangan:manage")) {
      return {
        success: false,
        message: "Anda tidak memiliki izin menghapus transaksi kas.",
      };
    }

    await deleteManualTransaksiKas(id_transaksi_kas);
    revalidateKeuanganPaths();

    return {
      success: true,
      message: "Transaksi kas manual berhasil dihapus.",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal menghapus transaksi kas.",
    };
  }
}
