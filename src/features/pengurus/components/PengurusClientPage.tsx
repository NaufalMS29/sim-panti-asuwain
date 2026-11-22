"use client";

import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { AlertBanner, Button, ConfirmModal } from "@/components/ui";
import { PengurusActionResponse, PengurusItem } from "../types/pengurus.types";
import {
  deletePengurusAction,
  resetPengurusPasswordAction,
} from "../actions/pengurus.actions";
import { PengurusFilterBar } from "./PengurusFilterBar";
import { PengurusTable } from "./PengurusTable";
import { PengurusCreateModal } from "./PengurusCreateModal";
import { PengurusEditModal } from "./PengurusEditModal";

interface PengurusClientPageProps {
  initialPengurus: PengurusItem[];
  canResetPassword?: boolean;
}

export function PengurusClientPage({
  initialPengurus,
  canResetPassword = false,
}: PengurusClientPageProps) {
  const [search, setSearch] = useState("");
  const [jabatanFilter, setJabatanFilter] = useState("semua");

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PengurusItem | null>(null);
  const [resetTarget, setResetTarget] = useState<PengurusItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PengurusItem | null>(null);

  const jabatanOptions = useMemo(() => {
    const unique = new Set(initialPengurus.map((p) => p.jabatan.trim()));
    return Array.from(unique).filter(Boolean).sort();
  }, [initialPengurus]);

  const filteredPengurus = initialPengurus.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.nama_pengurus.toLowerCase().includes(q) ||
      item.jabatan.toLowerCase().includes(q) ||
      item.username.toLowerCase().includes(q) ||
      item.no_telepon.toLowerCase().includes(q);
    const matchJabatan =
      jabatanFilter === "semua" || item.jabatan === jabatanFilter;

    return matchSearch && matchJabatan;
  });

  const handleActionResult = (res: PengurusActionResponse) => {
    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const handleConfirmResetPassword = async () => {
    if (!resetTarget) return;

    setLoading(true);
    setBanner(null);
    const res = await resetPengurusPasswordAction(resetTarget.id_pengurus);
    setLoading(false);
    setResetTarget(null);
    handleActionResult(res);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setLoading(true);
    setBanner(null);
    const res = await deletePengurusAction(deleteTarget.id_pengurus);
    setLoading(false);
    setDeleteTarget(null);
    handleActionResult(res);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Data Pengurus Panti
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola profil pengurus, jabatan, kontak, serta akun login staf
            panti.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => setCreateOpen(true)}
        >
          Tambah Pengurus
        </Button>
      </div>

      {banner && (
        <AlertBanner
          type={banner.type}
          message={banner.text}
          onClose={() => setBanner(null)}
        />
      )}

      <PengurusFilterBar
        search={search}
        onSearchChange={setSearch}
        jabatanFilter={jabatanFilter}
        onJabatanFilterChange={setJabatanFilter}
        jabatanOptions={jabatanOptions}
      />

      <PengurusTable
        pengurusList={filteredPengurus}
        loading={loading}
        canResetPassword={canResetPassword}
        onEdit={setEditTarget}
        onResetPassword={setResetTarget}
        onDelete={setDeleteTarget}
      />

      <PengurusCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onResult={handleActionResult}
      />

      <PengurusEditModal
        key={editTarget?.id_pengurus ?? "closed"}
        pengurus={editTarget}
        onClose={() => setEditTarget(null)}
        onResult={handleActionResult}
      />

      <ConfirmModal
        open={Boolean(resetTarget)}
        title="Reset Password Pengurus"
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
                {resetTarget.nama_pengurus}
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
        title="Hapus Data Pengurus"
        variant="danger"
        confirmLabel="Ya, Hapus Pengurus"
        loading={loading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        description={
          deleteTarget && (
            <>
              Menghapus{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.nama_pengurus}
              </span>{" "}
              akan menghapus permanen profil pengurus beserta akun login{" "}
              <span className="font-semibold font-mono text-gray-900">
                {deleteTarget.username}
              </span>
              . Lanjutkan?
            </>
          )
        }
      />
    </div>
  );
}
