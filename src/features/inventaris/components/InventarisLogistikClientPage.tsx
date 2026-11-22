"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  CheckCircle2,
  PackageOpen,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui";
import {
  InventarisBarangFormInput,
  LogistikKeluarFormInput,
  LogistikMasukFormInput,
} from "../schemas/inventaris.schema";
import {
  InventarisBarangItem,
  InventarisLogistikSummary,
  LogistikHabisPakaiItem,
  LogistikKeluarItem,
  LogistikMasukItem,
} from "../types/inventaris.types";
import {
  createInventarisBarangAction,
  createLogistikKeluarAction,
  createLogistikMasukAction,
  deleteInventarisBarangAction,
  deleteLogistikKeluarAction,
  deleteLogistikMasukAction,
  updateInventarisBarangAction,
} from "../actions/inventaris.actions";
import { LOW_STOCK_THRESHOLD } from "../utils/inventaris.utils";
import { InventarisStatsCards } from "./InventarisStatsCards";
import { InventarisTabSection } from "./inventaris/InventarisTabSection";
import { InventarisFormModal } from "./inventaris/InventarisFormModal";
import { LogistikStokAlertBanner } from "./logistik/LogistikStokAlertBanner";
import {
  LogistikStatusStokFilter,
  LogistikTabSection,
} from "./logistik/LogistikTabSection";
import { LogistikMasukModal } from "./logistik/LogistikMasukModal";
import { LogistikKeluarModal } from "./logistik/LogistikKeluarModal";

interface InventarisLogistikClientPageProps {
  initialInventaris: InventarisBarangItem[];
  initialLogistik: LogistikHabisPakaiItem[];
  initialLogistikMasuk: LogistikMasukItem[];
  initialLogistikKeluar: LogistikKeluarItem[];
  summary: InventarisLogistikSummary;
  canManage: boolean;
}

type DeleteConfirmState =
  | { type: "inventaris"; item: InventarisBarangItem }
  | { type: "masuk"; item: LogistikMasukItem }
  | { type: "keluar"; item: LogistikKeluarItem }
  | null;

export function InventarisLogistikClientPage({
  initialInventaris,
  initialLogistik,
  initialLogistikMasuk,
  initialLogistikKeluar,
  summary,
  canManage,
}: InventarisLogistikClientPageProps) {
  const [activeTab, setActiveTab] = useState<"inventaris" | "logistik">(
    "inventaris",
  );
  const [statusStokFilter, setStatusStokFilter] =
    useState<LogistikStatusStokFilter>("semua");

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "warning" | "error";
    text: string;
  } | null>(null);

  // Modal Inventaris
  const [invModalOpen, setInvModalOpen] = useState(false);
  const [invModalSeed, setInvModalSeed] = useState(0);
  const [editingInventaris, setEditingInventaris] =
    useState<InventarisBarangItem | null>(null);

  // Modal Logistik Masuk & Keluar
  const [masukModalOpen, setMasukModalOpen] = useState(false);
  const [masukSeed, setMasukSeed] = useState(0);
  const [preselectedMasukId, setPreselectedMasukId] = useState<number | null>(
    null,
  );

  const [keluarModalOpen, setKeluarModalOpen] = useState(false);
  const [keluarSeed, setKeluarSeed] = useState(0);
  const [preselectedKeluarId, setPreselectedKeluarId] = useState<number | null>(
    null,
  );

  // Modal Konfirmasi Hapus
  const [deleteTarget, setDeleteTarget] = useState<DeleteConfirmState>(null);

  const criticalStockCount = summary.stokHabisCount + summary.stokMenipisCount;

  const openMasukModal = (id?: number) => {
    setPreselectedMasukId(id ?? null);
    setMasukSeed((s) => s + 1);
    setMasukModalOpen(true);
  };

  const handleNavigateToCriticalStock = (filter: "habis" | "menipis") => {
    setActiveTab("logistik");
    setStatusStokFilter(filter);
  };

  const handleSaveInventaris = async (
    input: InventarisBarangFormInput,
  ): Promise<boolean> => {
    setLoading(true);
    setBanner(null);

    const res = editingInventaris
      ? await updateInventarisBarangAction(
          editingInventaris.id_inventaris,
          input,
        )
      : await createInventarisBarangAction(input);

    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return false;
    }

    setInvModalOpen(false);
    setBanner({ type: "success", text: res.message });
    return true;
  };

  const handleSaveLogistikMasuk = async (
    input: LogistikMasukFormInput,
  ): Promise<boolean> => {
    setLoading(true);
    setBanner(null);

    const res = await createLogistikMasukAction(input);
    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return false;
    }

    setMasukModalOpen(false);
    setBanner({ type: "success", text: res.message });
    return true;
  };

  const handleSaveLogistikKeluar = async (
    input: LogistikKeluarFormInput,
  ): Promise<boolean> => {
    setLoading(true);
    setBanner(null);

    const targetItem = initialLogistik.find(
      (i) => i.id_logistik === input.id_logistik,
    );

    const res = await createLogistikKeluarAction(input);
    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return false;
    }

    setKeluarModalOpen(false);

    if (targetItem) {
      const remaining = targetItem.stok_jumlah - input.jumlah_keluar;
      if (remaining <= 0) {
        setBanner({
          type: "warning",
          text: `${res.message} Peringatan: Stok "${targetItem.nama_barang}" sekarang HABIS (0 ${targetItem.satuan})! Segera lakukan pengisian ulang.`,
        });
        return true;
      }
      if (remaining <= LOW_STOCK_THRESHOLD) {
        setBanner({
          type: "warning",
          text: `${res.message} Perhatian: Stok "${targetItem.nama_barang}" mulai menipis (tersisa ${remaining} ${targetItem.satuan}).`,
        });
        return true;
      }
    }

    setBanner({ type: "success", text: res.message });
    return true;
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setLoading(true);
    setBanner(null);

    const res =
      deleteTarget.type === "inventaris"
        ? await deleteInventarisBarangAction(deleteTarget.item.id_inventaris)
        : deleteTarget.type === "masuk"
          ? await deleteLogistikMasukAction(deleteTarget.item.id_logistik_masuk)
          : await deleteLogistikKeluarAction(
              deleteTarget.item.id_logistik_keluar,
            );

    setLoading(false);
    setDeleteTarget(null);
    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Inventaris Aset & Logistik Panti
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola aset tetap, stok barang habis pakai, mutasi pemakaian harian,
          serta penerimaan otomatis dari donasi barang terverifikasi.
        </p>
      </div>

      <InventarisStatsCards summary={summary} />

      {/* Alert Otomatis Stok Habis / Menipis */}
      <LogistikStokAlertBanner
        logistikList={initialLogistik}
        canManage={canManage}
        onQuickRestock={(id) => openMasukModal(id)}
        onNavigateToCriticalStock={handleNavigateToCriticalStock}
      />

      {banner && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
            banner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : banner.type === "warning"
                ? "bg-amber-50 border-amber-300 text-amber-900"
                : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {banner.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : banner.type === "warning" ? (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{banner.text}</span>
        </div>
      )}

      {/* Tab Navigasi Utama */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("inventaris")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition cursor-pointer ${
            activeTab === "inventaris"
              ? "bg-blue-700 text-white border-blue-700 shadow-2xs"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Archive className="w-4 h-4" />
          Inventaris Aset Tetap ({initialInventaris.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("logistik")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition cursor-pointer ${
            activeTab === "logistik"
              ? "bg-blue-700 text-white border-blue-700 shadow-2xs"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <PackageOpen className="w-4 h-4" />
          Logistik Habis Pakai & Kartu Stok ({initialLogistik.length})
          {criticalStockCount > 0 && (
            <span
              className={`ml-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                summary.stokHabisCount > 0
                  ? "bg-red-600 text-white"
                  : "bg-amber-500 text-white"
              }`}
            >
              {criticalStockCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "inventaris" ? (
        <InventarisTabSection
          items={initialInventaris}
          canManage={canManage}
          loading={loading}
          onOpenCreate={() => {
            setEditingInventaris(null);
            setInvModalSeed((s) => s + 1);
            setInvModalOpen(true);
          }}
          onOpenEdit={(item) => {
            setEditingInventaris(item);
            setInvModalSeed((s) => s + 1);
            setInvModalOpen(true);
          }}
          onRequestDelete={(item) =>
            setDeleteTarget({ type: "inventaris", item })
          }
        />
      ) : (
        <LogistikTabSection
          logistikList={initialLogistik}
          logistikMasukList={initialLogistikMasuk}
          logistikKeluarList={initialLogistikKeluar}
          statusStokFilter={statusStokFilter}
          onStatusStokFilterChange={setStatusStokFilter}
          canManage={canManage}
          loading={loading}
          onOpenMasuk={openMasukModal}
          onOpenKeluar={(id) => {
            setPreselectedKeluarId(id ?? null);
            setKeluarSeed((s) => s + 1);
            setKeluarModalOpen(true);
          }}
          onRequestDeleteMasuk={(item) =>
            setDeleteTarget({ type: "masuk", item })
          }
          onRequestDeleteKeluar={(item) =>
            setDeleteTarget({ type: "keluar", item })
          }
        />
      )}

      <InventarisFormModal
        key={`inv-modal-${editingInventaris?.id_inventaris ?? "new"}-${invModalSeed}`}
        open={invModalOpen}
        editingItem={editingInventaris}
        loading={loading}
        onClose={() => setInvModalOpen(false)}
        onSubmitForm={handleSaveInventaris}
      />

      <LogistikMasukModal
        key={`log-masuk-${preselectedMasukId ?? "all"}-${masukSeed}`}
        open={masukModalOpen}
        logistikList={initialLogistik}
        preselectedLogistikId={preselectedMasukId}
        loading={loading}
        onClose={() => setMasukModalOpen(false)}
        onSubmitForm={handleSaveLogistikMasuk}
      />

      <LogistikKeluarModal
        key={`log-keluar-${preselectedKeluarId ?? "all"}-${keluarSeed}`}
        open={keluarModalOpen}
        logistikList={initialLogistik}
        preselectedLogistikId={preselectedKeluarId}
        loading={loading}
        onClose={() => setKeluarModalOpen(false)}
        onSubmitForm={handleSaveLogistikKeluar}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={
          deleteTarget?.type === "inventaris"
            ? "Hapus Aset Inventaris"
            : deleteTarget?.type === "masuk"
              ? "Hapus Riwayat Barang Masuk"
              : "Batalkan Pemakaian Logistik"
        }
        variant="danger"
        confirmLabel="Ya, Lanjutkan"
        loading={loading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        description={
          deleteTarget?.type === "inventaris" ? (
            <>
              Hapus aset{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.item.nama_barang}
              </span>{" "}
              (
              <span className="font-mono">
                {deleteTarget.item.kode_inventaris}
              </span>
              ) secara permanen?
            </>
          ) : deleteTarget?.type === "masuk" ? (
            <>
              Hapus riwayat masuk{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.item.nama_barang} (+
                {deleteTarget.item.jumlah_masuk} {deleteTarget.item.satuan})
              </span>
              ? Saldo stok di gudang akan otomatis dikurangi kembali.
            </>
          ) : deleteTarget?.type === "keluar" ? (
            <>
              Batalkan pemakaian{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.item.nama_barang} (-
                {deleteTarget.item.jumlah_keluar} {deleteTarget.item.satuan})
              </span>
              ? Stok gudang akan otomatis bertambah kembali.
            </>
          ) : null
        }
      />
    </div>
  );
}
