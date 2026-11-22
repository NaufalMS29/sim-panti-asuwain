import bcrypt from "bcrypt";
import crypto from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  DONATUR_ROLES,
  ROLE_DASHBOARD_MAP,
  RoleName,
} from "../types/auth.types";
import { RegisterDonaturInput } from "../schemas/auth.schema";

function getHmacSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "sim-panti-otp-secret"
  );
}

export function createOtpAutoLoginPayload(id_user: number) {
  const expires = String(Date.now() + 60 * 1000); // Berlaku 60 detik
  const signature = crypto
    .createHmac("sha256", getHmacSecret())
    .update(`${id_user}:${expires}`)
    .digest("hex");

  return {
    id_user: String(id_user),
    expires,
    signature,
  };
}

export async function verifyOtpAutoLoginUser(
  idUserRaw: string,
  expiresRaw: string,
  signature: string,
) {
  const id_user = Number(idUserRaw);
  const expires = Number(expiresRaw);

  if (
    !id_user ||
    Number.isNaN(id_user) ||
    !expires ||
    Number.isNaN(expires) ||
    Date.now() > expires
  ) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", getHmacSecret())
    .update(`${id_user}:${expires}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedSignature, "hex");
  const actualBuf = Buffer.from(signature, "hex");

  if (
    expectedBuf.length === 0 ||
    expectedBuf.length !== actualBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, actualBuf)
  ) {
    return null;
  }

  const user = await prisma.users.findUnique({
    where: { id_user },
    include: {
      roles: true,
      pengurus: true,
      anak_panti: true,
      donatur: true,
    },
  });

  if (!user || user.username.startsWith("pending_")) {
    return null;
  }

  const displayName =
    user.pengurus?.nama_pengurus ||
    user.anak_panti?.nama_anak ||
    user.donatur?.nama_donatur ||
    user.username;

  return {
    id_user: user.id_user,
    username: user.username,
    email: user.email,
    name: displayName,
    role: user.roles.nama_role as RoleName,
  };
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;

  const user = session.user as {
    id?: string;
    id_user?: number | string;
    username?: string;
    email?: string | null;
    name?: string | null;
    role?: RoleName;
  };

  const resolvedUserId = Number(user.id_user ?? user.id);
  if (!resolvedUserId || Number.isNaN(resolvedUserId) || !user.role) {
    return null;
  }

  return {
    id_user: resolvedUserId,
    username: String(user.username || user.email || user.name || ""),
    email: user.email ?? null,
    name: String(user.name || user.username || ""),
    role: user.role,
  };
}

export async function verifyCredentialsUser(
  identifier: string,
  plainPassword: string,
) {
  const cleanId = identifier.trim();

  const user = await prisma.users.findFirst({
    where: {
      OR: [{ username: cleanId }, { email: cleanId.toLowerCase() }],
    },
    include: {
      roles: true,
      pengurus: true,
      anak_panti: true,
      donatur: true,
    },
  });

  if (!user || !user.password) return null;

  // Tolak login jika akun donatur belum menyelesaikan verifikasi OTP pendaftaran
  if (user.username.startsWith("pending_")) return null;

  const isPasswordValid = await bcrypt.compare(plainPassword, user.password);
  if (!isPasswordValid) return null;

  // Bersihkan sisa kode OTP lupa password jika user berhasil masuk dengan password lama
  if (user.otp_code !== null) {
    await prisma.users.update({
      where: { id_user: user.id_user },
      data: { otp_code: null, otp_expires_at: null },
    });
  }

  const displayName =
    user.pengurus?.nama_pengurus ||
    user.anak_panti?.nama_anak ||
    user.donatur?.nama_donatur ||
    user.username;

  return {
    id_user: user.id_user,
    username: user.username,
    email: user.email,
    name: displayName,
    role: user.roles.nama_role as RoleName,
  };
}

export async function registerDonaturWithOtp(input: RegisterDonaturInput) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const pendingUsername = `pending_${normalizedEmail}`;

  const existing = await prisma.users.findFirst({
    where: {
      OR: [
        { username: normalizedEmail },
        { username: pendingUsername },
        { email: normalizedEmail },
      ],
    },
    include: { donatur: true },
  });

  // Jika akun sudah aktif (tidak diawali pending_)
  if (existing && !existing.username.startsWith("pending_")) {
    return {
      success: false as const,
      message: "Email sudah terdaftar dan aktif. Silakan langsung masuk.",
    };
  }

  const targetRoleName: RoleName =
    input.tipe_donatur === "tetap" ? "Donatur Tetap" : "Donatur Tidak Tetap";

  const role = await prisma.roles.findUnique({
    where: { nama_role: targetRoleName },
  });

  if (!role) {
    return {
      success: false as const,
      message:
        "Konfigurasi role belum tersedia. Jalankan /api/init-system terlebih dahulu.",
    };
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const otpCode = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Berlaku 5 menit
  const frekuensi =
    input.tipe_donatur === "tidak_tetap"
      ? "insidental"
      : input.frekuensi_donasi;

  // Jika sebelumnya mendaftar tetapi belum verifikasi OTP, perbarui data & kirim OTP baru
  if (existing && existing.username.startsWith("pending_")) {
    await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id_user: existing.id_user },
        data: {
          password: hashedPassword,
          role_id: role.id_role,
          otp_code: otpCode,
          otp_expires_at: expiresAt,
        },
      });

      if (existing.donatur) {
        await tx.donatur.update({
          where: { id_donatur: existing.donatur.id_donatur },
          data: {
            nama_donatur: input.nama_donatur,
            no_telepon: input.no_telepon,
            alamat: input.alamat,
            tipe_donatur: input.tipe_donatur,
            frekuensi_donasi: frekuensi,
          },
        });
      }
    });

    return {
      success: true as const,
      otpCode,
      targetEmail: normalizedEmail,
    };
  }

  // Pendaftaran baru dengan status sementara pending_
  await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        username: pendingUsername,
        email: normalizedEmail,
        password: hashedPassword,
        role_id: role.id_role,
        otp_code: otpCode,
        otp_expires_at: expiresAt,
      },
    });

    await tx.donatur.create({
      data: {
        id_user: user.id_user,
        nama_donatur: input.nama_donatur,
        email: normalizedEmail,
        no_telepon: input.no_telepon,
        alamat: input.alamat,
        tipe_donatur: input.tipe_donatur,
        frekuensi_donasi: frekuensi,
      },
    });
  });

  return {
    success: true as const,
    otpCode,
    targetEmail: normalizedEmail,
  };
}

export async function verifyRegistrationOtp(email: string, inputOtp: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.users.findFirst({
    where: {
      email: normalizedEmail,
      username: { startsWith: "pending_" },
    },
    include: { roles: true },
  });

  if (!user || !user.otp_code || !user.otp_expires_at) {
    return {
      success: false as const,
      message: "Data verifikasi tidak ditemukan atau akun sudah aktif.",
    };
  }

  if (new Date() > user.otp_expires_at) {
    return {
      success: false as const,
      message:
        "Kode OTP sudah kedaluwarsa (melebihi 5 menit). Silakan kirim ulang kode.",
    };
  }

  if (user.otp_code !== inputOtp.trim()) {
    return {
      success: false as const,
      message: "Kode OTP yang Anda masukkan salah.",
    };
  }

  // Aktifkan akun dengan mengubah username ke email asli & mengosongkan OTP
  await prisma.users.update({
    where: { id_user: user.id_user },
    data: {
      username: normalizedEmail,
      otp_code: null,
      otp_expires_at: null,
    },
  });

  const roleName = (user.roles.nama_role || "Donatur Tidak Tetap") as RoleName;
  const redirectUrl = ROLE_DASHBOARD_MAP[roleName] || "/dashboard/donatur";

  return {
    success: true as const,
    message: "Verifikasi email berhasil! Mengalihkan ke dashboard...",
    id_user: user.id_user,
    redirectUrl,
  };
}

export async function regenerateRegistrationOtp(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.users.findFirst({
    where: {
      email: normalizedEmail,
      username: { startsWith: "pending_" },
    },
  });

  if (!user) {
    return {
      success: false as const,
      message: "Akun tidak ditemukan atau sudah terverifikasi.",
    };
  }

  const otpCode = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.users.update({
    where: { id_user: user.id_user },
    data: {
      otp_code: otpCode,
      otp_expires_at: expiresAt,
    },
  });

  return {
    success: true as const,
    otpCode,
    targetEmail: normalizedEmail,
  };
}

export async function requestPasswordResetOtp(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.users.findFirst({
    where: {
      email: normalizedEmail,
      NOT: { username: { startsWith: "pending_" } },
    },
    include: { roles: true },
  });

  if (!user) {
    return {
      success: false as const,
      message:
        "Email tidak ditemukan atau belum menyelesaikan verifikasi pendaftaran.",
    };
  }

  if (!DONATUR_ROLES.includes(user.roles.nama_role as RoleName)) {
    return {
      success: false as const,
      message:
        "Reset password mandiri hanya berlaku untuk akun Donatur. Hubungi Admin Panti untuk akun internal.",
    };
  }

  const otpCode = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Berlaku 5 menit

  await prisma.users.update({
    where: { id_user: user.id_user },
    data: {
      otp_code: otpCode,
      otp_expires_at: expiresAt,
    },
  });

  return {
    success: true as const,
    otpCode,
    targetEmail: normalizedEmail,
  };
}

export async function resetPasswordWithOtp(
  email: string,
  inputOtp: string,
  newPassword: string,
) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.users.findFirst({
    where: {
      email: normalizedEmail,
      NOT: { username: { startsWith: "pending_" } },
    },
    include: { roles: true },
  });

  if (!user || !user.otp_code || !user.otp_expires_at) {
    return {
      success: false as const,
      message:
        "Permintaan reset password tidak ditemukan. Silakan minta kode OTP baru.",
    };
  }

  if (!DONATUR_ROLES.includes(user.roles.nama_role as RoleName)) {
    return {
      success: false as const,
      message: "Akses ditolak untuk akun non-donatur.",
    };
  }

  if (new Date() > user.otp_expires_at) {
    return {
      success: false as const,
      message:
        "Kode OTP sudah kedaluwarsa (melebihi 5 menit). Silakan kirim ulang kode.",
    };
  }

  if (user.otp_code !== inputOtp.trim()) {
    return {
      success: false as const,
      message: "Kode OTP yang Anda masukkan salah.",
    };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.users.update({
    where: { id_user: user.id_user },
    data: {
      password: hashedPassword,
      otp_code: null,
      otp_expires_at: null,
    },
  });

  return {
    success: true as const,
    message:
      "Password berhasil diperbarui! Silakan masuk menggunakan password baru Anda.",
  };
}

export async function syncGoogleDonaturUser(params: {
  email: string;
  name: string;
  googleId: string;
}) {
  const normalizedEmail = params.email.trim().toLowerCase();

  const existingUser = await prisma.users.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { google_id: params.googleId }],
    },
    include: { roles: true },
  });

  if (existingUser) {
    if (!DONATUR_ROLES.includes(existingUser.roles.nama_role as RoleName)) {
      return null;
    }

    await prisma.users.update({
      where: { id_user: existingUser.id_user },
      data: {
        username: existingUser.username.startsWith("pending_")
          ? normalizedEmail
          : existingUser.username,
        google_id: params.googleId,
        otp_code: null,
        otp_expires_at: null,
      },
    });

    return existingUser;
  }

  const roleTidakTetap = await prisma.roles.findUnique({
    where: { nama_role: "Donatur Tidak Tetap" },
  });

  if (!roleTidakTetap) return null;

  return prisma.$transaction(async (tx) => {
    const createdUser = await tx.users.create({
      data: {
        username: normalizedEmail,
        email: normalizedEmail,
        google_id: params.googleId,
        role_id: roleTidakTetap.id_role,
      },
      include: { roles: true },
    });

    await tx.donatur.create({
      data: {
        id_user: createdUser.id_user,
        nama_donatur: params.name || "Donatur Google",
        email: normalizedEmail,
        tipe_donatur: "tidak_tetap",
        frekuensi_donasi: "insidental",
      },
    });

    return createdUser;
  });
}
