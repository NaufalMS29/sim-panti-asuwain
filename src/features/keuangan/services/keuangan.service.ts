import { JenisKas, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TransaksiKasFormInput } from "../schemas/keuangan.schema";
import {
  JenisKasType,
  KategoriKasOption,
  KeuanganSummary,
  TransaksiKasItem,
} from "../types/keuangan.types";

const DEFAULT_KATEGORI_KAS: { nama_kategori: string; jenis_kas: JenisKas }[] = [
  { nama_kategori: "Donasi Uang", jenis_kas: "pemasukan" },
  { nama_kategori: "Bantuan Pemerintah / Sosial", jenis_kas: "pemasukan" },
  { nama_kategori: "Kotak Amal / Infak Harian", jenis_kas: "pemasukan" },
  { nama_kategori: "Pemasukan Lainnya", jenis_kas: "pemasukan" },
  { nama_kategori: "Konsumsi & Kebutuhan Dapur", jenis_kas: "pengeluaran" },
  {
    nama_kategori: "Pendidikan & Perlengkapan Sekolah",
    jenis_kas: "pengeluaran",
  },
  { nama_kategori: "Kesehatan & Obat-obatan", jenis_kas: "pengeluaran" },
  { nama_kategori: "Listrik, Air & Internet", jenis_kas: "pengeluaran" },
  {
    nama_kategori: "Pemeliharaan & Operasional Panti",
    jenis_kas: "pengeluaran",
  },
  { nama_kategori: "Pengeluaran Lainnya", jenis_kas: "pengeluaran" },
];

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

async function resolveCashActorForKas(
  tx: Prisma.TransactionClient | typeof prisma,
  userId: number,
): Promise<{ id_user: number; id_pengurus: number | null }> {
  const actor = await tx.users.findUnique({
    where: { id_user: userId },
    select: {
      id_user: true,
      pengurus: {
        select: { id_pengurus: true },
      },
    },
  });

  if (!actor) {
    throw new Error("Akun pengguna pencatat kas tidak ditemukan.");
  }

  return {
    id_user: actor.id_user,
    id_pengurus: actor.pengurus?.id_pengurus ?? null,
  };
}

export async function getAllKategoriKas(): Promise<KategoriKasOption[]> {
  let rows = await prisma.kategori_kas.findMany({
    orderBy: { id_kategori_kas: "asc" },
  });

  if (rows.length === 0) {
    await prisma.kategori_kas.createMany({
      data: DEFAULT_KATEGORI_KAS,
      skipDuplicates: true,
    });
    rows = await prisma.kategori_kas.findMany({
      orderBy: { id_kategori_kas: "asc" },
    });
  }

  return rows.map((r) => ({
    id_kategori_kas: r.id_kategori_kas,
    nama_kategori: r.nama_kategori,
    jenis_kas: String(r.jenis_kas) as JenisKasType,
  }));
}

export async function createKategoriKasRecord(
  namaKategori: string,
  jenisKas: JenisKasType,
): Promise<KategoriKasOption> {
  const cleanName = namaKategori.trim();
  if (cleanName.length < 2) {
    throw new Error("Nama kategori kas minimal 2 karakter.");
  }

  const existing = await prisma.kategori_kas.findFirst({
    where: {
      nama_kategori: cleanName,
      jenis_kas: jenisKas as JenisKas,
    },
  });
  if (existing) {
    return {
      id_kategori_kas: existing.id_kategori_kas,
      nama_kategori: existing.nama_kategori,
      jenis_kas: String(existing.jenis_kas) as JenisKasType,
    };
  }

  const created = await prisma.kategori_kas.create({
    data: {
      nama_kategori: cleanName,
      jenis_kas: jenisKas as JenisKas,
    },
  });

  return {
    id_kategori_kas: created.id_kategori_kas,
    nama_kategori: created.nama_kategori,
    jenis_kas: String(created.jenis_kas) as JenisKasType,
  };
}

export async function getAllTransaksiKas(): Promise<TransaksiKasItem[]> {
  const rows = await prisma.transaksi_kas.findMany({
    include: {
      pengurus: {
        select: { nama_pengurus: true },
      },
      users: {
        select: {
          username: true,
          roles: { select: { nama_role: true } },
        },
      },
      kategori_kas: {
        select: { nama_kategori: true },
      },
      donasi_uang: {
        select: {
          metode_pembayaran: true,
          donasi: {
            select: {
              kode_donasi: true,
            },
          },
        },
      },
    },
    orderBy: [{ tanggal_transaksi: "desc" }, { id_transaksi_kas: "desc" }],
  });

  return rows.map((row) => {
    const pencatatNama = row.pengurus?.nama_pengurus
      ? row.pengurus.nama_pengurus
      : row.users
        ? `${row.users.username} (${row.users.roles.nama_role})`
        : null;

    return {
      id_transaksi_kas: row.id_transaksi_kas,
      id_pengurus: row.id_pengurus,
      id_user: row.id_user,
      id_kategori_kas: row.id_kategori_kas,
      id_donasi_uang: row.id_donasi_uang,
      jenis_transaksi: String(row.jenis_transaksi) as JenisKasType,
      nama_kategori: row.kategori_kas?.nama_kategori ?? "Tanpa Kategori",
      nominal: Number(row.nominal ?? 0),
      tanggal_transaksi_iso: formatDateIso(row.tanggal_transaksi),
      tanggal_transaksi_display: formatDateIndo(row.tanggal_transaksi),
      keterangan: row.keterangan,
      file_nota: row.file_nota,
      pencatat_nama: pencatatNama,
      kode_donasi: row.donasi_uang?.donasi?.kode_donasi ?? null,
      metode_pembayaran: row.donasi_uang
        ? String(row.donasi_uang.metode_pembayaran)
        : null,
      is_auto_donasi: row.id_donasi_uang !== null,
    };
  });
}

export function calculateKeuanganSummary(
  items: TransaksiKasItem[],
): KeuanganSummary {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  let pemasukanBulanIni = 0;
  let pengeluaranBulanIni = 0;
  let pemasukanDariDonasi = 0;

  for (const item of items) {
    const d = new Date(item.tanggal_transaksi_iso);
    const isCurrentMonth =
      !Number.isNaN(d.getTime()) &&
      d.getFullYear() === currentYear &&
      d.getMonth() === currentMonth;

    if (item.jenis_transaksi === "pemasukan") {
      totalPemasukan += item.nominal;
      if (isCurrentMonth) pemasukanBulanIni += item.nominal;
      if (item.is_auto_donasi) pemasukanDariDonasi += item.nominal;
    } else {
      totalPengeluaran += item.nominal;
      if (isCurrentMonth) pengeluaranBulanIni += item.nominal;
    }
  }

  return {
    totalPemasukan,
    totalPengeluaran,
    saldoAkhir: totalPemasukan - totalPengeluaran,
    pemasukanBulanIni,
    pengeluaranBulanIni,
    pemasukanDariDonasi,
  };
}

export async function createManualTransaksiKas(
  input: TransaksiKasFormInput,
  userId: number,
  fileNotaPath: string | null,
) {
  const { id_user, id_pengurus } = await resolveCashActorForKas(prisma, userId);

  await prisma.transaksi_kas.create({
    data: {
      id_user,
      id_pengurus,
      id_kategori_kas: input.id_kategori_kas,
      id_donasi_uang: null,
      tanggal_transaksi: new Date(input.tanggal_transaksi),
      nominal: input.nominal,
      jenis_transaksi: input.jenis_transaksi as JenisKas,
      keterangan: input.keterangan.trim(),
      file_nota: fileNotaPath,
    },
  });
}

export async function updateManualTransaksiKas(
  id_transaksi_kas: number,
  input: TransaksiKasFormInput,
  newFileNotaPath: string | null,
) {
  const existing = await prisma.transaksi_kas.findUnique({
    where: { id_transaksi_kas },
    select: {
      id_transaksi_kas: true,
      id_donasi_uang: true,
      file_nota: true,
    },
  });

  if (!existing) {
    throw new Error("Data transaksi kas tidak ditemukan.");
  }

  if (existing.id_donasi_uang !== null) {
    throw new Error(
      "Transaksi kas otomatis dari donasi tidak dapat diubah langsung di sini. Ubah melalui modul Verifikasi Donasi.",
    );
  }

  await prisma.transaksi_kas.update({
    where: { id_transaksi_kas },
    data: {
      jenis_transaksi: input.jenis_transaksi as JenisKas,
      id_kategori_kas: input.id_kategori_kas,
      nominal: input.nominal,
      tanggal_transaksi: new Date(input.tanggal_transaksi),
      keterangan: input.keterangan.trim(),
      file_nota: newFileNotaPath ?? existing.file_nota,
    },
  });
}

export async function deleteManualTransaksiKas(id_transaksi_kas: number) {
  const existing = await prisma.transaksi_kas.findUnique({
    where: { id_transaksi_kas },
    select: {
      id_transaksi_kas: true,
      id_donasi_uang: true,
      keterangan: true,
    },
  });

  if (!existing) {
    throw new Error("Data transaksi kas tidak ditemukan.");
  }

  if (existing.id_donasi_uang !== null) {
    throw new Error(
      "Transaksi kas otomatis dari donasi tidak dapat dihapus langsung. Tolak atau hapus transaksi pada modul Kelola Donasi.",
    );
  }

  await prisma.transaksi_kas.delete({
    where: { id_transaksi_kas },
  });

  return existing.keterangan;
}
