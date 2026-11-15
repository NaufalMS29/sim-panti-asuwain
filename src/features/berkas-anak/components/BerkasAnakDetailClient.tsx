"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  GraduationCap,
  Upload,
  Eye,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderOpen,
  X,
  Download,
} from "lucide-react";
import { AnakBerkasDetail, BerkasAnakItem } from "../types/berkas-anak.types";
import {
  deleteBerkasAnakAction,
  uploadBerkasAnakAction,
} from "../actions/berkas-anak.actions";

interface BerkasAnakDetailClientProps {
  detail: AnakBerkasDetail;
  canManage: boolean;
  jenisBerkasOptions: string[];
}

function formatEnumLabel(val: string): string {
  if (val.toLowerCase() === "ktp") return "KTP";
  return val.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function isPdfFile(filePath: string): boolean {
  return filePath.toLowerCase().split("?")[0].endsWith(".pdf");
}

export function BerkasAnakDetailClient({
  detail,
  canManage,
  jenisBerkasOptions,
}: BerkasAnakDetailClientProps) {
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [jenisBerkas, setJenisBerkas] = useState<string>(
    jenisBerkasOptions[0] ?? "",
  );
  const [namaFile, setNamaFile] = useState("");
  const [previewItem, setPreviewItem] = useState<BerkasAnakItem | null>(null);

  const isJenisLainnya = jenisBerkas.toLowerCase() === "lainnya";
  const isAlumni = Boolean(detail.alumni);

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

  const handleUploadBerkas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBanner(null);

    if (isJenisLainnya && namaFile.trim().length < 3) {
      setBanner({
        type: "error",
        text: "Untuk kategori Lainnya, tuliskan nama atau jenis berkas minimal 3 karakter.",
      });
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setBanner({
        type: "error",
        text: "Silakan pilih file dokumen terlebih dahulu.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("id_anak", String(detail.id_anak));
    formData.append("jenis_berkas", jenisBerkas);
    formData.append("nama_file", namaFile);
    formData.append("file", file);

    setLoading(true);
    const res = await uploadBerkasAnakAction(formData);
    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return;
    }

    setNamaFile("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setBanner({ type: "success", text: res.message });
  };

  const handleDeleteBerkas = async (id_berkas: number, label: string) => {
    const confirmed = window.confirm(
      `Hapus dokumen "${label}" secara permanen?`,
    );
    if (!confirmed) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteBerkasAnakAction(id_berkas);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Navigasi Kembali & Header Profil Anak */}
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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-200">
                {formatEnumLabel(detail.status_anak)}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isAlumni
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {isAlumni
                  ? `Alumni (${detail.alumni?.tahun_lulus})`
                  : "Anak Asuh Aktif"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              NIK: <span className="font-mono">{detail.nik || "-"}</span> •{" "}
              {detail.tempat_lahir}, {detail.tanggal_lahir} • Masuk Panti:{" "}
              {detail.tanggal_masuk}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              <FileText className="w-3.5 h-3.5" />
              {detail.berkas.length} Berkas Tersimpan
            </span>
          </div>
        </div>
      </div>

      {banner && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
            banner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {banner.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{banner.text}</span>
        </div>
      )}

      {/* Bagian Utama: Unggah & Daftar Berkas Dokumen Anak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {canManage && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 h-fit shadow-2xs">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900">
                Unggah Berkas Baru
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Format PDF, JPG, PNG, atau WEBP (maks. 5 MB).
              </p>
            </div>

            <form onSubmit={handleUploadBerkas} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kategori Dokumen
                </label>
                <select
                  value={jenisBerkas ?? ""}
                  onChange={(e) => setJenisBerkas(e.target.value)}
                  className={inputClass}
                >
                  {jenisBerkasOptions.map((opt) => (
                    <option
                      key={opt}
                      value={opt}
                      className="text-gray-900 bg-white"
                    >
                      {formatEnumLabel(opt)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isJenisLainnya ? (
                    <>
                      Nama / Jenis Berkas Lainnya{" "}
                      <span className="text-red-600">*</span>
                    </>
                  ) : (
                    "Keterangan / Nama Dokumen (Opsional)"
                  )}
                </label>
                <input
                  type="text"
                  required={isJenisLainnya}
                  placeholder={
                    isJenisLainnya
                      ? "Wajib diisi, misal: Kartu BPJS / Surat Sehat"
                      : "Kosongkan untuk memakai nama file asli"
                  }
                  value={namaFile ?? ""}
                  onChange={(e) => setNamaFile(e.target.value)}
                  className={inputClass}
                />
                {isJenisLainnya && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    Kategori Lainnya mewajibkan Anda menuliskan nama spesifik
                    dokumen.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pilih File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="w-full text-xs text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Unggah Dokumen
              </button>
            </form>
          </div>
        )}

        <div
          className={`${
            canManage ? "lg:col-span-2" : "lg:col-span-3"
          } bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs`}
        >
          {detail.berkas.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <FolderOpen className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm font-semibold text-gray-700">
                Belum ada berkas dokumen
              </p>
              <p className="text-xs text-gray-500">
                Unggah KK, Akta Kelahiran, Ijazah, KTP, atau Rapor anak pada
                form di samping.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                    <th className="py-3 px-4">Jenis Berkas</th>
                    <th className="py-3 px-4">Nama / Keterangan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {detail.berkas.map((item) => (
                    <tr key={item.id_berkas} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {formatEnumLabel(item.jenis_berkas)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-gray-900">
                        {item.nama_file}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Pratinjau
                          </button>

                          {canManage && (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() =>
                                handleDeleteBerkas(
                                  item.id_berkas,
                                  item.nama_file,
                                )
                              }
                              title="Hapus Berkas"
                              className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 border border-red-200 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
