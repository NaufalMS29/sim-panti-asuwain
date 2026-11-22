"use client";

import Link from "next/link";
import {
  Pencil,
  KeyRound,
  Trash2,
  FileText,
  UserCheck,
  GraduationCap,
  Check,
  Minus,
} from "lucide-react";
import { Badge, Button, EmptyTableRow } from "@/components/ui";
import { AnakPantiItem } from "../types/anak-panti.types";
import { formatEnumLabel } from "../utils/anak-panti.utils";

interface AnakPantiTableProps {
  data: AnakPantiItem[];
  loading: boolean;
  canUpdate: boolean;
  canResetPassword: boolean;
  canDelete: boolean;
  onEdit: (item: AnakPantiItem) => void;
  onResetPassword: (item: AnakPantiItem) => void;
  onDelete: (item: AnakPantiItem) => void;
}

export function AnakPantiTable({
  data,
  loading,
  canUpdate,
  canResetPassword,
  canDelete,
  onEdit,
  onResetPassword,
  onDelete,
}: AnakPantiTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
              <th className="py-3.5 px-4">Nama Anak & Akun</th>
              <th className="py-3.5 px-4">Tempat, Tanggal Lahir</th>
              <th className="py-3.5 px-4">Kategori Sosial</th>
              <th className="py-3.5 px-4">Status Kepengasuhan</th>
              <th className="py-3.5 px-4">Kelengkapan Berkas</th>
              <th className="py-3.5 px-4">Tanggal Masuk</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {data.length === 0 ? (
              <EmptyTableRow
                colSpan={7}
                message="Tidak ada data anak panti yang sesuai dengan filter."
              />
            ) : (
              data.map((item) => {
                const docBadges = [
                  {
                    key: "kk",
                    label: "KK",
                    title: "Kartu Keluarga",
                    ready: item.kelengkapan_berkas.kk,
                  },
                  {
                    key: "akta",
                    label: "Akta",
                    title: "Akta Kelahiran",
                    ready: item.kelengkapan_berkas.akta,
                  },
                  {
                    key: "ijazah",
                    label: "Ijazah",
                    title: "Ijazah Pendidikan",
                    ready: item.kelengkapan_berkas.ijazah,
                  },
                ];

                const completedPrimaryCount = docBadges.filter(
                  (d) => d.ready,
                ).length;

                return (
                  <tr key={item.id_anak} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">
                        {item.nama_anak}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        NIK:{" "}
                        <span className="font-mono">{item.nik || "-"}</span>
                        {item.username && (
                          <>
                            {" "}
                            •{" "}
                            <span className="font-mono text-gray-700">
                              {item.username}
                            </span>
                          </>
                        )}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-700">
                      <p className="font-medium text-gray-900">
                        {item.tempat_lahir}, {item.tanggal_lahir_display}
                      </p>
                      <p className="text-gray-500 mt-0.5">
                        {formatEnumLabel(item.jenis_kelamin)}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="slate">
                        {formatEnumLabel(item.status_anak)}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.is_alumni ? (
                        <div className="space-y-1">
                          <Badge
                            variant="purple"
                            icon={<GraduationCap className="w-3.5 h-3.5" />}
                          >
                            Alumni
                            {item.tahun_lulus ? ` (${item.tahun_lulus})` : ""}
                          </Badge>
                          <div>
                            <Link
                              href="/dashboard/data-alumni"
                              className="text-[11px] font-medium text-purple-700 hover:underline"
                            >
                              Lihat di Data Alumni
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <Badge
                          variant="emerald"
                          icon={<UserCheck className="w-3.5 h-3.5" />}
                        >
                          Anak Asuh Aktif
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/data-anak-panti/${item.id_anak}`}
                        title="Klik untuk mengelola berkas anak"
                        className="inline-flex flex-wrap items-center gap-1.5 group"
                      >
                        {docBadges.map((doc) => (
                          <span
                            key={doc.key}
                            title={`${doc.title}: ${
                              doc.ready ? "Sudah diunggah" : "Belum ada"
                            }`}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border transition ${
                              doc.ready
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-gray-50 text-gray-400 border-gray-200 border-dashed group-hover:border-gray-300"
                            }`}
                          >
                            {doc.ready ? (
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                            {doc.label}
                          </span>
                        ))}
                      </Link>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {completedPrimaryCount === 3
                          ? "Dokumen utama lengkap"
                          : `${completedPrimaryCount}/3 dokumen utama`}
                        {item.berkas_count > 0
                          ? ` • Total ${item.berkas_count} file`
                          : ""}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      {item.tanggal_masuk_display}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/data-anak-panti/${item.id_anak}`}
                          title="Kelola Berkas Dokumen Anak"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Berkas ({item.berkas_count})
                        </Link>

                        {canResetPassword && Boolean(item.id_user) && (
                          <Button
                            variant="outline-blue"
                            size="xs"
                            disabled={loading}
                            onClick={() => onResetPassword(item)}
                            title="Reset Password ke Default (asuwain123)"
                            icon={<KeyRound className="w-4 h-4" />}
                          />
                        )}

                        {canUpdate && (
                          <Button
                            variant="outline-amber"
                            size="xs"
                            disabled={loading}
                            onClick={() => onEdit(item)}
                            title="Ubah Biodata Anak"
                            icon={<Pencil className="w-4 h-4" />}
                          />
                        )}

                        {canDelete && (
                          <Button
                            variant="outline-red"
                            size="xs"
                            disabled={loading}
                            onClick={() => onDelete(item)}
                            title="Hapus Data Anak"
                            icon={<Trash2 className="w-4 h-4" />}
                          />
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
