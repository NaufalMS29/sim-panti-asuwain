"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { can } from "@/lib/rbac";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import {
  donasiBarangInputSchema,
  donasiUangInputSchema,
  donaturSchema,
  verifikasiDonasiSchema,
} from "../schemas/donasi.schema";
import {
  createDonasiBarangTransaction,
  createDonasiUangTransaction,
  createDonaturRecord,
  deleteDonasiTransaction,
  deleteDonaturRecord,
  getOrCreateDonaturByUserId,
  updateDonaturRecord,
  verifyDonasiTransaction,
} from "../services/donasi.service";
import { DonasiActionResponse } from "../types/donasi.types";

const ALLOWED_PROOF_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const MAX_PROOF_BYTES = 5 * 1024 * 1024; // 5 MB

async function saveProofFile(file: File): Promise<string> {
  if (!ALLOWED_PROOF_MIME.has(file.type)) {
    throw new Error(
      "Format lampiran bukti harus berupa JPG, PNG, WEBP, atau PDF.",
    );
  }
  if (file.size > MAX_PROOF_BYTES) {
    throw new Error("Ukuran file lampiran maksimal 5 MB.");
  }

  const ext = path.extname(file.name) || ".jpg";
  const safeFilename = `bukti-${Date.now()}-${crypto
    .randomBytes(4)
    .toString("hex")}${ext.toLowerCase()}`;

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "bukti-donasi",
  );
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, safeFilename), buffer);

  return `/uploads/bukti-donasi/${safeFilename}`;
}

function revalidateDonasiPaths() {
  revalidatePath("/dashboard/donasi");
  revalidatePath("/dashboard/donasi-saya");
  revalidatePath("/dashboard/data-donatur");
  revalidatePath("/dashboard/keuangan");
  revalidatePath("/dashboard/inventaris");
  revalidatePath("/dashboard");
}

/* ==================== CRUD DONATUR ==================== */

export async function createDonaturAction(
  rawInput: unknown,
): Promise<DonasiActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "donatur:manage")) {
      return { success: false, message: "Anda tidak memiliki izin akses." };
    }

    const parsed = donaturSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Data donatur tidak valid.",
      };
    }

    await createDonaturRecord(parsed.data);
    revalidateDonasiPaths();
    return {
      success: true,
      message: `Donatur "${parsed.data.nama_donatur}" berhasil ditambahkan.`,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal menyimpan data donatur.",
    };
  }
}

export async function updateDonaturAction(
  id_donatur: number,
  rawInput: unknown,
): Promise<DonasiActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "donatur:manage")) {
      return { success: false, message: "Anda tidak memiliki izin akses." };
    }

    const parsed = donaturSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Data donatur tidak valid.",
      };
    }

    await updateDonaturRecord(id_donatur, parsed.data);
    revalidateDonasiPaths();
    return {
      success: true,
      message: "Perubahan profil donatur berhasil disimpan.",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal memperbarui data donatur.",
    };
  }
}

export async function deleteDonaturAction(
  id_donatur: number,
): Promise<DonasiActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "donatur:manage")) {
      return { success: false, message: "Anda tidak memiliki izin akses." };
    }

    const deletedName = await deleteDonaturRecord(id_donatur);
    revalidateDonasiPaths();
    return {
      success: true,
      message: `Data donatur "${deletedName}" berhasil dihapus.`,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal menghapus data donatur.",
    };
  }
}

export async function updateOwnDonaturProfileAction(
  rawInput: unknown,
): Promise<DonasiActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "donasi:create_own")) {
      return { success: false, message: "Sesi donatur tidak valid." };
    }

    const parsed = donaturSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Data profil tidak valid.",
      };
    }

    const profil = await getOrCreateDonaturByUserId(
      user.id_user,
      user.username,
    );
    await updateDonaturRecord(profil.id_donatur, parsed.data);

    revalidateDonasiPaths();
    return {
      success: true,
      message: "Identitas donatur Anda berhasil diperbarui.",
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal memperbarui profil.",
    };
  }
}

/* ==================== SUBMIT DONASI UANG ==================== */

export async function submitDonasiUangAction(
  formData: FormData,
): Promise<DonasiActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Silakan login terlebih dahulu." };
    }

    const isAdminOrPengurus = can(user.role, "donasi:create");
    const isSelfDonatur = can(user.role, "donasi:create_own");

    if (!isAdminOrPengurus && !isSelfDonatur) {
      return {
        success: false,
        message: "Anda tidak memiliki izin membuat transaksi donasi.",
      };
    }

    let resolvedDonaturId: number | null = Number(
      formData.get("id_donatur") || 0,
    );
    if (!resolvedDonaturId) resolvedDonaturId = null;

    let defaultNamaPengirim = String(
      formData.get("nama_pengirim") || "",
    ).trim();

    if (!isAdminOrPengurus && isSelfDonatur) {
      const ownProfil = await getOrCreateDonaturByUserId(
        user.id_user,
        user.username,
      );
      resolvedDonaturId = ownProfil.id_donatur;
      if (!defaultNamaPengirim) {
        defaultNamaPengirim = ownProfil.nama_donatur;
      }
    }

    const metode = String(formData.get("metode_pembayaran") || "transfer_bank");
    const autoVerify =
      isAdminOrPengurus && formData.get("auto_verify") === "true";

    const parsed = donasiUangInputSchema.safeParse({
      id_donatur: resolvedDonaturId,
      nama_pengirim: defaultNamaPengirim,
      tanggal_donasi: String(
        formData.get("tanggal_donasi") ||
          new Date().toISOString().split("T")[0],
      ),
      is_anonim: formData.get("is_anonim") === "true",
      nominal: formData.get("nominal"),
      metode_pembayaran: metode,
      catatan: String(formData.get("catatan") || ""),
      auto_verify: autoVerify,
    });

    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "Input donasi uang tidak valid.",
      };
    }

    const fileEntry = formData.get("bukti_pembayaran");
    const hasFile = fileEntry instanceof File && fileEntry.size > 0;

    if (!isAdminOrPengurus && metode !== "tunai" && !hasFile) {
      return {
        success: false,
        message:
          "Silakan unggah foto atau PDF bukti pembayaran terlebih dahulu.",
      };
    }

    const buktiPath =
      hasFile && fileEntry instanceof File
        ? await saveProofFile(fileEntry)
        : null;

    const kodeDonasi = await createDonasiUangTransaction(
      parsed.data,
      buktiPath,
      autoVerify ? user.id_user : null,
    );
    revalidateDonasiPaths();

    return {
      success: true,
      message: autoVerify
        ? `Donasi uang (${kodeDonasi}) berhasil dicatat dan langsung terverifikasi.`
        : `Konfirmasi donasi (${kodeDonasi}) berhasil dikirim dan menunggu verifikasi pengurus.`,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal memproses donasi uang.",
    };
  }
}

/* ==================== SUBMIT DONASI BARANG ==================== */

export async function submitDonasiBarangAction(
  formData: FormData,
): Promise<DonasiActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Silakan login terlebih dahulu." };
    }

    const isAdminOrPengurus = can(user.role, "donasi:create");
    const isSelfDonatur = can(user.role, "donasi:create_own");

    if (!isAdminOrPengurus && !isSelfDonatur) {
      return {
        success: false,
        message: "Anda tidak memiliki izin membuat transaksi donasi.",
      };
    }

    let resolvedDonaturId: number | null = Number(
      formData.get("id_donatur") || 0,
    );
    if (!resolvedDonaturId) resolvedDonaturId = null;

    let defaultNamaPengirim = String(
      formData.get("nama_pengirim") || "",
    ).trim();

    if (!isAdminOrPengurus && isSelfDonatur) {
      const ownProfil = await getOrCreateDonaturByUserId(
        user.id_user,
        user.username,
      );
      resolvedDonaturId = ownProfil.id_donatur;
      if (!defaultNamaPengirim) {
        defaultNamaPengirim = ownProfil.nama_donatur;
      }
    }

    const autoVerify =
      isAdminOrPengurus && formData.get("auto_verify") === "true";

    const parsed = donasiBarangInputSchema.safeParse({
      id_donatur: resolvedDonaturId,
      nama_pengirim: defaultNamaPengirim,
      tanggal_donasi: String(
        formData.get("tanggal_donasi") ||
          new Date().toISOString().split("T")[0],
      ),
      is_anonim: formData.get("is_anonim") === "true",
      nama_barang: String(formData.get("nama_barang") || ""),
      kategori_barang: String(formData.get("kategori_barang") || "habis_pakai"),
      jumlah: formData.get("jumlah"),
      satuan: String(formData.get("satuan") || ""),
      nomor_resi_ekspedisi: String(formData.get("nomor_resi_ekspedisi") || ""),
      catatan: String(formData.get("catatan") || ""),
      auto_verify: autoVerify,
    });

    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "Input donasi barang tidak valid.",
      };
    }

    const fileEntry = formData.get("bukti_pembayaran");
    const hasFile = fileEntry instanceof File && fileEntry.size > 0;
    const buktiPath =
      hasFile && fileEntry instanceof File
        ? await saveProofFile(fileEntry)
        : null;

    const kodeDonasi = await createDonasiBarangTransaction(
      parsed.data,
      buktiPath,
      autoVerify ? user.id_user : null,
    );
    revalidateDonasiPaths();

    return {
      success: true,
      message: autoVerify
        ? `Donasi barang (${kodeDonasi}) berhasil dicatat dan langsung terverifikasi.`
        : `Pengajuan donasi barang (${kodeDonasi}) berhasil dikirim dan menunggu verifikasi pengurus.`,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal memproses donasi barang.",
    };
  }
}

/* ==================== VERIFIKASI & HAPUS TRANSAKSI ==================== */

export async function verifyDonasiAction(
  rawInput: unknown,
): Promise<DonasiActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "donasi:verify")) {
      return {
        success: false,
        message: "Anda tidak memiliki hak verifikasi transaksi donasi.",
      };
    }

    const parsed = verifikasiDonasiSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "Data verifikasi tidak valid.",
      };
    }

    await verifyDonasiTransaction(
      parsed.data.id_donasi,
      parsed.data.status_verifikasi,
      parsed.data.catatan_verifikasi,
      user.id_user,
    );

    revalidateDonasiPaths();
    return {
      success: true,
      message:
        parsed.data.status_verifikasi === "terverifikasi"
          ? "Transaksi donasi berhasil diverifikasi."
          : "Transaksi donasi telah ditandai ditolak.",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal memverifikasi donasi.",
    };
  }
}

export async function deleteDonasiAction(
  id_donasi: number,
): Promise<DonasiActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "donasi:delete")) {
      return {
        success: false,
        message: "Hanya Admin yang dapat menghapus transaksi donasi.",
      };
    }

    const kode = await deleteDonasiTransaction(id_donasi);
    revalidateDonasiPaths();

    return {
      success: true,
      message: `Transaksi donasi (${kode}) berhasil dihapus.`,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal menghapus transaksi.",
    };
  }
}
