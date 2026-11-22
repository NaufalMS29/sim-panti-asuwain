"use client";

import { useState } from "react";
import { Plus, Download } from "lucide-react";
import { can } from "@/lib/rbac";
import { AlertBanner, Button, ConfirmModal } from "@/components/ui";
import { RoleName } from "@/features/auth/types/auth.types";
import {
  AnakPantiActionResponse,
  AnakPantiItem,
} from "../types/anak-panti.types";
import {
  deleteAnakPantiAction,
  resetAnakPantiPasswordAction,
} from "../actions/anak-panti.actions";
import {
  exportAnakPantiToCsv,
  isBerkasUtamaLengkap,
} from "../utils/anak-panti.utils";
import {
  AnakPantiStatsCards,
  KepengasuhanFilterType,
} from "./AnakPantiStatsCards";
import { AnakPantiFilterBar, BerkasFilterType } from "./AnakPantiFilterBar";
import { AnakPantiTable } from "./AnakPantiTable";
import { AnakPantiFormModal } from "./AnakPantiFormModal";

interface AnakPantiClientPageProps {
  initialData: AnakPantiItem[];
  currentRole: RoleName;
  jenisKelaminOptions: string[];
  statusAnakOptions: string[];
}

export function AnakPantiClientPage({
  initialData,
  currentRole,
  jenisKelaminOptions,
  statusAnakOptions,
}: AnakPantiClientPageProps) {
  const [search, setSearch] = useState("");
  const [kepengasuhanFilter, setKepengasuhanFilter] =
    useState<KepengasuhanFilterType>("semua");
  const [kategoriSosialFilter, setKategoriSosialFilter] =
    useState<string>("semua");
  const [berkasFilter, setBerkasFilter] = useState<BerkasFilterType>("semua");

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnakPantiItem | null>(null);
  const [resetTarget, setResetTarget] = useState<AnakPantiItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnakPantiItem | null>(null);

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const canCreate = can(currentRole, "anak_panti:create");
  const canUpdate = can(currentRole, "anak_panti:update");
  const canResetPassword = can(currentRole, "users:manage");
  const canDelete = can(currentRole, "anak_panti:delete");

  const aktifCount = initialData.filter((item) => !item.is_alumni).length;
  const alumniCount = initialData.filter((item) => item.is_alumni).length;
  const berkasLengkapCount = initialData.filter(isBerkasUtamaLengkap).length;

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

    const lengkap = isBerkasUtamaLengkap(item);
    const matchBerkas =
      berkasFilter === "semua" ||
      (berkasFilter === "lengkap" && lengkap) ||
      (berkasFilter === "belum_lengkap" && !lengkap);

    return matchSearch && matchKepengasuhan && matchKategori && matchBerkas;
  });

  const handleExportCsv = () => {
    if (filteredData.length === 0) {
      setBanner({
        type: "error",
        text: "Tidak ada data anak panti untuk diekspor sesuai filter saat ini.",
      });
      return;
    }

    exportAnakPantiToCsv(filteredData);
    setBanner({
      type: "success",
      text: `Berhasil mengunduh rekapitulasi CSV (${filteredData.length} data anak panti).`,
    });
  };

  const handleActionResult = (res: AnakPantiActionResponse) => {
    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const handleConfirmResetPassword = async () => {
    if (!resetTarget) return;

    setLoading(true);
    setBanner(null);
    const res = await resetAnakPantiPasswordAction(resetTarget.id_anak);
    setLoading(false);
    setResetTarget(null);
    handleActionResult(res);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteAnakPantiAction(deleteTarget.id_anak);
    setLoading(false);
    setDeleteTarget(null);
    handleActionResult(res);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Anak Panti</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola biodata anak asuh, pantau status kepengasuhan aktif maupun
            alumni, serta cek kelengkapan berkas utama.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            disabled={filteredData.length === 0}
            title="Unduh rekapitulasi biodata dan kelengkapan berkas dalam format CSV"
            icon={<Download className="w-4 h-4 text-emerald-700" />}
            onClick={handleExportCsv}
          >
            Ekspor CSV ({filteredData.length})
          </Button>

          {canCreate && (
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingItem(null);
                setFormOpen(true);
              }}
            >
              Tambah Data Anak
            </Button>
          )}
        </div>
      </div>

      <AnakPantiStatsCards
        totalCount={initialData.length}
        aktifCount={aktifCount}
        alumniCount={alumniCount}
        berkasLengkapCount={berkasLengkapCount}
        kepengasuhanFilter={kepengasuhanFilter}
        berkasFilter={berkasFilter}
        onSelectKepengasuhan={setKepengasuhanFilter}
        onSelectBerkas={setBerkasFilter}
        onResetAll={() => {
          setKepengasuhanFilter("semua");
          setBerkasFilter("semua");
        }}
      />

      {banner && (
        <AlertBanner
          type={banner.type}
          message={banner.text}
          onClose={() => setBanner(null)}
        />
      )}

      <AnakPantiFilterBar
        search={search}
        onSearchChange={setSearch}
        kepengasuhanFilter={kepengasuhanFilter}
        onKepengasuhanFilterChange={setKepengasuhanFilter}
        kategoriSosialFilter={kategoriSosialFilter}
        onKategoriSosialFilterChange={setKategoriSosialFilter}
        berkasFilter={berkasFilter}
        onBerkasFilterChange={setBerkasFilter}
        statusAnakOptions={statusAnakOptions}
        totalCount={initialData.length}
        aktifCount={aktifCount}
        alumniCount={alumniCount}
        berkasLengkapCount={berkasLengkapCount}
      />

      <AnakPantiTable
        data={filteredData}
        loading={loading}
        canUpdate={canUpdate}
        canResetPassword={canResetPassword}
        canDelete={canDelete}
        onEdit={(item) => {
          setEditingItem(item);
          setFormOpen(true);
        }}
        onResetPassword={setResetTarget}
        onDelete={setDeleteTarget}
      />

      <AnakPantiFormModal
        key={editingItem ? `edit-${editingItem.id_anak}` : "create"}
        open={formOpen}
        editingItem={editingItem}
        jenisKelaminOptions={jenisKelaminOptions}
        statusAnakOptions={statusAnakOptions}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onResult={handleActionResult}
      />

      <ConfirmModal
        open={Boolean(resetTarget)}
        title="Reset Password Akun Anak"
        variant="primary"
        confirmLabel="Ya, Reset Password"
        loading={loading}
        onClose={() => setResetTarget(null)}
        onConfirm={handleConfirmResetPassword}
        description={
          resetTarget && (
            <>
              Reset password akun{" "}
              <span className="font-semibold font-mono text-gray-900">
                {resetTarget.username}
              </span>{" "}
              milik{" "}
              <span className="font-semibold text-gray-900">
                {resetTarget.nama_anak}
              </span>{" "}
              kembali ke password default{" "}
              <span className="font-semibold font-mono text-blue-700">
                asuwain123
              </span>
              ?
            </>
          )
        }
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Data Anak Panti"
        variant="danger"
        confirmLabel="Ya, Hapus Data"
        loading={loading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        description={
          deleteTarget && (
            <>
              Hapus data anak{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.nama_anak}
              </span>{" "}
              beserta seluruh berkas dokumen dan akun loginnya secara permanen?
              Tindakan ini tidak dapat dibatalkan.
            </>
          )
        }
      />
    </div>
  );
}
