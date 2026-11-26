"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  Phone,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyTableRow } from "@/components/ui/EmptyTableRow";
import { JadwalKunjunganDTO } from "../types/kunjungan.types";

interface KunjunganTableProps {
  items: JadwalKunjunganDTO[];
  pendingQueueMap: Map<number, number>;
  onSelectVerify: (item: JadwalKunjunganDTO) => void;
}

export function KunjunganTable({
  items,
  pendingQueueMap,
  onSelectVerify,
}: KunjunganTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold tracking-wider text-gray-600 uppercase">
            <tr>
              <th className="px-4 py-3.5">Tiket & Antrian</th>
              <th className="px-4 py-3.5">Pengunjung</th>
              <th className="px-4 py-3.5">Jadwal & Rombongan</th>
              <th className="px-4 py-3.5">Tujuan Kunjungan</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <EmptyTableRow
                colSpan={6}
                message="Belum ada data jadwal kunjungan yang sesuai dengan filter."
              />
            ) : (
              items.map((item) => {
                const queueNumber = pendingQueueMap.get(item.id_kunjungan);

                return (
                  <tr
                    key={item.id_kunjungan}
                    className="transition hover:bg-gray-50/80"
                  >
                    <td className="px-4 py-3.5 align-top">
                      <span className="font-mono text-xs font-bold text-blue-700">
                        {item.kode_tiket}
                      </span>

                      {queueNumber !== undefined && (
                        <p className="mt-1 text-[11px] font-medium text-gray-500">
                          Antrian #{queueNumber}
                        </p>
                      )}

                      {item.has_slot_conflict && (
                        <div className="mt-1.5">
                          <Badge
                            variant="amber"
                            icon={<AlertTriangle className="h-3 w-3" />}
                          >
                            Jadwal Bersamaan
                          </Badge>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 align-top">
                      <p className="font-semibold text-gray-900">
                        {item.nama_pengunjung}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.instansi_organisasi || "Perorangan / Keluarga"}
                      </p>
                      <div className="mt-1.5 space-y-0.5 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span className="truncate">
                            {item.email_pengunjung}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span>{item.no_telepon}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-top">
                      <p className="font-semibold text-gray-900">
                        {item.tanggal_rencana}
                      </p>
                      <p className="text-xs text-gray-600">
                        Pukul {item.jam_rencana} WIB
                      </p>
                      <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-gray-700">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span>{item.jumlah_rombongan} orang</span>
                      </div>
                    </td>

                    <td className="max-w-xs px-4 py-3.5 align-top text-xs leading-relaxed text-gray-700">
                      <p className="line-clamp-3">{item.tujuan_kunjungan}</p>
                    </td>

                    <td className="px-4 py-3.5 align-top">
                      {item.status_kunjungan === "pending" && (
                        <Badge
                          variant="amber"
                          icon={<Clock className="h-3 w-3" />}
                        >
                          Pending
                        </Badge>
                      )}
                      {item.status_kunjungan === "disetujui" && (
                        <Badge
                          variant="emerald"
                          icon={<CheckCircle2 className="h-3 w-3" />}
                        >
                          Disetujui
                        </Badge>
                      )}
                      {item.status_kunjungan === "ditolak" && (
                        <Badge
                          variant="red"
                          icon={<XCircle className="h-3 w-3" />}
                        >
                          Ditolak
                        </Badge>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right align-top">
                      <Button
                        variant={
                          item.status_kunjungan === "pending"
                            ? "outline-blue"
                            : "secondary"
                        }
                        size="sm"
                        icon={<Eye className="h-3.5 w-3.5" />}
                        onClick={() => onSelectVerify(item)}
                      >
                        {item.status_kunjungan === "pending"
                          ? "Verifikasi"
                          : "Detail"}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
