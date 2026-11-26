"use client";

import { useMemo, useState } from "react";
import { JadwalKunjunganDTO } from "../types/kunjungan.types";
import { KunjunganStatsCards } from "./KunjunganStatsCards";
import {
  KunjunganFilterBar,
  KunjunganFilterStatus,
} from "./KunjunganFilterBar";
import { KunjunganTable } from "./KunjunganTable";
import { KunjunganVerifyModal } from "./KunjunganVerifyModal";

interface KunjunganClientPageProps {
  initialData: JadwalKunjunganDTO[];
}

export function KunjunganClientPage({ initialData }: KunjunganClientPageProps) {
  const [activeStatus, setActiveStatus] =
    useState<KunjunganFilterStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<JadwalKunjunganDTO | null>(
    null,
  );

  const counts = useMemo(
    () => ({
      all: initialData.length,
      pending: initialData.filter((d) => d.status_kunjungan === "pending")
        .length,
      disetujui: initialData.filter((d) => d.status_kunjungan === "disetujui")
        .length,
      ditolak: initialData.filter((d) => d.status_kunjungan === "ditolak")
        .length,
    }),
    [initialData],
  );

  // Urutan antrian kronologis (FIFO) khusus untuk status pending
  const pendingQueueMap = useMemo(() => {
    const map = new Map<number, number>();
    let order = 1;
    for (const item of initialData) {
      if (item.status_kunjungan === "pending") {
        map.set(item.id_kunjungan, order++);
      }
    }
    return map;
  }, [initialData]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialData.filter((item) => {
      const matchStatus =
        activeStatus === "all" || item.status_kunjungan === activeStatus;
      if (!matchStatus) return false;

      if (!q) return true;
      return (
        item.kode_tiket.toLowerCase().includes(q) ||
        item.nama_pengunjung.toLowerCase().includes(q) ||
        item.email_pengunjung.toLowerCase().includes(q) ||
        (item.instansi_organisasi || "").toLowerCase().includes(q)
      );
    });
  }, [initialData, activeStatus, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Jadwal Kunjungan Tamu
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelola antrian permohonan kunjungan dan kirim e-tiket konfirmasi ke
          email pengunjung.
        </p>
      </div>

      <KunjunganStatsCards data={initialData} />

      <KunjunganFilterBar
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
      />

      <KunjunganTable
        items={filteredItems}
        pendingQueueMap={pendingQueueMap}
        onSelectVerify={setSelectedItem}
      />

      <KunjunganVerifyModal
        key={selectedItem?.id_kunjungan ?? "closed"}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
