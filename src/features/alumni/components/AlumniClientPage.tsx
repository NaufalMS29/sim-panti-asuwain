"use client";

import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { AlertBanner, Button, ConfirmModal } from "@/components/ui";
import {
  AlumniActionResponse,
  AlumniListItem,
  EligibleAnakOption,
} from "../types/alumni.types";
import { deleteAlumniAction } from "../actions/alumni.actions";
import { exportAlumniToCsv } from "../utils/alumni.utils";
import { AlumniStatsCards } from "./AlumniStatsCards";
import { AktivitasFilterType, AlumniFilterBar } from "./AlumniFilterBar";
import { AlumniTable } from "./AlumniTable";
import { AlumniFormModal } from "./AlumniFormModal";

interface AlumniClientPageProps {
  initialAlumni: AlumniListItem[];
  eligibleAnak: EligibleAnakOption[];
  canManage: boolean;
}

export function AlumniClientPage({
  initialAlumni = [],
  eligibleAnak = [],
  canManage,
}: AlumniClientPageProps) {
  const [search, setSearch] = useState("");
  const [tahunFilter, setTahunFilter] = useState<string>("semua");
  const [aktivitasFilter, setAktivitasFilter] =
    useState<AktivitasFilterType>("semua");

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AlumniListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AlumniListItem | null>(null);

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const tahunLulusList = useMemo(() => {
    return Array.from(
      new Set(initialAlumni.map((item) => item.tahun_lulus)),
    ).sort((a, b) => b - a);
  }, [initialAlumni]);

  const aktivitasTerdataCount = initialAlumni.filter((item) =>
    Boolean(item.pekerjaan_sekarang?.trim()),
  ).length;

  const latestCohortYear = tahunLulusList[0] ?? null;
  const latestCohortCount = latestCohortYear
    ? initialAlumni.filter((item) => item.tahun_lulus === latestCohortYear)
        .length
    : 0;

  const filteredData = initialAlumni.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.nama_anak.toLowerCase().includes(q) ||
      (item.nik || "").toLowerCase().includes(q) ||
      (item.pekerjaan_sekarang || "").toLowerCase().includes(q) ||
      (item.kontak || "").toLowerCase().includes(q) ||
      (item.alamat_sekarang || "").toLowerCase().includes(q) ||
      String(item.tahun_lulus).includes(q);

    const matchTahun =
      tahunFilter === "semua" || String(item.tahun_lulus) === tahunFilter;

    const hasAktivitas = Boolean(item.pekerjaan_sekarang?.trim());
    const matchAktivitas =
      aktivitasFilter === "semua" ||
      (aktivitasFilter === "terdata" && hasAktivitas) ||
      (aktivitasFilter === "belum_terdata" && !hasAktivitas);

    return matchSearch && matchTahun && matchAktivitas;
  });

  const handleExportCsv = () => {
    if (filteredData.length === 0) {
      setBanner({
        type: "error",
        text: "Tidak ada data alumni untuk diekspor sesuai filter saat ini.",
      });
      return;
    }

    exportAlumniToCsv(filteredData);
    setBanner({
      type: "success",
      text: `Berhasil mengunduh rekapitulasi direktori alumni (${filteredData.length} lulusan).`,
    });
  };

  const handleActionResult = (res: AlumniActionResponse) => {
    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteAlumniAction(deleteTarget.id_alumni);
    setLoading(false);
    setDeleteTarget(null);
    handleActionResult(res);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Alumni</h1>
          <p className="text-sm text-gray-500 mt-1">
            Direktori lulusan panti asuhan beserta jejak pekerjaan dan kontak
            domisili terkini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            disabled={filteredData.length === 0}
            title="Unduh rekapitulasi direktori lulusan panti asuhan dalam format CSV"
            icon={<Download className="w-4 h-4 text-emerald-700" />}
            onClick={handleExportCsv}
          >
            Ekspor CSV ({filteredData.length})
          </Button>

          {canManage && (
            <Button
              variant="primary"
              size="md"
              disabled={eligibleAnak.length === 0}
              title={
                eligibleAnak.length === 0
                  ? "Seluruh anak terdata sudah berstatus alumni"
                  : "Catat lulusan baru dari daftar anak asuh aktif"
              }
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingItem(null);
                setFormOpen(true);
              }}
            >
              Catat Alumni
            </Button>
          )}
        </div>
      </div>

      <AlumniStatsCards
        totalCount={initialAlumni.length}
        aktivitasTerdataCount={aktivitasTerdataCount}
        latestCohortYear={latestCohortYear}
        latestCohortCount={latestCohortCount}
        tahunFilter={tahunFilter}
        aktivitasFilter={aktivitasFilter}
        onSelectAktivitas={setAktivitasFilter}
        onSelectTahun={setTahunFilter}
        onResetAll={() => {
          setTahunFilter("semua");
          setAktivitasFilter("semua");
        }}
      />

      {banner && (
        <AlertBanner
          type={banner.type}
          message={banner.text}
          onClose={() => setBanner(null)}
        />
      )}

      <AlumniFilterBar
        search={search}
        onSearchChange={setSearch}
        tahunFilter={tahunFilter}
        onTahunFilterChange={setTahunFilter}
        aktivitasFilter={aktivitasFilter}
        onAktivitasFilterChange={setAktivitasFilter}
        tahunLulusList={tahunLulusList}
        totalCount={initialAlumni.length}
        aktivitasTerdataCount={aktivitasTerdataCount}
      />

      <AlumniTable
        data={filteredData}
        loading={loading}
        canManage={canManage}
        onEdit={(item) => {
          setEditingItem(item);
          setFormOpen(true);
        }}
        onDelete={setDeleteTarget}
      />

      <AlumniFormModal
        key={editingItem ? `edit-${editingItem.id_alumni}` : "create"}
        open={formOpen}
        editingItem={editingItem}
        eligibleAnak={eligibleAnak}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onResult={handleActionResult}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Status Alumni"
        variant="danger"
        confirmLabel="Ya, Hapus Status"
        loading={loading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        description={
          deleteTarget && (
            <>
              Hapus{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.nama_anak}
              </span>{" "}
              dari daftar alumni dan kembalikan statusnya menjadi{" "}
              <span className="font-semibold text-gray-900">
                Anak Asuh Aktif
              </span>
              ?
            </>
          )
        }
      />
    </div>
  );
}
