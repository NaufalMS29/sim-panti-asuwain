import { headers } from "next/headers";

interface RateRecord {
  count: number;
  resetAt: number;
}

const ipRateStore = new Map<string, RateRecord>();
const WINDOW_MS = 15 * 60 * 1000; // 15 menit
const MAX_REQUESTS_PER_IP = 3; // Maksimal 3 pengajuan per 15 menit per IP

export async function checkPublicSubmissionSecurity(params: {
  honeypot?: string;
  formStartedAt?: number;
}): Promise<{ allowed: boolean; reason?: string }> {
  // 1. Cek Honeypot (bot otomatis biasanya mengisi semua input tersembunyi)
  if (params.honeypot && params.honeypot.trim().length > 0) {
    return {
      allowed: false,
      reason: "Permintaan ditolak oleh filter keamanan.",
    };
  }

  // 2. Cek Kecepatan Pengisian Form (< 3 detik dianggap skrip otomatis)
  if (params.formStartedAt && params.formStartedAt > 0) {
    const elapsedMs = Date.now() - params.formStartedAt;
    if (elapsedMs < 3000) {
      return {
        allowed: false,
        reason:
          "Pengisian formulir terlalu cepat. Silakan periksa kembali data Anda sebelum mengirim.",
      };
    }
  }

  // 3. Rate Limiting Berbasis IP Address
  const reqHeaders = await headers();
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  const realIp = reqHeaders.get("x-real-ip");
  const clientIp =
    forwardedFor?.split(",")[0]?.trim() || realIp || "unknown-local-ip";

  const now = Date.now();

  // Pembersihan memori berkala agar Map tidak membengkak
  if (ipRateStore.size > 5000) {
    for (const [key, entry] of ipRateStore.entries()) {
      if (now > entry.resetAt) ipRateStore.delete(key);
    }
  }

  const current = ipRateStore.get(clientIp);
  if (!current || now > current.resetAt) {
    ipRateStore.set(clientIp, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return { allowed: true };
  }

  if (current.count >= MAX_REQUESTS_PER_IP) {
    const remainingMinutes = Math.ceil((current.resetAt - now) / 60000);
    return {
      allowed: false,
      reason: `Terlalu banyak percobaan pengajuan dari jaringan Anda. Silakan coba kembali dalam ${remainingMinutes} menit.`,
    };
  }

  current.count += 1;
  ipRateStore.set(clientIp, current);
  return { allowed: true };
}
