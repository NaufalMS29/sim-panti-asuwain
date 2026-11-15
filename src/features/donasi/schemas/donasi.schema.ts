import { z } from "zod";

export const donaturSchema = z.object({
  nama_donatur: z
    .string()
    .trim()
    .min(2, "Nama donatur minimal 2 karakter.")
    .max(100, "Nama donatur maksimal 100 karakter."),
  email: z
    .string()
    .trim()
    .email("Format alamat email tidak valid.")
    .max(100, "Email maksimal 100 karakter.")
    .optional()
    .or(z.literal("")),
  no_telepon: z
    .string()
    .trim()
    .max(20, "Nomor telepon maksimal 20 karakter.")
    .optional()
    .or(z.literal("")),
  alamat: z.string().trim().max(500).optional().or(z.literal("")),
  tipe_donatur: z.string().min(1, "Tipe donatur wajib dipilih."),
  frekuensi_donasi: z
    .string()
    .trim()
    .max(50, "Frekuensi donasi maksimal 50 karakter.")
    .optional()
    .or(z.literal("")),
});

export const donasiUangInputSchema = z.object({
  id_donatur: z.coerce.number().int().positive().nullable().optional(),
  nama_pengirim: z
    .string()
    .trim()
    .min(2, "Nama pengirim minimal 2 karakter.")
    .max(100, "Nama pengirim maksimal 100 karakter."),
  tanggal_donasi: z.string().min(1, "Tanggal donasi wajib diisi."),
  is_anonim: z.boolean().default(false),
  nominal: z.coerce
    .number()
    .min(1000, "Nominal donasi minimal Rp 1.000.")
    .max(9999999999, "Nominal melebihi batas maksimum kolom."),
  metode_pembayaran: z.enum(["transfer_bank", "qris", "tunai"], {
    message: "Metode pembayaran tidak valid.",
  }),
  catatan: z.string().trim().max(500).optional().or(z.literal("")),
  auto_verify: z.boolean().optional(),
});

export const donasiBarangInputSchema = z.object({
  id_donatur: z.coerce.number().int().positive().nullable().optional(),
  nama_pengirim: z
    .string()
    .trim()
    .min(2, "Nama pengirim minimal 2 karakter.")
    .max(100, "Nama pengirim maksimal 100 karakter."),
  tanggal_donasi: z.string().min(1, "Tanggal donasi wajib diisi."),
  is_anonim: z.boolean().default(false),
  nama_barang: z
    .string()
    .trim()
    .min(2, "Nama barang minimal 2 karakter.")
    .max(100, "Nama barang maksimal 100 karakter."),
  kategori_barang: z.enum(["habis_pakai", "inventaris"], {
    message: "Pilih kategori barang (Habis Pakai atau Inventaris).",
  }),
  jumlah: z.coerce
    .number()
    .int("Jumlah barang harus bilangan bulat.")
    .min(1, "Jumlah barang minimal 1."),
  satuan: z
    .string()
    .trim()
    .min(1, "Satuan wajib diisi (misal: kg, dus, unit).")
    .max(20, "Satuan maksimal 20 karakter."),
  nomor_resi_ekspedisi: z
    .string()
    .trim()
    .max(50, "Nomor resi maksimal 50 karakter.")
    .optional()
    .or(z.literal("")),
  catatan: z.string().trim().max(500).optional().or(z.literal("")),
  auto_verify: z.boolean().optional(),
});

export const verifikasiDonasiSchema = z.object({
  id_donasi: z.coerce.number().int().positive(),
  status_verifikasi: z.enum(["terverifikasi", "ditolak"]),
  catatan_verifikasi: z.string().trim().max(500).optional().or(z.literal("")),
});

export type DonaturFormInput = z.infer<typeof donaturSchema>;
export type DonasiUangFormInput = z.infer<typeof donasiUangInputSchema>;
export type DonasiBarangFormInput = z.infer<typeof donasiBarangInputSchema>;
