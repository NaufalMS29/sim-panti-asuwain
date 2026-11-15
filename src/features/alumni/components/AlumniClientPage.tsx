"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  GraduationCap,
  Briefcase,
  CalendarCheck,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
} from "lucide-react";
import { AlumniListItem, EligibleAnakOption } from "../types/alumni.types";
import {
  createAlumniAction,
  deleteAlumniAction,
  updateAlumniAction,
} from "../actions/alumni.actions";

interface AlumniClientPageProps {
  initialAlumni: AlumniListItem[];
  eligibleAnak: EligibleAnakOption[];
  canManage: boolean;
}

function formatStatusSosial(val: string): string {
  return val.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AlumniClientPage({
  initialAlumni,
  eligibleAnak,
  canManage,
}: AlumniClientPageProps) {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("semua");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AlumniListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({
    id_anak: eligibleAnak[0]?.id_anak ?? 0,
    tahun_lulus: currentYear,
    pekerjaan_sekarang: "",
    alamat_sekarang: "",
    kontak: "",
  });

  const availableYears = Array.from(
    new Set(initialAlumni.map((item) => item.tahun_lulus)),
  ).sort((a, b) => b - a);

  const filteredAlumni = initialAlumni.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.nama_anak.toLowerCase().includes(q) ||
      (item.nik || "").toLowerCase().includes(q) ||
      (item.pekerjaan_sekarang || "").toLowerCase().includes(q) ||
      (item.alamat_sekarang || "").toLowerCase().includes(q);
    const matchYear =
      yearFilter === "semua" || String(item.tahun_lulus) === yearFilter;
    return matchSearch && matchYear;
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      id_anak: eligibleAnak[0]?.id_anak ?? 0,
      tahun_lulus: currentYear,
      pekerjaan_sekarang: "",
      alamat_sekarang: "",
      kontak: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (item: AlumniListItem) => {
    setEditingItem(item);
    setForm({
      id_anak: item.id_anak,
      tahun_lulus: item.tahun_lulus,
      pekerjaan_sekarang: item.pekerjaan_sekarang || "",
      alamat_sekarang: item.alamat_sekarang || "",
      kontak: item.kontak || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    const res = editingItem
      ? await updateAlumniAction(editingItem.id_alumni, {
          tahun_lulus: Number(form.tahun_lulus),
          pekerjaan_sekarang: form.pekerjaan_sekarang,
          alamat_sekarang: form.alamat_sekarang,
          kontak: form.kontak,
        })
      : await createAlumniAction({
          id_anak: Number(form.id_anak),
          tahun_lulus: Number(form.tahun_lulus),
          pekerjaan_sekarang: form.pekerjaan_sekarang,
          alamat_sekarang: form.alamat_sekarang,
          kontak: form.kontak,
        });

    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return;
    }

    setModalOpen(false);
    setBanner({ type: "success", text: res.message });
  };

  const handleDelete = async (item: AlumniListItem) => {
    const confirmed = window.confirm(
      `Hapus "${item.nama_anak}" dari daftar alumni dan kembalikan sebagai Anak Asuh Aktif? (Berkas dokumennya tidak akan terhapus).`,
    );
    if (!confirmed) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteAlumniAction(item.id_alumni);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const lulusTahunIniCount = initialAlumni.filter(
    (a) => a.tahun_lulus === currentYear,
  ).length;
  const terdataPekerjaanCount = initialAlumni.filter(
    (a) => a.pekerjaan_sekarang && a.pekerjaan_sekarang.trim() !== "",
  ).length;

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Alumni</h1>
          <p className="text-sm text-gray-500 mt-1">
            Direktori lulusan panti asuhan beserta rekam jejak aktivitas,
            kontak, dan domisili saat ini.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Catat Alumni Baru
          </button>
        )}
      </div>

      {/* Ringkasan Statistik Alumni */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Alumni</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {initialAlumni.length} Orang
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Lulusan Tahun {currentYear}
            </p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {lulusTahunIniCount} Orang
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Aktivitas / Pekerjaan Terdata
            </p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {terdataPekerjaanCount} Orang
            </p>
          </div>
        </div>
      </div>

      {banner && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
            banner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {banner.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{banner.text}</span>
        </div>
      )}

      {/* Bilah Pencarian & Filter Tahun Lulus */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama alumni, NIK, pekerjaan, atau alamat..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 sm:w-52"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Tahun Lulus ({initialAlumni.length})
          </option>
          {availableYears.map((yr) => (
            <option
              key={yr}
              value={String(yr)}
              className="text-gray-900 bg-white"
            >
              Angkatan {yr}
            </option>
          ))}
        </select>
      </div>

      {/* Tabel Data Alumni */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <th className="py-3.5 px-4">Nama Alumni</th>
                <th className="py-3.5 px-4">Tahun Lulus</th>
                <th className="py-3.5 px-4">Pekerjaan / Aktivitas</th>
                <th className="py-3.5 px-4">Kontak & Domisili</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredAlumni.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-gray-500 text-sm"
                  >
                    Belum ada data alumni yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredAlumni.map((item) => (
                  <tr key={item.id_alumni} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">
                        {item.nama_anak}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[11px] font-mono text-gray-500">
                          NIK: {item.nik || "-"}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {formatStatusSosial(item.status_anak)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {item.tahun_lulus}
                      </span>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Masuk: {item.tanggal_masuk}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-800 font-medium">
                      {item.pekerjaan_sekarang || (
                        <span className="italic text-gray-400 font-normal">
                          Belum diisi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600 max-w-xs space-y-1">
                      {item.kontak && (
                        <p className="inline-flex items-center gap-1.5 font-medium text-gray-800">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {item.kontak}
                        </p>
                      )}
                      <p className="flex items-start gap-1.5 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{item.alamat_sekarang || "-"}</span>
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/data-anak-panti/${item.id_anak}`}
                          title="Lihat Arsip Berkas Dokumen"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Berkas
                        </Link>

                        {canManage && (
                          <>
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => openEditModal(item)}
                              title="Ubah Data Alumni"
                              className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 border border-blue-200 cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleDelete(item)}
                              title="Hapus dari Daftar Alumni"
                              className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 border border-red-200 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Alumni */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem
                  ? `Ubah Data Alumni — ${editingItem.nama_anak}`
                  : "Catat Alumni Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!editingItem && eligibleAnak.length === 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                  Seluruh anak panti yang terdaftar saat ini sudah tercatat di
                  dalam daftar alumni. Tambahkan data anak terlebih dahulu di
                  menu <strong>Data Anak Panti</strong> jika ingin mencatat
                  alumni baru.
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingItem && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Pilih Anak Asuh yang Lulus
                    </label>
                    <select
                      required
                      value={form.id_anak}
                      onChange={(e) =>
                        setForm({ ...form, id_anak: Number(e.target.value) })
                      }
                      className={inputClass}
                    >
                      {eligibleAnak.map((anak) => (
                        <option
                          key={anak.id_anak}
                          value={anak.id_anak}
                          className="text-gray-900 bg-white"
                        >
                          {anak.nama_anak}
                          {anak.nik ? ` (${anak.nik})` : ""} —{" "}
                          {formatStatusSosial(anak.status_anak)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tahun Lulus / Keluar Panti
                    </label>
                    <input
                      type="number"
                      required
                      min={1990}
                      max={2100}
                      value={form.tahun_lulus}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          tahun_lulus: Number(e.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Kontak (Telepon / WhatsApp)
                    </label>
                    <input
                      type="text"
                      placeholder="0812xxxxxxxx"
                      value={form.kontak}
                      onChange={(e) =>
                        setForm({ ...form, kontak: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Pekerjaan / Aktivitas Sekarang
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Mahasiswa / Karyawan Swasta / Wirausaha"
                    value={form.pekerjaan_sekarang}
                    onChange={(e) =>
                      setForm({ ...form, pekerjaan_sekarang: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Alamat Domisili Sekarang
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Alamat tempat tinggal alumni setelah lulus dari panti"
                    value={form.alamat_sekarang}
                    onChange={(e) =>
                      setForm({ ...form, alamat_sekarang: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
                  >
                    {loading && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    {editingItem ? "Simpan Perubahan" : "Simpan Data Alumni"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
