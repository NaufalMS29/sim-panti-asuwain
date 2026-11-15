"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Eye,
  ExternalLink,
  Download,
  FolderOpen,
  ShieldCheck,
  Info,
  IdCard,
  GraduationCap,
  X,
} from "lucide-react";
import { BerkasAnakItem, OwnBerkasSummary } from "../types/berkas-anak.types";

interface BerkasSayaClientPageProps {
  data: OwnBerkasSummary | null;
  jenisBerkasOptions: string[];
}

function formatEnumLabel(val: string): string {
  if (val.toLowerCase() === "ktp") return "KTP";
  return val.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function isPdfFile(filePath: string): boolean {
  return filePath.toLowerCase().split("?")[0].endsWith(".pdf");
}

const IDENTITAS_CATEGORIES = new Set(["kartu_keluarga", "akta", "ktp"]);
const PENDIDIKAN_CATEGORIES = new Set(["ijazah", "rapor", "sertifikat"]);

export function BerkasSayaClientPage({
  data,
  jenisBerkasOptions,
}: BerkasSayaClientPageProps) {
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("semua");
  const [previewItem, setPreviewItem] = useState<BerkasAnakItem | null>(null);

  useEffect(() => {
    if (!previewItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewItem]);

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
      {/* Header Halaman */}
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

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold w-fit">
          <ShieldCheck className="w-4 h-4" />
          Mode Lihat & Unduh
        </span>
      </div>

      {/* Ringkasan Kategori Berkas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Dokumen</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {data.berkas.length} Berkas
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <IdCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Dokumen Kependudukan
            </p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {identitasCount} Berkas
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Pendidikan & Sertifikat
            </p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {pendidikanCount} Berkas
            </p>
          </div>
        </div>
      </div>

      {/* Catatan Informasi Read-Only */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 flex items-start gap-3 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p>
          Pengunggahan dan pembaruan berkas digital dikelola oleh{" "}
          <strong>Pengurus Panti</strong>. Apabila terdapat berkas baru (seperti
          rapor semester atau sertifikat lomba) yang belum tercatat, silakan
          serahkan salinannya kepada pengurus panti.
        </p>
      </div>

      {/* Bilah Pencarian & Filter Kategori */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama dokumen atau kategori berkas..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={kategoriFilter ?? "semua"}
          onChange={(e) => setKategoriFilter(e.target.value)}
          aria-label="Filter Kategori Berkas"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 sm:w-56"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Kategori ({data.berkas.length})
          </option>
          {jenisBerkasOptions.map((opt) => (
            <option key={opt} value={opt} className="text-gray-900 bg-white">
              {formatEnumLabel(opt)}
            </option>
          ))}
        </select>
      </div>

      {/* Tabel Daftar Berkas (Read-Only) */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        {filteredBerkas.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FolderOpen className="w-9 h-9 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">
              {data.berkas.length === 0
                ? "Belum ada berkas dokumen yang diunggah"
                : "Tidak ada berkas yang sesuai dengan filter"}
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {data.berkas.length === 0
                ? "Dokumen seperti Kartu Keluarga, Akta Kelahiran, Rapor, dan Ijazah Anda akan muncul di sini setelah diunggah oleh pengurus panti."
                : "Coba ubah kata kunci pencarian atau pilih kategori dokumen lainnya."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                  <th className="py-3.5 px-4">Kategori Berkas</th>
                  <th className="py-3.5 px-4">Nama / Keterangan Dokumen</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredBerkas.map((item) => (
                  <tr key={item.id_berkas} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {formatEnumLabel(item.jenis_berkas)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-900">
                      {item.nama_file}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Pratinjau
                        </button>

                        <a
                          href={item.file_path}
                          download={item.nama_file}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Unduh
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Pratinjau Dokumen Inline (PDF & Gambar) */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header Modal */}
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  {formatEnumLabel(previewItem.jenis_berkas)}
                </span>
                <h2 className="text-sm font-bold text-gray-900 truncate">
                  {previewItem.nama_file}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewItem.file_path}
                  download={previewItem.nama_file}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh
                </a>

                <a
                  href={previewItem.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Tab Baru
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  aria-label="Tutup Pratinjau"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-200/70 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Area Konten Pratinjau */}
            <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-4">
              {isPdfFile(previewItem.file_path) ? (
                <iframe
                  src={previewItem.file_path}
                  title={previewItem.nama_file}
                  className="w-full h-full rounded-xl border border-gray-300 bg-white"
                />
              ) : (
                <img
                  src={previewItem.file_path}
                  alt={previewItem.nama_file}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-md bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
