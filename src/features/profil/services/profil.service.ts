import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { RoleName } from "@/features/auth/types/auth.types";
import {
  ChangePasswordInput,
  UpdateProfilInput,
} from "../schemas/profil.schema";
import { UserProfilData } from "../types/profil.types";

const DEFAULT_SYSTEM_PASSWORD = "asuwain123";

function formatDateIndo(dateVal: Date | string): string {
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function getUserProfilById(
  id_user: number,
): Promise<UserProfilData | null> {
  const user = await prisma.users.findUnique({
    where: { id_user },
    include: {
      roles: { select: { nama_role: true } },
      pengurus: true,
      anak_panti: true,
      donatur: true,
    },
  });

  if (!user) return null;

  const isDefaultPassword = user.password
    ? await bcrypt.compare(DEFAULT_SYSTEM_PASSWORD, user.password)
    : false;

  const roleName = user.roles.nama_role as RoleName;
  const isDonaturRole =
    roleName === "Donatur Tetap" || roleName === "Donatur Tidak Tetap";

  return {
    id_user: user.id_user,
    username: user.username,
    email: user.email,
    role: roleName,
    has_password: Boolean(user.password),
    has_google: Boolean(user.google_id),
    is_default_password: isDefaultPassword,
    created_at: formatDateIndo(user.created_at),
    pengurus: user.pengurus
      ? {
          id_pengurus: user.pengurus.id_pengurus,
          nama_pengurus: user.pengurus.nama_pengurus,
          jabatan: user.pengurus.jabatan,
          no_telepon: user.pengurus.no_telepon,
          alamat: user.pengurus.alamat,
        }
      : null,
    anak_panti: user.anak_panti
      ? {
          id_anak: user.anak_panti.id_anak,
          nama_anak: user.anak_panti.nama_anak,
          nik: user.anak_panti.nik,
          tempat_lahir: user.anak_panti.tempat_lahir,
          tanggal_lahir: formatDateIndo(user.anak_panti.tanggal_lahir),
          jenis_kelamin: String(user.anak_panti.jenis_kelamin),
          status_anak: String(user.anak_panti.status_anak),
          tanggal_masuk: formatDateIndo(user.anak_panti.tanggal_masuk),
          foto: user.anak_panti.foto,
        }
      : null,
    donatur:
      user.donatur || isDonaturRole
        ? {
            id_donatur: user.donatur?.id_donatur ?? null,
            nama_donatur: user.donatur?.nama_donatur ?? user.username,
            email: user.donatur?.email ?? user.email,
            no_telepon: user.donatur?.no_telepon ?? null,
            alamat: user.donatur?.alamat ?? null,
            tipe_donatur:
              user.donatur?.tipe_donatur ??
              (roleName === "Donatur Tetap" ? "tetap" : "tidak_tetap"),
            frekuensi_donasi: user.donatur?.frekuensi_donasi ?? null,
          }
        : null,
  };
}

export async function updateOwnProfil(
  id_user: number,
  role: RoleName,
  input: UpdateProfilInput,
) {
  const existingUser = await prisma.users.findUnique({
    where: { id_user },
    include: { pengurus: true, donatur: true },
  });

  if (!existingUser) {
    throw new Error("Data akun tidak ditemukan.");
  }

  const normalizedEmail =
    input.email.trim() === "" ? null : input.email.trim().toLowerCase();

  if (normalizedEmail) {
    const emailTaken = await prisma.users.findFirst({
      where: {
        email: normalizedEmail,
        NOT: { id_user },
      },
      select: { id_user: true },
    });

    if (emailTaken) {
      throw new Error(
        `Email "${normalizedEmail}" sudah digunakan oleh akun lain.`,
      );
    }
  }

  let nextUsername = existingUser.username;
  if (role === "Admin" && input.username && input.username.trim() !== "") {
    const candidate = input.username.trim().toLowerCase();
    const usernameTaken = await prisma.users.findFirst({
      where: {
        username: candidate,
        NOT: { id_user },
      },
      select: { id_user: true },
    });
    if (usernameTaken) {
      throw new Error(`Username "${candidate}" sudah digunakan.`);
    }
    nextUsername = candidate;
  }

  // Validasi khusus Pengurus Panti
  if (role === "Pengurus Panti" && existingUser.pengurus) {
    if (!input.nama_pengurus || input.nama_pengurus.trim().length < 3) {
      throw new Error("Nama lengkap pengurus minimal 3 karakter.");
    }
    if (
      !input.no_telepon_pengurus ||
      input.no_telepon_pengurus.trim().length < 8
    ) {
      throw new Error("Nomor telepon pengurus minimal 8 digit.");
    }
    if (!input.alamat_pengurus || input.alamat_pengurus.trim().length < 5) {
      throw new Error("Alamat lengkap pengurus wajib diisi.");
    }
  }

  // Validasi khusus Donatur
  const isDonaturRole =
    role === "Donatur Tetap" || role === "Donatur Tidak Tetap";
  if (isDonaturRole) {
    if (!input.nama_donatur || input.nama_donatur.trim().length < 3) {
      throw new Error("Nama lengkap donatur minimal 3 karakter.");
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.users.update({
      where: { id_user },
      data: {
        username: nextUsername,
        email: normalizedEmail,
      },
    });

    if (role === "Pengurus Panti" && existingUser.pengurus) {
      await tx.pengurus.update({
        where: { id_pengurus: existingUser.pengurus.id_pengurus },
        data: {
          nama_pengurus: input.nama_pengurus!.trim(),
          no_telepon: input.no_telepon_pengurus!.trim(),
          alamat: input.alamat_pengurus!.trim(),
        },
      });
    }

    if (isDonaturRole) {
      const donaturPayload = {
        nama_donatur: input.nama_donatur!.trim(),
        email: normalizedEmail,
        no_telepon:
          input.no_telepon_donatur && input.no_telepon_donatur.trim() !== ""
            ? input.no_telepon_donatur.trim()
            : null,
        alamat:
          input.alamat_donatur && input.alamat_donatur.trim() !== ""
            ? input.alamat_donatur.trim()
            : null,
        frekuensi_donasi:
          input.frekuensi_donasi && input.frekuensi_donasi.trim() !== ""
            ? input.frekuensi_donasi.trim()
            : null,
      };

      if (existingUser.donatur) {
        await tx.donatur.update({
          where: { id_donatur: existingUser.donatur.id_donatur },
          data: donaturPayload,
        });
      } else {
        await tx.donatur.create({
          data: {
            id_user,
            tipe_donatur: role === "Donatur Tetap" ? "tetap" : "tidak_tetap",
            ...donaturPayload,
          },
        });
      }
    }
  });
}

export async function changeOwnPassword(
  id_user: number,
  input: ChangePasswordInput,
) {
  const user = await prisma.users.findUnique({
    where: { id_user },
    select: { id_user: true, password: true },
  });

  if (!user) {
    throw new Error("Data akun tidak ditemukan.");
  }

  // Jika akun sudah memiliki password, wajib verifikasi password lama
  if (user.password) {
    if (!input.current_password || input.current_password.trim() === "") {
      throw new Error("Password saat ini wajib diisi.");
    }

    const isMatch = await bcrypt.compare(input.current_password, user.password);
    if (!isMatch) {
      throw new Error("Password saat ini yang Anda masukkan salah.");
    }

    if (input.current_password === input.new_password) {
      throw new Error(
        "Password baru tidak boleh sama dengan password saat ini.",
      );
    }
  }

  const hashedNewPassword = await bcrypt.hash(input.new_password, 10);

  await prisma.users.update({
    where: { id_user },
    data: { password: hashedNewPassword },
  });
}
