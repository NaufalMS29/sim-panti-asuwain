"use client";

import Link from "next/link";
import {
  FileText,
  GraduationCap,
  MapPin,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { Badge, Button, EmptyTableRow } from "@/components/ui";
import { AlumniListItem } from "../types/alumni.types";
import { getBiodataSubline } from "../utils/alumni.utils";

interface AlumniTableProps {
  data: AlumniListItem[];
  loading: boolean;
  canManage: boolean;
  onEdit: (item: AlumniListItem) => void;
  onDelete: (item: AlumniListItem) => void;
}

export function AlumniTable({
  data,
  loading,
  canManage,
  onEdit,
  onDelete,
}: AlumniTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
              <th className="py-3.5 px-4">Nama Alumni</th>
              <th className="py-3.5 px-4">Tahun Lulus</th>
              <th className="py-3.5 px-4">Pekerjaan / Aktivitas</th>
              <th className="py-3.5 px-4">Kontak & Domisili</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {data.length === 0 ? (
              <EmptyTableRow
                colSpan={5}
                message="Tidak ada data alumni yang sesuai dengan filter."
              />
            ) : (
              data.map((item) => {
                const biodataSubline = getBiodataSubline(item);

                return (
                  <tr key={item.id_alumni} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">
                        {item.nama_anak}
                      </p>
                      {biodataSubline && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {biodataSubline}
                        </p>
                      )}
                      {item.nik && (
                        <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                          NIK: {item.nik}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant="purple"
                        icon={<GraduationCap className="w-3.5 h-3.5" />}
                      >
                        Lulus {item.tahun_lulus}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <p className="font-semibold text-gray-900">
                        {item.pekerjaan_sekarang || "Belum diperbarui"}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-700 space-y-1">
                      <p className="inline-flex items-center gap-1.5 font-mono text-gray-800">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {item.kontak || "-"}
                      </p>
                      <p className="flex items-start gap-1.5 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {item.alamat_sekarang || "-"}
                        </span>
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/data-anak-panti/${item.id_anak}`}
                          title="Lihat Arsip Berkas Dokumen Alumni"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Berkas
                        </Link>

                        {canManage && (
                          <>
                            <Button
                              variant="outline-amber"
                              size="xs"
                              disabled={loading}
                              onClick={() => onEdit(item)}
                              title="Perbarui Data Alumni"
                              icon={<Pencil className="w-4 h-4" />}
                            />

                            <Button
                              variant="outline-red"
                              size="xs"
                              disabled={loading}
                              onClick={() => onDelete(item)}
                              title="Hapus Status Alumni"
                              icon={<Trash2 className="w-4 h-4" />}
                            />
                          </>
                        )}
                      </div>
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
