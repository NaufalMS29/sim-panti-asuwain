import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { CreateUserInput, UpdateUserInput } from "../schemas/users.schema";
import { RoleOption, UserManagementItem } from "../types/users.types";

export const DEFAULT_ACCOUNT_PASSWORD = "asuwain123";

export async function getAllRoles(): Promise<RoleOption[]> {
  return prisma.roles.findMany({
    select: {
      id_role: true,
      nama_role: true,
    },
    orderBy: { id_role: "asc" },
  });
}

export async function getAllUsersWithRelations(): Promise<
  UserManagementItem[]
> {
  const rows = await prisma.users.findMany({
    include: {
      roles: { select: { nama_role: true } },
      pengurus: { select: { nama_pengurus: true } },
      anak_panti: { select: { nama_anak: true } },
      donatur: { select: { nama_donatur: true } },
    },
    orderBy: { id_user: "desc" },
  });

  return rows.map((row) => {
    const linkedName =
      row.pengurus?.nama_pengurus ||
      row.anak_panti?.nama_anak ||
      row.donatur?.nama_donatur ||
      null;

    return {
      id_user: row.id_user,
      role_id: row.role_id,
      nama_role: row.roles.nama_role,
      username: row.username,
      email: row.email,
      has_password: Boolean(row.password),
      has_google: Boolean(row.google_id),
      linked_name: linkedName,
      created_at: new Date(row.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  });
}

export async function createUserAccount(input: CreateUserInput) {
  const normalizedUsername = input.username.trim().toLowerCase();
  const normalizedEmail =
    input.email.trim() === "" ? null : input.email.trim().toLowerCase();

  const existingUsername = await prisma.users.findUnique({
    where: { username: normalizedUsername },
    select: { id_user: true },
  });
  if (existingUsername) {
    throw new Error(`Username "${normalizedUsername}" sudah digunakan.`);
  }

  if (normalizedEmail) {
    const existingEmail = await prisma.users.findUnique({
      where: { email: normalizedEmail },
      select: { id_user: true },
    });
    if (existingEmail) {
      throw new Error(
        `Email "${normalizedEmail}" sudah terdaftar pada akun lain.`,
      );
    }
  }

  const rawPassword =
    input.password.trim() === ""
      ? DEFAULT_ACCOUNT_PASSWORD
      : input.password.trim();
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  await prisma.users.create({
    data: {
      username: normalizedUsername,
      email: normalizedEmail,
      role_id: input.role_id,
      password: hashedPassword,
    },
  });

  return {
    username: normalizedUsername,
    usedPassword: rawPassword,
  };
}

export async function updateUserAccount(
  id_user: number,
  input: UpdateUserInput,
) {
  const normalizedUsername = input.username.trim().toLowerCase();
  const normalizedEmail =
    input.email.trim() === "" ? null : input.email.trim().toLowerCase();

  const duplicateUsername = await prisma.users.findFirst({
    where: {
      username: normalizedUsername,
      NOT: { id_user },
    },
    select: { id_user: true },
  });
  if (duplicateUsername) {
    throw new Error(
      `Username "${normalizedUsername}" sudah dipakai akun lain.`,
    );
  }

  if (normalizedEmail) {
    const duplicateEmail = await prisma.users.findFirst({
      where: {
        email: normalizedEmail,
        NOT: { id_user },
      },
      select: { id_user: true },
    });
    if (duplicateEmail) {
      throw new Error(`Email "${normalizedEmail}" sudah dipakai akun lain.`);
    }
  }

  await prisma.users.update({
    where: { id_user },
    data: {
      username: normalizedUsername,
      email: normalizedEmail,
      role_id: input.role_id,
    },
  });
}

export async function resetUserPasswordToDefault(id_user: number) {
  const user = await prisma.users.findUnique({
    where: { id_user },
    select: { id_user: true, username: true },
  });

  if (!user) {
    throw new Error("Akun pengguna tidak ditemukan.");
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ACCOUNT_PASSWORD, 10);

  await prisma.users.update({
    where: { id_user },
    data: { password: hashedPassword },
  });

  return {
    username: user.username,
    defaultPassword: DEFAULT_ACCOUNT_PASSWORD,
  };
}

export async function deleteUserAccount(
  targetUserId: number,
  currentUserId: number | null,
) {
  if (currentUserId && targetUserId === currentUserId) {
    throw new Error(
      "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.",
    );
  }

  const existing = await prisma.users.findUnique({
    where: { id_user: targetUserId },
    select: { id_user: true },
  });

  if (!existing) {
    throw new Error("Akun pengguna tidak ditemukan.");
  }

  await prisma.users.delete({
    where: { id_user: targetUserId },
  });
}
