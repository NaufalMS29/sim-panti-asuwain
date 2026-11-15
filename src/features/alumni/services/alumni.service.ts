import { prisma } from "@/lib/prisma";
import { CreateAlumniInput, UpdateAlumniInput } from "../schemas/alumni.schema";
import { AlumniListItem, EligibleAnakOption } from "../types/alumni.types";

function formatDateIndo(dateVal: Date | string): string {
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function getAllAlumni(): Promise<AlumniListItem[]> {
  const rows = await prisma.alumni.findMany({
    include: {
      anak_panti: true,
    },
    orderBy: [{ tahun_lulus: "desc" }, { id_alumni: "desc" }],
  });

  return rows.map((row) => ({
    id_alumni: row.id_alumni,
    id_anak: row.id_anak,
    nama_anak: row.anak_panti.nama_anak,
    nik: row.anak_panti.nik,
    jenis_kelamin: String(row.anak_panti.jenis_kelamin),
    status_anak: String(row.anak_panti.status_anak),
    tanggal_masuk: formatDateIndo(row.anak_panti.tanggal_masuk),
    tahun_lulus: row.tahun_lulus,
    pekerjaan_sekarang: row.pekerjaan_sekarang,
    alamat_sekarang: row.alamat_sekarang,
    kontak: row.kontak,
  }));
}

export async function getEligibleAnakForAlumni(): Promise<
  EligibleAnakOption[]
> {
  const rows = await prisma.anak_panti.findMany({
    where: {
      alumni: null,
    },
    select: {
      id_anak: true,
      nama_anak: true,
      nik: true,
      status_anak: true,
    },
    orderBy: { nama_anak: "asc" },
  });

  return rows.map((r) => ({
    id_anak: r.id_anak,
    nama_anak: r.nama_anak,
    nik: r.nik,
    status_anak: String(r.status_anak),
  }));
}

export async function createAlumniRecord(input: CreateAlumniInput) {
  const anak = await prisma.anak_panti.findUnique({
    where: { id_anak: input.id_anak },
    include: { alumni: true },
  });

  if (!anak) {
    throw new Error("Data anak panti tidak ditemukan.");
  }

  if (anak.alumni) {
    throw new Error(`"${anak.nama_anak}" sudah terdaftar di data alumni.`);
  }

  await prisma.alumni.create({
    data: {
      id_anak: input.id_anak,
      tahun_lulus: input.tahun_lulus,
      pekerjaan_sekarang:
        input.pekerjaan_sekarang && input.pekerjaan_sekarang.trim() !== ""
          ? input.pekerjaan_sekarang.trim()
          : null,
      alamat_sekarang: input.alamat_sekarang.trim(),
      kontak:
        input.kontak && input.kontak.trim() !== "" ? input.kontak.trim() : null,
    },
  });

  return anak.nama_anak;
}

export async function updateAlumniRecord(
  id_alumni: number,
  input: UpdateAlumniInput,
) {
  const existing = await prisma.alumni.findUnique({
    where: { id_alumni },
    select: { id_alumni: true },
  });

  if (!existing) {
    throw new Error("Data alumni tidak ditemukan.");
  }

  await prisma.alumni.update({
    where: { id_alumni },
    data: {
      tahun_lulus: input.tahun_lulus,
      pekerjaan_sekarang:
        input.pekerjaan_sekarang && input.pekerjaan_sekarang.trim() !== ""
          ? input.pekerjaan_sekarang.trim()
          : null,
      alamat_sekarang: input.alamat_sekarang.trim(),
      kontak:
        input.kontak && input.kontak.trim() !== "" ? input.kontak.trim() : null,
    },
  });
}

export async function deleteAlumniRecord(id_alumni: number) {
  const existing = await prisma.alumni.findUnique({
    where: { id_alumni },
    include: { anak_panti: { select: { id_anak: true, nama_anak: true } } },
  });

  if (!existing) {
    throw new Error("Data alumni tidak ditemukan.");
  }

  await prisma.alumni.delete({
    where: { id_alumni },
  });

  return {
    id_anak: existing.id_anak,
    nama_anak: existing.anak_panti.nama_anak,
  };
}
