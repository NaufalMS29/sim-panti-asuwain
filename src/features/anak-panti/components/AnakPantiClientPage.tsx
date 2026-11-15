"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FileText,
  Users,
  UserCheck,
  GraduationCap,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { can } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import { AnakPantiItem } from "../types/anak-panti.types";
import {
  createAnakPantiAction,
  deleteAnakPantiAction,
  updateAnakPantiAction,
} from "../actions/anak-panti.actions";

interface AnakPantiClientPageProps {
  initialData: AnakPantiItem[];
  currentRole: RoleName;
  jenisKelaminOptions: string[];
  statusAnakOptions: string[];
}

function formatEnumLabel(val: string): string {
  if (val === "L") return "Laki-laki";
  if (val === "P") return "Perempuan";
  return val.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AnakPantiClientPage({
  initialData,
  currentRole,
  jenisKelaminOptions,
  statusAnakOptions,
}: AnakPantiClientPageProps) {
  const [search, setSearch] = useState("");
  const [kepengasuhanFilter, setKepengasuhanFilter] = useState<
    "semua" | "aktif" | "alumni"
  >("semua");
  const [kategoriSosialFilter, setKategoriSosialFilter] =
    useState<string>("semua");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnakPantiItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const canCreate = can(currentRole, "anak_panti:create");
  const canUpdate = can(currentRole, "anak_panti:update");
  const canDelete = can(currentRole, "anak_panti:delete");

  const [form, setForm] = useState({
    nama_anak: "",
    nik: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: jenisKelaminOptions[0] ?? "L",
    status_anak: statusAnakOptions[0] ?? "yatim",
    tanggal_masuk: new Date().toISOString().split("T")[0],
  });

  const aktifCount = initialData.filter((item) => !item.is_alumni).length;
  const alumniCount = initialData.filter((item) => item.is_alumni).length;

  const filteredData = initialData.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.nama_anak.toLowerCase().includes(q) ||
      (item.nik || "").toLowerCase().includes(q) ||
      item.tempat_lahir.toLowerCase().includes(q) ||
      (item.username || "").toLowerCase().includes(q);

    const matchKepengasuhan =
      kepengasuhanFilter === "semua" ||
      (kepengasuhanFilter === "aktif" && !item.is_alumni) ||
      (kepengasuhanFilter === "alumni" && item.is_alumni);

    const matchKategori =
      kategoriSosialFilter === "semua" ||
      item.status_anak === kategoriSosialFilter;

    return matchSearch && matchKepengasuhan && matchKategori;
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      nama_anak: "",
      nik: "",
      tempat_lahir: "",
      tanggal_lahir: "",
      jenis_kelamin: jenisKelaminOptions[0] ?? "L",
      status_anak: statusAnakOptions[0] ?? "yatim",
      tanggal_masuk: new Date().toISOString().split("T")[0],
    });
    setModalOpen(true);
  };

  const openEditModal = (item: AnakPantiItem) => {
    setEditingItem(item);
    setForm({
      nama_anak: item.nama_anak ?? "",
      nik: item.nik ?? "",
      tempat_lahir: item.tempat_lahir ?? "",
      tanggal_lahir: item.tanggal_lahir_iso ?? "",
      jenis_kelamin: item.jenis_kelamin ?? jenisKelaminOptions[0] ?? "L",
      status_anak: item.status_anak ?? statusAnakOptions[0] ?? "yatim",
      tanggal_masuk: item.tanggal_masuk_iso ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    const res = editingItem
      ? await updateAnakPantiAction(editingItem.id_anak, form)
      : await createAnakPantiAction(form);

    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return;
    }

    setModalOpen(false);
    setBanner({ type: "success", text: res.message });
  };

  const handleDelete = async (item: AnakPantiItem) => {
    const confirmed = window.confirm(
      `Hapus data anak "${item.nama_anak}" beserta berkas dan akun loginnya secara permanen?`,
    );
    if (!confirmed) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteAnakPantiAction(item.id_anak);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600";

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Anak Panti</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola biodata anak asuh, pantau status kepengasuhan aktif maupun
            alumni, serta akses arsip berkas.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Data Anak
          </button>
        )}
      </div>

      {/* Kartu Ringkasan Status Kepengasuhan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setKepengasuhanFilter("semua")}
          className={`text-left bg-white border rounded-2xl p-5 flex items-center gap-4 transition cursor-pointer shadow-2xs ${
            kepengasuhanFilter === "semua"
              ? "border-blue-600 ring-2 ring-blue-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Total Anak Terdata
            </p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {initialData.length} Anak
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setKepengasuhanFilter("aktif")}
          className={`text-left bg-white border rounded-2xl p-5 flex items-center gap-4 transition cursor-pointer shadow-2xs ${
            kepengasuhanFilter === "aktif"
              ? "border-emerald-600 ring-2 ring-emerald-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Anak Asuh Aktif</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {aktifCount} Anak
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setKepengasuhanFilter("alumni")}
          className={`text-left bg-white border rounded-2xl p-5 flex items-center gap-4 transition cursor-pointer shadow-2xs ${
            kepengasuhanFilter === "alumni"
              ? "border-purple-600 ring-2 ring-purple-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Sudah Alumni</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {alumniCount} Orang
            </p>
          </div>
        </button>
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

      {/* Bilah Pencarian & Filter */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama anak, NIK, tempat lahir, atau username..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={kepengasuhanFilter ?? "semua"}
          onChange={(e) =>
            setKepengasuhanFilter(
              e.target.value as "semua" | "aktif" | "alumni",
            )
          }
          aria-label="Filter Status Kepengasuhan"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 md:w-56"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Kepengasuhan ({initialData.length})
          </option>
          <option value="aktif" className="text-gray-900 bg-white">
            Anak Asuh Aktif ({aktifCount})
          </option>
          <option value="alumni" className="text-gray-900 bg-white">
            Alumni ({alumniCount})
          </option>
        </select>

        <select
          value={kategoriSosialFilter ?? "semua"}
          onChange={(e) => setKategoriSosialFilter(e.target.value)}
          aria-label="Filter Kategori Sosial"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 md:w-52"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Kategori Sosial
          </option>
          {statusAnakOptions.map((opt) => (
            <option key={opt} value={opt} className="text-gray-900 bg-white">
              {formatEnumLabel(opt)}
            </option>
          ))}
        </select>
      </div>

      {/* Tabel Data Anak Panti */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <th className="py-3.5 px-4">Nama Anak & Akun</th>
                <th className="py-3.5 px-4">Tempat, Tanggal Lahir</th>
                <th className="py-3.5 px-4">Kategori Sosial</th>
                <th className="py-3.5 px-4">Status Kepengasuhan</th>
                <th className="py-3.5 px-4">Tanggal Masuk</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-gray-500 text-sm"
                  >
                    Tidak ada data anak panti yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id_anak} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">
                        {item.nama_anak}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        NIK:{" "}
                        <span className="font-mono">{item.nik || "-"}</span>
                        {item.username && (
                          <>
                            {" "}
                            •{" "}
                            <span className="font-mono text-gray-700">
                              {item.username}
                            </span>
                          </>
                        )}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-700">
                      <p className="font-medium text-gray-900">
                        {item.tempat_lahir}, {item.tanggal_lahir_display}
                      </p>
                      <p className="text-gray-500 mt-0.5">
                        {formatEnumLabel(item.jenis_kelamin)}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {formatEnumLabel(item.status_anak)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.is_alumni ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <GraduationCap className="w-3.5 h-3.5" />
                            Alumni
                            {item.tahun_lulus ? ` (${item.tahun_lulus})` : ""}
                          </span>
                          <div>
                            <Link
                              href="/dashboard/data-alumni"
                              className="text-[11px] font-medium text-purple-700 hover:underline"
                            >
                              Lihat di Data Alumni
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <UserCheck className="w-3.5 h-3.5" />
                          Anak Asuh Aktif
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      {item.tanggal_masuk_display}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/data-anak-panti/${item.id_anak}`}
                          title="Kelola Berkas Dokumen Anak"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Berkas ({item.berkas_count})
                        </Link>

                        {canUpdate && (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => openEditModal(item)}
                            title="Ubah Biodata Anak"
                            className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 border border-blue-200 cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleDelete(item)}
                            title="Hapus Data Anak"
                            className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 border border-red-200 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Modal Tambah / Ubah Data Anak */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem ? "Ubah Biodata Anak Panti" : "Tambah Data Anak"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!editingItem && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 leading-relaxed">
                Sistem akan otomatis membuatkan akun portal{" "}
                <strong>Anak Panti</strong> dengan awalan{" "}
                <code className="font-mono font-semibold">ank_</code> dan
                password bawaan{" "}
                <code className="font-mono font-semibold">asuwain123</code>.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap Anak
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Syaiful"
                  value={form.nama_anak ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, nama_anak: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  NIK (16 Digit — Opsional)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="5371xxxxxxxxxxxx"
                  value={form.nik ?? ""}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kupang"
                    value={form.tempat_lahir ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, tempat_lahir: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    required
                    value={form.tanggal_lahir ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, tanggal_lahir: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={form.jenis_kelamin ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, jenis_kelamin: e.target.value })
                    }
                    className={inputClass}
                  >
                    {jenisKelaminOptions.map((jk) => (
                      <option
                        key={jk}
                        value={jk}
                        className="text-gray-900 bg-white"
                      >
                        {formatEnumLabel(jk)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategori Sosial Anak
                  </label>
                  <select
                    value={form.status_anak ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, status_anak: e.target.value })
                    }
                    className={inputClass}
                  >
                    {statusAnakOptions.map((st) => (
                      <option
                        key={st}
                        value={st}
                        className="text-gray-900 bg-white"
                      >
                        {formatEnumLabel(st)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tanggal Masuk Panti
                </label>
                <input
                  type="date"
                  required
                  value={form.tanggal_masuk ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, tanggal_masuk: e.target.value })
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
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingItem ? "Simpan Perubahan" : "Simpan Data Anak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
