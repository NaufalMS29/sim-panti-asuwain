"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { loginWithCredentialsAction } from "../actions/auth.actions";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface LoginFormProps {
  oauthError?: string;
}

export function LoginForm({ oauthError }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isJustVerified = searchParams.get("verified") === "1";
  const isJustReset = searchParams.get("reset") === "1";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    oauthError === "AccessDenied"
      ? "Email Google tersebut terdaftar sebagai akun internal panti. Gunakan Username & Password."
      : null,
  );

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await loginWithCredentialsAction(identifier, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    router.push(res.redirectUrl || "/dashboard/donatur");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Masuk ke Sistem</h1>
        <p className="text-sm text-gray-500">Panti Asuhan Asuwain Timor</p>
      </div>

      {isJustVerified && !errorMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
          Verifikasi OTP berhasil! Silakan masuk menggunakan email dan password
          Anda.
        </div>
      )}

      {isJustReset && !errorMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
          Password berhasil diperbarui! Silakan masuk menggunakan password baru
          Anda.
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Username atau Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="nama@gmail.com"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-700 hover:underline font-medium"
            >
              Lupa password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Masuk
        </button>
      </form>

      <div className="relative flex py-1 items-center">
        <div className="grow border-t border-gray-200" />
        <span className="shrink mx-3 text-xs text-gray-400">
          atau khusus Donatur
        </span>
        <div className="grow border-t border-gray-200" />
      </div>

      <GoogleSignInButton />

      <p className="text-center text-xs text-gray-600">
        Belum memiliki akun donatur?{" "}
        <Link
          href="/register"
          className="text-blue-700 font-semibold hover:underline"
        >
          Daftar sebagai Donatur
        </Link>
      </p>
    </div>
  );
}
