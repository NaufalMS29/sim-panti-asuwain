"use client";

import React, { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  Phone,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { verifyKunjunganAction } from "../actions/kunjungan.actions";
import {
  JadwalKunjunganDTO,
  StatusKunjunganType,
} from "../types/kunjungan.types";

interface AdminKunjunganManagerProps {
  initialData: JadwalKunjunganDTO[];
}

export function AdminKunjunganManager({
  initialData,
}: AdminKunjunganManagerProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | StatusKunjunganType>(
    "pending",
  );
  const [selectedItem, setSelectedItem] = useState<JadwalKunjunganDTO | null>(
    null,
  );
  const [catatan, setCatatan] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingCount = initialData.filter(
    (d) => d.status_kunjungan === "pending",
  ).length;
  const approvedCount = initialData.filter(
    (d) => d.status_kunjungan === "disetujui",
  ).length;

  const filteredList =
    filterStatus === "all"
      ? initialData
      : initialData.filter((d) => d.status_kunjungan === filterStatus);

  function openVerifyModal(item: JadwalKunjunganDTO) {
    setSelectedItem(item);
    setCatatan(item.catatan_pengurus || "");
    setFeedback(null);
  }

  function handleDecision(decision: "disetujui" | "ditolak") {
    if (!selectedItem) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await verifyKunjunganAction({
        id_kunjungan: selectedItem.id_kunjungan,
        status_kunjungan: decision,
        catatan_pengurus: catatan,
      });

      if (!res.success) {
        setFeedback({ type: "error", message: res.message });
        return;
      }

      setFeedback({ type: "success", message: res.message });
      setTimeout(() => {
        setSelectedItem(null);
        setFeedback(null);
      }, 900);
    });
  }

  return (
    <div className="space-y-6">
      {/* Ringkasan & Filter Tab */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Manajemen Jadwal Kunjungan
          </h1>
          <p className="text-sm text-slate-600">
            Antrian diurutkan secara kronologis berdasarkan waktu pengajuan
            masuk.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilterStatus("pending")}
            className={`rounded-lg px-3.5 py-2 transition ${
              filterStatus === "pending"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Antrian Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("disetujui")}
            className={`rounded-lg px-3.5 py-2 transition ${
              filterStatus === "disetujui"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Disetujui ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("ditolak")}
            className={`rounded-lg px-3.5 py-2 transition ${
              filterStatus === "ditolak"
                ? "bg-white text-red-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Ditolak
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`rounded-lg px-3.5 py-2 transition ${
              filterStatus === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua ({initialData.length})
          </button>
        </div>
      </div>

      {/* Tabel Data Kunjungan */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-3.5">Tiket & Antrian</th>
                <th className="px-4 py-3.5">Pengunjung</th>
                <th className="px-4 py-3.5">Jadwal & Rombongan</th>
                <th className="px-4 py-3.5">Tujuan</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Tidak ada data jadwal kunjungan pada kategori ini.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.id_kunjungan} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3.5 align-top">
                      <span className="font-mono font-bold text-teal-800">
                        {item.kode_tiket}
                      </span>
                      {item.status_kunjungan === "pending" && (
                        <span className="mt-1 block text-xs text-slate-500">
                          Antrian #{idx + 1}
                        </span>
                      )}
                      {item.has_slot_conflict && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                          <AlertTriangle className="h-3 w-3" />
                          Jadwal Bersamaan
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 align-top">
                      <div className="font-semibold text-slate-900">
                        {item.nama_pengunjung}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.instansi_organisasi || "Perorangan"}
                      </div>
                      <div className="mt-1 flex flex-col gap-0.5 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {item.email_pengunjung}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {item.no_telepon}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-top">
                      <div className="font-medium text-slate-900">
                        {item.tanggal_rencana}
                      </div>
                      <div className="text-xs text-slate-600">
                        Pukul {item.jam_rencana} WIB
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                        <Users className="h-3.5 w-3.5" />
                        {item.jumlah_rombongan} orang
                      </div>
                    </td>

                    <td className="max-w-xs px-4 py-3.5 align-top text-slate-700">
                      <p className="line-clamp-2">{item.tujuan_kunjungan}</p>
                    </td>

                    <td className="px-4 py-3.5 align-top">
                      {item.status_kunjungan === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          <Clock className="h-3.5 w-3.5" /> Pending
                        </span>
                      )}
                      {item.status_kunjungan === "disetujui" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Disetujui
                        </span>
                      )}
                      {item.status_kunjungan === "ditolak" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                          <XCircle className="h-3.5 w-3.5" /> Ditolak
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right align-top">
                      <button
                        type="button"
                        onClick={() => openVerifyModal(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {item.status_kunjungan === "pending"
                          ? "Verifikasi"
                          : "Detail"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL VERIFIKASI */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-teal-700">
                  {selectedItem.kode_tiket}
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Verifikasi Pengajuan Kunjungan
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p>
                  <strong>Pengunjung:</strong> {selectedItem.nama_pengunjung} (
                  {selectedItem.instansi_organisasi || "Perorangan"})
                </p>
                <p>
                  <strong>Kontak:</strong> {selectedItem.email_pengunjung} •{" "}
                  {selectedItem.no_telepon}
                </p>
                <p>
                  <strong>Waktu:</strong> {selectedItem.tanggal_rencana} pukul{" "}
                  {selectedItem.jam_rencana} WIB (
                  {selectedItem.jumlah_rombongan} orang)
                </p>
                <p className="mt-1.5 border-t border-slate-200 pt-1.5">
                  <strong>Tujuan:</strong> {selectedItem.tujuan_kunjungan}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 uppercase">
                  Catatan Pengurus (Dikirim ke Email Pengunjung)
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Silakan datang 15 menit lebih awal melalui gerbang utama. Jika menolak, tuliskan alasan penolakan (wajib)..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
                />
              </div>

              {feedback && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDecision("ditolak")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  Tolak Pengajuan
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDecision("disetujui")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Setujui & Kirim E-Tiket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
