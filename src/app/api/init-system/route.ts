import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const INITIAL_ROLES = [
  "Admin",
  "Pengurus Panti",
  "Anak Panti",
  "Donatur Tetap",
  "Donatur Tidak Tetap",
] as const;

export async function GET() {
  try {
    // 1. Seed 5 Role Utama
    const roleMap: Record<string, number> = {};
    for (const roleName of INITIAL_ROLES) {
      const role = await prisma.roles.upsert({
        where: { nama_role: roleName },
        update: {},
        create: { nama_role: roleName },
      });
      roleMap[roleName] = role.id_role;
    }

    const defaultPasswordHash = await bcrypt.hash("password123", 10);

    // 2. Seed Akun Admin Utama
    const adminUser = await prisma.users.upsert({
      where: { username: "admin_asuwain" },
      update: {
        role_id: roleMap["Admin"],
      },
      create: {
        username: "admin_asuwain",
        email: "admin@asuwain.or.id",
        password: defaultPasswordHash,
        role_id: roleMap["Admin"],
      },
    });

    // 3. Seed 1 Akun Donatur Tetap untuk Testing RBAC & Dashboard Donatur
    const donaturEmail = "donatur.test@gmail.com";
    const donaturUser = await prisma.users.upsert({
      where: { username: donaturEmail },
      update: {
        role_id: roleMap["Donatur Tetap"],
        otp_code: null,
        otp_expires_at: null,
      },
      create: {
        username: donaturEmail,
        email: donaturEmail,
        password: defaultPasswordHash,
        role_id: roleMap["Donatur Tetap"],
      },
    });

    const existingDonaturProfile = await prisma.donatur.findFirst({
      where: { id_user: donaturUser.id_user },
    });

    if (!existingDonaturProfile) {
      await prisma.donatur.create({
        data: {
          id_user: donaturUser.id_user,
          nama_donatur: "Donatur Pengujian",
          email: donaturEmail,
          no_telepon: "081234567890",
          alamat: "Jl. Raya Cilodong, Depok",
          tipe_donatur: "tetap",
          frekuensi_donasi: "bulanan",
        },
      });
    }

    return NextResponse.json({
      status: "OK",
      message: "Seeder roles dan akun testing berhasil dijalankan.",
      data: {
        roles_seeded: Object.keys(roleMap),
        accounts: [
          {
            role: "Admin",
            username: adminUser.username,
            password: "password123",
          },
          {
            role: "Donatur Tetap",
            username: donaturUser.username,
            password: "password123",
          },
        ],
      },
    });
  } catch (error) {
    console.error("Seeder error:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Gagal menjalankan seeder. Pastikan koneksi MySQL aktif.",
      },
      { status: 500 },
    );
  }
}
