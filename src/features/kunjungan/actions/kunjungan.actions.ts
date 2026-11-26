"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import { checkPublicSubmissionSecurity } from "../lib/kunjungan-security";
import { can } from "@/lib/rbac";
import {
  sendVisitDecisionToVisitorEmail,
  sendVisitSubmittedToPantiEmail,
  sendVisitSubmittedToVisitorEmail,
} from "@/lib/mail";
import {
  cekTiketSchema,
  createKunjunganSchema,
  CreateKunjunganInput,
  verifyKunjunganSchema,
  VerifyKunjunganInput,
} from "../schemas/kunjungan.schema";
import {
  createJadwalKunjungan,
  getJadwalByKodeTiket,
  resolvePantiNotificationEmail,
  verifyJadwalKunjungan,
} from "../services/kunjungan.service";
import {
  JadwalKunjunganDTO,
  KunjunganActionResponse,
} from "../types/kunjungan.types";

export async function submitKunjunganPublicAction(
  rawInput: CreateKunjunganInput,
): Promise<KunjunganActionResponse<JadwalKunjunganDTO>> {
  // 1. Validasi payload ketat di pintu masuk
  const parsed = createKunjunganSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ||
        "Mohon periksa kembali isian formulir kunjungan.",
    };
  }

  // 2. Cek keamanan anti-bot & rate limit IP
  const securityCheck = await checkPublicSubmissionSecurity({
    honeypot: parsed.data.website_url,
    formStartedAt: parsed.data.form_started_at,
  });

  if (!securityCheck.allowed) {
    return {
      success: false,
      message:
        securityCheck.reason || "Permintaan ditolak oleh sistem keamanan.",
    };
  }

  // 3. Simpan ke database
  const result = await createJadwalKunjungan(parsed.data);
  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  // 4. Kirim notifikasi Email ke Pengunjung & Pengurus Panti (non-blocking)
  const pantiEmail = await resolvePantiNotificationEmail();

  await Promise.allSettled([
    sendVisitSubmittedToVisitorEmail(result.data),
    pantiEmail
      ? sendVisitSubmittedToPantiEmail(pantiEmail, result.data)
      : Promise.resolve(),
  ]);

  revalidatePath("/dashboard/pengurus/kunjungan");
  revalidatePath("/dashboard/admin/kunjungan");

  return {
    success: true,
    message:
      "Pengajuan jadwal kunjungan berhasil dikirim! Bukti kode tiket telah dikirim ke email Anda.",
    data: result.data,
  };
}

export async function cekStatusKunjunganAction(
  kodeTiket: string,
): Promise<KunjunganActionResponse<JadwalKunjunganDTO>> {
  const parsed = cekTiketSchema.safeParse({ kode_tiket: kodeTiket });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Kode tiket tidak valid.",
    };
  }

  const ticket = await getJadwalByKodeTiket(parsed.data.kode_tiket);
  if (!ticket) {
    return {
      success: false,
      message: `Tiket dengan kode "${parsed.data.kode_tiket}" tidak ditemukan. Pastikan penulisan kode sudah benar.`,
    };
  }

  return {
    success: true,
    message: "Data tiket ditemukan.",
    data: ticket,
  };
}

export async function verifyKunjunganAction(
  rawInput: VerifyKunjunganInput,
): Promise<KunjunganActionResponse<JadwalKunjunganDTO>> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "kunjungan:manage")) {
    return {
      success: false,
      message: "Anda tidak memiliki hak akses untuk memverifikasi kunjungan.",
    };
  }

  const parsed = verifyKunjunganSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message || "Input verifikasi tidak valid.",
    };
  }

  const result = await verifyJadwalKunjungan({
    id_kunjungan: parsed.data.id_kunjungan,
    status_kunjungan: parsed.data.status_kunjungan,
    catatan_pengurus: parsed.data.catatan_pengurus,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  // Kirim email hasil keputusan (Disetujui / Ditolak) ke pengunjung
  try {
    await sendVisitDecisionToVisitorEmail({
      ...result.data,
      status: parsed.data.status_kunjungan,
    });
  } catch {
    // Tetap kembalikan sukses karena status di database sudah terbarui
  }

  revalidatePath("/dashboard/pengurus/kunjungan");
  revalidatePath("/dashboard/admin/kunjungan");
  revalidatePath("/kunjungan");

  return {
    success: true,
    message:
      parsed.data.status_kunjungan === "disetujui"
        ? `Jadwal kunjungan #${result.data.kode_tiket} berhasil disetujui dan e-tiket telah dikirim ke email pengunjung.`
        : `Pengajuan kunjungan #${result.data.kode_tiket} telah ditolak dan pemberitahuan dikirim ke email pengunjung.`,
    data: result.data,
  };
}
