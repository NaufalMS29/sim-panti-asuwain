"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  GraduationCap,
  Briefcase,
  Calendar,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
  Phone,
  MapPin,
} from "lucide-react";
import { AlumniListItem, EligibleAnakOption } from "../types/alumni.types";
import {
  createAlumniAction,
  deleteAlumniAction,
  updateAlumniAction,
} from "../actions/alumni.actions";

interface AlumniClientPageProps {
  initialAlumni: AlumniListItem[];
  eligibleAnak: EligibleAnakOption[];
  canManage: boolean;
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function getBiodataSubline(item: AlumniListItem): string {
  const rec = item as unknown as Record<string, unknown>;
  const jk =
    rec.jenis_kelamin === "L"
      ? "Laki-laki"
      : rec.jenis_kelamin === "P"
        ? "Perempuan"
        : typeof rec.jenis_kelamin === "string"
          ? rec.jenis_kelamin
          : "";
  const tempat = typeof rec.tempat_lahir === "string" ? rec.tempat_lahir : "";
  const tgl =
    typeof rec.tanggal_lahir_display === "string"
      ? rec.tanggal_lahir_display
      : typeof rec.tanggal_lahir === "string"
        ? rec.tanggal_lahir
        : "";
  const ttl = [tempat, tgl].filter(Boolean).join(", ");
  return [jk, ttl].filter(Boolean).join(" • ");
}

export function AlumniClientPage({
  initialAlumni = [],
  eligibleAnak = [],
  canManage,
}: AlumniClientPageProps) {
  const [search, setSearch] = useState("");
  const [tahunFilter, setTahunFilter] = useState<string>("semua");
  const [aktivitasFilter, setAktivitasFilter] = useState<
    "semua" | "terdata" | "belum_terdata"
  >("semua");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AlumniListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({
    id_anak: eligibleAnak[0]?.id_anak ? String(eligibleAnak[0].id_anak) : "",
    tahun_lulus: String(currentYear),
    pekerjaan_sekarang: "",
    kontak: "",
    alamat_sekarang: "",
  });

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

    const headers = [
      "No",
      "Nama Lengkap Alumni",
      "NIK",
      "Tahun Lulus",
      "Pekerjaan / Aktivitas Saat Ini",
      "Kontak / No. HP",
      "Alamat Domisili Sekarang",
    ];

    const rows = filteredData.map((item, idx) =>
      [
        idx + 1,
        item.nama_anak,
        item.nik ? `\t${item.nik}` : "-",
        item.tahun_lulus,
        item.pekerjaan_sekarang || "-",
        item.kontak ? `\t${item.kontak}` : "-",
        item.alamat_sekarang || "-",
      ]
        .map(escapeCsvCell)
        .join(","),
    );

    const csvContent = `\uFEFF${[headers.map(escapeCsvCell).join(","), ...rows].join("\r\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const todayStr = new Date().toISOString().split("T")[0];
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rekap-data-alumni-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setBanner({
      type: "success",
      text: `Berhasil mengunduh rekapitulasi direktori alumni (${filteredData.length} lulusan).`,
    });
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      id_anak: eligibleAnak[0]?.id_anak ? String(eligibleAnak[0].id_anak) : "",
      tahun_lulus: String(currentYear),
      pekerjaan_sekarang: "",
      kontak: "",
      alamat_sekarang: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (item: AlumniListItem) => {
    setEditingItem(item);
    setForm({
      id_anak: String(item.id_anak),
      tahun_lulus: String(item.tahun_lulus),
      pekerjaan_sekarang: item.pekerjaan_sekarang ?? "",
      kontak: item.kontak ?? "",
      alamat_sekarang: item.alamat_sekarang ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    const res = editingItem
      ? await updateAlumniAction(editingItem.id_alumni, {
          tahun_lulus: Number(form.tahun_lulus),
          alamat_sekarang: form.alamat_sekarang,
          pekerjaan_sekarang: form.pekerjaan_sekarang || undefined,
          kontak: form.kontak || undefined,
        })
      : await createAlumniAction({
          id_anak: Number(form.id_anak),
          tahun_lulus: Number(form.tahun_lulus),
          alamat_sekarang: form.alamat_sekarang,
          pekerjaan_sekarang: form.pekerjaan_sekarang || undefined,
          kontak: form.kontak || undefined,
        });

    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return;
    }

    setModalOpen(false);
    setBanner({ type: "success", text: res.message });
  };

  const handleDelete = async (item: AlumniListItem) => {
    const confirmed = window.confirm(
      `Hapus "${item.nama_anak}" dari daftar alumni dan kembalikan statusnya menjadi Anak Asuh Aktif?`,
    );
    if (!confirmed) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteAlumniAction(item.id_alumni);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600";

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Alumni</h1>
          <p className="text-sm text-gray-500 mt-1">
            Direktori lulusan panti asuhan beserta jejak pekerjaan dan kontak
            domisili terkini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredData.length === 0}
            title="Unduh rekapitulasi direktori lulusan panti asuhan dalam format CSV"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-medium px-4 py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Ekspor CSV ({filteredData.length})
          </button>

          {canManage && (
            <button
              type="button"
              onClick={openCreateModal}
              disabled={eligibleAnak.length === 0}
              title={
                eligibleAnak.length === 0
                  ? "Seluruh anak terdata sudah berstatus alumni"
                  : "Catat lulusan baru dari daftar anak asuh aktif"
              }
              className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Catat Alumni
            </button>
          )}
        </div>
      </div>

      {/* Kartu Ringkasan Direktori Alumni */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Alumni</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {initialAlumni.length} Lulusan
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Pekerjaan / Kuliah Terdata
            </p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {aktivitasTerdataCount} Orang
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              {latestCohortYear
                ? `Angkatan Terbaru (${latestCohortYear})`
                : "Angkatan Terbaru"}
            </p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {latestCohortCount} Orang
            </p>
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

      {/* Bilah Pencarian & Filter */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama alumni, NIK, pekerjaan, kontak, atau alamat domisili..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={tahunFilter ?? "semua"}
          onChange={(e) => setTahunFilter(e.target.value)}
          aria-label="Filter Tahun Lulus"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 lg:w-48"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Tahun Lulus
          </option>
          {tahunLulusList.map((tahun) => (
            <option
              key={tahun}
              value={String(tahun)}
              className="text-gray-900 bg-white"
            >
              Lulusan {tahun}
            </option>
          ))}
        </select>

        <select
          value={aktivitasFilter ?? "semua"}
          onChange={(e) =>
            setAktivitasFilter(
              e.target.value as "semua" | "terdata" | "belum_terdata",
            )
          }
          aria-label="Filter Kelengkapan Jejak Alumni"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 lg:w-56"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Status Aktivitas
          </option>
          <option value="terdata" className="text-gray-900 bg-white">
            Pekerjaan/Kuliah Terdata ({aktivitasTerdataCount})
          </option>
          <option value="belum_terdata" className="text-gray-900 bg-white">
            Belum Diperbarui ({initialAlumni.length - aktivitasTerdataCount})
          </option>
        </select>
      </div>

      {/* Tabel Direktori Alumni */}
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
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-gray-500 text-sm"
                  >
                    Tidak ada data alumni yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
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
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Lulus {item.tahun_lulus}
                        </span>
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

                      <td className="py-3.5 px-4 text-right">
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
                              <button
                                type="button"
                                disabled={loading}
                                onClick={() => openEditModal(item)}
                                title="Perbarui Data Alumni"
                                className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 border border-blue-200 cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                disabled={loading}
                                onClick={() => handleDelete(item)}
                                title="Hapus Status Alumni"
                                className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 border border-red-200 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

      {/* Modal Tambah / Ubah Data Alumni */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem ? "Perbarui Data Alumni" : "Catat Alumni Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {editingItem ? (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                  Alumni: <strong>{editingItem.nama_anak}</strong>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Pilih Anak Asuh Aktif
                  </label>
                  <select
                    required
                    value={form.id_anak ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, id_anak: e.target.value })
                    }
                    className={inputClass}
                  >
                    {eligibleAnak.map((anak) => {
                      const nik = (
                        anak as EligibleAnakOption & { nik?: string | null }
                      ).nik;
                      return (
                        <option
                          key={anak.id_anak}
                          value={String(anak.id_anak)}
                          className="text-gray-900 bg-white"
                        >
                          {anak.nama_anak}
                          {nik ? ` (${nik})` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tahun Lulus
                </label>
                <input
                  type="number"
                  required
                  min={1990}
                  max={currentYear + 1}
                  value={form.tahun_lulus ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, tahun_lulus: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pekerjaan / Aktivitas Saat Ini
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Mahasiswa Teknik Informatika / Karyawan Swasta"
                  value={form.pekerjaan_sekarang ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, pekerjaan_sekarang: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kontak / Nomor HP / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={form.kontak ?? ""}
                  onChange={(e) => setForm({ ...form, kontak: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alamat Domisili Sekarang{" "}
                  <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Alamat tempat tinggal alumni saat ini..."
                  value={form.alamat_sekarang ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, alamat_sekarang: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingItem ? "Simpan Perubahan" : "Simpan Data Alumni"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
