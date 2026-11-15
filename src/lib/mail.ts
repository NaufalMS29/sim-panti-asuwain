import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

export async function sendOtpEmail(toEmail: string, otpCode: string) {
  await transporter.sendMail({
    from: `"Panti Asuhan Asuwain Timor" <$process.env.SMTP_EMAIL>`,
    to: toEmail,
    subject: "Kode Verifikasi Login (OTP) - Panti Asuhan Asuwain Timor",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Kode Verifikasi Masuk (OTP)</h2>
        <p style="color: #374151; font-size: 14px; line-height: 1.5;">
          Gunakan kode 6 digit berikut untuk menyelesaikan proses masuk ke portal Donatur <strong>Panti Asuhan Asuwain Timor</strong>:
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
