"use client";

import { useState } from "react";
import Link from "next/link";
import { DonasiAdminTable } from "./DonasiAdminTable";
import { Button, ConfirmModal } from "@/components/ui";
import { DonasiAdminStatsCards } from "./DonasiAdminStatsCards";
import { DonasiOfflineFormModal } from "./DonasiOfflineFormModal";
import { exportDonasiTransactionsCsv } from "../../utils/donasi.utils";
import { DonasiInspectVerifyModal } from "./DonasiInspectVerifyModal";
import { DonasiTransactionItem, DonaturItem } from "../../types/donasi.types";
import { AlertCircle, CheckCircle2, Download, Plus, Users } from "lucide-react";
import {
  verifyDonasiAction,
  submitDonasiUangAction,
  submitDonasiBarangAction,
  deleteDonasiAction,
} from "../../actions/donasi.actions";
import {
  DonasiAdminFilterBar,
  DonasiJenisFilter,
  DonasiStatusFilter,
} from "./DonasiAdminFilterBar";

interface DonasiAdminClientPageProps {
  initialTransactions: DonasiTransactionItem[];
  donaturOptions: DonaturItem[];
  canCreate: boolean;
  canVerify: boolean;
  canDelete: boolean;
}

export function DonasiAdminClientPage({
  initialTransactions,
  donaturOptions,
  canCreate,
  canVerify,
  canDelete,
}: DonasiAdminClientPageProps) {
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState<DonasiJenisFilter>("semua");
  const [statusFilter, setStatusFilter] = useState<DonasiStatusFilter>("semua");

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [inspectTx, setInspectTx] = useState<DonasiTransactionItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    useState<DonasiTransactionItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalSeed, setCreateModalSeed] = useState(0);

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
    setBanner({ type: "success", text: res.message });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteDonasiAction(deleteTarget.id_donasi);
    setLoading(false);

    setDeleteTarget(null);
    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const handleCreateOfflineSubmit = async (
    createType: "uang" | "barang",
    fd: FormData,
  ): Promise<boolean> => {
    setLoading(true);
    setBanner(null);

    const res =
      createType === "uang"
        ? await submitDonasiUangAction(fd)
        : await submitDonasiBarangAction(fd);

    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return false;
    }

    setCreateModalOpen(false);
    setBanner({
      type: "success",
      text: res.message,
    });
    return true;
  };

  return (
    <div className="space-y-6">
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

          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={<Download className="w-4 h-4 text-emerald-700" />}
            onClick={() => exportDonasiTransactionsCsv(filteredTransactions)}
            disabled={filteredTransactions.length === 0}
          >
            Ekspor CSV ({filteredTransactions.length})
          </Button>

          {canCreate && (
            <Button
              type="button"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setCreateModalSeed((s) => s + 1);
                setCreateModalOpen(true);
              }}
            >
              Catat Donasi Langsung
            </Button>
          )}
        </div>
      </div>

      <DonasiAdminStatsCards
        totalUangTerverifikasi={totalUangTerverifikasi}
        pendingCount={pendingCount}
        barangTerverifikasiCount={barangTerverifikasiCount}
        isPendingFilterActive={statusFilter === "pending"}
        onTogglePendingFilter={() =>
          setStatusFilter(statusFilter === "pending" ? "semua" : "pending")
        }
      />

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

      <DonasiAdminFilterBar
        search={search}
        onSearchChange={setSearch}
        jenisFilter={jenisFilter}
        onJenisFilterChange={setJenisFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        pendingCount={pendingCount}
      />

      <DonasiAdminTable
        transactions={filteredTransactions}
        canVerify={canVerify}
        canDelete={canDelete}
        loading={loading}
        onInspect={setInspectTx}
        onDelete={(tx) => setDeleteTarget(tx)}
      />

      <DonasiInspectVerifyModal
        key={`inspect-${inspectTx?.id_donasi ?? "none"}`}
        transaction={inspectTx}
        canVerify={canVerify}
        loading={loading}
        onClose={() => setInspectTx(null)}
        onVerifyDecision={handleVerifyDecision}
      />

      <DonasiOfflineFormModal
        key={`offline-${createModalSeed}`}
        open={createModalOpen}
        donaturOptions={donaturOptions}
        loading={loading}
        onClose={() => setCreateModalOpen(false)}
        onSubmitFormData={handleCreateOfflineSubmit}
      />

      {/* Modal Konfirmasi Hapus Donasi */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Transaksi Donasi"
        variant="danger"
        confirmLabel="Ya, Hapus Permanen"
        loading={loading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        description={
          deleteTarget && (
            <>
              Hapus transaksi donasi dengan kode{" "}
              <span className="font-mono font-bold text-blue-700">
                {deleteTarget.kode_donasi}
              </span>{" "}
              dari pengirim{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.nama_pengirim}
              </span>{" "}
              secara permanen? Tindakan ini tidak dapat dibatalkan.
            </>
          )
        }
      />
    </div>
  );
}
