"use client";

import { useEffect, useRef, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarRange,
  Plus,
  Search,
  Download,
  Eye,
  ExternalLink,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link2,
  FolderPlus,
} from "lucide-react";
import {
  JenisKasType,
  KategoriKasOption,
  KeuanganSummary,
  TransaksiKasItem,
} from "../types/keuangan.types";
import {
  createKategoriKasAction,
  createTransaksiKasAction,
  deleteTransaksiKasAction,
  updateTransaksiKasAction,
} from "../actions/keuangan.actions";

interface KeuanganClientPageProps {
  initialTransactions: TransaksiKasItem[];
  kategoriOptions: KategoriKasOption[];
  summary: KeuanganSummary;
  canManage: boolean;
}

function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nominal);
}

function isPdfFile(filePath: string): boolean {
  return filePath.toLowerCase().split("?")[0].endsWith(".pdf");
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export function KeuanganClientPage({
  initialTransactions,
  kategoriOptions,
  summary,
  canManage,
}: KeuanganClientPageProps) {
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState<
    "semua" | "pemasukan" | "pengeluaran"
  >("semua");
  const [sumberFilter, setSumberFilter] = useState<
    "semua" | "otomatis" | "manual"
  >("semua");
  const [monthFilter, setMonthFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modal Tambah / Ubah Kas Manual
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransaksiKasItem | null>(null);
  const notaInputRef = useRef<HTMLInputElement | null>(null);

  const initialPengeluaranKat = kategoriOptions.find(
    (k) => k.jenis_kas === "pengeluaran",
  );

  const [form, setForm] = useState({
    jenis_transaksi: "pengeluaran" as JenisKasType,
    id_kategori_kas: String(
      initialPengeluaranKat?.id_kategori_kas ??
        kategoriOptions[0]?.id_kategori_kas ??
        "",
    ),
    nominal: "",
    tanggal_transaksi: new Date().toISOString().split("T")[0],
    keterangan: "",
  });

  // Tambah Kategori Baru Inline
  const [newKategoriOpen, setNewKategoriOpen] = useState(false);
  const [newKategoriName, setNewKategoriName] = useState("");

  // Modal Pratinjau Nota / Bukti Transfer
  const [previewNota, setPreviewNota] = useState<{
    title: string;
    path: string;
  } | null>(null);

  useEffect(() => {
    if (!previewNota) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewNota(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [previewNota]);

  const activeKategoriOptions = kategoriOptions.filter(
    (k) => k.jenis_kas === form.jenis_transaksi,
  );

  const filteredTransactions = initialTransactions.filter((tx) => {
    const q = search.toLowerCase();
    const matchSearch =
      tx.nama_kategori.toLowerCase().includes(q) ||
      tx.keterangan.toLowerCase().includes(q) ||
      (tx.kode_donasi || "").toLowerCase().includes(q) ||
      (tx.pencatat_nama || "").toLowerCase().includes(q) ||
      String(tx.nominal).includes(q);

    const matchJenis =
      jenisFilter === "semua" || tx.jenis_transaksi === jenisFilter;

    const matchSumber =
      sumberFilter === "semua" ||
      (sumberFilter === "otomatis" && tx.is_auto_donasi) ||
      (sumberFilter === "manual" && !tx.is_auto_donasi);

    const matchMonth =
      !monthFilter || tx.tanggal_transaksi_iso.startsWith(monthFilter);

    return matchSearch && matchJenis && matchSumber && matchMonth;
  });

  const openCreateModal = (defaultJenis: JenisKasType) => {
    const firstMatch = kategoriOptions.find(
      (k) => k.jenis_kas === defaultJenis,
    );
    setEditingItem(null);
    setNewKategoriOpen(false);
    setForm({
      jenis_transaksi: defaultJenis,
      id_kategori_kas: String(firstMatch?.id_kategori_kas ?? ""),
      nominal: "",
      tanggal_transaksi: new Date().toISOString().split("T")[0],
      keterangan: "",
    });
    if (notaInputRef.current) notaInputRef.current.value = "";
    setModalOpen(true);
  };

  const openEditModal = (item: TransaksiKasItem) => {
    setEditingItem(item);
    setNewKategoriOpen(false);
    setForm({
      jenis_transaksi: item.jenis_transaksi,
      id_kategori_kas: String(item.id_kategori_kas),
      nominal: String(item.nominal),
      tanggal_transaksi: item.tanggal_transaksi_iso,
      keterangan: item.keterangan,
    });
    if (notaInputRef.current) notaInputRef.current.value = "";
    setModalOpen(true);
  };

  const handleJenisSwitch = (targetJenis: JenisKasType) => {
    const firstMatch = kategoriOptions.find((k) => k.jenis_kas === targetJenis);
    setForm({
      ...form,
      jenis_transaksi: targetJenis,
      id_kategori_kas: String(firstMatch?.id_kategori_kas ?? ""),
    });
  };

  const handleAddKategori = async () => {
    if (newKategoriName.trim().length < 2) return;
    setLoading(true);
    const res = await createKategoriKasAction(
      newKategoriName,
      form.jenis_transaksi,
    );
    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return;
    }

    setNewKategoriName("");
    setNewKategoriOpen(false);
    setBanner({ type: "success", text: res.message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    const fd = new FormData();
    fd.append("jenis_transaksi", form.jenis_transaksi);
    fd.append("id_kategori_kas", form.id_kategori_kas);
    fd.append("nominal", form.nominal);
    fd.append("tanggal_transaksi", form.tanggal_transaksi);
    fd.append("keterangan", form.keterangan);

    const file = notaInputRef.current?.files?.[0];
    if (file) {
      fd.append("file_nota", file);
    }

    const res = editingItem
      ? await updateTransaksiKasAction(editingItem.id_transaksi_kas, fd)
      : await createTransaksiKasAction(fd);

    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return;
    }

    setModalOpen(false);
    setBanner({ type: "success", text: res.message });
  };

  const handleDelete = async (item: TransaksiKasItem) => {
    const confirmed = window.confirm(
      `Hapus transaksi kas "${item.nama_kategori}" sebesar ${formatRupiah(item.nominal)}?`,
    );
    if (!confirmed) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteTransaksiKasAction(item.id_transaksi_kas);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const handleExportCsv = () => {
    if (filteredTransactions.length === 0) return;

    const headers = [
      "No",
      "Tanggal",
      "Jenis Kas",
      "Kategori",
      "Sumber Pencatatan",
      "Kode Donasi Terkait",
      "Nominal (Rp)",
      "Keterangan",
      "Pengurus Pencatat",
    ];

    const rows = filteredTransactions.map((tx, idx) =>
      [
        idx + 1,
        tx.tanggal_transaksi_display,
        tx.jenis_transaksi.toUpperCase(),
        tx.nama_kategori,
        tx.is_auto_donasi ? "Otomatis dari Donasi" : "Input Manual Kas",
        tx.kode_donasi || "-",
        tx.jenis_transaksi === "pemasukan" ? tx.nominal : -tx.nominal,
        tx.keterangan,
        tx.pencatat_nama || "-",
      ]
        .map(escapeCsvCell)
        .join(","),
    );

    const csvContent = `\uFEFF${[headers.map(escapeCsvCell).join(","), ...rows].join("\r\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const todayStr = new Date().toISOString().split("T")[0];
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `buku-kas-panti-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const arusBulanIni = summary.pemasukanBulanIni - summary.pengeluaranBulanIni;

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600";

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Keuangan & Buku Kas Panti
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Rekap pemasukan otomatis dari donasi uang terverifikasi dan
            pencatatan operasional kas panti asuhan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-medium px-4 py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Ekspor CSV ({filteredTransactions.length})
          </button>

          {canManage && (
            <>
              <button
                type="button"
                onClick={() => openCreateModal("pemasukan")}
                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Catat Pemasukan
              </button>

              <button
                type="button"
                onClick={() => openCreateModal("pengeluaran")}
                className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Catat Pengeluaran
              </button>
            </>
          )}
        </div>
      </div>

      {/* Kartu Ringkasan Keuangan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              Saldo Kas Saat Ini
            </p>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-xl font-bold ${
              summary.saldoAkhir < 0 ? "text-red-600" : "text-gray-900"
            }`}
          >
            {formatRupiah(summary.saldoAkhir)}
          </p>
          <p className="text-[11px] text-gray-500">
            Akumulasi seluruh pemasukan dikurangi pengeluaran
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              Total Pemasukan Kas
            </p>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-700">
            {formatRupiah(summary.totalPemasukan)}
          </p>
          <p className="text-[11px] text-gray-500">
            Dari Donasi:{" "}
            <strong>{formatRupiah(summary.pemasukanDariDonasi)}</strong>
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              Total Pengeluaran Kas
            </p>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-red-700">
            {formatRupiah(summary.totalPengeluaran)}
          </p>
          <p className="text-[11px] text-gray-500">
            Operasional, pendidikan, konsumsi & kebutuhan anak
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              Surplus / Defisit Bulan Ini
            </p>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
              <CalendarRange className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-xl font-bold ${
              arusBulanIni >= 0 ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {arusBulanIni >= 0 ? "+" : ""}
            {formatRupiah(arusBulanIni)}
          </p>
          <p className="text-[11px] text-gray-500">
            Masuk {formatRupiah(summary.pemasukanBulanIni)} • Keluar{" "}
            {formatRupiah(summary.pengeluaranBulanIni)}
          </p>
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
      <div className="bg-white border border-gray-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="relative md:col-span-5">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kategori, keterangan, kode donasi, atau pengurus..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={jenisFilter}
          onChange={(e) =>
            setJenisFilter(
              e.target.value as "semua" | "pemasukan" | "pengeluaran",
            )
          }
          className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Jenis
          </option>
          <option value="pemasukan" className="text-gray-900 bg-white">
            Pemasukan
          </option>
          <option value="pengeluaran" className="text-gray-900 bg-white">
            Pengeluaran
          </option>
        </select>

        <select
          value={sumberFilter}
          onChange={(e) =>
            setSumberFilter(e.target.value as "semua" | "otomatis" | "manual")
          }
          className="md:col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Sumber Kas
          </option>
          <option value="otomatis" className="text-gray-900 bg-white">
            Otomatis dari Donasi
          </option>
          <option value="manual" className="text-gray-900 bg-white">
            Input Manual Pengurus
          </option>
        </select>

        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          aria-label="Filter Bulan"
          className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Tabel Buku Kas */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <th className="py-3.5 px-4">Tanggal & Sumber</th>
                <th className="py-3.5 px-4">Jenis & Kategori</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4 text-right">Nominal</th>
                <th className="py-3.5 px-4 text-right">Nota & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-gray-500 text-sm"
                  >
                    Belum ada catatan transaksi kas yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id_transaksi_kas} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4 text-xs">
                      <p className="font-semibold text-gray-900">
                        {tx.tanggal_transaksi_display}
                      </p>
                      {tx.is_auto_donasi ? (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-semibold">
                          <Link2 className="w-3 h-3" />
                          {tx.kode_donasi}
                        </span>
                      ) : (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                          Kas Manual
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      {tx.jenis_transaksi === "pemasukan" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Pemasukan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-red-50 text-red-700 border border-red-200">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Pengeluaran
                        </span>
                      )}
                      <p className="font-semibold text-gray-800 mt-1">
                        {tx.nama_kategori}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-xs max-w-md">
                      <p className="text-gray-800 leading-relaxed">
                        {tx.keterangan}
                      </p>
                      {tx.pencatat_nama && (
                        <p className="text-[11px] text-gray-500 mt-1">
                          {tx.is_auto_donasi ? "Diverifikasi" : "Dicatat"} oleh:{" "}
                          <span className="font-medium text-gray-700">
                            {tx.pencatat_nama}
                          </span>
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-bold text-sm ${
                          tx.jenis_transaksi === "pemasukan"
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        {tx.jenis_transaksi === "pemasukan" ? "+ " : "- "}
                        {formatRupiah(tx.nominal)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {tx.file_nota && (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewNota({
                                title: `Nota Kas: ${tx.nama_kategori} (${tx.tanggal_transaksi_display})`,
                                path: tx.file_nota!,
                              })
                            }
                            title="Lihat Nota / Bukti"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Nota
                          </button>
                        )}

                        {canManage && !tx.is_auto_donasi && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(tx)}
                              title="Ubah Transaksi Manual"
                              className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-200 cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleDelete(tx)}
                              title="Hapus Transaksi Manual"
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

      {/* Modal Tambah / Edit Transaksi Kas Manual */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem
                  ? "Ubah Transaksi Kas Manual"
                  : "Catat Transaksi Kas Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleJenisSwitch("pemasukan")}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    form.jenis_transaksi === "pemasukan"
                      ? "bg-emerald-700 text-white border-emerald-700"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  + Pemasukan Kas
                </button>
                <button
                  type="button"
                  onClick={() => handleJenisSwitch("pengeluaran")}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    form.jenis_transaksi === "pengeluaran"
                      ? "bg-red-700 text-white border-red-700"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  - Pengeluaran Kas
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-700">
                      Kategori Kas
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewKategoriOpen(!newKategoriOpen)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
                    >
                      <FolderPlus className="w-3 h-3" />
                      Kategori Baru
                    </button>
                  </div>

                  <select
                    required
                    value={form.id_kategori_kas}
                    onChange={(e) =>
                      setForm({ ...form, id_kategori_kas: e.target.value })
                    }
                    className={inputClass}
                  >
                    {activeKategoriOptions.length === 0 ? (
                      <option value="" className="text-gray-900 bg-white">
                        Belum ada kategori ({form.jenis_transaksi})
                      </option>
                    ) : (
                      activeKategoriOptions.map((kat) => (
                        <option
                          key={kat.id_kategori_kas}
                          value={String(kat.id_kategori_kas)}
                          className="text-gray-900 bg-white"
                        >
                          {kat.nama_kategori}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    required
                    value={form.tanggal_transaksi}
                    onChange={(e) =>
                      setForm({ ...form, tanggal_transaksi: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {newKategoriOpen && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex gap-2">
                  <input
                    type="text"
                    placeholder={`Nama kategori ${form.jenis_transaksi} baru...`}
                    value={newKategoriName}
                    onChange={(e) => setNewKategoriName(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleAddKategori}
                    className="px-3.5 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  min={500}
                  step={500}
                  placeholder="Contoh: 250000"
                  value={form.nominal}
                  onChange={(e) =>
                    setForm({ ...form, nominal: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Keterangan / Rincian Penggunaan{" "}
                  <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Pembelian beras 50 kg dan telur 3 tray untuk konsumsi anak panti..."
                  value={form.keterangan}
                  onChange={(e) =>
                    setForm({ ...form, keterangan: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Unggah File Nota / Kwitansi (Opsional — JPG, PNG, WEBP, PDF
                  maks. 5 MB)
                </label>
                <input
                  ref={notaInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  className="w-full text-xs text-gray-700 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-lg p-1.5"
                />
                {editingItem?.file_nota && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Biarkan kosong jika tidak ingin mengganti file nota yang
                    sudah tersimpan.
                  </p>
                )}
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
                  {editingItem ? "Simpan Perubahan" : "Simpan Transaksi Kas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pratinjau Nota / Bukti */}
      {previewNota && (
        <div
          onClick={() => setPreviewNota(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {previewNota.title}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewNota.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Tab Baru
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewNota(null)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center overflow-auto">
              {isPdfFile(previewNota.path) ? (
                <iframe
                  src={previewNota.path}
                  title={previewNota.title}
                  className="w-full h-full rounded-xl border border-gray-300 bg-white"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewNota.path}
                  alt={previewNota.title}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-md bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
