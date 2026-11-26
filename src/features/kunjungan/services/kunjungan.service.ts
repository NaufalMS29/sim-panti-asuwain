import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CreateKunjunganInput } from "../schemas/kunjungan.schema";
import {
  JadwalKunjunganDTO,
  StatusKunjunganType,
} from "../types/kunjungan.types";

function toDateOnlyUTC(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function toTimeOnlyUTC(timeStr: string): Date {
  return new Date(`1970-01-01T${timeStr}:00.000Z`);
}

function formatDateDTO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatTimeDTO(time: Date): string {
  return time.toISOString().slice(11, 16);
}

function generateTicketCode(tanggalRencana: string): string {
  const dateCompact = tanggalRencana.replace(/-/g, "");
  const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `KNJ-${dateCompact}-${randomHex}`;
}

function mapToDTO(
  row: {
    id_kunjungan: number;
    kode_tiket: string;
    nama_pengunjung: string;
    email_pengunjung: string;
    no_telepon: string;
    instansi_organisasi: string | null;
    tujuan_kunjungan: string;
    tanggal_rencana: Date;
    jam_rencana: Date;
    jumlah_rombongan: number;
    status_kunjungan: StatusKunjunganType;
    catatan_pengurus: string | null;
    created_at: Date;
    updated_at: Date;
  },
  hasSlotConflict = false,
): JadwalKunjunganDTO {
  return {
    id_kunjungan: row.id_kunjungan,
    kode_tiket: row.kode_tiket,
    nama_pengunjung: row.nama_pengunjung,
    email_pengunjung: row.email_pengunjung,
    no_telepon: row.no_telepon,
    instansi_organisasi: row.instansi_organisasi,
    tujuan_kunjungan: row.tujuan_kunjungan,
    tanggal_rencana: formatDateDTO(row.tanggal_rencana),
    jam_rencana: formatTimeDTO(row.jam_rencana),
    jumlah_rombongan: row.jumlah_rombongan,
    status_kunjungan: row.status_kunjungan,
    catatan_pengurus: row.catatan_pengurus,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    has_slot_conflict: hasSlotConflict,
  };
}

export async function resolvePantiNotificationEmail(): Promise<string | null> {
  try {
    // Membaca email resmi dari tabel cms_profil_panti jika tersedia, fallback ke .env
    const dynamicPrisma = prisma as unknown as {
      cms_profil_panti?: {
        findFirst: () => Promise<{ email_resmi?: string | null } | null>;
      };
    };
    if (dynamicPrisma.cms_profil_panti?.findFirst) {
      const profil = await dynamicPrisma.cms_profil_panti.findFirst();
      if (profil?.email_resmi) return profil.email_resmi;
    }
  } catch {
    // Abaikan jika tabel profil belum diisi
  }

  return process.env.PANTI_EMAIL || process.env.SMTP_EMAIL || null;
}

export async function createJadwalKunjungan(input: CreateKunjunganInput) {
  const normalizedEmail = input.email_pengunjung.trim().toLowerCase();
  const targetDate = toDateOnlyUTC(input.tanggal_rencana);
  const targetTime = toTimeOnlyUTC(input.jam_rencana);

  // 1. Cek batas maksimal 2 tiket aktif (pending) per email agar tidak terjadi email bombing
  const activePendingCount = await prisma.jadwal_kunjungan.count({
    where: {
      email_pengunjung: normalizedEmail,
      status_kunjungan: "pending",
    },
  });

  if (activePendingCount >= 2) {
    return {
      success: false as const,
      message:
        "Anda masih memiliki 2 pengajuan kunjungan yang menunggu verifikasi. Harap tunggu keputusan pengurus sebelum mengajukan jadwal baru.",
    };
  }

  // 2. Pencegahan Double-Submit (email + tanggal yang sama dalam 2 menit terakhir)
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const duplicateRecent = await prisma.jadwal_kunjungan.findFirst({
    where: {
      email_pengunjung: normalizedEmail,
      tanggal_rencana: targetDate,
      created_at: { gte: twoMinutesAgo },
    },
  });

  if (duplicateRecent) {
    return {
      success: false as const,
      message: `Pengajuan Anda pada tanggal tersebut baru saja tercatat dengan kode tiket ${duplicateRecent.kode_tiket}.`,
    };
  }

  // 3. Cek bentrok jadwal yang sudah DISETUJUI pada tanggal & jam yang sama
  const approvedConflict = await prisma.jadwal_kunjungan.findFirst({
    where: {
      tanggal_rencana: targetDate,
      jam_rencana: targetTime,
      status_kunjungan: "disetujui",
    },
  });

  if (approvedConflict) {
    return {
      success: false as const,
      message: `Slot kunjungan pada tanggal ${input.tanggal_rencana} pukul ${input.jam_rencana} WIB sudah terisi dan disetujui untuk rombongan lain. Silakan pilih jam atau tanggal lain.`,
    };
  }

  // 4. Simpan ke database dengan auto-retry kode_tiket jika terjadi tabrakan acak (P2002)
  for (let attempt = 0; attempt < 5; attempt++) {
    const kodeTiket = generateTicketCode(input.tanggal_rencana);
    try {
      const created = await prisma.jadwal_kunjungan.create({
        data: {
          kode_tiket: kodeTiket,
          nama_pengunjung: input.nama_pengunjung.trim(),
          email_pengunjung: normalizedEmail,
          no_telepon: input.no_telepon.trim(),
          instansi_organisasi: input.instansi_organisasi?.trim() || null,
          tujuan_kunjungan: input.tujuan_kunjungan.trim(),
          tanggal_rencana: targetDate,
          jam_rencana: targetTime,
          jumlah_rombongan: input.jumlah_rombongan,
          status_kunjungan: "pending",
        },
      });

      return {
        success: true as const,
        data: mapToDTO(created),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue; // Ulangi pembuatan kode tiket jika terjadi collision
      }
      throw error;
    }
  }

  return {
    success: false as const,
    message: "Sistem sedang sibuk memproses antrian. Silakan kirim ulang.",
  };
}

export async function getJadwalByKodeTiket(
  kodeTiket: string,
): Promise<JadwalKunjunganDTO | null> {
  const row = await prisma.jadwal_kunjungan.findUnique({
    where: { kode_tiket: kodeTiket.trim().toUpperCase() },
  });

  if (!row) return null;
  return mapToDTO(row);
}

export async function getAllJadwalKunjungan(): Promise<JadwalKunjunganDTO[]> {
  // Urutkan: antrian pending paling awal di atas (FIFO), diikuti jadwal terbaru
  const rows = await prisma.jadwal_kunjungan.findMany({
    orderBy: [{ created_at: "asc" }],
  });

  // Hitung frekuensi slot (tanggal + jam) pada status pending/disetujui untuk menandai jadwal bersamaan
  const slotCounter = new Map<string, number>();
  for (const item of rows) {
    if (item.status_kunjungan !== "ditolak") {
      const slotKey = `${formatDateDTO(item.tanggal_rencana)}_${formatTimeDTO(item.jam_rencana)}`;
      slotCounter.set(slotKey, (slotCounter.get(slotKey) || 0) + 1);
    }
  }

  return rows.map((row) => {
    const slotKey = `${formatDateDTO(row.tanggal_rencana)}_${formatTimeDTO(row.jam_rencana)}`;
    const hasConflict =
      row.status_kunjungan === "pending" && (slotCounter.get(slotKey) || 0) > 1;
    return mapToDTO(row, hasConflict);
  });
}

export async function getPendingKunjunganCount(): Promise<number> {
  return prisma.jadwal_kunjungan.count({
    where: { status_kunjungan: "pending" },
  });
}

export async function verifyJadwalKunjungan(params: {
  id_kunjungan: number;
  status_kunjungan: "disetujui" | "ditolak";
  catatan_pengurus?: string;
}) {
  const existing = await prisma.jadwal_kunjungan.findUnique({
    where: { id_kunjungan: params.id_kunjungan },
  });

  if (!existing) {
    return {
      success: false as const,
      message: "Data pengajuan kunjungan tidak ditemukan.",
    };
  }

  // Jika pengurus menyetujui, pastikan belum ada pengajuan lain pada tanggal & jam sama yang sudah disetujui
  if (params.status_kunjungan === "disetujui") {
    const alreadyApproved = await prisma.jadwal_kunjungan.findFirst({
      where: {
        id_kunjungan: { not: existing.id_kunjungan },
        tanggal_rencana: existing.tanggal_rencana,
        jam_rencana: existing.jam_rencana,
        status_kunjungan: "disetujui",
      },
    });

    if (alreadyApproved) {
      return {
        success: false as const,
        message: `Gagal menyetujui: Slot tanggal ${formatDateDTO(existing.tanggal_rencana)} pukul ${formatTimeDTO(existing.jam_rencana)} WIB sudah disetujui untuk tiket #${alreadyApproved.kode_tiket}.`,
      };
    }
  }

  const updated = await prisma.jadwal_kunjungan.update({
    where: { id_kunjungan: params.id_kunjungan },
    data: {
      status_kunjungan: params.status_kunjungan,
      catatan_pengurus: params.catatan_pengurus?.trim() || null,
    },
  });

  return {
    success: true as const,
    data: mapToDTO(updated),
  };
}
