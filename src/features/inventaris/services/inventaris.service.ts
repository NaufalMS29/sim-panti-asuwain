import crypto from "crypto";
import { KondisiInventaris, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  InventarisBarangFormInput,
  LogistikKeluarFormInput,
  LogistikMasukFormInput,
} from "../schemas/inventaris.schema";
import {
  InventarisBarangItem,
  InventarisLogistikSummary,
  KondisiInventarisType,
  LogistikHabisPakaiItem,
  LogistikKeluarItem,
  LogistikMasukItem,
} from "../types/inventaris.types";
import { LOW_STOCK_THRESHOLD } from "../utils/inventaris.utils";

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

async function resolveActorIds(
  tx: Prisma.TransactionClient,
  userId: number,
): Promise<{ id_user: number; id_pengurus: number | null }> {
  const actor = await tx.users.findUnique({
    where: { id_user: userId },
    select: {
      id_user: true,
      pengurus: { select: { id_pengurus: true } },
    },
  });

  if (!actor) {
    throw new Error("Akun pengguna pencatat tidak ditemukan.");
  }

  return {
    id_user: actor.id_user,
    id_pengurus: actor.pengurus?.id_pengurus ?? null,
  };
}

async function generateUniqueKodeInventaris(): Promise<string> {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");

  while (true) {
    const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    const candidate = `INV-${d}${m}${y}-${suffix}`;
    const exists = await prisma.inventaris_barang.findUnique({
      where: { kode_inventaris: candidate },
      select: { id_inventaris: true },
    });
    if (!exists) return candidate;
  }
}

/* ==================== QUERIES ==================== */

export async function getAllInventarisBarang(): Promise<
  InventarisBarangItem[]
> {
  const rows = await prisma.inventaris_barang.findMany({
    include: {
      donasi_barang: {
        select: {
          donasi: {
            select: {
              kode_donasi: true,
              nama_pengirim: true,
              is_anonim: true,
            },
          },
        },
      },
    },
    orderBy: [{ tgl_perolehan: "desc" }, { id_inventaris: "desc" }],
  });

  return rows.map((row) => {
    const donasiInfo = row.donasi_barang?.donasi;
    return {
      id_inventaris: row.id_inventaris,
      id_donasi_barang: row.id_donasi_barang,
      kode_inventaris: row.kode_inventaris,
      nama_barang: row.nama_barang,
      jumlah: row.jumlah,
      kondisi: String(row.kondisi) as KondisiInventarisType,
      lokasi_penyimpanan: row.lokasi_penyimpanan,
      tgl_perolehan_iso: formatDateIso(row.tgl_perolehan),
      tgl_perolehan_display: formatDateIndo(row.tgl_perolehan),
      keterangan: row.keterangan,
      kode_donasi: donasiInfo?.kode_donasi ?? null,
      nama_pengirim_donasi: donasiInfo
        ? donasiInfo.is_anonim
          ? "Hamba Allah (Anonim)"
          : donasiInfo.nama_pengirim
        : null,
      is_auto_donasi: row.id_donasi_barang !== null,
    };
  });
}

export async function getAllLogistikHabisPakai(): Promise<
  LogistikHabisPakaiItem[]
> {
  const rows = await prisma.logistik_habis_pakai.findMany({
    orderBy: [{ stok_jumlah: "asc" }, { nama_barang: "asc" }],
  });

  return rows.map((row) => ({
    id_logistik: row.id_logistik,
    nama_barang: row.nama_barang,
    kategori: row.kategori,
    stok_jumlah: row.stok_jumlah,
    satuan: row.satuan,
    updated_at_display: formatDateIndo(row.updated_at),
  }));
}

export async function getAllLogistikMasuk(): Promise<LogistikMasukItem[]> {
  const rows = await prisma.logistik_masuk.findMany({
    include: {
      logistik_habis_pakai: {
        select: { nama_barang: true, kategori: true, satuan: true },
      },
      donasi_barang: {
        select: { donasi: { select: { kode_donasi: true } } },
      },
      pengurus: { select: { nama_pengurus: true } },
      users: {
        select: { username: true, roles: { select: { nama_role: true } } },
      },
    },
    orderBy: [{ tanggal_masuk: "desc" }, { id_logistik_masuk: "desc" }],
  });

  return rows.map((row) => {
    const pencatatNama = row.pengurus?.nama_pengurus
      ? row.pengurus.nama_pengurus
      : row.users
        ? `${row.users.username} (${row.users.roles.nama_role})`
        : null;

    return {
      id_logistik_masuk: row.id_logistik_masuk,
      id_logistik: row.id_logistik,
      id_donasi_barang: row.id_donasi_barang,
      nama_barang: row.logistik_habis_pakai.nama_barang,
      kategori: row.logistik_habis_pakai.kategori,
      satuan: row.logistik_habis_pakai.satuan,
      jumlah_masuk: row.jumlah_masuk,
      tanggal_masuk_iso: formatDateIso(row.tanggal_masuk),
      tanggal_masuk_display: formatDateIndo(row.tanggal_masuk),
      keterangan: row.keterangan,
      pencatat_nama: pencatatNama,
      kode_donasi: row.donasi_barang?.donasi?.kode_donasi ?? null,
      is_auto_donasi: row.id_donasi_barang !== null,
    };
  });
}

export async function getAllLogistikKeluar(): Promise<LogistikKeluarItem[]> {
  const rows = await prisma.logistik_keluar.findMany({
    include: {
      logistik_habis_pakai: {
        select: { nama_barang: true, kategori: true, satuan: true },
      },
      pengurus: { select: { nama_pengurus: true } },
      users: {
        select: { username: true, roles: { select: { nama_role: true } } },
      },
    },
    orderBy: [{ tanggal_keluar: "desc" }, { id_logistik_keluar: "desc" }],
  });

  return rows.map((row) => {
    const pencatatNama = row.pengurus?.nama_pengurus
      ? row.pengurus.nama_pengurus
      : row.users
        ? `${row.users.username} (${row.users.roles.nama_role})`
        : null;

    return {
      id_logistik_keluar: row.id_logistik_keluar,
      id_logistik: row.id_logistik,
      nama_barang: row.logistik_habis_pakai.nama_barang,
      kategori: row.logistik_habis_pakai.kategori,
      satuan: row.logistik_habis_pakai.satuan,
      jumlah_keluar: row.jumlah_keluar,
      tanggal_keluar_iso: formatDateIso(row.tanggal_keluar),
      tanggal_keluar_display: formatDateIndo(row.tanggal_keluar),
      peruntukan: row.peruntukan,
      pencatat_nama: pencatatNama,
    };
  });
}

export function calculateInventarisLogistikSummary(
  inventarisList: InventarisBarangItem[],
  logistikList: LogistikHabisPakaiItem[],
): InventarisLogistikSummary {
  let totalUnitAset = 0;
  let asetBaikUnit = 0;
  let asetRusakUnit = 0;

  for (const item of inventarisList) {
    totalUnitAset += item.jumlah;
    if (item.kondisi === "baik") {
      asetBaikUnit += item.jumlah;
    } else {
      asetRusakUnit += item.jumlah;
    }
  }

  let stokMenipisCount = 0;
  let stokHabisCount = 0;

  for (const log of logistikList) {
    if (log.stok_jumlah === 0) {
      stokHabisCount += 1;
    } else if (log.stok_jumlah <= LOW_STOCK_THRESHOLD) {
      stokMenipisCount += 1;
    }
  }

  return {
    totalJenisAset: inventarisList.length,
    totalUnitAset,
    asetBaikUnit,
    asetRusakUnit,
    totalJenisLogistik: logistikList.length,
    stokMenipisCount,
    stokHabisCount,
  };
}

/* ==================== MUTATIONS: INVENTARIS BARANG ==================== */

export async function createManualInventarisBarang(
  input: InventarisBarangFormInput,
) {
  const kodeInventaris = await generateUniqueKodeInventaris();

  await prisma.inventaris_barang.create({
    data: {
      id_donasi_barang: null,
      kode_inventaris: kodeInventaris,
      nama_barang: input.nama_barang.trim(),
      jumlah: input.jumlah,
      kondisi: input.kondisi as KondisiInventaris,
      lokasi_penyimpanan: input.lokasi_penyimpanan.trim(),
      tgl_perolehan: new Date(input.tgl_perolehan),
      keterangan: input.keterangan?.trim() || null,
    },
  });

  return kodeInventaris;
}

export async function updateInventarisBarangRecord(
  id_inventaris: number,
  input: InventarisBarangFormInput,
) {
  const existing = await prisma.inventaris_barang.findUnique({
    where: { id_inventaris },
  });

  if (!existing) {
    throw new Error("Data inventaris barang tidak ditemukan.");
  }

  // Jika berasal dari donasi: hanya izinkan ubah kondisi, lokasi penyimpanan, dan keterangan
  if (existing.id_donasi_barang !== null) {
    await prisma.inventaris_barang.update({
      where: { id_inventaris },
      data: {
        kondisi: input.kondisi as KondisiInventaris,
        lokasi_penyimpanan: input.lokasi_penyimpanan.trim(),
        keterangan: input.keterangan?.trim() || existing.keterangan,
      },
    });
    return;
  }

  await prisma.inventaris_barang.update({
    where: { id_inventaris },
    data: {
      nama_barang: input.nama_barang.trim(),
      jumlah: input.jumlah,
      kondisi: input.kondisi as KondisiInventaris,
      lokasi_penyimpanan: input.lokasi_penyimpanan.trim(),
      tgl_perolehan: new Date(input.tgl_perolehan),
      keterangan: input.keterangan?.trim() || null,
    },
  });
}

export async function deleteManualInventarisBarang(id_inventaris: number) {
  const existing = await prisma.inventaris_barang.findUnique({
    where: { id_inventaris },
  });

  if (!existing) {
    throw new Error("Data inventaris barang tidak ditemukan.");
  }

  if (existing.id_donasi_barang !== null) {
    throw new Error(
      "Aset inventaris dari donasi tidak dapat dihapus langsung di sini. Tolak atau hapus transaksi pada modul Kelola Donasi.",
    );
  }

  await prisma.inventaris_barang.delete({
    where: { id_inventaris },
  });

  return existing.nama_barang;
}

/* ==================== MUTATIONS: LOGISTIK HABIS PAKAI ==================== */

export async function createManualLogistikMasuk(
  input: LogistikMasukFormInput,
  userId: number,
) {
  await prisma.$transaction(async (tx) => {
    const { id_user, id_pengurus } = await resolveActorIds(tx, userId);
    let targetLogistikId: number;

    if (input.mode === "existing" && input.id_logistik) {
      const existingItem = await tx.logistik_habis_pakai.findUnique({
        where: { id_logistik: input.id_logistik },
        select: { id_logistik: true },
      });
      if (!existingItem) {
        throw new Error("Item logistik yang dipilih tidak ditemukan.");
      }

      await tx.logistik_habis_pakai.update({
        where: { id_logistik: existingItem.id_logistik },
        data: { stok_jumlah: { increment: input.jumlah_masuk } },
      });
      targetLogistikId = existingItem.id_logistik;
    } else {
      const cleanName = (input.nama_barang || "").trim();
      const cleanSatuan = (input.satuan || "").trim();
      const cleanKategori = (input.kategori || "Umum").trim();

      const allItems = await tx.logistik_habis_pakai.findMany();
      const duplicate = allItems.find(
        (i) =>
          i.nama_barang.trim().toLowerCase() === cleanName.toLowerCase() &&
          i.satuan.trim().toLowerCase() === cleanSatuan.toLowerCase(),
      );

      if (duplicate) {
        await tx.logistik_habis_pakai.update({
          where: { id_logistik: duplicate.id_logistik },
          data: { stok_jumlah: { increment: input.jumlah_masuk } },
        });
        targetLogistikId = duplicate.id_logistik;
      } else {
        const created = await tx.logistik_habis_pakai.create({
          data: {
            nama_barang: cleanName,
            kategori: cleanKategori,
            stok_jumlah: input.jumlah_masuk,
            satuan: cleanSatuan,
          },
          select: { id_logistik: true },
        });
        targetLogistikId = created.id_logistik;
      }
    }

    await tx.logistik_masuk.create({
      data: {
        id_logistik: targetLogistikId,
        id_donasi_barang: null,
        id_user,
        id_pengurus,
        jumlah_masuk: input.jumlah_masuk,
        tanggal_masuk: new Date(input.tanggal_masuk),
        keterangan: input.keterangan.trim(),
      },
    });
  });
}

export async function createLogistikKeluarRecord(
  input: LogistikKeluarFormInput,
  userId: number,
) {
  await prisma.$transaction(async (tx) => {
    const { id_user, id_pengurus } = await resolveActorIds(tx, userId);

    const item = await tx.logistik_habis_pakai.findUnique({
      where: { id_logistik: input.id_logistik },
    });

    if (!item) {
      throw new Error("Item logistik tidak ditemukan.");
    }

    if (item.stok_jumlah < input.jumlah_keluar) {
      throw new Error(
        `Stok "${item.nama_barang}" tidak mencukupi (tersedia ${item.stok_jumlah} ${item.satuan}, diminta ${input.jumlah_keluar} ${item.satuan}).`,
      );
    }

    await tx.logistik_habis_pakai.update({
      where: { id_logistik: item.id_logistik },
      data: {
        stok_jumlah: { decrement: input.jumlah_keluar },
      },
    });

    await tx.logistik_keluar.create({
      data: {
        id_logistik: item.id_logistik,
        id_user,
        id_pengurus,
        jumlah_keluar: input.jumlah_keluar,
        tanggal_keluar: new Date(input.tanggal_keluar),
        peruntukan: input.peruntukan.trim(),
      },
    });
  });
}

export async function deleteManualLogistikMasuk(id_logistik_masuk: number) {
  await prisma.$transaction(async (tx) => {
    const record = await tx.logistik_masuk.findUnique({
      where: { id_logistik_masuk },
      include: {
        logistik_habis_pakai: {
          select: {
            id_logistik: true,
            nama_barang: true,
            stok_jumlah: true,
            satuan: true,
          },
        },
      },
    });

    if (!record) {
      throw new Error("Riwayat barang masuk tidak ditemukan.");
    }

    if (record.id_donasi_barang !== null) {
      throw new Error(
        "Riwayat barang masuk otomatis dari donasi tidak dapat dihapus di sini. Ubah melalui modul Kelola Donasi.",
      );
    }

    if (record.logistik_habis_pakai.stok_jumlah < record.jumlah_masuk) {
      throw new Error(
        `Tidak dapat menghapus riwayat masuk karena sisa stok "${record.logistik_habis_pakai.nama_barang}" (${record.logistik_habis_pakai.stok_jumlah} ${record.logistik_habis_pakai.satuan}) sudah terpakai sebagian.`,
      );
    }

    await tx.logistik_habis_pakai.update({
      where: { id_logistik: record.id_logistik },
      data: {
        stok_jumlah: { decrement: record.jumlah_masuk },
      },
    });

    await tx.logistik_masuk.delete({
      where: { id_logistik_masuk },
    });
  });
}

export async function deleteLogistikKeluarRecord(id_logistik_keluar: number) {
  await prisma.$transaction(async (tx) => {
    const record = await tx.logistik_keluar.findUnique({
      where: { id_logistik_keluar },
    });

    if (!record) {
      throw new Error("Riwayat barang keluar tidak ditemukan.");
    }

    // Kembalikan stok saat catatan keluar dibatalkan
    await tx.logistik_habis_pakai.update({
      where: { id_logistik: record.id_logistik },
      data: {
        stok_jumlah: { increment: record.jumlah_keluar },
      },
    });

    await tx.logistik_keluar.delete({
      where: { id_logistik_keluar },
    });
  });
}
