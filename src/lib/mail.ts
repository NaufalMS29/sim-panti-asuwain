import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

const SENDER_NAME = "Panti Asuhan Asuwain Timor";

export async function sendOtpEmail(toEmail: string, otpCode: string) {
  await transporter.sendMail({
    from: `"${SENDER_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: toEmail,
    subject: `Kode Verifikasi Login (OTP) - ${SENDER_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Kode Verifikasi Masuk (OTP)</h2>
        <p style="color: #374151; font-size: 14px; line-height: 1.5;">
          Gunakan kode 6 digit berikut untuk menyelesaikan proses masuk ke portal Donatur <strong>${SENDER_NAME}</strong>:
        </p>
        <div style="margin: 24px 0; padding: 16px; background-color: #f3f4f6; text-align: center; border-radius: 8px; font-size: 30px; font-weight: bold; letter-spacing: 8px; color: #111827;">
          ${otpCode}
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">
          Kode ini berlaku selama <strong>5 menit</strong> dan hanya dapat digunakan satu kali. Abaikan email ini jika Anda tidak merasa meminta kode verifikasi.
        </p>
      </div>
    `,
  });
}

export interface VisitEmailPayload {
  kode_tiket: string;
  nama_pengunjung: string;
  email_pengunjung: string;
  no_telepon: string;
  instansi_organisasi?: string | null;
  tujuan_kunjungan: string;
  tanggal_rencana: string; // YYYY-MM-DD
  jam_rencana: string; // HH:mm
  jumlah_rombongan: number;
  catatan_pengurus?: string | null;
}

function formatTanggalIndonesia(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month || 1) - 1, day || 1));
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

// 1. Email Bukti Pengajuan ke Pengunjung
export async function sendVisitSubmittedToVisitorEmail(
  data: VisitEmailPayload,
) {
  const tanggalFormatted = formatTanggalIndonesia(data.tanggal_rencana);
  const cekStatusUrl = `${getBaseUrl()}/kunjungan?tiket=${encodeURIComponent(data.kode_tiket)}`;

  await transporter.sendMail({
    from: `"${SENDER_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: data.email_pengunjung,
    subject: `[Pengajuan Diterima] Tiket Kunjungan #${data.kode_tiket} - ${SENDER_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #0f766e; color: #ffffff; padding: 20px 24px;">
          <h2 style="margin: 0; font-size: 18px;">Pengajuan Jadwal Kunjungan Diterima</h2>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">${SENDER_NAME} • Menunggu Verifikasi Pengurus</p>
        </div>
        <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
          <p>Halo <strong>${data.nama_pengunjung}</strong>,</p>
          <p>Terima kasih telah mengajukan permohonan kunjungan ke <strong>${SENDER_NAME}</strong>. Data Anda telah masuk ke dalam antrian verifikasi kami dengan rincian berikut:</p>
          
          <div style="background-color: #f8fafc; border: 1px dashed #94a3b8; border-radius: 8px; padding: 14px; text-align: center; margin: 16px 0;">
            <span style="font-size: 12px; color: #64748b; display: block;">KODE TIKET KUNJUNGAN</span>
            <strong style="font-size: 22px; letter-spacing: 2px; color: #0f766e;">${data.kode_tiket}</strong>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Tanggal Rencana</td><td style="padding: 6px 0;"><strong>${tanggalFormatted}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Jam Kedatangan</td><td style="padding: 6px 0;"><strong>${data.jam_rencana} WIB</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Jumlah Rombongan</td><td style="padding: 6px 0;">${data.jumlah_rombongan} orang</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Instansi / Asal</td><td style="padding: 6px 0;">${data.instansi_organisasi || "Perorangan / Keluarga"}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Tujuan Kunjungan</td><td style="padding: 6px 0;">${data.tujuan_kunjungan}</td></tr>
          </table>

          <p style="font-size: 13px; color: #475569;">Anda akan menerima email pemberitahuan kembali setelah pengurus menyetujui atau memberikan catatan pada jadwal Anda. Pantau status secara mandiri melalui tombol berikut:</p>
          
          <div style="text-align: center; margin: 24px 0 8px;">
            <a href="${cekStatusUrl}" style="background-color: #0f766e; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">Cek Status Kunjungan</a>
          </div>
        </div>
      </div>
    `,
  });
}

// 2. Email Notifikasi Pengajuan Baru ke Pihak Panti
export async function sendVisitSubmittedToPantiEmail(
  targetPantiEmail: string,
  data: VisitEmailPayload,
) {
  const tanggalFormatted = formatTanggalIndonesia(data.tanggal_rencana);
  const dashboardUrl = `${getBaseUrl()}/dashboard/jadwal-kunjungan`;

  await transporter.sendMail({
    from: `"${SENDER_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: targetPantiEmail,
    subject: `[Kunjungan Baru] Tiket #${data.kode_tiket} — ${data.nama_pengunjung}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #1e293b; color: #ffffff; padding: 20px 24px;">
          <h2 style="margin: 0; font-size: 18px;">Pengajuan Kunjungan Tamu Baru</h2>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">${SENDER_NAME} • Tiket #${data.kode_tiket}</p>
        </div>
        <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
          <p>Halo Pengurus Panti, terdapat pengajuan jadwal kunjungan baru yang perlu diverifikasi:</p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; background-color: #f8fafc; border-radius: 8px;">
            <tr><td style="padding: 8px 12px; color: #64748b; width: 38%;">Nama Pengunjung</td><td style="padding: 8px 12px;"><strong>${data.nama_pengunjung}</strong></td></tr>
            <tr><td style="padding: 8px 12px; color: #64748b;">Email Pengunjung</td><td style="padding: 8px 12px;">${data.email_pengunjung}</td></tr>
            <tr><td style="padding: 8px 12px; color: #64748b;">No. Telepon / WA</td><td style="padding: 8px 12px;">${data.no_telepon}</td></tr>
            <tr><td style="padding: 8px 12px; color: #64748b;">Instansi / Organisasi</td><td style="padding: 8px 12px;">${data.instansi_organisasi || "Perorangan"}</td></tr>
            <tr><td style="padding: 8px 12px; color: #64748b;">Rencana Kedatangan</td><td style="padding: 8px 12px;"><strong>${tanggalFormatted} • ${data.jam_rencana} WIB</strong></td></tr>
            <tr><td style="padding: 8px 12px; color: #64748b;">Jumlah Rombongan</td><td style="padding: 8px 12px;">${data.jumlah_rombongan} orang</td></tr>
            <tr><td style="padding: 8px 12px; color: #64748b;">Tujuan Kunjungan</td><td style="padding: 8px 12px;">${data.tujuan_kunjungan}</td></tr>
          </table>

          <div style="text-align: center; margin: 24px 0 8px;">
            <a href="${dashboardUrl}" style="background-color: #0f766e; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">Verifikasi Jadwal di Dashboard</a>
          </div>
        </div>
      </div>
    `,
  });
}

// 3. Email Hasil Keputusan (Disetujui / Ditolak) ke Pengunjung
export async function sendVisitDecisionToVisitorEmail(
  data: VisitEmailPayload & { status: "disetujui" | "ditolak" },
) {
  const isApproved = data.status === "disetujui";
  const tanggalFormatted = formatTanggalIndonesia(data.tanggal_rencana);
  const cekStatusUrl = `${getBaseUrl()}/kunjungan?tiket=${encodeURIComponent(data.kode_tiket)}`;

  const headerBg = isApproved ? "#047857" : "#b91c1c";
  const titleText = isApproved
    ? "E-Tiket Kunjungan Disetujui"
    : "Pemberitahuan Jadwal Kunjungan";
  const statusBadge = isApproved ? "DISETUJUI" : "TIDAK DAPAT DISETUJUI";

  await transporter.sendMail({
    from: `"${SENDER_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: data.email_pengunjung,
    subject: `[${statusBadge}] Tiket Kunjungan #${data.kode_tiket} - ${SENDER_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: ${headerBg}; color: #ffffff; padding: 20px 24px;">
          <h2 style="margin: 0; font-size: 18px;">${titleText}</h2>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">${SENDER_NAME} • Status: <strong>${statusBadge}</strong></p>
        </div>
        <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
          <p>Halo <strong>${data.nama_pengunjung}</strong>,</p>
          <p>${
            isApproved
              ? `Permohonan jadwal kunjungan Anda ke <strong>${SENDER_NAME}</strong> telah <strong>disetujui</strong> oleh pengurus panti. Silakan tunjukkan kode tiket di bawah ini kepada petugas saat tiba di lokasi.`
              : `Mohon maaf, permohonan jadwal kunjungan Anda ke <strong>${SENDER_NAME}</strong> belum dapat kami setujui pada waktu yang diajukan.`
          }</p>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; text-align: center; margin: 16px 0;">
            <span style="font-size: 12px; color: #64748b; display: block;">KODE TIKET</span>
            <strong style="font-size: 22px; letter-spacing: 2px; color: ${headerBg};">${data.kode_tiket}</strong>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Tanggal Kunjungan</td><td style="padding: 6px 0;"><strong>${tanggalFormatted}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Jam Kedatangan</td><td style="padding: 6px 0;"><strong>${data.jam_rencana} WIB</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Jumlah Rombongan</td><td style="padding: 6px 0;">${data.jumlah_rombongan} orang</td></tr>
          </table>

          ${
            data.catatan_pengurus
              ? `<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 14px; margin: 16px 0; font-size: 14px;">
                  <strong style="display: block; margin-bottom: 4px; color: #92400e;">Catatan Pengurus Panti:</strong>
                  <span style="color: #78350f;">${data.catatan_pengurus}</span>
                </div>`
              : ""
          }

          <div style="text-align: center; margin: 24px 0 8px;">
            <a href="${cekStatusUrl}" style="background-color: #1e293b; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">Lihat E-Tiket di Website</a>
          </div>
        </div>
      </div>
    `,
  });
}
