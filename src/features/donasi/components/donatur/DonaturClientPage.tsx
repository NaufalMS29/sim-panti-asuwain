"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Plus } from "lucide-react";
import { Button, ConfirmModal } from "@/components/ui";
import { DonaturFormInput } from "../../schemas/donasi.schema";
import { DonaturItem } from "../../types/donasi.types";
import {
  createDonaturAction,
  deleteDonaturAction,
  updateDonaturAction,
} from "../../actions/donasi.actions";
import { DonaturFilterBar } from "./DonaturFilterBar";
import { DonaturTable } from "./DonaturTable";
import { DonaturFormModal } from "./DonaturFormModal";

interface DonaturClientPageProps {
  initialDonatur: DonaturItem[];
  tipeDonaturOptions: string[];
  canManage: boolean;
}

export function DonaturClientPage({
  initialDonatur,
  tipeDonaturOptions,
  canManage,
}: DonaturClientPageProps) {
  const [search, setSearch] = useState("");
  const [tipeFilter, setTipeFilter] = useState<string>("semua");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSeed, setModalSeed] = useState(0);
  const [editingItem, setEditingItem] = useState<DonaturItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DonaturItem | null>(null);

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
    setModalSeed((s) => s + 1);
    setModalOpen(true);
  };

  const openEditModal = (item: DonaturItem) => {
    setEditingItem(item);
    setModalSeed((s) => s + 1);
    setModalOpen(true);
  };

  const handleSubmitForm = async (form: DonaturFormInput) => {
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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteDonaturAction(deleteTarget.id_donatur);
    setLoading(false);

    setDeleteTarget(null);
    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

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
            <Button
              type="button"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={openCreateModal}
            >
              Tambah Donatur
            </Button>
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

      <DonaturFilterBar
        search={search}
        onSearchChange={setSearch}
        tipeFilter={tipeFilter}
        onTipeFilterChange={setTipeFilter}
        tipeDonaturOptions={tipeDonaturOptions}
      />

      <DonaturTable
        donaturList={filteredData}
        canManage={canManage}
        onEdit={openEditModal}
        onDelete={(item) => setDeleteTarget(item)}
      />

      <DonaturFormModal
        key={`${editingItem?.id_donatur ?? "new"}-${modalSeed}`}
        open={modalOpen}
        editingItem={editingItem}
        tipeDonaturOptions={tipeDonaturOptions}
        loading={loading}
        onClose={() => setModalOpen(false)}
        onSubmitForm={handleSubmitForm}
      />

      {/* Modal Konfirmasi Hapus Donatur */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Data Donatur"
        variant="danger"
        confirmLabel="Ya, Hapus Donatur"
        loading={loading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        description={
          deleteTarget && (
            <>
              Hapus data donatur{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.nama_donatur}
              </span>
              ? Riwayat donasi sebelumnya akan tetap tersimpan aman tanpa tautan
              akun donatur.
            </>
          )
        }
      />
    </div>
  );
}
