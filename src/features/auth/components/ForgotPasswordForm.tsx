"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  ArrowLeft,
} from "lucide-react";
import {
  requestForgotPasswordAction,
  resetPasswordAction,
} from "../actions/auth.actions";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const isPasswordMismatch =
    confirmNewPassword.length > 0 && newPassword !== confirmNewPassword;

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const res = await requestForgotPasswordAction(email);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setStep("reset");
    setCooldown(60);
    setInfoMsg(res.message);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordMismatch) {
      setErrorMsg("Konfirmasi password baru tidak cocok.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await resetPasswordAction({
      email,
      otp,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword,
    });
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    router.push("/login?reset=1");
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const res = await requestForgotPasswordAction(email);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setCooldown(60);
    setInfoMsg(res.message);
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">
          {step === "request" ? "Lupa Password" : "Buat Password Baru"}
        </h1>
        <p className="text-sm text-gray-500">
          {step === "request"
            ? "Masukkan email akun Donatur Anda untuk menerima kode OTP pemulihan"
            : `Masukkan kode OTP dari ${email} dan sandi baru Anda`}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          {errorMsg}
        </div>
      )}

      {infoMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
          {infoMsg}
        </div>
      )}

      {step === "request" && (
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Akun Donatur
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Kirim Kode OTP Pemulihan
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div className="flex flex-col items-center justify-center p-3.5 bg-blue-50 rounded-xl text-blue-800 text-xs text-center gap-1">
            <MailCheck className="w-5 h-5 text-blue-700" />
            <span>
              Periksa Inbox atau folder Spam pada <strong>{email}</strong>{" "}
              (berlaku 5 menit).
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Kode OTP (6 Digit Angka)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-base !text-gray-900 bg-white placeholder:text-gray-400 tracking-[0.4em] font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password Baru
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showNewPassword ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={
                  showNewPassword ? "Sembunyikan password" : "Lihat password"
                }
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-800 cursor-pointer z-10"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showConfirmNewPassword ? "text" : "password"}
                required
                minLength={6}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                  isPasswordMismatch
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                aria-label={
                  showConfirmNewPassword
                    ? "Sembunyikan konfirmasi password"
                    : "Lihat konfirmasi password"
                }
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-800 cursor-pointer z-10"
              >
                {showConfirmNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {isPasswordMismatch && (
              <p className="text-xs text-red-600 mt-1">
                Konfirmasi password baru belum sama.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || isPasswordMismatch}
            className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Simpan Password Baru
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => {
                setStep("request");
                setOtp("");
                setNewPassword("");
                setConfirmNewPassword("");
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className="text-gray-500 hover:text-gray-800 underline cursor-pointer"
            >
              Ganti email
            </button>

            <button
              type="button"
              disabled={loading || cooldown > 0}
              onClick={handleResendOtp}
              className="text-blue-700 font-semibold hover:underline disabled:text-gray-400 cursor-pointer"
            >
              {cooldown > 0
                ? `Kirim ulang (${cooldown}d)`
                : "Kirim ulang kode OTP"}
            </button>
          </div>
        </form>
      )}

      <div className="text-center pt-1">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke halaman Login
        </Link>
      </div>
    </div>
  );
}
