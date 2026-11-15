"use client";

import { useState } from "react";
import {
  UserCircle,
  Lock,
  Save,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { UserProfilData } from "../types/profil.types";
import {
  changeOwnPasswordAction,
  updateOwnProfilAction,
} from "../actions/profil.actions";

interface ProfilClientPageProps {
  profil: UserProfilData;
}

function formatStatusLabel(val: string): string {
  if (val === "L") return "Laki-laki";
  if (val === "P") return "Perempuan";
  return val.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ProfilClientPage({ profil }: ProfilClientPageProps) {
  const [savingProfil, setSavingProfil] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profilBanner, setProfilBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [passwordBanner, setPasswordBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [profilForm, setProfilForm] = useState({
    username: profil.username,
    email: profil.email || "",
    // Pengurus
    nama_pengurus: profil.pengurus?.nama_pengurus || "",
    no_telepon_pengurus: profil.pengurus?.no_telepon || "",
    alamat_pengurus: profil.pengurus?.alamat || "",
    // Donatur
    nama_donatur: profil.donatur?.nama_donatur || "",
    no_telepon_donatur: profil.donatur?.no_telepon || "",
    alamat_donatur: profil.donatur?.alamat || "",
    frekuensi_donasi: profil.donatur?.frekuensi_donasi || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const isDonatur =
    profil.role === "Donatur Tetap" || profil.role === "Donatur Tidak Tetap";

  const handleProfilSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfil(true);
    setProfilBanner(null);

    const res = await updateOwnProfilAction(profilForm);
    setSavingProfil(false);

    setProfilBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordBanner(null);

    const res = await changeOwnPasswordAction(passwordForm);
    setSavingPassword(false);

    if (!res.success) {
      setPasswordBanner({ type: "error", text: res.message });
      return;
    }

    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
    setPasswordBanner({ type: "success", text: res.message });
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600";

  const readOnlyClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm !text-gray-600 bg-gray-50 cursor-not-allowed";

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola informasi akun pribadi, kontak pemulihan, dan keamanan kata
          sandi Anda.
        </p>
      </div>

      {/* Peringatan jika masih memakai password bawaan asuwain123 */}
      {profil.is_default_password && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-sm text-amber-950">
              Anda Masih Menggunakan Password Bawaan Sistem
            </p>
            <p className="mt-0.5">
              Demi keamanan akun, segera ganti password bawaan (
              <code className="font-mono font-semibold">asuwain123</code>)
              dengan kata sandi pribadi Anda pada kolom{" "}
              <strong>Keamanan & Ganti Password</strong> di bawah.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Kartu Ringkasan Akun */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 h-fit shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <UserCircle className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate">
                {profil.pengurus?.nama_pengurus ||
                  profil.anak_panti?.nama_anak ||
                  profil.donatur?.nama_donatur ||
                  profil.username}
              </p>
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck className="w-3 h-3" />
                {profil.role}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3 text-xs">
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">Username</span>
              <span className="font-mono font-semibold text-gray-900">
                {profil.username}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">Email Terdaftar</span>
              <span className="font-medium text-gray-900 truncate max-w-[170px]">
                {profil.email || "Belum diatur"}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">Metode Login</span>
              <span className="font-medium text-gray-900">
                {[
                  profil.has_password ? "Password" : null,
                  profil.has_google ? "Google" : null,
                ]
                  .filter(Boolean)
                  .join(" + ")}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">Terdaftar Sejak</span>
              <span className="font-medium text-gray-900">
                {profil.created_at}
              </span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Biodata & Form Password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Informasi Akun & Biodata */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-2xs">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900">
                Informasi Akun & Biodata
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Email digunakan untuk menerima kode OTP saat lupa password.
              </p>
            </div>

            {profilBanner && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  profilBanner.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {profilBanner.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{profilBanner.text}</span>
              </div>
            )}

            <form onSubmit={handleProfilSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Username Login
                  </label>
                  {profil.role === "Admin" ? (
                    <input
                      type="text"
                      required
                      value={profilForm.username}
                      onChange={(e) =>
                        setProfilForm({
                          ...profilForm,
                          username: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  ) : (
                    <input
                      type="text"
                      readOnly
                      value={profil.username}
                      className={readOnlyClass}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={profilForm.email}
                    onChange={(e) =>
                      setProfilForm({ ...profilForm, email: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Form Khusus Pengurus Panti */}
              {profil.role === "Pengurus Panti" && profil.pengurus && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nama Lengkap Pengurus
                      </label>
                      <input
                        type="text"
                        required
                        value={profilForm.nama_pengurus}
                        onChange={(e) =>
                          setProfilForm({
                            ...profilForm,
                            nama_pengurus: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Jabatan (Ditetapkan Admin)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={profil.pengurus.jabatan}
                        className={readOnlyClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      value={profilForm.no_telepon_pengurus}
                      onChange={(e) =>
                        setProfilForm({
                          ...profilForm,
                          no_telepon_pengurus: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Alamat Lengkap
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={profilForm.alamat_pengurus}
                      onChange={(e) =>
                        setProfilForm({
                          ...profilForm,
                          alamat_pengurus: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {/* Data Read-Only Khusus Anak Panti */}
              {profil.role === "Anak Panti" && profil.anak_panti && (
                <div className="pt-2 border-t border-gray-100 space-y-4">
                  <p className="text-xs text-gray-500">
                    Biodata kependudukan di bawah dikelola oleh pengurus panti.
                    Hubungi pengurus jika terdapat kesalahan penulisan.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={profil.anak_panti.nama_anak}
                        className={readOnlyClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        NIK
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={profil.anak_panti.nik || "-"}
                        className={readOnlyClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Tempat, Tanggal Lahir
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`${profil.anak_panti.tempat_lahir}, ${profil.anak_panti.tanggal_lahir}`}
                        className={readOnlyClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Jenis Kelamin & Status
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`${formatStatusLabel(
                          profil.anak_panti.jenis_kelamin,
                        )} • ${formatStatusLabel(profil.anak_panti.status_anak)}`}
                        className={readOnlyClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Khusus Donatur */}
              {isDonatur && profil.donatur && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nama Lengkap / Instansi Donatur
                      </label>
                      <input
                        type="text"
                        required
                        value={profilForm.nama_donatur}
                        onChange={(e) =>
                          setProfilForm({
                            ...profilForm,
                            nama_donatur: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nomor Telepon / WhatsApp
                      </label>
                      <input
                        type="text"
                        placeholder="0812xxxxxxxx"
                        value={profilForm.no_telepon_donatur}
                        onChange={(e) =>
                          setProfilForm({
                            ...profilForm,
                            no_telepon_donatur: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Alamat Domisili
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Alamat lengkap Anda"
                      value={profilForm.alamat_donatur}
                      onChange={(e) =>
                        setProfilForm({
                          ...profilForm,
                          alamat_donatur: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfil}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
                >
                  {savingProfil ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Simpan Perubahan Profil
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Keamanan & Ganti Password */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-2xs">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Keamanan & Ganti Password
                </h2>
                <p className="text-xs text-gray-500">
                  {profil.has_password
                    ? "Gunakan kombinasi huruf dan angka minimal 6 karakter."
                    : "Akun Anda login via Google. Anda dapat menambahkan password cadangan di bawah ini."}
                </p>
              </div>
            </div>

            {passwordBanner && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  passwordBanner.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {passwordBanner.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{passwordBanner.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {profil.has_password && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      required
                      placeholder="Masukkan password saat ini"
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          current_password: e.target.value,
                        })
                      }
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      {showCurrentPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Minimal 6 karakter"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password: e.target.value,
                        })
                      }
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      {showNewPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ulangi Password Baru
                  </label>
                  <input
                    type={showNewPw ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Ketik ulang password baru"
                    value={passwordForm.confirm_password}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirm_password: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
                >
                  {savingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  Perbarui Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
