import { z } from "zod";

export const createKunjunganSchema = z.object({
  nama_pengunjung: z
    .string()
    .trim()
    .min(3, "Nama pengunjung minimal 3 karakter.")
    .max(100, "Nama pengunjung maksimal 100 karakter."),
  email_pengunjung: z
    .string()
    .trim()
    .email("Format alamat email tidak valid.")
    .max(100, "Email maksimal 100 karakter."),
  no_telepon: z
    .string()
    .trim()
    .min(8, "Nomor telepon/WA minimal 8 digit.")
    .max(20, "Nomor telepon/WA maksimal 20 digit.")
    .regex(/^[0-9+\-\s()]+$/, "Format nomor telepon tidak valid."),
  instansi_organisasi: z
    .string()
    .trim()
    .max(100, "Nama instansi maksimal 100 karakter.")
    .optional()
    .or(z.literal("")),
  tujuan_kunjungan: z
    .string()
    .trim()
    .min(10, "Tujuan kunjungan minimal 10 karakter.")
    .max(1000, "Tujuan kunjungan maksimal 1000 karakter."),
  tanggal_rencana: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD).")
    .refine((val) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(`${val}T00:00:00`);
      return selected >= today;
    }, "Tanggal kunjungan tidak boleh di masa lalu."),
  jam_rencana: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam tidak valid (HH:mm).")
    .refine((val) => {
      const [hour] = val.split(":").map(Number);
      return hour >= 8 && hour <= 17;
    }, "Jam kunjungan hanya tersedia antara pukul 08:00 hingga 17:00 WIB."),
  jumlah_rombongan: z.coerce
    .number()
    .int("Jumlah rombongan harus bilangan bulat.")
    .min(1, "Jumlah rombongan minimal 1 orang.")
    .max(200, "Jumlah rombongan maksimal 200 orang."),
  // Field keamanan anti-bot (Honeypot & Time-Trap)
  website_url: z.string().optional().default(""),
  form_started_at: z.coerce.number().optional().default(0),
});

export type CreateKunjunganInput = z.infer<typeof createKunjunganSchema>;

export const cekTiketSchema = z.object({
  kode_tiket: z
    .string()
    .trim()
    .min(6, "Masukkan kode tiket yang valid.")
    .max(30, "Kode tiket maksimal 30 karakter.")
    .toUpperCase(),
});

export const verifyKunjunganSchema = z
  .object({
    id_kunjungan: z.coerce.number().int().positive(),
    status_kunjungan: z.enum(["disetujui", "ditolak"]),
    catatan_pengurus: z
      .string()
      .trim()
      .max(1000, "Catatan pengurus maksimal 1000 karakter.")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.status_kunjungan === "ditolak") {
        return Boolean(
          data.catatan_pengurus && data.catatan_pengurus.length >= 5,
        );
      }
      return true;
    },
    {
      message: "Alasan penolakan wajib diisi minimal 5 karakter.",
      path: ["catatan_pengurus"],
    },
  );

export type VerifyKunjunganInput = z.infer<typeof verifyKunjunganSchema>;
