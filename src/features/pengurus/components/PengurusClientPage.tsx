"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  KeyRound,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Can } from "@/components/auth/Can";
import { RoleName } from "@/features/auth/types/auth.types";
import { PengurusItem } from "../types/pengurus.types";
import { PengurusInput } from "../schemas/pengurus.schema";
import {
  createPengurusAction,
  updatePengurusAction,
  deletePengurusAction,
  resetPengurusPasswordAction,
} from "../actions/pengurus.actions";

interface PengurusClientPageProps {
  initialData: PengurusItem[];
  currentRole: RoleName;
}

export function PengurusClientPage({
  initialData,
  currentRole,
}: PengurusClientPageProps) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PengurusItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState<PengurusInput>({
    nama_pengurus: "",
    jabatan: "",
    no_telepon: "",
    alamat: "",
  });

  const filteredData = initialData.filter(
    (item) =>
      item.nama_pengurus.toLowerCase().includes(search.toLowerCase()) ||
      item.jabatan.toLowerCase().includes(search.toLowerCase()) ||
      item.username.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      nama_pengurus: "",
      jabatan: "",
      no_telepon: "",
      alamat: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (item: PengurusItem) => {
    setEditingItem(item);
    setForm({
      nama_pengurus: item.nama_pengurus,
      jabatan: item.jabatan,
      no_telepon: item.no_telepon,
      alamat: item.alamat,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    const res = editingItem
      ? await updatePengurusAction(editingItem.id_pengurus, form)
      : await createPengurusAction(form);

    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return;
    }

    setModalOpen(false);
    setBanner({ type: "success", text: res.message });
  };

  const handleDelete = async (item: PengurusItem) => {
    const confirmed = window.confirm(
      `Hapus pengurus "${item.nama_pengurus}" beserta akun login (${item.username})?`,
    );
    if (!confirmed) return;

    setLoading(true);
    const res = await deletePengurusAction(item.id_pengurus);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const handleResetPassword = async (item: PengurusItem) => {
    const confirmed = window.confirm(
      `Reset password akun "${item.username}" kembali ke default (asuwain123)?`,
    );
    if (!confirmed) return;

    setLoading(true);
    const res = await resetPengurusPasswordAction(item.id_pengurus);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Data Pengurus Panti
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola biodata pengurus dan akun akses sistem ber-prefix{" "}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-blue-700">
              pgr_
            </code>
            .
          </p>
        </div>

        <Can role={currentRole} permission="pengurus:manage">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengurus
          </button>
        </Can>
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

      {/* Bilah Pencarian */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, jabatan, atau username..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Tabel Data Pengurus */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <th className="py-3.5 px-4">Nama Pengurus</th>
                <th className="py-3.5 px-4">Akun Login</th>
                <th className="py-3.5 px-4">Jabatan</th>
                <th className="py-3.5 px-4">No. Telepon</th>
                <Can role={currentRole} permission="pengurus:manage">
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </Can>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-gray-500 text-sm"
                  >
                    Belum ada data pengurus yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id_pengurus} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">
                        {item.nama_pengurus}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">
                        {item.alamat}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block font-mono text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                        {item.username}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {item.jabatan}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {item.no_telepon}
                    </td>
                    <Can role={currentRole} permission="pengurus:manage">
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Can role={currentRole} permission="users:manage">
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleResetPassword(item)}
                              title="Reset Password ke asuwain123"
                              className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-200 cursor-pointer"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          </Can>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => openEditModal(item)}
                            title="Ubah Data"
                            className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 border border-blue-200 cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleDelete(item)}
                            title="Hapus Pengurus"
                            className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 border border-red-200 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </Can>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Pengurus */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem ? "Ubah Data Pengurus" : "Tambah Pengurus Baru"}
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
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
                Akun login dengan prefix <strong>pgr_</strong> dan password
                default <strong>asuwain123</strong> akan dibuat otomatis saat
                data disimpan.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap Pengurus
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Yohanes Bria"
                  value={form.nama_pengurus}
                  onChange={(e) =>
                    setForm({ ...form, nama_pengurus: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bendahara / Pengasuh"
                    value={form.jabatan}
                    onChange={(e) =>
                      setForm({ ...form, jabatan: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    No. Telepon / WA
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="081234567890"
                    value={form.no_telepon}
                    onChange={(e) =>
                      setForm({ ...form, no_telepon: e.target.value })
                    }
                    className={inputClass}
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
                  placeholder="Alamat tempat tinggal pengurus"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
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
                  {editingItem ? "Simpan Perubahan" : "Simpan & Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
