import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { PengurusInput } from "../schemas/pengurus.schema";
import { PengurusItem } from "../types/pengurus.types";

export const DEFAULT_STAFF_PASSWORD = "asuwain123";

async function generateUniquePengurusUsername(
  fullName: string,
): Promise<string> {
  const baseSlug =
    fullName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .slice(0, 2)
      .join("_") || "pengurus";

  let candidate = `pgr_${baseSlug}`;
  let counter = 2;

  while (
    await prisma.users.findUnique({
      where: { username: candidate },
      select: { id_user: true },
    })
  ) {
    candidate = `pgr_${baseSlug}_${counter}`;
    counter += 1;
  }

  return candidate;
}

export async function getAllPengurus(): Promise<PengurusItem[]> {
  const rows = await prisma.pengurus.findMany({
    include: {
      users: {
        select: { username: true },
      },
    },
    orderBy: { id_pengurus: "desc" },
  });

  return rows.map((row) => ({
    id_pengurus: row.id_pengurus,
    id_user: row.id_user,
    nama_pengurus: row.nama_pengurus,
    jabatan: row.jabatan,
    no_telepon: row.no_telepon,
    alamat: row.alamat,
    username: row.users.username,
  }));
}

export async function createPengurusWithAccount(input: PengurusInput) {
  const rolePengurus = await prisma.roles.findUnique({
    where: { nama_role: "Pengurus Panti" },
  });

  if (!rolePengurus) {
    throw new Error(
      "Role 'Pengurus Panti' belum tersedia. Jalankan /api/init-system terlebih dahulu.",
    );
  }

  const username = await generateUniquePengurusUsername(input.nama_pengurus);
  const hashedPassword = await bcrypt.hash(DEFAULT_STAFF_PASSWORD, 10);

  await prisma.$transaction(async (tx) => {
    const newUser = await tx.users.create({
      data: {
        username,
        password: hashedPassword,
        role_id: rolePengurus.id_role,
      },
    });

    await tx.pengurus.create({
      data: {
        id_user: newUser.id_user,
        nama_pengurus: input.nama_pengurus.trim(),
        jabatan: input.jabatan.trim(),
        no_telepon: input.no_telepon.trim(),
        alamat: input.alamat.trim(),
      },
    });
  });

  return {
    username,
    defaultPassword: DEFAULT_STAFF_PASSWORD,
  };
}

export async function updatePengurusById(
  id_pengurus: number,
  input: PengurusInput,
) {
  await prisma.pengurus.update({
    where: { id_pengurus },
    data: {
      nama_pengurus: input.nama_pengurus.trim(),
      jabatan: input.jabatan.trim(),
      no_telepon: input.no_telepon.trim(),
      alamat: input.alamat.trim(),
    },
  });
}

export async function deletePengurusWithAccount(id_pengurus: number) {
  const existing = await prisma.pengurus.findUnique({
    where: { id_pengurus },
    select: { id_user: true },
  });

  if (!existing) {
    throw new Error("Data pengurus tidak ditemukan.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.pengurus.delete({
      where: { id_pengurus },
    });

    await tx.users.delete({
      where: { id_user: existing.id_user },
    });
  });
}

export async function resetPengurusPasswordToDefault(id_pengurus: number) {
  const existing = await prisma.pengurus.findUnique({
    where: { id_pengurus },
    include: { users: { select: { id_user: true, username: true } } },
  });

  if (!existing) {
    throw new Error("Data pengurus tidak ditemukan.");
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_STAFF_PASSWORD, 10);

  await prisma.users.update({
    where: { id_user: existing.users.id_user },
    data: { password: hashedPassword },
  });

  return {
    username: existing.users.username,
    defaultPassword: DEFAULT_STAFF_PASSWORD,
  };
}
