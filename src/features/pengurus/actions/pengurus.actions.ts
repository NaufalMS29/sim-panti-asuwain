"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { assertPermission } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import { pengurusSchema, PengurusInput } from "../schemas/pengurus.schema";
import {
  createPengurusWithAccount,
  updatePengurusById,
  deletePengurusWithAccount,
  resetPengurusPasswordToDefault,
} from "../services/pengurus.service";
import { PengurusActionResponse } from "../types/pengurus.types";

async function getCurrentRole(): Promise<RoleName | undefined> {
  const session = await auth();
  return (session?.user as { role?: RoleName } | undefined)?.role;
}

export async function createPengurusAction(
  data: PengurusInput,
): Promise<PengurusActionResponse> {
  try {
    const role = await getCurrentRole();
    assertPermission(role, "pengurus:manage");

    const parsed = pengurusSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message || "Input pengurus tidak valid.",
      };
    }

    const creds = await createPengurusWithAccount(parsed.data);
    revalidatePath("/dashboard/data-pengurus");
    revalidatePath("/dashboard/admin");

    return {
      success: true,
      message: `Data pengurus berhasil disimpan. Akun otomatis dibuat dengan username "${creds.username}" dan password "${creds.defaultPassword}".`,
      generatedCredentials: creds,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menambahkan pengurus.",
    };
  }
}

export async function updatePengurusAction(
  id_pengurus: number,
  data: PengurusInput,
): Promise<PengurusActionResponse> {
  try {
    const role = await getCurrentRole();
    assertPermission(role, "pengurus:manage");

    const parsed = pengurusSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message || "Input pengurus tidak valid.",
      };
    }

    await updatePengurusById(id_pengurus, parsed.data);
    revalidatePath("/dashboard/data-pengurus");

    return {
      success: true,
      message: "Data pengurus berhasil diperbarui.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memperbarui pengurus.",
    };
  }
}

export async function deletePengurusAction(
  id_pengurus: number,
): Promise<PengurusActionResponse> {
  try {
    const role = await getCurrentRole();
    assertPermission(role, "pengurus:manage");

    await deletePengurusWithAccount(id_pengurus);
    revalidatePath("/dashboard/data-pengurus");
    revalidatePath("/dashboard/admin");

    return {
      success: true,
      message: "Data pengurus beserta akun loginnya berhasil dihapus.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menghapus pengurus.",
    };
  }
}

export async function resetPengurusPasswordAction(
  id_pengurus: number,
): Promise<PengurusActionResponse> {
  try {
    const role = await getCurrentRole();
    assertPermission(role, "users:manage");

    const creds = await resetPengurusPasswordToDefault(id_pengurus);
    return {
      success: true,
      message: `Password untuk akun "${creds.username}" berhasil direset ke "${creds.defaultPassword}".`,
      generatedCredentials: creds,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal mereset password.",
    };
  }
}
