import { z } from "zod";

export const pengurusSchema = z.object({
  nama_pengurus: z.string().min(3, "Nama pengurus minimal 3 karakter."),
  jabatan: z.string().min(2, "Jabatan wajib diisi."),
  no_telepon: z
    .string()
    .min(8, "Nomor telepon minimal 8 digit.")
    .max(20, "Nomor telepon maksimal 20 digit."),
  alamat: z.string().min(5, "Alamat lengkap wajib diisi."),
});

export type PengurusInput = z.infer<typeof pengurusSchema>;
