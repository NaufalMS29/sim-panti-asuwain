import { z } from "zod";

export const loginCredentialsSchema = z.object({
  identifier: z.string().min(1, "Username atau email wajib diisi."),
  password: z.string().min(1, "Password wajib diisi."),
});

export const registerDonaturSchema = z
  .object({
    nama_donatur: z.string().min(3, "Nama lengkap minimal 3 karakter."),
    email: z.string().email("Format email tidak valid."),
    no_telepon: z
      .string()
      .min(8, "Nomor telepon minimal 8 digit.")
      .max(20, "Nomor telepon maksimal 20 digit."),
    alamat: z.string().min(5, "Alamat lengkap wajib diisi."),
    tipe_donatur: z.enum(["tetap", "tidak_tetap"]),
    frekuensi_donasi: z.enum([
      "insidental",
      "bulanan",
      "3_bulanan",
      "6_bulanan",
      "tahunan",
    ]),
    password: z.string().min(6, "Password minimal 6 karakter."),
    confirm_password: z
      .string()
      .min(6, "Konfirmasi password minimal 6 karakter."),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Konfirmasi password tidak cocok dengan password.",
    path: ["confirm_password"],
  });

export type RegisterDonaturInput = z.infer<typeof registerDonaturSchema>;

export const requestOtpSchema = z.object({
  email: z.string().email("Format email tidak valid."),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  otp: z
    .string()
    .length(6, "Kode OTP harus 6 digit angka.")
    .regex(/^\d{6}$/, "Kode OTP hanya boleh berisi angka."),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Format email tidak valid."),
    otp: z
      .string()
      .length(6, "Kode OTP harus 6 digit angka.")
      .regex(/^\d{6}$/, "Kode OTP hanya boleh berisi angka."),
    new_password: z.string().min(6, "Password baru minimal 6 karakter."),
    confirm_new_password: z
      .string()
      .min(6, "Konfirmasi password baru minimal 6 karakter."),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Konfirmasi password baru tidak cocok.",
    path: ["confirm_new_password"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
