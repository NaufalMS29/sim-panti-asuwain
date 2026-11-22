"use client";

import Link from "next/link";
import { ArrowLeft, FileText, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui";
import { AnakBerkasDetail } from "../types/berkas-anak.types";
import { formatEnumLabel } from "../utils/berkas-anak.utils";

interface BerkasAnakProfileHeaderProps {
  detail: AnakBerkasDetail;
}

export function BerkasAnakProfileHeader({
  detail,
}: BerkasAnakProfileHeaderProps) {
  const isAlumni = Boolean(detail.alumni);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link
          href="/dashboard/data-anak-panti"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Data Anak Panti
        </Link>

        {isAlumni && (
          <Link
            href="/dashboard/data-alumni"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-800"
          >
            <GraduationCap className="w-4 h-4" />
            Lihat di Direktori Data Alumni
          </Link>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">
              {detail.nama_anak}
            </h1>
            <Badge variant="slate">{formatEnumLabel(detail.status_anak)}</Badge>
            <Badge variant={isAlumni ? "purple" : "emerald"}>
              {isAlumni
                ? `Alumni (${detail.alumni?.tahun_lulus})`
                : "Anak Asuh Aktif"}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            NIK: <span className="font-mono">{detail.nik || "-"}</span> •{" "}
            {detail.tempat_lahir}, {detail.tanggal_lahir} • Masuk Panti:{" "}
            {detail.tanggal_masuk}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge
            variant="blue"
            icon={<FileText className="w-3.5 h-3.5" />}
            className="px-3 py-1.5 rounded-xl"
          >
            {detail.berkas.length} Berkas Tersimpan
          </Badge>
        </div>
      </div>
    </div>
  );
}
