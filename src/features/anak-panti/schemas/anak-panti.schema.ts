import { z } from "zod";

export const anakPantiFormSchema = z.object({
  nama_anak: z
    .string()
    .trim()
    .min(3, "Nama lengkap anak minimal 3 karakter.")
    .max(150, "Nama lengkap anak maksimal 150 karakter."),
  nik: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || /^[0-9]{16}$/.test(val),
      "NIK harus terdiri dari 16 digit angka (atau kosongkan jika belum ada).",
    ),
  tempat_lahir: z
    .string()
    .trim()
    .min(2, "Tempat lahir wajib diisi.")
    .max(100, "Tempat lahir maksimal 100 karakter."),
  tanggal_lahir: z.string().trim().min(1, "Tanggal lahir wajib diisi."),
  jenis_kelamin: z.string().trim().min(1, "Jenis kelamin wajib dipilih."),
  status_anak: z
    .string()
    .trim()
    .min(1, "Kategori status sosial anak wajib dipilih."),
  tanggal_masuk: z.string().trim().min(1, "Tanggal masuk panti wajib diisi."),
});

export type AnakPantiFormInput = z.infer<typeof anakPantiFormSchema>;
