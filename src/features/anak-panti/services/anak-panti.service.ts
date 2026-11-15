import bcrypt from "bcrypt";
import { JenisKelamin, StatusAnak } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AnakPantiFormInput } from "../schemas/anak-panti.schema";
import { AnakPantiItem } from "../types/anak-panti.types";

const DEFAULT_ANAK_PASSWORD = "asuwain123";

function formatDateIndo(dateVal: Date | string): string {
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateIso(dateVal: Date | string): string {
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function sanitizeUsernameBase(nama: string): string {
  const firstWord = nama
    .trim()
    .toLowerCase()
    .split(/\s+/)[0]
    ?.replace(/[^a-z0-9]/g, "");
  return firstWord && firstWord.length >= 2 ? firstWord : "anak";
}

async function generateUniqueAnakUsername(nama: string): Promise<string> {
  const base = `ank_${sanitizeUsernameBase(nama)}`;
  let candidate = base;
  let counter = 2;

  while (true) {
    const exists = await prisma.users.findUnique({
      where: { username: candidate },
      select: { id_user: true },
    });
    if (!exists) return candidate;
    candidate = `${base}${counter}`;
    counter += 1;
  }
}

export async function getAllAnakPanti(): Promise<AnakPantiItem[]> {
  const rows = await prisma.anak_panti.findMany({
    include: {
      users: {
        select: { username: true },
      },
      alumni: {
        select: {
          id_alumni: true,
          tahun_lulus: true,
        },
      },
      _count: {
        select: { berkas_anak: true },
      },
    },
    orderBy: { id_anak: "desc" },
  });

  return rows.map((row) => ({
    id_anak: row.id_anak,
    id_user: row.id_user,
    username: row.users?.username ?? null,
    nama_anak: row.nama_anak,
    nik: row.nik,
    tempat_lahir: row.tempat_lahir,
    tanggal_lahir_iso: formatDateIso(row.tanggal_lahir),
    tanggal_lahir_display: formatDateIndo(row.tanggal_lahir),
    jenis_kelamin: String(row.jenis_kelamin),
    status_anak: String(row.status_anak),
    tanggal_masuk_iso: formatDateIso(row.tanggal_masuk),
    tanggal_masuk_display: formatDateIndo(row.tanggal_masuk),
    foto: row.foto,
    is_alumni: Boolean(row.alumni),
    tahun_lulus: row.alumni?.tahun_lulus ?? null,
    berkas_count: row._count.berkas_anak,
  }));
}

export async function createAnakPantiRecord(input: AnakPantiFormInput) {
  const validJk = Object.values(JenisKelamin) as string[];
  const validStatus = Object.values(StatusAnak) as string[];

  if (!validJk.includes(input.jenis_kelamin)) {
    throw new Error("Nilai jenis kelamin tidak valid.");
  }
  if (!validStatus.includes(input.status_anak)) {
    throw new Error("Nilai status sosial anak tidak valid.");
  }

  const normalizedNik = input.nik.trim() === "" ? null : input.nik.trim();
  if (normalizedNik) {
    const duplicateNik = await prisma.anak_panti.findFirst({
      where: { nik: normalizedNik },
      select: { id_anak: true },
    });
    if (duplicateNik) {
      throw new Error(`NIK "${normalizedNik}" sudah terdaftar pada anak lain.`);
    }
  }

  const roleAnak = await prisma.roles.findFirst({
    where: { nama_role: "Anak Panti" },
    select: { id_role: true },
  });

  if (!roleAnak) {
    throw new Error('Role "Anak Panti" belum tersedia di tabel roles.');
  }

  const username = await generateUniqueAnakUsername(input.nama_anak);
  const hashedPassword = await bcrypt.hash(DEFAULT_ANAK_PASSWORD, 10);

  await prisma.$transaction(async (tx) => {
    const createdUser = await tx.users.create({
      data: {
        role_id: roleAnak.id_role,
        username,
        password: hashedPassword,
      },
    });

    await tx.anak_panti.create({
      data: {
        id_user: createdUser.id_user,
        nama_anak: input.nama_anak.trim(),
        nik: normalizedNik,
        tempat_lahir: input.tempat_lahir.trim(),
        tanggal_lahir: new Date(input.tanggal_lahir),
        jenis_kelamin: input.jenis_kelamin as JenisKelamin,
        status_anak: input.status_anak as StatusAnak,
        tanggal_masuk: new Date(input.tanggal_masuk),
      },
    });
  });

  return {
    nama_anak: input.nama_anak.trim(),
    username,
    defaultPassword: DEFAULT_ANAK_PASSWORD,
  };
}

export async function updateAnakPantiRecord(
  id_anak: number,
  input: AnakPantiFormInput,
) {
  const validJk = Object.values(JenisKelamin) as string[];
  const validStatus = Object.values(StatusAnak) as string[];

  if (!validJk.includes(input.jenis_kelamin)) {
    throw new Error("Nilai jenis kelamin tidak valid.");
  }
  if (!validStatus.includes(input.status_anak)) {
    throw new Error("Nilai status sosial anak tidak valid.");
  }

  const existing = await prisma.anak_panti.findUnique({
    where: { id_anak },
    select: { id_anak: true },
  });

  if (!existing) {
    throw new Error("Data anak panti tidak ditemukan.");
  }

  const normalizedNik = input.nik.trim() === "" ? null : input.nik.trim();
  if (normalizedNik) {
    const duplicateNik = await prisma.anak_panti.findFirst({
      where: {
        nik: normalizedNik,
        NOT: { id_anak },
      },
      select: { id_anak: true },
    });
    if (duplicateNik) {
      throw new Error(`NIK "${normalizedNik}" sudah dipakai oleh anak lain.`);
    }
  }

  await prisma.anak_panti.update({
    where: { id_anak },
    data: {
      nama_anak: input.nama_anak.trim(),
      nik: normalizedNik,
      tempat_lahir: input.tempat_lahir.trim(),
      tanggal_lahir: new Date(input.tanggal_lahir),
      jenis_kelamin: input.jenis_kelamin as JenisKelamin,
      status_anak: input.status_anak as StatusAnak,
      tanggal_masuk: new Date(input.tanggal_masuk),
    },
  });
}

export async function deleteAnakPantiRecord(id_anak: number) {
  const existing = await prisma.anak_panti.findUnique({
    where: { id_anak },
    select: { id_anak: true, id_user: true, nama_anak: true },
  });

  if (!existing) {
    throw new Error("Data anak panti tidak ditemukan.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.berkas_anak.deleteMany({ where: { id_anak } });
    await tx.alumni.deleteMany({ where: { id_anak } });
    await tx.anak_panti.delete({ where: { id_anak } });

    if (existing.id_user) {
      await tx.users.delete({
        where: { id_user: existing.id_user },
      });
    }
  });

  return existing.nama_anak;
}
