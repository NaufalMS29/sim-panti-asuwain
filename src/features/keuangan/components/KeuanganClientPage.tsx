"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Download, Plus } from "lucide-react";
import { Button, ConfirmModal } from "@/components/ui";
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
import { exportKeuanganCsv, formatRupiah } from "../utils/keuangan.utils";
import { KeuanganStatsCards } from "./KeuanganStatsCards";
import {
  KeuanganFilterBar,
  KeuanganJenisFilter,
  KeuanganSumberFilter,
} from "./KeuanganFilterBar";
import { KeuanganTable } from "./KeuanganTable";
import { KeuanganFormModal } from "./KeuanganFormModal";
import { KeuanganNotaPreviewModal } from "./KeuanganNotaPreviewModal";

interface KeuanganClientPageProps {
  initialTransactions: TransaksiKasItem[];
  kategoriOptions: KategoriKasOption[];
  summary: KeuanganSummary;
  canManage: boolean;
}

export function KeuanganClientPage({
  initialTransactions,
  kategoriOptions,
  summary,
  canManage,
}: KeuanganClientPageProps) {
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState<KeuanganJenisFilter>("semua");
  const [sumberFilter, setSumberFilter] =
    useState<KeuanganSumberFilter>("semua");
  const [monthFilter, setMonthFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSeed, setModalSeed] = useState(0);
  const [defaultCreateJenis, setDefaultCreateJenis] =
    useState<JenisKasType>("pengeluaran");
  const [editingItem, setEditingItem] = useState<TransaksiKasItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<TransaksiKasItem | null>(
    null,
  );
  const [previewNota, setPreviewNota] = useState<{
    title: string;
    path: string;
  } | null>(null);

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

  const openCreateModal = (jenis: JenisKasType) => {
    setEditingItem(null);
    setDefaultCreateJenis(jenis);
    setModalSeed((s) => s + 1);
    setModalOpen(true);
  };

  const openEditModal = (item: TransaksiKasItem) => {
    setEditingItem(item);
    setModalSeed((s) => s + 1);
    setModalOpen(true);
  };

  const handleAddKategori = async (
    namaKategori: string,
    jenisKas: JenisKasType,
  ): Promise<boolean> => {
    setLoading(true);
    const res = await createKategoriKasAction(namaKategori, jenisKas);
    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return false;
    }

    setBanner({ type: "success", text: res.message });
    return true;
  };

  const handleSubmitFormData = async (
    fd: FormData,
    editingId?: number,
  ): Promise<boolean> => {
    setLoading(true);
    setBanner(null);

    const res = editingId
      ? await updateTransaksiKasAction(editingId, fd)
      : await createTransaksiKasAction(fd);

    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return false;
    }

    setModalOpen(false);
    setBanner({ type: "success", text: res.message });
    return true;
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteTransaksiKasAction(deleteTarget.id_transaksi_kas);
    setLoading(false);

    setDeleteTarget(null);
    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setJenisFilter("semua");
    setSumberFilter("semua");
    setMonthFilter("");
  };

  return (
    <div className="space-y-6">
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
          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={<Download className="w-4 h-4 text-emerald-700" />}
            onClick={() => exportKeuanganCsv(filteredTransactions)}
            disabled={filteredTransactions.length === 0}
          >
            Ekspor CSV ({filteredTransactions.length})
          </Button>

          {canManage && (
            <>
              <Button
                type="button"
                variant="success"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => openCreateModal("pemasukan")}
              >
                Catat Pemasukan
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => openCreateModal("pengeluaran")}
              >
                Catat Pengeluaran
              </Button>
            </>
          )}
        </div>
      </div>

      <KeuanganStatsCards summary={summary} />

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

      <KeuanganFilterBar
        search={search}
        onSearchChange={setSearch}
        jenisFilter={jenisFilter}
        onJenisFilterChange={setJenisFilter}
        sumberFilter={sumberFilter}
        onSumberFilterChange={setSumberFilter}
        monthFilter={monthFilter}
        onMonthFilterChange={setMonthFilter}
        onResetFilters={handleResetFilters}
      />

      <KeuanganTable
        transactions={filteredTransactions}
        canManage={canManage}
        loading={loading}
        onPreviewNota={setPreviewNota}
        onEdit={openEditModal}
        onDelete={setDeleteTarget}
      />

      <KeuanganFormModal
        key={`kas-form-${editingItem?.id_transaksi_kas ?? defaultCreateJenis}-${modalSeed}`}
        open={modalOpen}
        editingItem={editingItem}
        defaultJenis={defaultCreateJenis}
        kategoriOptions={kategoriOptions}
        loading={loading}
        onClose={() => setModalOpen(false)}
        onAddKategori={handleAddKategori}
        onSubmitFormData={handleSubmitFormData}
      />

      <KeuanganNotaPreviewModal
        key={`nota-preview-${previewNota?.path ?? "none"}`}
        preview={previewNota}
        onClose={() => setPreviewNota(null)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Transaksi Kas Manual"
        variant="danger"
        confirmLabel="Ya, Hapus Transaksi"
        loading={loading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        description={
          deleteTarget && (
            <>
              Hapus transaksi kas kategori{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.nama_kategori}
              </span>{" "}
              sebesar{" "}
              <span className="font-semibold text-gray-900">
                {formatRupiah(deleteTarget.nominal)}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </>
          )
        }
      />
    </div>
  );
}
