import { z } from "zod";

export const updateProfilSchema = z.object({
  username: z
    .string()
    .trim()
    .min(4, "Username minimal 4 karakter.")
    .max(100, "Username maksimal 100 karakter.")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username hanya boleh berisi huruf, angka, titik, strip, atau garis bawah.",
    )
    .optional(),
  email: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || z.string().email().safeParse(val).success,
      "Format alamat email tidak valid.",
    ),
  // Field khusus Pengurus Panti
  nama_pengurus: z.string().trim().optional(),
  no_telepon_pengurus: z.string().trim().optional(),
  alamat_pengurus: z.string().trim().optional(),
  // Field khusus Donatur
  nama_donatur: z.string().trim().optional(),
  no_telepon_donatur: z.string().trim().optional(),
  alamat_donatur: z.string().trim().optional(),
  frekuensi_donasi: z.string().trim().optional(),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().optional(),
    new_password: z
      .string()
      .min(6, "Password baru minimal terdiri dari 6 karakter.")
      .max(100, "Password baru maksimal 100 karakter."),
    confirm_password: z
      .string()
      .min(1, "Konfirmasi password baru wajib diisi."),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Konfirmasi password baru tidak cocok.",
    path: ["confirm_password"],
  });

export type UpdateProfilInput = z.infer<typeof updateProfilSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
