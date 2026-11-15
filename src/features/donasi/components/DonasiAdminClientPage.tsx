"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  ExternalLink,
  Plus,
  Trash2,
  Download,
  X,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  DonasiTransactionItem,
  DonaturItem,
  KategoriBarangDonasiType,
  MetodePembayaranType,
} from "../types/donasi.types";
import {
  deleteDonasiAction,
  submitDonasiBarangAction,
  submitDonasiUangAction,
  verifyDonasiAction,
} from "../actions/donasi.actions";

interface DonasiAdminClientPageProps {
  initialTransactions: DonasiTransactionItem[];
  donaturOptions: DonaturItem[];
  canCreate: boolean;
  canVerify: boolean;
  canDelete: boolean;
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

function isPdfFile(filePath: string): boolean {
  return filePath.toLowerCase().split("?")[0].endsWith(".pdf");
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export function DonasiAdminClientPage({
  initialTransactions,
  donaturOptions,
  canCreate,
  canVerify,
  canDelete,
}: DonasiAdminClientPageProps) {
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState<"semua" | "uang" | "barang">(
    "semua",
  );
  const [statusFilter, setStatusFilter] = useState<
    "semua" | "pending" | "terverifikasi" | "ditolak"
  >("semua");

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modal Detail & Verifikasi
  const [inspectTx, setInspectTx] = useState<DonasiTransactionItem | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");

  // Modal Catat Donasi Manual (Offline)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<"uang" | "barang">("uang");
  const [offlineForm, setOfflineForm] = useState({
    id_donatur: "",
    nama_pengirim: "",
    tanggal_donasi: new Date().toISOString().split("T")[0],
    is_anonim: false,
    nominal: "100000",
    metode_pembayaran: "tunai" as MetodePembayaranType,
    nama_barang: "",
    kategori_barang: "habis_pakai" as KategoriBarangDonasiType,
    jumlah: "1",
    satuan: "dus",
    nomor_resi_ekspedisi: "",
    catatan: "",
    auto_verify: true,
  });

  useEffect(() => {
    if (!inspectTx) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInspectTx(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [inspectTx]);

  const totalUangTerverifikasi = initialTransactions
    .filter(
      (t) =>
        t.jenis_donasi === "uang" &&
        t.status_verifikasi === "terverifikasi" &&
        t.donasi_uang,
    )
    .reduce((acc, t) => acc + (t.donasi_uang?.nominal ?? 0), 0);

  const pendingCount = initialTransactions.filter(
    (t) => t.status_verifikasi === "pending",
  ).length;

  const barangTerverifikasiCount = initialTransactions.filter(
    (t) =>
      t.jenis_donasi === "barang" && t.status_verifikasi === "terverifikasi",
  ).length;

  const filteredTransactions = initialTransactions.filter((tx) => {
    const q = search.toLowerCase();
    const matchSearch =
      tx.kode_donasi.toLowerCase().includes(q) ||
      tx.nama_pengirim.toLowerCase().includes(q) ||
      (tx.nama_donatur_terdaftar || "").toLowerCase().includes(q) ||
      (tx.catatan || "").toLowerCase().includes(q) ||
      (tx.donasi_barang?.nama_barang || "").toLowerCase().includes(q) ||
      (tx.donasi_uang && String(tx.donasi_uang.nominal).includes(q));

    const matchJenis =
      jenisFilter === "semua" || tx.jenis_donasi === jenisFilter;
    const matchStatus =
      statusFilter === "semua" || tx.status_verifikasi === statusFilter;

    return matchSearch && matchJenis && matchStatus;
  });

  const handleVerifyDecision = async (
    id_donasi: number,
    decision: "terverifikasi" | "ditolak",
    catatan?: string,
  ) => {
    if (decision === "ditolak" && (!catatan || catatan.trim().length < 3)) {
      setBanner({
        type: "error",
        text: "Tuliskan alasan penolakan minimal 3 karakter.",
      });
      return;
    }

    setLoading(true);
    setBanner(null);
    const res = await verifyDonasiAction({
      id_donasi,
      status_verifikasi: decision,
      catatan_verifikasi: catatan,
    });
    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return;
    }

    setInspectTx(null);
    setRejectReason("");
    setBanner({ type: "success", text: res.message });
  };

  const handleDeleteTx = async (tx: DonasiTransactionItem) => {
    const confirmed = window.confirm(
      `Hapus permanen transaksi donasi "${tx.kode_donasi}" dari "${tx.nama_pengirim}"?`,
    );
    if (!confirmed) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteDonasiAction(tx.id_donasi);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const handleSelectDonaturPreset = (idDonaturStr: string) => {
    const found = donaturOptions.find(
      (d) => String(d.id_donatur) === idDonaturStr,
    );
    setOfflineForm({
      ...offlineForm,
      id_donatur: idDonaturStr,
      nama_pengirim: found ? found.nama_donatur : offlineForm.nama_pengirim,
    });
  };

  const handleCreateOfflineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    const fd = new FormData();
    if (offlineForm.id_donatur) {
      fd.append("id_donatur", offlineForm.id_donatur);
    }
    fd.append("nama_pengirim", offlineForm.nama_pengirim);
    fd.append("tanggal_donasi", offlineForm.tanggal_donasi);
    fd.append("is_anonim", String(offlineForm.is_anonim));
    fd.append("catatan", offlineForm.catatan);
    fd.append("auto_verify", String(offlineForm.auto_verify));

    if (createType === "uang") {
      fd.append("nominal", offlineForm.nominal);
      fd.append("metode_pembayaran", offlineForm.metode_pembayaran);

      const res = await submitDonasiUangAction(fd);
      setLoading(false);
      if (!res.success) {
        setBanner({ type: "error", text: res.message });
        return;
      }
    } else {
      fd.append("nama_barang", offlineForm.nama_barang);
      fd.append("kategori_barang", offlineForm.kategori_barang);
      fd.append("jumlah", offlineForm.jumlah);
      fd.append("satuan", offlineForm.satuan);
      fd.append("nomor_resi_ekspedisi", offlineForm.nomor_resi_ekspedisi);

      const res = await submitDonasiBarangAction(fd);
      setLoading(false);
      if (!res.success) {
        setBanner({ type: "error", text: res.message });
        return;
      }
    }

    setCreateModalOpen(false);
    setBanner({
      type: "success",
      text: "Transaksi donasi langsung berhasil disimpan.",
    });
  };

  const handleExportCsv = () => {
    if (filteredTransactions.length === 0) return;

    const headers = [
      "No",
      "Kode Donasi",
      "Tanggal Donasi",
      "Nama Pengirim",
      "Anonim",
      "Donatur Terdaftar",
      "Jenis Donasi",
      "Nominal Uang (Rp)",
      "Rincian Metode / Barang",
      "Status Verifikasi",
      "Catatan",
    ];

    const rows = filteredTransactions.map((tx, idx) => {
      const rincian =
        tx.jenis_donasi === "uang" && tx.donasi_uang
          ? formatEnumLabel(tx.donasi_uang.metode_pembayaran)
          : tx.donasi_barang
            ? `${tx.donasi_barang.nama_barang} (${tx.donasi_barang.jumlah} ${tx.donasi_barang.satuan} - ${formatEnumLabel(tx.donasi_barang.kategori_barang)})`
            : "-";

      return [
        idx + 1,
        tx.kode_donasi,
        tx.tanggal_donasi_display,
        tx.nama_pengirim,
        tx.is_anonim ? "Ya (Hamba Allah)" : "Tidak",
        tx.nama_donatur_terdaftar || "-",
        tx.jenis_donasi.toUpperCase(),
        tx.donasi_uang ? tx.donasi_uang.nominal : 0,
        rincian,
        tx.status_verifikasi.toUpperCase(),
        tx.catatan || "-",
      ]
        .map(escapeCsvCell)
        .join(",");
    });

    const csvContent = `\uFEFF${[headers.map(escapeCsvCell).join(","), ...rows].join("\r\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const todayStr = new Date().toISOString().split("T")[0];
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rekap-transaksi-donasi-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600";

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Transaksi & Verifikasi Donasi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Periksa bukti pembayaran masuk, verifikasi donasi barang, dan catat
            penerimaan donasi langsung.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/data-donatur"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-medium px-4 py-2.5 rounded-xl transition"
          >
            <Users className="w-4 h-4 text-blue-700" />
            Data Donatur
          </Link>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-medium px-4 py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Ekspor CSV ({filteredTransactions.length})
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Catat Donasi Langsung
            </button>
          )}
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Total Donasi Uang Terverifikasi
            </p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {formatRupiah(totalUangTerverifikasi)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === "pending" ? "semua" : "pending")
          }
          className={`text-left bg-white border rounded-2xl p-5 flex items-center gap-4 transition cursor-pointer shadow-2xs ${
            statusFilter === "pending"
              ? "border-amber-500 ring-2 ring-amber-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Menunggu Verifikasi
            </p>
            <p className="text-xl font-bold text-amber-700 mt-0.5">
              {pendingCount} Transaksi
            </p>
          </div>
        </button>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Donasi Barang Terverifikasi
            </p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {barangTerverifikasiCount} Paket
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

      {/* Bilah Pencarian & Filter */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode donasi, nama pengirim, donatur, nama barang, atau catatan..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={jenisFilter}
          onChange={(e) =>
            setJenisFilter(e.target.value as "semua" | "uang" | "barang")
          }
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 lg:w-44"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Jenis
          </option>
          <option value="uang" className="text-gray-900 bg-white">
            Donasi Uang
          </option>
          <option value="barang" className="text-gray-900 bg-white">
            Donasi Barang
          </option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as
                | "semua"
                | "pending"
                | "terverifikasi"
                | "ditolak",
            )
          }
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 lg:w-52"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Status
          </option>
          <option value="pending" className="text-gray-900 bg-white">
            Menunggu Verifikasi ({pendingCount})
          </option>
          <option value="terverifikasi" className="text-gray-900 bg-white">
            Terverifikasi
          </option>
          <option value="ditolak" className="text-gray-900 bg-white">
            Ditolak
          </option>
        </select>
      </div>

      {/* Tabel Transaksi Donasi */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <th className="py-3.5 px-4">Kode & Pengirim</th>
                <th className="py-3.5 px-4">Jenis</th>
                <th className="py-3.5 px-4">Rincian Donasi</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Verifikasi & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-gray-500 text-sm"
                  >
                    Tidak ada transaksi donasi yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id_donasi} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4">
                      <p className="text-[11px] font-mono font-bold text-blue-700">
                        {tx.kode_donasi}
                      </p>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {tx.nama_pengirim}
                        {tx.is_anonim && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                            Anonim
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {tx.tanggal_donasi_display}
                        {tx.nama_donatur_terdaftar
                          ? ` • Akun: ${tx.nama_donatur_terdaftar}`
                          : ""}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      {tx.jenis_donasi === "uang" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Banknote className="w-3.5 h-3.5" />
                          Uang
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Package className="w-3.5 h-3.5" />
                          Barang
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      {tx.jenis_donasi === "uang" && tx.donasi_uang ? (
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {formatRupiah(tx.donasi_uang.nominal)}
                          </p>
                          <p className="text-gray-500 mt-0.5">
                            {formatEnumLabel(tx.donasi_uang.metode_pembayaran)}
                          </p>
                        </div>
                      ) : tx.donasi_barang ? (
                        <div>
                          <p className="font-bold text-gray-900">
                            {tx.donasi_barang.nama_barang} (
                            {tx.donasi_barang.jumlah} {tx.donasi_barang.satuan})
                          </p>
                          <p className="text-gray-500 mt-0.5">
                            {formatEnumLabel(tx.donasi_barang.kategori_barang)}
                            {tx.donasi_barang.nomor_resi_ekspedisi
                              ? ` • Resi: ${tx.donasi_barang.nomor_resi_ekspedisi}`
                              : ""}
                          </p>
                        </div>
                      ) : null}
                      {tx.catatan && (
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                          {tx.catatan}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {tx.status_verifikasi === "terverifikasi" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Terverifikasi
                        </span>
                      )}
                      {tx.status_verifikasi === "terverifikasi" &&
                        tx.verifikator_nama && (
                          <p className="text-[11px] text-gray-500 mt-1">
                            Oleh:{" "}
                            <span className="font-medium text-gray-700">
                              {tx.verifikator_nama}
                            </span>
                          </p>
                        )}
                      {tx.status_verifikasi === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                      {tx.status_verifikasi === "ditolak" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" />
                          Ditolak
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setRejectReason("");
                            setInspectTx(tx);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {tx.status_verifikasi === "pending" && canVerify
                            ? "Periksa & Verifikasi"
                            : "Detail"}
                        </button>

                        {canDelete && (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleDeleteTx(tx)}
                            title="Hapus Transaksi"
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

      {/* Modal Detail & Verifikasi */}
      {inspectTx && (
        <div
          onClick={() => setInspectTx(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Detail Transaksi {inspectTx.kode_donasi}
                </h2>
                <p className="text-xs text-gray-500">
                  Pengirim: {inspectTx.nama_pengirim} •{" "}
                  {inspectTx.tanggal_donasi_display}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectTx(null)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <p className="font-bold text-slate-800 uppercase">
                    Ringkasan Transaksi
                  </p>
                  {inspectTx.jenis_donasi === "uang" &&
                  inspectTx.donasi_uang ? (
                    <>
                      <p className="text-lg font-bold text-emerald-700">
                        {formatRupiah(inspectTx.donasi_uang.nominal)}
                      </p>
                      <p className="text-gray-700">
                        Metode:{" "}
                        <strong>
                          {formatEnumLabel(
                            inspectTx.donasi_uang.metode_pembayaran,
                          )}
                        </strong>
                      </p>
                    </>
                  ) : inspectTx.donasi_barang ? (
                    <>
                      <p className="text-base font-bold text-gray-900">
                        {inspectTx.donasi_barang.nama_barang} (
                        {inspectTx.donasi_barang.jumlah}{" "}
                        {inspectTx.donasi_barang.satuan})
                      </p>
                      <p className="text-gray-700">
                        Kategori:{" "}
                        <strong>
                          {formatEnumLabel(
                            inspectTx.donasi_barang.kategori_barang,
                          )}
                        </strong>
                      </p>
                      <p className="text-gray-700">
                        Nomor Resi:{" "}
                        <span className="font-mono">
                          {inspectTx.donasi_barang.nomor_resi_ekspedisi || "-"}
                        </span>
                      </p>
                    </>
                  ) : null}
                  <p className="text-gray-700">
                    Publikasi:{" "}
                    <strong>
                      {inspectTx.is_anonim
                        ? "Anonim (Hamba Allah)"
                        : inspectTx.nama_pengirim}
                    </strong>
                  </p>
                  <p className="text-gray-600 pt-1">
                    Catatan: {inspectTx.catatan || "-"}
                  </p>
                </div>

                {canVerify && inspectTx.status_verifikasi === "pending" && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-3">
                    <p className="text-xs font-bold text-amber-900">
                      Tindakan Verifikasi Pengurus
                    </p>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        handleVerifyDecision(
                          inspectTx.id_donasi,
                          "terverifikasi",
                        )
                      }
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Setujui & Verifikasi Donasi
                    </button>

                    <div className="border-t border-amber-200 pt-3 space-y-2">
                      <label className="block text-[11px] font-semibold text-gray-700">
                        Alasan Penolakan (Jika Bukti Tidak Valid / Barang Tidak
                        Sesuai)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Nominal pada bukti transfer berbeda..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          handleVerifyDecision(
                            inspectTx.id_donasi,
                            "ditolak",
                            rejectReason,
                          )
                        }
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        Tolak Transaksi
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-100 rounded-xl border border-gray-200 p-3 flex flex-col min-h-[320px]">
                {inspectTx.bukti_pembayaran ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700">
                        Lampiran Bukti Pembayaran / Paket
                      </span>
                      <a
                        href={inspectTx.bukti_pembayaran}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buka Penuh
                      </a>
                    </div>
                    <div className="flex-1 flex items-center justify-center overflow-hidden">
                      {isPdfFile(inspectTx.bukti_pembayaran) ? (
                        <iframe
                          src={inspectTx.bukti_pembayaran}
                          title="Lampiran Bukti"
                          className="w-full h-80 rounded-lg border border-gray-300 bg-white"
                        />
                      ) : (
                        <img
                          src={inspectTx.bukti_pembayaran}
                          alt="Lampiran Bukti"
                          className="max-h-80 object-contain rounded-lg shadow-xs bg-white"
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-gray-500 text-center p-6">
                    Transaksi ini tidak memiliki lampiran file bukti.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Catat Donasi Langsung (Offline) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-xl p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                Catat Donasi Langsung
              </h2>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCreateType("uang")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border cursor-pointer ${
                  createType === "uang"
                    ? "bg-blue-700 text-white border-blue-700"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                Donasi Uang
              </button>
              <button
                type="button"
                onClick={() => setCreateType("barang")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border cursor-pointer ${
                  createType === "barang"
                    ? "bg-blue-700 text-white border-blue-700"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                Donasi Barang
              </button>
            </div>

            <form onSubmit={handleCreateOfflineSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tautkan ke Donatur Terdaftar (Opsional)
                </label>
                <select
                  value={offlineForm.id_donatur}
                  onChange={(e) => handleSelectDonaturPreset(e.target.value)}
                  className={inputClass}
                >
                  <option value="" className="text-gray-900 bg-white">
                    -- Donatur Non-Akun / Tamu Langsung --
                  </option>
                  {donaturOptions.map((d) => (
                    <option
                      key={d.id_donatur}
                      value={String(d.id_donatur)}
                      className="text-gray-900 bg-white"
                    >
                      {d.nama_donatur} ({formatEnumLabel(d.tipe_donatur)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Pengirim
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama pemberi donasi"
                    value={offlineForm.nama_pengirim}
                    onChange={(e) =>
                      setOfflineForm({
                        ...offlineForm,
                        nama_pengirim: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tanggal Diterima
                  </label>
                  <input
                    type="date"
                    required
                    value={offlineForm.tanggal_donasi}
                    onChange={(e) =>
                      setOfflineForm({
                        ...offlineForm,
                        tanggal_donasi: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {createType === "uang" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nominal (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={offlineForm.nominal}
                      onChange={(e) =>
                        setOfflineForm({
                          ...offlineForm,
                          nominal: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Metode Penerimaan
                    </label>
                    <select
                      value={offlineForm.metode_pembayaran}
                      onChange={(e) =>
                        setOfflineForm({
                          ...offlineForm,
                          metode_pembayaran: e.target
                            .value as MetodePembayaranType,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="tunai" className="text-gray-900 bg-white">
                        Tunai di Panti
                      </option>
                      <option
                        value="transfer_bank"
                        className="text-gray-900 bg-white"
                      >
                        Transfer Bank
                      </option>
                      <option value="qris" className="text-gray-900 bg-white">
                        QRIS
                      </option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nama Barang
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Beras / Meja Belajar"
                        value={offlineForm.nama_barang}
                        onChange={(e) =>
                          setOfflineForm({
                            ...offlineForm,
                            nama_barang: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Kategori Barang
                      </label>
                      <select
                        value={offlineForm.kategori_barang}
                        onChange={(e) =>
                          setOfflineForm({
                            ...offlineForm,
                            kategori_barang: e.target
                              .value as KategoriBarangDonasiType,
                          })
                        }
                        className={inputClass}
                      >
                        <option
                          value="habis_pakai"
                          className="text-gray-900 bg-white"
                        >
                          Habis Pakai
                        </option>
                        <option
                          value="inventaris"
                          className="text-gray-900 bg-white"
                        >
                          Inventaris
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Jumlah
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={offlineForm.jumlah}
                        onChange={(e) =>
                          setOfflineForm({
                            ...offlineForm,
                            jumlah: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Satuan
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="dus / kg / unit"
                        value={offlineForm.satuan}
                        onChange={(e) =>
                          setOfflineForm({
                            ...offlineForm,
                            satuan: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nomor Resi (Opsional)
                      </label>
                      <input
                        type="text"
                        value={offlineForm.nomor_resi_ekspedisi}
                        onChange={(e) =>
                          setOfflineForm({
                            ...offlineForm,
                            nomor_resi_ekspedisi: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  value={offlineForm.catatan}
                  onChange={(e) =>
                    setOfflineForm({ ...offlineForm, catatan: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offlineForm.is_anonim}
                    onChange={(e) =>
                      setOfflineForm({
                        ...offlineForm,
                        is_anonim: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  Tandai sebagai Anonim
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offlineForm.auto_verify}
                    onChange={(e) =>
                      setOfflineForm({
                        ...offlineForm,
                        auto_verify: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  Langsung <strong>Terverifikasi</strong>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
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
                  Simpan Donasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
