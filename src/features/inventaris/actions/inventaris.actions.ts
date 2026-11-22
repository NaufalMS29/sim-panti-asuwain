"use server";

import { revalidatePath } from "next/cache";
import { can } from "@/lib/rbac";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import {
  inventarisBarangSchema,
  logistikKeluarSchema,
  logistikMasukSchema,
} from "../schemas/inventaris.schema";
import {
  createLogistikKeluarRecord,
  createManualInventarisBarang,
  createManualLogistikMasuk,
  deleteLogistikKeluarRecord,
  deleteManualInventarisBarang,
  deleteManualLogistikMasuk,
  updateInventarisBarangRecord,
} from "../services/inventaris.service";
import { InventarisActionResponse } from "../types/inventaris.types";

function revalidateInventarisPaths() {
  revalidatePath("/dashboard/inventaris");
  revalidatePath("/dashboard");
}

/* ==================== INVENTARIS BARANG ==================== */

export async function createInventarisBarangAction(
  rawInput: unknown,
): Promise<InventarisActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "inventaris:manage")) {
      return {
        success: false,
        message: "Anda tidak memiliki izin mengelola inventaris panti.",
      };
    }

    const parsed = inventarisBarangSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "Data inventaris tidak valid.",
      };
    }

    const kode = await createManualInventarisBarang(parsed.data);
    revalidateInventarisPaths();

    return {
      success: true,
      message: `Aset inventaris "${parsed.data.nama_barang}" (${kode}) berhasil ditambahkan.`,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal menambah data inventaris.",
    };
  }
}

export async function updateInventarisBarangAction(
  id_inventaris: number,
  rawInput: unknown,
): Promise<InventarisActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "inventaris:manage")) {
      return {
        success: false,
        message: "Anda tidak memiliki izin mengelola inventaris panti.",
      };
    }

    const parsed = inventarisBarangSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "Data inventaris tidak valid.",
      };
    }

    await updateInventarisBarangRecord(id_inventaris, parsed.data);
    revalidateInventarisPaths();

    return {
      success: true,
      message: "Perubahan data inventaris berhasil disimpan.",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Gagal memperbarui data inventaris.",
    };
  }
}

export async function deleteInventarisBarangAction(
  id_inventaris: number,
): Promise<InventarisActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "inventaris:manage")) {
      return {
        success: false,
        message: "Anda tidak memiliki izin menghapus inventaris panti.",
      };
    }

    const nama = await deleteManualInventarisBarang(id_inventaris);
    revalidateInventarisPaths();

    return {
      success: true,
      message: `Aset inventaris "${nama}" berhasil dihapus.`,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal menghapus inventaris.",
    };
  }
}

/* ==================== LOGISTIK HABIS PAKAI ==================== */

export async function createLogistikMasukAction(
  rawInput: unknown,
): Promise<InventarisActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "inventaris:manage")) {
      return {
        success: false,
        message: "Anda tidak memiliki izin mencatat logistik masuk.",
      };
    }

    const parsed = logistikMasukSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "Input barang masuk tidak valid.",
      };
    }

    await createManualLogistikMasuk(parsed.data, user.id_user);
    revalidateInventarisPaths();

    return {
      success: true,
      message: "Penerimaan stok logistik berhasil dicatat.",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal mencatat logistik masuk.",
    };
  }
}

export async function createLogistikKeluarAction(
  rawInput: unknown,
): Promise<InventarisActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "inventaris:manage")) {
      return {
        success: false,
        message: "Anda tidak memiliki izin mencatat pemakaian logistik.",
      };
    }

    const parsed = logistikKeluarSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "Input barang keluar tidak valid.",
      };
    }

    await createLogistikKeluarRecord(parsed.data, user.id_user);
    revalidateInventarisPaths();

    return {
      success: true,
      message: "Pemakaian / distribusi logistik berhasil dicatat.",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Gagal mencatat logistik keluar.",
    };
  }
}

export async function deleteLogistikMasukAction(
  id_logistik_masuk: number,
): Promise<InventarisActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "inventaris:manage")) {
      return {
        success: false,
        message: "Anda tidak memiliki izin menghapus riwayat logistik.",
      };
    }

    await deleteManualLogistikMasuk(id_logistik_masuk);
    revalidateInventarisPaths();

    return {
      success: true,
      message: "Riwayat barang masuk dihapus dan stok telah disesuaikan.",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Gagal menghapus riwayat barang masuk.",
    };
  }
}

export async function deleteLogistikKeluarAction(
  id_logistik_keluar: number,
): Promise<InventarisActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !can(user.role, "inventaris:manage")) {
      return {
        success: false,
        message: "Anda tidak memiliki izin menghapus riwayat logistik.",
      };
    }

    await deleteLogistikKeluarRecord(id_logistik_keluar);
    revalidateInventarisPaths();

    return {
      success: true,
      message: "Riwayat barang keluar dibatalkan dan stok dikembalikan.",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Gagal membatalkan riwayat barang keluar.",
    };
  }
}
