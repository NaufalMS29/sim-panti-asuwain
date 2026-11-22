import crypto from "crypto";
import {
  KategoriBarangDonasi,
  MetodePembayaran,
  Prisma,
  StatusVerifikasi,
  TipeDonatur,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DonasiBarangFormInput,
  DonasiUangFormInput,
  DonaturFormInput,
} from "../schemas/donasi.schema";
import {
  DonasiTransactionItem,
  DonaturItem,
  DonaturPortalData,
  JenisDonasiType,
  KategoriBarangDonasiType,
  MetodePembayaranType,
  StatusVerifikasiType,
} from "../types/donasi.types";

export function getTipeDonaturOptions(): string[] {
  return Object.values(TipeDonatur) as string[];
}

function formatMetodeLabel(metode: string): string {
  switch (metode) {
    case "transfer_bank":
      return "Transfer Bank";
    case "qris":
      return "QRIS";
    case "tunai":
      return "Tunai";
    default:
      return metode;
  }
}

async function resolveActorIds(
  tx: Prisma.TransactionClient,
  userId?: number | null,
): Promise<{ id_user: number | null; id_pengurus: number | null }> {
  if (!userId) {
    return { id_user: null, id_pengurus: null };
  }

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
    return { id_user: null, id_pengurus: null };
  }

  return {
    id_user: actor.id_user,
    id_pengurus: actor.pengurus?.id_pengurus ?? null,
  };
}

async function resolveDonasiKategoriKasId(
  tx: Prisma.TransactionClient,
): Promise<number> {
  const existing = await tx.kategori_kas.findFirst({
    where: {
      nama_kategori: "Donasi Uang",
      jenis_kas: "pemasukan",
    },
    select: { id_kategori_kas: true },
  });

  if (existing) return existing.id_kategori_kas;

  const created = await tx.kategori_kas.create({
    data: {
      nama_kategori: "Donasi Uang",
      jenis_kas: "pemasukan",
    },
    select: { id_kategori_kas: true },
  });

  return created.id_kategori_kas;
}

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

async function generateUniqueKodeDonasi(): Promise<string> {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");

  while (true) {
    const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    const candidate = `DON-${d}${m}${y}-${suffix}`;
    const exists = await prisma.donasi.findUnique({
      where: { kode_donasi: candidate },
      select: { id_donasi: true },
    });
    if (!exists) return candidate;
  }
}

/**
 * Menerapkan pencatatan otomatis ke `inventaris_barang` atau `logistik_habis_pakai` + `logistik_masuk`
 * saat donasi barang berstatus `terverifikasi`.
 */
async function syncVerifiedDonasiBarang(
  tx: Prisma.TransactionClient,
  params: {
    kode_donasi: string;
    nama_pengirim: string;
    is_anonim: boolean;
    tanggal_donasi: Date;
    barang: {
      id_donasi_barang: number;
      nama_barang: string;
      kategori_barang: KategoriBarangDonasi;
      jumlah: number;
      satuan: string;
    };
    verifiedByUserId?: number | null;
  },
) {
  const {
    kode_donasi,
    nama_pengirim,
    is_anonim,
    tanggal_donasi,
    barang,
    verifiedByUserId,
  } = params;

  const namaPublik = is_anonim ? "Hamba Allah (Anonim)" : nama_pengirim.trim();
  const keteranganAuto = `Donasi (${kode_donasi}) dari ${namaPublik}`;

  if (barang.kategori_barang === "inventaris") {
    // Jika sebelumnya sempat tercatat sebagai habis_pakai, tarik dulu dampaknya
    await rollbackDonasiBarangLogistikOnly(tx, barang.id_donasi_barang);

    await tx.inventaris_barang.upsert({
      where: { id_donasi_barang: barang.id_donasi_barang },
      update: {
        nama_barang: barang.nama_barang.trim(),
        jumlah: barang.jumlah,
        tgl_perolehan: tanggal_donasi,
        keterangan: keteranganAuto,
      },
      create: {
        id_donasi_barang: barang.id_donasi_barang,
        kode_inventaris: `INV-${kode_donasi}`,
        nama_barang: barang.nama_barang.trim(),
        jumlah: barang.jumlah,
        kondisi: "baik",
        lokasi_penyimpanan: "Gudang Utama (Belum Ditempatkan)",
        tgl_perolehan: tanggal_donasi,
        keterangan: keteranganAuto,
      },
    });
    return;
  }

  // Kategori: habis_pakai -> Hapus entri inventaris jika sebelumnya sempat kategori inventaris
  await tx.inventaris_barang.deleteMany({
    where: { id_donasi_barang: barang.id_donasi_barang },
  });

  const existingMasuk = await tx.logistik_masuk.findUnique({
    where: { id_donasi_barang: barang.id_donasi_barang },
    include: {
      logistik_habis_pakai: true,
    },
  });

  const { id_user, id_pengurus } = await resolveActorIds(tx, verifiedByUserId);

  // Jika sudah pernah terverifikasi sebelumnya, cek apakah ada perubahan nama/satuan/jumlah
  if (existingMasuk) {
    const isSameItem =
      existingMasuk.logistik_habis_pakai.nama_barang.trim().toLowerCase() ===
        barang.nama_barang.trim().toLowerCase() &&
      existingMasuk.logistik_habis_pakai.satuan.trim().toLowerCase() ===
        barang.satuan.trim().toLowerCase();

    if (isSameItem && existingMasuk.jumlah_masuk === barang.jumlah) {
      await tx.logistik_masuk.update({
        where: { id_logistik_masuk: existingMasuk.id_logistik_masuk },
        data: {
          tanggal_masuk: tanggal_donasi,
          keterangan: keteranganAuto,
          ...(id_user ? { id_user } : {}),
          ...(id_pengurus ? { id_pengurus } : {}),
        },
      });
      return;
    }

    // Jika item atau jumlah berubah pasca-verifikasi: rollback stok lama dengan validasi
    await rollbackDonasiBarangLogistikOnly(tx, barang.id_donasi_barang);
  }

  // Cari master logistik yang cocok berdasarkan nama_barang & satuan (case-insensitive)
  const allLogistik = await tx.logistik_habis_pakai.findMany();
  const matchedLogistik = allLogistik.find(
    (item) =>
      item.nama_barang.trim().toLowerCase() ===
        barang.nama_barang.trim().toLowerCase() &&
      item.satuan.trim().toLowerCase() === barang.satuan.trim().toLowerCase(),
  );

  let targetLogistikId: number;
  if (matchedLogistik) {
    const updated = await tx.logistik_habis_pakai.update({
      where: { id_logistik: matchedLogistik.id_logistik },
      data: {
        stok_jumlah: { increment: barang.jumlah },
      },
      select: { id_logistik: true },
    });
    targetLogistikId = updated.id_logistik;
  } else {
    const created = await tx.logistik_habis_pakai.create({
      data: {
        nama_barang: barang.nama_barang.trim(),
        kategori: "Donasi / Umum",
        stok_jumlah: barang.jumlah,
        satuan: barang.satuan.trim(),
      },
      select: { id_logistik: true },
    });
    targetLogistikId = created.id_logistik;
  }

  await tx.logistik_masuk.create({
    data: {
      id_logistik: targetLogistikId,
      id_donasi_barang: barang.id_donasi_barang,
      id_user,
      id_pengurus,
      jumlah_masuk: barang.jumlah,
      tanggal_masuk: tanggal_donasi,
      keterangan: keteranganAuto,
    },
  });
}

async function rollbackDonasiBarangLogistikOnly(
  tx: Prisma.TransactionClient,
  id_donasi_barang: number,
) {
  const existingLogistikMasuk = await tx.logistik_masuk.findUnique({
    where: { id_donasi_barang },
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

  if (!existingLogistikMasuk) return;

  const { stok_jumlah, nama_barang, satuan } =
    existingLogistikMasuk.logistik_habis_pakai;

  if (stok_jumlah < existingLogistikMasuk.jumlah_masuk) {
    throw new Error(
      `Tidak dapat membatalkan/menghapus donasi karena stok "${nama_barang}" tersisa ${stok_jumlah} ${satuan} (lebih kecil dari jumlah donasi ${existingLogistikMasuk.jumlah_masuk} ${satuan}). Sesuaikan catatan logistik keluar terlebih dahulu.`,
    );
  }

  await tx.logistik_habis_pakai.update({
    where: { id_logistik: existingLogistikMasuk.id_logistik },
    data: {
      stok_jumlah: { decrement: existingLogistikMasuk.jumlah_masuk },
    },
  });

  await tx.logistik_masuk.delete({
    where: { id_logistik_masuk: existingLogistikMasuk.id_logistik_masuk },
  });
}

async function rollbackDonasiBarangSync(
  tx: Prisma.TransactionClient,
  id_donasi_barang: number,
) {
  await tx.inventaris_barang.deleteMany({
    where: { id_donasi_barang },
  });
  await rollbackDonasiBarangLogistikOnly(tx, id_donasi_barang);
}

function mapDonasiRow(row: {
  id_donasi: number;
  id_donatur: number | null;
  kode_donasi: string;
  nama_pengirim: string;
  tanggal_donasi: Date;
  jenis_donasi: unknown;
  is_anonim: boolean;
  status_verifikasi: unknown;
  bukti_pembayaran: string | null;
  catatan: string | null;
  donatur: { nama_donatur: string } | null;
  donasi_uang: {
    id_donasi_uang: number;
    nominal: unknown;
    metode_pembayaran: unknown;
    transaksi_kas?: {
      pengurus: { nama_pengurus: string } | null;
      users: {
        username: string;
        roles: { nama_role: string };
      } | null;
    } | null;
  } | null;
  donasi_barang: {
    id_donasi_barang: number;
    nama_barang: string;
    kategori_barang: unknown;
    jumlah: number;
    satuan: string;
    nomor_resi_ekspedisi: string | null;
    logistik_masuk?: {
      pengurus: { nama_pengurus: string } | null;
      users: {
        username: string;
        roles: { nama_role: string };
      } | null;
    } | null;
  } | null;
}): DonasiTransactionItem {
  const kasVerifikator = row.donasi_uang?.transaksi_kas;
  const logistikVerifikator = row.donasi_barang?.logistik_masuk;

  const verifikatorNama = kasVerifikator?.pengurus?.nama_pengurus
    ? kasVerifikator.pengurus.nama_pengurus
    : kasVerifikator?.users
      ? `${kasVerifikator.users.username} (${kasVerifikator.users.roles.nama_role})`
      : logistikVerifikator?.pengurus?.nama_pengurus
        ? logistikVerifikator.pengurus.nama_pengurus
        : logistikVerifikator?.users
          ? `${logistikVerifikator.users.username} (${logistikVerifikator.users.roles.nama_role})`
          : null;

  return {
    id_donasi: row.id_donasi,
    id_donatur: row.id_donatur,
    kode_donasi: row.kode_donasi,
    nama_pengirim: row.nama_pengirim,
    nama_donatur_terdaftar: row.donatur?.nama_donatur ?? null,
    tanggal_donasi_iso: formatDateIso(row.tanggal_donasi),
    tanggal_donasi_display: formatDateIndo(row.tanggal_donasi),
    jenis_donasi: String(row.jenis_donasi) as JenisDonasiType,
    is_anonim: Boolean(row.is_anonim),
    status_verifikasi: String(row.status_verifikasi) as StatusVerifikasiType,
    bukti_pembayaran: row.bukti_pembayaran,
    catatan: row.catatan,
    verifikator_nama: verifikatorNama,
    donasi_uang: row.donasi_uang
      ? {
          id_donasi_uang: row.donasi_uang.id_donasi_uang,
          nominal: Number(row.donasi_uang.nominal ?? 0),
          metode_pembayaran: String(
            row.donasi_uang.metode_pembayaran,
          ) as MetodePembayaranType,
        }
      : null,
    donasi_barang: row.donasi_barang
      ? {
          id_donasi_barang: row.donasi_barang.id_donasi_barang,
          nama_barang: row.donasi_barang.nama_barang,
          kategori_barang: String(
            row.donasi_barang.kategori_barang,
          ) as KategoriBarangDonasiType,
          jumlah: row.donasi_barang.jumlah,
          satuan: row.donasi_barang.satuan,
          nomor_resi_ekspedisi: row.donasi_barang.nomor_resi_ekspedisi,
        }
      : null,
  };
}

export async function getAllDonatur(): Promise<DonaturItem[]> {
  const rows = await prisma.donatur.findMany({
    include: {
      users: { select: { username: true } },
      donasi: {
        include: {
          donasi_uang: { select: { nominal: true } },
        },
      },
    },
    orderBy: { id_donatur: "desc" },
  });

  return rows.map((row) => {
    const verifiedDonations = row.donasi.filter(
      (d) => String(d.status_verifikasi) === "terverifikasi",
    );
    const totalUang = verifiedDonations.reduce((acc, d) => {
      return acc + (d.donasi_uang ? Number(d.donasi_uang.nominal ?? 0) : 0);
    }, 0);

    return {
      id_donatur: row.id_donatur,
      id_user: row.id_user,
      username: row.users?.username ?? null,
      nama_donatur: row.nama_donatur,
      email: row.email,
      no_telepon: row.no_telepon,
      alamat: row.alamat,
      tipe_donatur: String(row.tipe_donatur),
      frekuensi_donasi: row.frekuensi_donasi,
      total_transaksi: verifiedDonations.length,
      total_donasi_uang: totalUang,
    };
  });
}

export async function createDonaturRecord(input: DonaturFormInput) {
  const validTipe = getTipeDonaturOptions();
  if (!validTipe.includes(input.tipe_donatur)) {
    throw new Error("Tipe donatur tidak valid.");
  }

  await prisma.donatur.create({
    data: {
      nama_donatur: input.nama_donatur.trim(),
      email: input.email?.trim() || null,
      no_telepon: input.no_telepon?.trim() || null,
      alamat: input.alamat?.trim() || null,
      tipe_donatur: input.tipe_donatur as TipeDonatur,
      frekuensi_donasi: input.frekuensi_donasi?.trim() || null,
    },
  });
}

export async function updateDonaturRecord(
  id_donatur: number,
  input: DonaturFormInput,
) {
  const validTipe = getTipeDonaturOptions();
  if (!validTipe.includes(input.tipe_donatur)) {
    throw new Error("Tipe donatur tidak valid.");
  }

  const existing = await prisma.donatur.findUnique({
    where: { id_donatur },
    select: { id_donatur: true },
  });
  if (!existing) {
    throw new Error("Data donatur tidak ditemukan.");
  }

  await prisma.donatur.update({
    where: { id_donatur },
    data: {
      nama_donatur: input.nama_donatur.trim(),
      email: input.email?.trim() || null,
      no_telepon: input.no_telepon?.trim() || null,
      alamat: input.alamat?.trim() || null,
      tipe_donatur: input.tipe_donatur as TipeDonatur,
      frekuensi_donasi: input.frekuensi_donasi?.trim() || null,
    },
  });
}

export async function deleteDonaturRecord(id_donatur: number) {
  const existing = await prisma.donatur.findUnique({
    where: { id_donatur },
    select: { nama_donatur: true },
  });
  if (!existing) {
    throw new Error("Data donatur tidak ditemukan.");
  }

  await prisma.donatur.delete({ where: { id_donatur } });
  return existing.nama_donatur;
}

export async function getAllDonasiTransactions(): Promise<
  DonasiTransactionItem[]
> {
  const rows = await prisma.donasi.findMany({
    include: {
      donatur: { select: { nama_donatur: true } },
      donasi_uang: {
        include: {
          transaksi_kas: {
            select: {
              pengurus: { select: { nama_pengurus: true } },
              users: {
                select: {
                  username: true,
                  roles: { select: { nama_role: true } },
                },
              },
            },
          },
        },
      },
      donasi_barang: {
        include: {
          logistik_masuk: {
            select: {
              pengurus: { select: { nama_pengurus: true } },
              users: {
                select: {
                  username: true,
                  roles: { select: { nama_role: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ tanggal_donasi: "desc" }, { id_donasi: "desc" }],
  });

  return rows.map(mapDonasiRow);
}

export async function getOrCreateDonaturByUserId(
  id_user: number,
  fallbackUsername: string,
): Promise<DonaturItem> {
  let donaturRow = await prisma.donatur.findUnique({
    where: { id_user },
    include: {
      users: { select: { username: true } },
      donasi: {
        include: { donasi_uang: { select: { nominal: true } } },
      },
    },
  });

  if (!donaturRow) {
    donaturRow = await prisma.donatur.create({
      data: {
        id_user,
        nama_donatur: fallbackUsername,
        tipe_donatur: TipeDonatur.tidak_tetap,
      },
      include: {
        users: { select: { username: true } },
        donasi: {
          include: { donasi_uang: { select: { nominal: true } } },
        },
      },
    });
  }

  const verifiedDonations = donaturRow.donasi.filter(
    (d) => String(d.status_verifikasi) === "terverifikasi",
  );
  const totalUang = verifiedDonations.reduce((acc, d) => {
    return acc + (d.donasi_uang ? Number(d.donasi_uang.nominal ?? 0) : 0);
  }, 0);

  return {
    id_donatur: donaturRow.id_donatur,
    id_user: donaturRow.id_user,
    username: donaturRow.users?.username ?? fallbackUsername,
    nama_donatur: donaturRow.nama_donatur,
    email: donaturRow.email,
    no_telepon: donaturRow.no_telepon,
    alamat: donaturRow.alamat,
    tipe_donatur: String(donaturRow.tipe_donatur),
    frekuensi_donasi: donaturRow.frekuensi_donasi,
    total_transaksi: verifiedDonations.length,
    total_donasi_uang: totalUang,
  };
}

export async function getDonaturPortalData(
  id_user: number,
  fallbackUsername: string,
): Promise<DonaturPortalData> {
  const profil = await getOrCreateDonaturByUserId(id_user, fallbackUsername);

  const rows = await prisma.donasi.findMany({
    where: { id_donatur: profil.id_donatur },
    include: {
      donatur: { select: { nama_donatur: true } },
      donasi_uang: true,
      donasi_barang: true,
    },
    orderBy: [{ tanggal_donasi: "desc" }, { id_donasi: "desc" }],
  });

  return {
    profil,
    riwayat: rows.map(mapDonasiRow),
  };
}

export async function createDonasiUangTransaction(
  input: DonasiUangFormInput,
  buktiPembayaranPath: string | null,
  verifiedByUserId?: number | null,
) {
  const kodeDonasi = await generateUniqueKodeDonasi();
  const statusAwal: StatusVerifikasi = input.auto_verify
    ? "terverifikasi"
    : "pending";
  const tanggalDonasi = new Date(input.tanggal_donasi);

  await prisma.$transaction(async (tx) => {
    const createdDonasi = await tx.donasi.create({
      data: {
        id_donatur: input.id_donatur ?? null,
        kode_donasi: kodeDonasi,
        nama_pengirim: input.nama_pengirim.trim(),
        tanggal_donasi: tanggalDonasi,
        jenis_donasi: "uang",
        is_anonim: input.is_anonim,
        status_verifikasi: statusAwal,
        bukti_pembayaran: buktiPembayaranPath,
        catatan: input.catatan?.trim() || null,
        donasi_uang: {
          create: {
            nominal: input.nominal,
            metode_pembayaran: input.metode_pembayaran as MetodePembayaran,
          },
        },
      },
      include: {
        donasi_uang: true,
      },
    });

    if (statusAwal === "terverifikasi" && createdDonasi.donasi_uang) {
      const [{ id_user, id_pengurus }, idKategoriKas] = await Promise.all([
        resolveActorIds(tx, verifiedByUserId),
        resolveDonasiKategoriKasId(tx),
      ]);

      const namaPublik = input.is_anonim
        ? "Hamba Allah (Anonim)"
        : input.nama_pengirim.trim();

      await tx.transaksi_kas.create({
        data: {
          id_user,
          id_pengurus,
          id_kategori_kas: idKategoriKas,
          id_donasi_uang: createdDonasi.donasi_uang.id_donasi_uang,
          tanggal_transaksi: tanggalDonasi,
          nominal: input.nominal,
          jenis_transaksi: "pemasukan",
          keterangan: `Penerimaan Donasi (${kodeDonasi}) dari ${namaPublik} via ${formatMetodeLabel(input.metode_pembayaran)}`,
          file_nota: buktiPembayaranPath,
        },
      });
    }
  });

  return kodeDonasi;
}

export async function createDonasiBarangTransaction(
  input: DonasiBarangFormInput,
  buktiPembayaranPath: string | null,
  verifiedByUserId?: number | null,
) {
  const kodeDonasi = await generateUniqueKodeDonasi();
  const statusAwal: StatusVerifikasi = input.auto_verify
    ? "terverifikasi"
    : "pending";
  const tanggalDonasi = new Date(input.tanggal_donasi);

  await prisma.$transaction(async (tx) => {
    const createdDonasi = await tx.donasi.create({
      data: {
        id_donatur: input.id_donatur ?? null,
        kode_donasi: kodeDonasi,
        nama_pengirim: input.nama_pengirim.trim(),
        tanggal_donasi: tanggalDonasi,
        jenis_donasi: "barang",
        is_anonim: input.is_anonim,
        status_verifikasi: statusAwal,
        bukti_pembayaran: buktiPembayaranPath,
        catatan: input.catatan?.trim() || null,
        donasi_barang: {
          create: {
            nama_barang: input.nama_barang.trim(),
            kategori_barang: input.kategori_barang as KategoriBarangDonasi,
            jumlah: input.jumlah,
            satuan: input.satuan.trim(),
            nomor_resi_ekspedisi: input.nomor_resi_ekspedisi?.trim() || null,
          },
        },
      },
      include: {
        donasi_barang: true,
      },
    });

    if (statusAwal === "terverifikasi" && createdDonasi.donasi_barang) {
      await syncVerifiedDonasiBarang(tx, {
        kode_donasi: createdDonasi.kode_donasi,
        nama_pengirim: createdDonasi.nama_pengirim,
        is_anonim: createdDonasi.is_anonim,
        tanggal_donasi: createdDonasi.tanggal_donasi,
        barang: createdDonasi.donasi_barang,
        verifiedByUserId,
      });
    }
  });

  return kodeDonasi;
}

export async function verifyDonasiTransaction(
  id_donasi: number,
  status: "terverifikasi" | "ditolak",
  catatan?: string,
  verifiedByUserId?: number | null,
) {
  const existing = await prisma.donasi.findUnique({
    where: { id_donasi },
    include: {
      donasi_uang: true,
      donasi_barang: true,
    },
  });

  if (!existing) {
    throw new Error("Transaksi donasi tidak ditemukan.");
  }

  let updatedCatatan = existing.catatan;
  if (catatan && catatan.trim().length > 0) {
    const prefix =
      status === "ditolak" ? "[Alasan Penolakan]" : "[Catatan Verifikator]";
    updatedCatatan = existing.catatan
      ? `${existing.catatan} | ${prefix}: ${catatan.trim()}`
      : `${prefix}: ${catatan.trim()}`;
  }

  await prisma.$transaction(async (tx) => {
    await tx.donasi.update({
      where: { id_donasi },
      data: {
        status_verifikasi: status as StatusVerifikasi,
        catatan: updatedCatatan,
      },
    });

    // Sinkronisasi Donasi Uang -> Buku Kas
    if (existing.jenis_donasi === "uang" && existing.donasi_uang) {
      if (status === "terverifikasi") {
        const [{ id_user, id_pengurus }, idKategoriKas] = await Promise.all([
          resolveActorIds(tx, verifiedByUserId),
          resolveDonasiKategoriKasId(tx),
        ]);

        const namaPublik = existing.is_anonim
          ? "Hamba Allah (Anonim)"
          : existing.nama_pengirim;

        const keteranganOtomatis = `Penerimaan Donasi (${existing.kode_donasi}) dari ${namaPublik} via ${formatMetodeLabel(String(existing.donasi_uang.metode_pembayaran))}`;

        await tx.transaksi_kas.upsert({
          where: {
            id_donasi_uang: existing.donasi_uang.id_donasi_uang,
          },
          update: {
            id_user,
            id_pengurus,
            id_kategori_kas: idKategoriKas,
            tanggal_transaksi: existing.tanggal_donasi,
            nominal: existing.donasi_uang.nominal,
            jenis_transaksi: "pemasukan",
            keterangan: keteranganOtomatis,
            file_nota: existing.bukti_pembayaran,
          },
          create: {
            id_user,
            id_pengurus,
            id_kategori_kas: idKategoriKas,
            id_donasi_uang: existing.donasi_uang.id_donasi_uang,
            tanggal_transaksi: existing.tanggal_donasi,
            nominal: existing.donasi_uang.nominal,
            jenis_transaksi: "pemasukan",
            keterangan: keteranganOtomatis,
            file_nota: existing.bukti_pembayaran,
          },
        });
      } else if (status === "ditolak") {
        await tx.transaksi_kas.deleteMany({
          where: {
            id_donasi_uang: existing.donasi_uang.id_donasi_uang,
          },
        });
      }
    }

    // Sinkronisasi Donasi Barang -> Inventaris & Logistik Habis Pakai
    if (existing.jenis_donasi === "barang" && existing.donasi_barang) {
      if (status === "terverifikasi") {
        await syncVerifiedDonasiBarang(tx, {
          kode_donasi: existing.kode_donasi,
          nama_pengirim: existing.nama_pengirim,
          is_anonim: existing.is_anonim,
          tanggal_donasi: existing.tanggal_donasi,
          barang: existing.donasi_barang,
          verifiedByUserId,
        });
      } else if (status === "ditolak") {
        await rollbackDonasiBarangSync(
          tx,
          existing.donasi_barang.id_donasi_barang,
        );
      }
    }
  });
}

export async function deleteDonasiTransaction(id_donasi: number) {
  const existing = await prisma.donasi.findUnique({
    where: { id_donasi },
    include: {
      donasi_uang: { select: { id_donasi_uang: true } },
      donasi_barang: { select: { id_donasi_barang: true } },
    },
  });

  if (!existing) {
    throw new Error("Transaksi donasi tidak ditemukan.");
  }

  await prisma.$transaction(async (tx) => {
    if (existing.donasi_uang) {
      await tx.transaksi_kas.deleteMany({
        where: { id_donasi_uang: existing.donasi_uang.id_donasi_uang },
      });
    }
    if (existing.donasi_barang) {
      await rollbackDonasiBarangSync(
        tx,
        existing.donasi_barang.id_donasi_barang,
      );
    }
    await tx.donasi.delete({ where: { id_donasi } });
  });

  return existing.kode_donasi;
}
