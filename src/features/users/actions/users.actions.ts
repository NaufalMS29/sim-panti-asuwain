"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { assertPermission } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import {
  createUserSchema,
  updateUserSchema,
  CreateUserInput,
  UpdateUserInput,
} from "../schemas/users.schema";
import {
  createUserAccount,
  updateUserAccount,
  resetUserPasswordToDefault,
  deleteUserAccount,
} from "../services/users.service";
import { UserActionResponse } from "../types/users.types";

async function getSessionInfo() {
  const session = await auth();
  const user = session?.user as
    | { id_user?: number; id?: string; role?: RoleName }
    | undefined;
  const userId = user?.id_user ?? (user?.id ? Number(user.id) : null);

  return {
    role: user?.role,
    userId: Number.isNaN(userId) ? null : userId,
  };
}

export async function createUserAction(
  data: CreateUserInput,
): Promise<UserActionResponse> {
  try {
    const { role } = await getSessionInfo();
    assertPermission(role, "users:manage");

    const parsed = createUserSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Input akun tidak valid.",
      };
    }

    const result = await createUserAccount(parsed.data);
    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard/admin");

    return {
      success: true,
      message: `Akun "${result.username}" berhasil dibuat dengan password "${result.usedPassword}".`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal membuat akun pengguna.",
    };
  }
}

export async function updateUserAction(
  id_user: number,
  data: UpdateUserInput,
): Promise<UserActionResponse> {
  try {
    const { role } = await getSessionInfo();
    assertPermission(role, "users:manage");

    const parsed = updateUserSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message || "Input pembaruan tidak valid.",
      };
    }

    await updateUserAccount(id_user, parsed.data);
    revalidatePath("/dashboard/users");

    return {
      success: true,
      message: "Data akun dan role pengguna berhasil diperbarui.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memperbarui akun pengguna.",
    };
  }
}

export async function resetUserPasswordAction(
  id_user: number,
): Promise<UserActionResponse> {
  try {
    const { role } = await getSessionInfo();
    assertPermission(role, "users:manage");

    const result = await resetUserPasswordToDefault(id_user);
    revalidatePath("/dashboard/users");

    return {
      success: true,
      message: `Password akun "${result.username}" berhasil direset ke "${result.defaultPassword}".`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal mereset password akun.",
    };
  }
}

export async function deleteUserAction(
  id_user: number,
): Promise<UserActionResponse> {
  try {
    const { role, userId } = await getSessionInfo();
    assertPermission(role, "users:manage");

    await deleteUserAccount(id_user, userId);
    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/data-pengurus");
    revalidatePath("/dashboard/data-anak-panti");

    return {
      success: true,
      message: "Akun pengguna berhasil dihapus.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menghapus akun pengguna.",
    };
  }
}
