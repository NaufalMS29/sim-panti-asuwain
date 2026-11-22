import { z } from "zod";

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(4, "Username minimal 4 karakter.")
    .max(100, "Username maksimal 100 karakter.")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username hanya boleh berisi huruf, angka, titik, strip, atau garis bawah.",
    ),
  email: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || z.string().email().safeParse(val).success,
      "Format alamat email tidak valid.",
    ),
  role_id: z.coerce.number().int().positive("Role pengguna wajib dipilih."),
  password: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || val.length >= 6,
      "Password minimal 6 karakter (atau kosongkan untuk memakai default asuwain123).",
    ),
});

export const updateUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(4, "Username minimal 4 karakter.")
    .max(100, "Username maksimal 100 karakter.")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username hanya boleh berisi huruf, angka, titik, strip, atau garis bawah.",
    ),
  email: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || z.string().email().safeParse(val).success,
      "Format alamat email tidak valid.",
    ),
  role_id: z.coerce.number().int().positive("Role pengguna wajib dipilih."),
});

export const resetPasswordSchema = z.object({
  new_password: z
    .string()
    .trim()
    .min(6, "Password baru minimal 6 karakter.")
    .max(100, "Password baru maksimal 100 karakter."),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
