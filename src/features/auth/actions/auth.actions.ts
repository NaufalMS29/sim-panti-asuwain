"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mail";
import {
  loginCredentialsSchema,
  registerDonaturSchema,
  verifyOtpSchema,
  requestOtpSchema,
  resetPasswordSchema,
  RegisterDonaturInput,
  ResetPasswordInput,
} from "../schemas/auth.schema";
import {
  createOtpAutoLoginPayload,
  registerDonaturWithOtp,
  verifyRegistrationOtp,
  regenerateRegistrationOtp,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} from "../services/auth.service";
import {
  AuthActionResponse,
  ROLE_DASHBOARD_MAP,
  RoleName,
} from "../types/auth.types";

export async function loginWithCredentialsAction(
  identifier: string,
  password: string,
): Promise<AuthActionResponse> {
  const parsed = loginCredentialsSchema.safeParse({ identifier, password });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Input login tidak valid.",
    };
  }

  const existingUser = await prisma.users.findFirst({
    where: {
      OR: [
        { username: parsed.data.identifier },
        { email: parsed.data.identifier.toLowerCase() },
      ],
    },
    include: { roles: true },
  });

  if (existingUser && existingUser.username.startsWith("pending_")) {
    return {
      success: false,
      message:
        "Email Anda belum diverifikasi dengan kode OTP. Silakan daftar ulang di halaman Registrasi untuk menerima kode OTP.",
    };
  }

  try {
    await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      redirect: false,
    });

    const roleName = (existingUser?.roles.nama_role ||
      "Donatur Tidak Tetap") as RoleName;
    const redirectUrl = ROLE_DASHBOARD_MAP[roleName] || "/dashboard/donatur";

    return {
      success: true,
      message: "Login berhasil.",
      redirectUrl,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: "Username/email atau password salah.",
      };
    }
    return {
      success: false,
      message: "Terjadi kesalahan pada server saat memproses login.",
    };
  }
}

export async function registerDonaturAction(
  data: RegisterDonaturInput,
): Promise<AuthActionResponse> {
  const parsed = registerDonaturSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message || "Data pendaftaran tidak valid.",
    };
  }

  const regResult = await registerDonaturWithOtp(parsed.data);
  if (!regResult.success) {
    return {
      success: false,
      message: regResult.message,
    };
  }

  try {
    await sendOtpEmail(regResult.targetEmail, regResult.otpCode);
    return {
      success: true,
      message: `Kode OTP 6 digit telah dikirim ke ${regResult.targetEmail}. Masukkan kode tersebut untuk mengaktifkan akun.`,
    };
  } catch {
    return {
      success: false,
      message:
        "Data tersimpan, tetapi gagal mengirim email OTP. Periksa SMTP_EMAIL dan SMTP_APP_PASSWORD di .env.",
    };
  }
}

export async function verifyRegisterOtpAction(
  email: string,
  otp: string,
): Promise<AuthActionResponse> {
  const parsed = verifyOtpSchema.safeParse({ email, otp });
  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message || "Format kode OTP tidak valid.",
    };
  }

  const verifyResult = await verifyRegistrationOtp(
    parsed.data.email,
    parsed.data.otp,
  );
  if (!verifyResult.success) {
    return {
      success: false,
      message: verifyResult.message,
    };
  }

  try {
    const autoLoginPayload = createOtpAutoLoginPayload(verifyResult.id_user);
    await signIn("otp-auto-login", {
      ...autoLoginPayload,
      redirect: false,
    });

    return {
      success: true,
      message: verifyResult.message,
      redirectUrl: verifyResult.redirectUrl,
    };
  } catch {
    return {
      success: true,
      message:
        "Verifikasi email berhasil! Silakan masuk menggunakan akun Anda.",
      redirectUrl: "/login",
    };
  }
}

export async function resendRegisterOtpAction(
  email: string,
): Promise<AuthActionResponse> {
  const parsed = requestOtpSchema.safeParse({ email });
  if (!parsed.success) {
    return {
      success: false,
      message: "Email tidak valid.",
    };
  }

  const regenResult = await regenerateRegistrationOtp(parsed.data.email);
  if (!regenResult.success) {
    return {
      success: false,
      message: regenResult.message,
    };
  }

  try {
    await sendOtpEmail(regenResult.targetEmail, regenResult.otpCode);
    return {
      success: true,
      message: `Kode OTP baru telah dikirim ke ${regenResult.targetEmail}.`,
    };
  } catch {
    return {
      success: false,
      message: "Gagal mengirim ulang email OTP.",
    };
  }
}

export async function requestForgotPasswordAction(
  email: string,
): Promise<AuthActionResponse> {
  const parsed = requestOtpSchema.safeParse({ email });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Format email tidak valid.",
    };
  }

  const resetReq = await requestPasswordResetOtp(parsed.data.email);
  if (!resetReq.success) {
    return {
      success: false,
      message: resetReq.message,
    };
  }

  try {
    await sendOtpEmail(resetReq.targetEmail, resetReq.otpCode);
    return {
      success: true,
      message: `Kode OTP pemulihan telah dikirim ke ${resetReq.targetEmail}.`,
    };
  } catch {
    return {
      success: false,
      message:
        "Gagal mengirim email OTP pemulihan. Periksa konfigurasi SMTP di .env.",
    };
  }
}

export async function resetPasswordAction(
  data: ResetPasswordInput,
): Promise<AuthActionResponse> {
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Data reset tidak valid.",
    };
  }

  return resetPasswordWithOtp(
    parsed.data.email,
    parsed.data.otp,
    parsed.data.new_password,
  );
}

export async function loginWithGoogleAction() {
  await signIn("google", { redirectTo: "/dashboard/donatur" });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
