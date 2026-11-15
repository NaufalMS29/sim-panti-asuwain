"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { assertPermission } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import {
  createAlumniSchema,
  CreateAlumniInput,
  updateAlumniSchema,
  UpdateAlumniInput,
} from "../schemas/alumni.schema";
import {
  createAlumniRecord,
  deleteAlumniRecord,
  updateAlumniRecord,
} from "../services/alumni.service";
import { AlumniActionResponse } from "../types/alumni.types";

async function requireAnakManageRole() {
  const session = await auth();
  const role = (session?.user as { role?: RoleName } | undefined)?.role;
  assertPermission(role, "anak_panti:update");
}

function revalidateAlumniRelatedPaths(id_anak?: number) {
  revalidatePath("/dashboard/data-alumni");
  revalidatePath("/dashboard/data-anak-panti");
  if (id_anak) {
    revalidatePath(`/dashboard/data-anak-panti/${id_anak}`);
  }
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/pengurus");
}

export async function createAlumniAction(
  data: CreateAlumniInput,
): Promise<AlumniActionResponse> {
  try {
    await requireAnakManageRole();

    const parsed = createAlumniSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message || "Input data alumni tidak valid.",
      };
    }

    const namaAnak = await createAlumniRecord(parsed.data);
    revalidateAlumniRelatedPaths(parsed.data.id_anak);

    return {
      success: true,
      message: `"${namaAnak}" berhasil dicatat ke dalam daftar alumni.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal mencatat data alumni.",
    };
  }
}

export async function updateAlumniAction(
  id_alumni: number,
  data: UpdateAlumniInput,
): Promise<AlumniActionResponse> {
  try {
    await requireAnakManageRole();

    const parsed = updateAlumniSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ||
          "Input pembaruan alumni tidak valid.",
      };
    }

    await updateAlumniRecord(id_alumni, parsed.data);
    revalidateAlumniRelatedPaths();

    return {
      success: true,
      message: "Data alumni berhasil diperbarui.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memperbarui data alumni.",
    };
  }
}

export async function deleteAlumniAction(
  id_alumni: number,
): Promise<AlumniActionResponse> {
  try {
    await requireAnakManageRole();

    const result = await deleteAlumniRecord(id_alumni);
    revalidateAlumniRelatedPaths(result.id_anak);

    return {
      success: true,
      message: `Catatan alumni "${result.nama_anak}" dihapus dan statusnya dikembalikan menjadi Anak Aktif.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menghapus data alumni.",
    };
  }
}
