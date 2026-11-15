"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { assertPermission } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import {
  changePasswordSchema,
  ChangePasswordInput,
  updateProfilSchema,
  UpdateProfilInput,
} from "../schemas/profil.schema";
import { changeOwnPassword, updateOwnProfil } from "../services/profil.service";
import { ProfilActionResponse } from "../types/profil.types";

async function getCurrentSessionUser() {
  const session = await auth();
  const user = session?.user as
    | { id_user?: number; id?: string; role?: RoleName }
    | undefined;
  const rawId = user?.id_user ?? (user?.id ? Number(user.id) : null);
  const userId = rawId !== null && !Number.isNaN(rawId) ? rawId : null;

  return {
    userId,
    role: user?.role,
  };
}

export async function updateOwnProfilAction(
  data: UpdateProfilInput,
): Promise<ProfilActionResponse> {
  try {
    const { userId, role } = await getCurrentSessionUser();
    assertPermission(role, "profil:view_own");

    if (!userId || !role) {
      return {
        success: false,
        message: "Sesi login tidak valid. Silakan masuk ulang.",
      };
    }

    const parsed = updateProfilSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Input profil tidak valid.",
      };
    }

    await updateOwnProfil(userId, role, parsed.data);
    revalidatePath("/dashboard/profil");
    revalidatePath("/dashboard/anak");
    revalidatePath("/dashboard/data-pengurus");
    revalidatePath("/dashboard/users");

    return {
      success: true,
      message: "Data profil Anda berhasil diperbarui.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memperbarui profil.",
    };
  }
}

export async function changeOwnPasswordAction(
  data: ChangePasswordInput,
): Promise<ProfilActionResponse> {
  try {
    const { userId, role } = await getCurrentSessionUser();
    assertPermission(role, "profil:view_own");

    if (!userId) {
      return {
        success: false,
        message: "Sesi login tidak valid. Silakan masuk ulang.",
      };
    }

    const parsed = changePasswordSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message || "Input password tidak valid.",
      };
    }

    await changeOwnPassword(userId, parsed.data);
    revalidatePath("/dashboard/profil");

    return {
      success: true,
      message: "Password akun Anda berhasil diperbarui.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal mengubah password.",
    };
  }
}
