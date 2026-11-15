"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { assertPermission } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import {
  anakPantiFormSchema,
  AnakPantiFormInput,
} from "../schemas/anak-panti.schema";
import {
  createAnakPantiRecord,
  deleteAnakPantiRecord,
  updateAnakPantiRecord,
} from "../services/anak-panti.service";
import { AnakPantiActionResponse } from "../types/anak-panti.types";

async function getCurrentRole(): Promise<RoleName | undefined> {
  const session = await auth();
  return (session?.user as { role?: RoleName } | undefined)?.role;
}

function revalidateAnakAllPaths(id_anak?: number) {
  revalidatePath("/dashboard/data-anak-panti");
  revalidatePath("/dashboard/data-alumni");
  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/pengurus");
  if (id_anak) {
    revalidatePath(`/dashboard/data-anak-panti/${id_anak}`);
  }
}

export async function createAnakPantiAction(
  data: AnakPantiFormInput,
): Promise<AnakPantiActionResponse> {
  try {
    const role = await getCurrentRole();
    assertPermission(role, "anak_panti:create");

    const parsed = anakPantiFormSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message || "Input data anak tidak valid.",
      };
    }

    const result = await createAnakPantiRecord(parsed.data);
    revalidateAnakAllPaths();

    return {
      success: true,
      message: `Data "${result.nama_anak}" berhasil ditambahkan dengan akun login "${result.username}" (password: ${result.defaultPassword}).`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menambahkan data anak panti.",
    };
  }
}

export async function updateAnakPantiAction(
  id_anak: number,
  data: AnakPantiFormInput,
): Promise<AnakPantiActionResponse> {
  try {
    const role = await getCurrentRole();
    assertPermission(role, "anak_panti:update");

    const parsed = anakPantiFormSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message || "Input pembaruan tidak valid.",
      };
    }

    await updateAnakPantiRecord(id_anak, parsed.data);
    revalidateAnakAllPaths(id_anak);

    return {
      success: true,
      message: "Biodata anak panti berhasil diperbarui.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memperbarui data anak panti.",
    };
  }
}

export async function deleteAnakPantiAction(
  id_anak: number,
): Promise<AnakPantiActionResponse> {
  try {
    const role = await getCurrentRole();
    assertPermission(role, "anak_panti:delete");

    const deletedName = await deleteAnakPantiRecord(id_anak);
    revalidateAnakAllPaths(id_anak);

    return {
      success: true,
      message: `Data anak "${deletedName}" beserta akun loginnya berhasil dihapus.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menghapus data anak panti.",
    };
  }
}
