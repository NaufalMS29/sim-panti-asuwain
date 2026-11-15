import { z } from "zod";

export const createAlumniSchema = z.object({
  id_anak: z.coerce
    .number()
    .int()
    .positive("Pilih anak panti yang akan ditetapkan sebagai alumni."),
  tahun_lulus: z.coerce
    .number()
    .int("Tahun lulus harus berupa angka bulat.")
    .min(1990, "Tahun lulus minimal 1990.")
    .max(2100, "Tahun lulus tidak valid."),
  pekerjaan_sekarang: z
    .string()
    .trim()
    .max(100, "Pekerjaan/aktivitas maksimal 100 karakter.")
    .optional(),
  alamat_sekarang: z
    .string()
    .trim()
    .min(5, "Alamat domisili saat ini minimal 5 karakter."),
  kontak: z.string().trim().max(50, "Kontak maksimal 50 karakter.").optional(),
});

export const updateAlumniSchema = z.object({
  tahun_lulus: z.coerce
    .number()
    .int("Tahun lulus harus berupa angka bulat.")
    .min(1990, "Tahun lulus minimal 1990.")
    .max(2100, "Tahun lulus tidak valid."),
  pekerjaan_sekarang: z
    .string()
    .trim()
    .max(100, "Pekerjaan/aktivitas maksimal 100 karakter.")
    .optional(),
  alamat_sekarang: z
    .string()
    .trim()
    .min(5, "Alamat domisili saat ini minimal 5 karakter."),
  kontak: z.string().trim().max(50, "Kontak maksimal 50 karakter.").optional(),
});

export type CreateAlumniInput = z.infer<typeof createAlumniSchema>;
export type UpdateAlumniInput = z.infer<typeof updateAlumniSchema>;
