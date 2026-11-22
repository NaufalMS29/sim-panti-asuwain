"use client";

import { useState } from "react";
import { Info, Search, ShieldCheck } from "lucide-react";
import { Badge, FormSelect } from "@/components/ui";
import { BerkasAnakItem, OwnBerkasSummary } from "../types/berkas-anak.types";
import {
  formatEnumLabel,
  IDENTITAS_CATEGORIES,
  PENDIDIKAN_CATEGORIES,
} from "../utils/berkas-anak.utils";
import { BerkasSayaStatsCards } from "./BerkasSayaStatsCards";
import { BerkasSayaTable } from "./BerkasSayaTable";
import { BerkasPreviewModal } from "./BerkasPreviewModal";

interface BerkasSayaClientPageProps {
  data: OwnBerkasSummary | null;
  jenisBerkasOptions: string[];
}

export function BerkasSayaClientPage({
  data,
  jenisBerkasOptions,
}: BerkasSayaClientPageProps) {
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("semua");
  const [previewItem, setPreviewItem] = useState<BerkasAnakItem | null>(null);

  if (!data) {
    return (
      <div className="max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Berkas Dokumen Saya
        </h1>
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">
              Akun Belum Terhubung dengan Biodata Anak Panti
            </p>
            <p className="mt-1">
              Akun login Anda belum ditautkan ke data anak asuh oleh pengurus
              panti. Silakan hubungi pengurus atau admin panti untuk penautan
              akun.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredBerkas = data.berkas.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.nama_file.toLowerCase().includes(q) ||
      formatEnumLabel(item.jenis_berkas).toLowerCase().includes(q);
    const matchKategori =
      kategoriFilter === "semua" || item.jenis_berkas === kategoriFilter;
    return matchSearch && matchKategori;
  });

  const identitasCount = data.berkas.filter((b) =>
    IDENTITAS_CATEGORIES.has(b.jenis_berkas.toLowerCase()),
  ).length;

  const pendidikanCount = data.berkas.filter((b) =>
    PENDIDIKAN_CATEGORIES.has(b.jenis_berkas.toLowerCase()),
  ).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Berkas Dokumen Saya
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Arsip dokumen kependudukan, rapor, ijazah, dan sertifikat atas nama{" "}
            <strong className="text-gray-800">{data.nama_anak}</strong>.
          </p>
        </div>

        <Badge
          variant="emerald"
          icon={<ShieldCheck className="w-4 h-4" />}
          className="px-3 py-1.5 rounded-xl w-fit"
        >
          Mode Lihat & Unduh
        </Badge>
      </div>

      <BerkasSayaStatsCards
        totalCount={data.berkas.length}
        identitasCount={identitasCount}
        pendidikanCount={pendidikanCount}
      />

      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 flex items-start gap-3 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p>
          Pengunggahan dan pembaruan berkas digital dikelola oleh{" "}
          <strong>Pengurus Panti</strong>. Apabila terdapat berkas baru (seperti
          rapor semester atau sertifikat lomba) yang belum tercatat, silakan
          serahkan salinannya kepada pengurus panti.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama dokumen atau kategori berkas..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="sm:w-56">
          <FormSelect
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            aria-label="Filter Kategori Berkas"
          >
            <option value="semua" className="text-gray-900 bg-white">
              Semua Kategori ({data.berkas.length})
            </option>
            {jenisBerkasOptions.map((opt) => (
              <option key={opt} value={opt} className="text-gray-900 bg-white">
                {formatEnumLabel(opt)}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>

      <BerkasSayaTable
        berkasList={filteredBerkas}
        totalUploaded={data.berkas.length}
        onPreview={setPreviewItem}
      />

      <BerkasPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  );
}
