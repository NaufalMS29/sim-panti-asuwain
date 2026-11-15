"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Loader2, MailCheck, Eye, EyeOff, Lock } from "lucide-react";
import {
  registerDonaturAction,
  verifyRegisterOtpAction,
  resendRegisterOtpAction,
} from "../actions/auth.actions";
import { RegisterDonaturInput } from "../schemas/auth.schema";

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [form, setForm] = useState<RegisterDonaturInput>({
    nama_donatur: "",
    email: "",
    no_telepon: "",
    alamat: "",
    tipe_donatur: "tidak_tetap",
    frekuensi_donasi: "insidental",
    password: "",
    confirm_password: "",
  });

  const [otpCode, setOtpCode] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const isPasswordMismatch =
    form.confirm_password.length > 0 && form.password !== form.confirm_password;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordMismatch) {
      setErrorMsg("Konfirmasi password tidak cocok dengan password.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const res = await registerDonaturAction(form);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setStep("otp");
    setCooldown(60);
    setInfoMsg(res.message);
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await verifyRegisterOtpAction(form.email, otpCode);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    router.push("/login?verified=1");
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const res = await resendRegisterOtpAction(form.email);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setCooldown(60);
    setInfoMsg(res.message);
  };

  const inputBaseClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600";

  return (
    <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">
          {step === "form" ? "Registrasi Donatur" : "Verifikasi Email OTP"}
        </h1>
        <p className="text-sm text-gray-500">
          {step === "form"
            ? "Bergabung menjadi sahabat Panti Asuhan Asuwain Timor"
            : `Masukkan 6 digit kode yang dikirim ke ${form.email}`}
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

      {step === "form" && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nama Lengkap / Instansi
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={form.nama_donatur}
              onChange={(e) =>
                setForm({ ...form, nama_donatur: e.target.value })
              }
              className={inputBaseClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Aktif (Penerima OTP)
              </label>
              <input
                type="email"
                required
                placeholder="nama@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputBaseClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                No. Telepon / WhatsApp
              </label>
              <input
                type="text"
                required
                placeholder="081234567890"
                value={form.no_telepon}
                onChange={(e) =>
                  setForm({ ...form, no_telepon: e.target.value })
                }
                className={inputBaseClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Alamat Lengkap
            </label>
            <textarea
              rows={2}
              required
              placeholder="Masukkan alamat domisili lengkap"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className={inputBaseClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Komitmen Donatur
              </label>
              <select
                value={form.tipe_donatur}
                onChange={(e) => {
                  const tipe = e.target.value as "tetap" | "tidak_tetap";
                  setForm({
                    ...form,
                    tipe_donatur: tipe,
                    frekuensi_donasi:
                      tipe === "tidak_tetap" ? "insidental" : "bulanan",
                  });
                }}
                className={inputBaseClass}
              >
                <option value="tidak_tetap" className="text-gray-900 bg-white">
                  Donatur Tidak Tetap (Insidental)
                </option>
                <option value="tetap" className="text-gray-900 bg-white">
                  Donatur Tetap (Rutin)
                </option>
              </select>
            </div>

            {form.tipe_donatur === "tetap" && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Frekuensi Donasi Rutin
                </label>
                <select
                  value={form.frekuensi_donasi}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      frekuensi_donasi: e.target
                        .value as RegisterDonaturInput["frekuensi_donasi"],
                    })
                  }
                  className={inputBaseClass}
                >
                  <option value="bulanan" className="text-gray-900 bg-white">
                    Setiap Bulan
                  </option>
                  <option value="3_bulanan" className="text-gray-900 bg-white">
                    Setiap 3 Bulan
                  </option>
                  <option value="6_bulanan" className="text-gray-900 bg-white">
                    Setiap 6 Bulan
                  </option>
                  <option value="tahunan" className="text-gray-900 bg-white">
                    Setiap Tahun
                  </option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password Akun
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Lihat password"
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-800 cursor-pointer z-10"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Ulangi password"
                  value={form.confirm_password}
                  onChange={(e) =>
                    setForm({ ...form, confirm_password: e.target.value })
                  }
                  className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                    isPasswordMismatch
                      ? "border-red-400 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan konfirmasi password"
                      : "Lihat konfirmasi password"
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-800 cursor-pointer z-10"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {isPasswordMismatch && (
            <p className="text-xs text-red-600">
              Konfirmasi password belum sama dengan password di atas.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || isPasswordMismatch}
            className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Daftar & Kirim Kode OTP
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl text-blue-800 text-xs text-center gap-1.5">
            <MailCheck className="w-6 h-6 text-blue-700" />
            <span>
              Periksa kotak masuk (Inbox) atau folder Spam pada email{" "}
              <strong>{form.email}</strong>.
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
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-base !text-gray-900 bg-white placeholder:text-gray-400 tracking-[0.4em] font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Verifikasi & Aktifkan Akun
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setOtpCode("");
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className="text-gray-500 hover:text-gray-800 underline cursor-pointer"
            >
              Ganti alamat email
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

      <p className="text-center text-xs text-gray-600">
        Sudah punya akun aktif?{" "}
        <Link
          href="/login"
          className="text-blue-700 font-semibold hover:underline"
        >
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
