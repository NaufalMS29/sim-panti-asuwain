"use client";

import { CalendarDays, Clock, CheckCircle2, XCircle } from "lucide-react";
import { JadwalKunjunganDTO } from "../types/kunjungan.types";

interface KunjunganStatsCardsProps {
  data: JadwalKunjunganDTO[];
}

export function KunjunganStatsCards({ data }: KunjunganStatsCardsProps) {
  const totalCount = data.length;
  const pendingCount = data.filter(
    (item) => item.status_kunjungan === "pending",
  ).length;
  const approvedCount = data.filter(
    (item) => item.status_kunjungan === "disetujui",
  ).length;
  const rejectedCount = data.filter(
    (item) => item.status_kunjungan === "ditolak",
  ).length;

  const cards = [
    {
      label: "Total Pengajuan",
      value: totalCount,
      icon: CalendarDays,
      iconBg: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Menunggu Verifikasi",
      value: pendingCount,
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Jadwal Disetujui",
      value: approvedCount,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Ditolak",
      value: rejectedCount,
      icon: XCircle,
      iconBg: "bg-red-50 text-red-700 border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs"
          >
            <div>
              <p className="text-xs font-medium text-gray-500">{card.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
            <div className={`rounded-xl border p-3 ${card.iconBg}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
