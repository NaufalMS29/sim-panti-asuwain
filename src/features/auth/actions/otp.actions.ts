// "use server";

// import { AuthError } from "next-auth";
// import { signIn } from "@/auth";
// import { sendOtpEmail } from "@/lib/mail";
// import { requestOtpSchema, verifyOtpSchema } from "../schemas/auth.schema";
// import { generateDonaturOtp } from "../services/auth.service";
// import { AuthActionResponse } from "../types/auth.types";

// export async function requestOtpAction(
//   email: string,
// ): Promise<AuthActionResponse> {
//   const parsed = requestOtpSchema.safeParse({ email });
//   if (!parsed.success) {
//     return {
//       success: false,
//       message: parsed.error.issues[0]?.message || "Email tidak valid.",
//     };
//   }

//   const otpResult = await generateDonaturOtp(parsed.data.email);
//   if (!otpResult.success) {
//     return {
//       success: false,
//       message: otpResult.message,
//     };
//   }

//   try {
//     await sendOtpEmail(otpResult.targetEmail, otpResult.otpCode);
//     return {
//       success: true,
//       message: `Kode OTP 6 digit telah dikirim ke ${otpResult.targetEmail}.`,
//     };
//   } catch {
//     return {
//       success: false,
//       message:
//         "Gagal mengirim email OTP. Periksa konfigurasi SMTP Gmail di .env.",
//     };
//   }
// }

// export async function verifyOtpLoginAction(
//   email: string,
//   otp: string,
// ): Promise<AuthActionResponse> {
//   const parsed = verifyOtpSchema.safeParse({ email, otp });
//   if (!parsed.success) {
//     return {
//       success: false,
//       message: parsed.error.issues[0]?.message || "Kode OTP tidak valid.",
//     };
//   }

//   try {
//     await signIn("otp", {
//       email: parsed.data.email,
//       otp: parsed.data.otp,
//       redirect: false,
//     });

//     return {
//       success: true,
//       message: "Verifikasi OTP berhasil.",
//       redirectUrl: "/dashboard/donatur",
//     };
//   } catch (error) {
//     if (error instanceof AuthError) {
//       return {
//         success: false,
//         message: "Kode OTP salah atau sudah kedaluwarsa (melebihi 5 menit).",
//       };
//     }
//     return {
//       success: false,
//       message: "Gagal memverifikasi sesi OTP.",
//     };
//   }
// }
