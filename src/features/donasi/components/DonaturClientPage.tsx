"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowLeft,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { DonaturItem } from "../types/donasi.types";
import {
  createDonaturAction,
  deleteDonaturAction,
  updateDonaturAction,
} from "../actions/donasi.actions";

interface DonaturClientPageProps {
  initialDonatur: DonaturItem[];
  tipeDonaturOptions: string[];
  canManage: boolean;
}

function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nominal);
}

function formatEnumLabel(val: string): string {
  return val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DonaturClientPage({
  initialDonatur,
  tipeDonaturOptions,
  canManage,
}: DonaturClientPageProps) {
  const [search, setSearch] = useState("");
  const [tipeFilter, setTipeFilter] = useState<string>("semua");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DonaturItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState({
    nama_donatur: "",
    email: "",
    no_telepon: "",
    alamat: "",
    tipe_donatur: tipeDonaturOptions[0] ?? "tidak_tetap",
    frekuensi_donasi: "",
  });

  const filteredData = initialDonatur.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      d.nama_donatur.toLowerCase().includes(q) ||
      (d.no_telepon || "").toLowerCase().includes(q) ||
      (d.email || "").toLowerCase().includes(q) ||
      (d.alamat || "").toLowerCase().includes(q);
    const matchTipe = tipeFilter === "semua" || d.tipe_donatur === tipeFilter;
    return matchSearch && matchTipe;
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      nama_donatur: "",
      email: "",
      no_telepon: "",
      alamat: "",
      tipe_donatur: tipeDonaturOptions[0] ?? "tidak_tetap",
      frekuensi_donasi: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (item: DonaturItem) => {
    setEditingItem(item);
    setForm({
      nama_donatur: item.nama_donatur,
      email: item.email ?? "",
      no_telepon: item.no_telepon ?? "",
      alamat: item.alamat ?? "",
      tipe_donatur: item.tipe_donatur,
      frekuensi_donasi: item.frekuensi_donasi ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    const res = editingItem
      ? await updateDonaturAction(editingItem.id_donatur, form)
      : await createDonaturAction(form);

    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return;
    }

    setModalOpen(false);
    setBanner({ type: "success", text: res.message });
  };

  const handleDelete = async (item: DonaturItem) => {
    const confirmed = window.confirm(
      `Hapus data donatur "${item.nama_donatur}"? (Riwayat donasinya akan tetap tersimpan tanpa tautan akun donatur)`,
    );
    if (!confirmed) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteDonaturAction(item.id_donatur);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/dashboard/donasi"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Transaksi Donasi
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Donatur</h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola profil donatur tetap maupun tidak tetap beserta frekuensi
              dan rekap kontribusinya.
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Donatur
            </button>
          )}
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
          <span>{banner.text}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama donatur, nomor telepon, email, atau alamat..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={tipeFilter}
          onChange={(e) => setTipeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 sm:w-48"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Tipe Donatur
          </option>
          {tipeDonaturOptions.map((opt) => (
            <option key={opt} value={opt} className="text-gray-900 bg-white">
              {formatEnumLabel(opt)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <th className="py-3.5 px-4">Nama Donatur</th>
                <th className="py-3.5 px-4">Tipe & Frekuensi</th>
                <th className="py-3.5 px-4">Kontak & Alamat</th>
                <th className="py-3.5 px-4">Kontribusi Terverifikasi</th>
                {canManage && <th className="py-3.5 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 5 : 4}
                    className="py-10 text-center text-gray-500 text-sm"
                  >
                    Tidak ada data donatur yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id_donatur} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">
                        {item.nama_donatur}
                      </p>
                      {item.username && (
                        <p className="text-[11px] font-mono text-blue-700 mt-0.5">
                          Akun Portal: {item.username}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {formatEnumLabel(item.tipe_donatur)}
                      </span>
                      {item.frekuensi_donasi && (
                        <p className="text-gray-500 mt-1">
                          Frekuensi: {item.frekuensi_donasi}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-600 space-y-0.5">
                      <p className="font-mono text-gray-800">
                        {item.no_telepon || "-"}
                      </p>
                      {item.email && <p>{item.email}</p>}
                      {item.alamat && (
                        <p className="line-clamp-1 text-gray-500">
                          {item.alamat}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <p className="font-bold text-emerald-700">
                        {formatRupiah(item.total_donasi_uang)}
                      </p>
                      <p className="text-gray-500 mt-0.5">
                        {item.total_transaksi} transaksi terverifikasi
                      </p>
                    </td>

                    {canManage && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 border border-blue-200 cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 border border-red-200 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem ? "Ubah Data Donatur" : "Tambah Donatur Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Donatur / Instansi
                </label>
                <input
                  type="text"
                  required
                  value={form.nama_donatur}
                  onChange={(e) =>
                    setForm({ ...form, nama_donatur: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tipe Donatur
                  </label>
                  <select
                    value={form.tipe_donatur}
                    onChange={(e) =>
                      setForm({ ...form, tipe_donatur: e.target.value })
                    }
                    className={inputClass}
                  >
                    {tipeDonaturOptions.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        className="text-gray-900 bg-white"
                      >
                        {formatEnumLabel(opt)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Frekuensi Donasi
                  </label>
                  <input
                    type="text"
                    placeholder="Bulanan / Insidental"
                    value={form.frekuensi_donasi}
                    onChange={(e) =>
                      setForm({ ...form, frekuensi_donasi: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={form.no_telepon}
                  onChange={(e) =>
                    setForm({ ...form, no_telepon: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alamat
                </label>
                <textarea
                  rows={2}
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
