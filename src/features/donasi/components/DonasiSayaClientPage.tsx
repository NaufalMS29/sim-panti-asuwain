"use client";

import { useEffect, useRef, useState } from "react";
import {
  HeartHandshake,
  Banknote,
  Package,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  ExternalLink,
  X,
  UserCheck,
  Building2,
} from "lucide-react";
import {
  DonasiTransactionItem,
  DonaturPortalData,
  KategoriBarangDonasiType,
  MetodePembayaranType,
} from "../types/donasi.types";
import {
  submitDonasiBarangAction,
  submitDonasiUangAction,
  updateOwnDonaturProfileAction,
} from "../actions/donasi.actions";

interface DonasiSayaClientPageProps {
  portalData: DonaturPortalData;
  tipeDonaturOptions: string[];
}

function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nominal);
}

function formatEnumLabel(val: string): string {
  return val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function isPdfFile(filePath: string): boolean {
  return filePath.toLowerCase().split("?")[0].endsWith(".pdf");
}

const REKENING_PANTI = [
  {
    bank: "Bank BRI",
    nomor: "0234-01-008912-53-4",
    atasNama: "Yayasan Panti Asuhan Asuwain",
  },
  {
    bank: "Bank Mandiri",
    nomor: "181-00-0451920-8",
    atasNama: "Panti Asuhan Asuwain",
  },
];

const NOMINAL_PRESETS = [50000, 100000, 250000, 500000, 1000000];

export function DonasiSayaClientPage({
  portalData,
  tipeDonaturOptions,
}: DonasiSayaClientPageProps) {
  const { profil, riwayat } = portalData;

  const [activeTab, setActiveTab] = useState<"uang" | "barang" | "profil">(
    "uang",
  );
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // State Form Donasi Uang
  const uangReceiptRef = useRef<HTMLInputElement | null>(null);
  const [uangForm, setUangForm] = useState({
    nama_pengirim: profil.nama_donatur ?? "",
    tanggal_donasi: new Date().toISOString().split("T")[0],
    nominal: "100000",
    metode_pembayaran: "transfer_bank" as MetodePembayaranType,
    is_anonim: false,
    catatan: "",
  });

  // State Form Donasi Barang
  const barangReceiptRef = useRef<HTMLInputElement | null>(null);
  const [barangForm, setBarangForm] = useState({
    nama_pengirim: profil.nama_donatur ?? "",
    tanggal_donasi: new Date().toISOString().split("T")[0],
    is_anonim: false,
    nama_barang: "",
    kategori_barang: "habis_pakai" as KategoriBarangDonasiType,
    jumlah: "1",
    satuan: "dus",
    nomor_resi_ekspedisi: "",
    catatan: "",
  });

  // State Form Profil Donatur
  const [profilForm, setProfilForm] = useState({
    nama_donatur: profil.nama_donatur ?? "",
    email: profil.email ?? "",
    no_telepon: profil.no_telepon ?? "",
    alamat: profil.alamat ?? "",
    tipe_donatur: profil.tipe_donatur ?? tipeDonaturOptions[0] ?? "tidak_tetap",
    frekuensi_donasi: profil.frekuensi_donasi ?? "",
  });

  // Modal Pratinjau Bukti Pembayaran / Pengiriman
  const [previewReceipt, setPreviewReceipt] = useState<{
    title: string;
    path: string;
  } | null>(null);

  useEffect(() => {
    if (!previewReceipt) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewReceipt(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [previewReceipt]);

  const handleSubmitUang = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    const file = uangReceiptRef.current?.files?.[0];
    if (!file) {
      setBanner({
        type: "error",
        text: "Silakan unggah foto atau PDF bukti pembayaran terlebih dahulu.",
      });
      return;
    }

    const fd = new FormData();
    fd.append("nama_pengirim", uangForm.nama_pengirim);
    fd.append("tanggal_donasi", uangForm.tanggal_donasi);
    fd.append("nominal", uangForm.nominal);
    fd.append("metode_pembayaran", uangForm.metode_pembayaran);
    fd.append("is_anonim", String(uangForm.is_anonim));
    fd.append("catatan", uangForm.catatan);
    fd.append("bukti_pembayaran", file);

    setLoading(true);
    const res = await submitDonasiUangAction(fd);
    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return;
    }

    setUangForm({ ...uangForm, catatan: "", is_anonim: false });
    if (uangReceiptRef.current) uangReceiptRef.current.value = "";
    setBanner({ type: "success", text: res.message });
  };

  const handleSubmitBarang = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    const fd = new FormData();
    fd.append("nama_pengirim", barangForm.nama_pengirim);
    fd.append("tanggal_donasi", barangForm.tanggal_donasi);
    fd.append("is_anonim", String(barangForm.is_anonim));
    fd.append("nama_barang", barangForm.nama_barang);
    fd.append("kategori_barang", barangForm.kategori_barang);
    fd.append("jumlah", barangForm.jumlah);
    fd.append("satuan", barangForm.satuan);
    fd.append("nomor_resi_ekspedisi", barangForm.nomor_resi_ekspedisi);
    fd.append("catatan", barangForm.catatan);

    const file = barangReceiptRef.current?.files?.[0];
    if (file) {
      fd.append("bukti_pembayaran", file);
    }

    setLoading(true);
    const res = await submitDonasiBarangAction(fd);
    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return;
    }

    setBarangForm({
      ...barangForm,
      nama_barang: "",
      jumlah: "1",
      satuan: "dus",
      nomor_resi_ekspedisi: "",
      catatan: "",
      is_anonim: false,
    });
    if (barangReceiptRef.current) barangReceiptRef.current.value = "";
    setBanner({ type: "success", text: res.message });
  };

  const handleSaveProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    const res = await updateOwnDonaturProfileAction(profilForm);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const pendingCount = riwayat.filter(
    (r) => r.status_verifikasi === "pending",
  ).length;

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Portal Donatur */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Portal Donasi Saya
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Salurkan bantuan dana maupun barang logistik untuk anak-anak Panti
            Asuhan Asuwain dan pantau status verifikasinya.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold w-fit">
          <HeartHandshake className="w-4 h-4 text-blue-700" />
          {profil.nama_donatur} ({formatEnumLabel(profil.tipe_donatur)})
        </span>
      </div>

      {/* Ringkasan Kontribusi Donatur */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
          <p className="text-xs font-medium text-gray-500">
            Total Donasi Uang Terverifikasi
          </p>
          <p className="text-xl font-bold text-emerald-700 mt-1">
            {formatRupiah(profil.total_donasi_uang)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
          <p className="text-xs font-medium text-gray-500">
            Transaksi Terverifikasi
          </p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {profil.total_transaksi} Transaksi
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
          <p className="text-xs font-medium text-gray-500">
            Menunggu Verifikasi Pengurus
          </p>
          <p className="text-xl font-bold text-amber-600 mt-1">
            {pendingCount} Transaksi
          </p>
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

      {/* Tab Navigasi Form */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="flex flex-wrap border-b border-gray-200 bg-gray-50/70">
          <button
            type="button"
            onClick={() => setActiveTab("uang")}
            className={`inline-flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === "uang"
                ? "border-blue-700 text-blue-700 bg-white"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Banknote className="w-4 h-4" />
            Kirim Donasi Uang
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("barang")}
            className={`inline-flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === "barang"
                ? "border-blue-700 text-blue-700 bg-white"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Package className="w-4 h-4" />
            Kirim Donasi Barang
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profil")}
            className={`inline-flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === "profil"
                ? "border-blue-700 text-blue-700 bg-white"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Identitas Donatur
          </button>
        </div>

        {/* TAB 1: DONASI UANG */}
        {activeTab === "uang" && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4 h-fit">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Building2 className="w-4 h-4 text-blue-700" />
                Rekening Resmi Panti Asuhan
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lakukan transfer atau pembayaran QRIS ke rekening berikut,
                kemudian unggah bukti pembayarannya pada formulir di samping.
              </p>

              <div className="space-y-2.5 pt-1">
                {REKENING_PANTI.map((rek) => (
                  <div
                    key={rek.bank}
                    className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-0.5"
                  >
                    <p className="font-bold text-blue-800">{rek.bank}</p>
                    <p className="font-mono font-semibold text-gray-900 text-sm">
                      {rek.nomor}
                    </p>
                    <p className="text-gray-500">a.n. {rek.atasNama}</p>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleSubmitUang}
              className="lg:col-span-2 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Pilih Nominal Cepat atau Ketik Nominal (Rp)
                </label>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {NOMINAL_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setUangForm({ ...uangForm, nominal: String(preset) })
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        Number(uangForm.nominal) === preset
                          ? "bg-blue-700 text-white border-blue-700"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {formatRupiah(preset)}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={uangForm.nominal ?? ""}
                  onChange={(e) =>
                    setUangForm({ ...uangForm, nominal: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Pengirim
                  </label>
                  <input
                    type="text"
                    required
                    value={uangForm.nama_pengirim ?? ""}
                    onChange={(e) =>
                      setUangForm({
                        ...uangForm,
                        nama_pengirim: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tanggal Transfer
                  </label>
                  <input
                    type="date"
                    required
                    value={uangForm.tanggal_donasi ?? ""}
                    onChange={(e) =>
                      setUangForm({
                        ...uangForm,
                        tanggal_donasi: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={uangForm.metode_pembayaran}
                    onChange={(e) =>
                      setUangForm({
                        ...uangForm,
                        metode_pembayaran: e.target
                          .value as MetodePembayaranType,
                      })
                    }
                    className={inputClass}
                  >
                    <option
                      value="transfer_bank"
                      className="text-gray-900 bg-white"
                    >
                      Transfer Bank
                    </option>
                    <option value="qris" className="text-gray-900 bg-white">
                      QRIS
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Unggah Bukti Pembayaran (JPG, PNG, WEBP, atau PDF — maks. 5
                  MB) <span className="text-red-600">*</span>
                </label>
                <input
                  ref={uangReceiptRef}
                  type="file"
                  required
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  className="w-full text-xs text-gray-700 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-lg p-1.5"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uangForm.is_anonim}
                  onChange={(e) =>
                    setUangForm({ ...uangForm, is_anonim: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                Sembunyikan nama saya pada laporan publik (tampilkan sebagai{" "}
                <strong>Hamba Allah</strong>)
              </label>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Catatan / Doa / Peruntukan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Semoga bermanfaat untuk kebutuhan sekolah anak-anak panti..."
                  value={uangForm.catatan ?? ""}
                  onChange={(e) =>
                    setUangForm({ ...uangForm, catatan: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Kirim Konfirmasi Donasi
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: DONASI BARANG */}
        {activeTab === "barang" && (
          <form onSubmit={handleSubmitBarang} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Pengirim
                </label>
                <input
                  type="text"
                  required
                  value={barangForm.nama_pengirim}
                  onChange={(e) =>
                    setBarangForm({
                      ...barangForm,
                      nama_pengirim: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tanggal Pengiriman / Penyerahan
                </label>
                <input
                  type="date"
                  required
                  value={barangForm.tanggal_donasi}
                  onChange={(e) =>
                    setBarangForm({
                      ...barangForm,
                      tanggal_donasi: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Barang yang Didonasikan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beras Premium / Paket Alat Tulis"
                  value={barangForm.nama_barang}
                  onChange={(e) =>
                    setBarangForm({
                      ...barangForm,
                      nama_barang: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kategori Barang
                </label>
                <select
                  value={barangForm.kategori_barang}
                  onChange={(e) =>
                    setBarangForm({
                      ...barangForm,
                      kategori_barang: e.target
                        .value as KategoriBarangDonasiType,
                    })
                  }
                  className={inputClass}
                >
                  <option
                    value="habis_pakai"
                    className="text-gray-900 bg-white"
                  >
                    Habis Pakai (Sembako, ATK, Perlengkapan Mandi)
                  </option>
                  <option value="inventaris" className="text-gray-900 bg-white">
                    Inventaris (Perabot, Elektronik, Buku Perpustakaan)
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Jumlah
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={barangForm.jumlah}
                  onChange={(e) =>
                    setBarangForm({ ...barangForm, jumlah: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Satuan
                </label>
                <input
                  type="text"
                  required
                  placeholder="kg / dus / karung / unit"
                  value={barangForm.satuan}
                  onChange={(e) =>
                    setBarangForm({ ...barangForm, satuan: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nomor Resi Ekspedisi (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Isi jika dikirim via kurir"
                  value={barangForm.nomor_resi_ekspedisi}
                  onChange={(e) =>
                    setBarangForm({
                      ...barangForm,
                      nomor_resi_ekspedisi: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Foto Paket / Resi Pengiriman (Opsional — JPG, PNG, WEBP, PDF)
              </label>
              <input
                ref={barangReceiptRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                className="w-full text-xs text-gray-700 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-lg p-1.5"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={barangForm.is_anonim}
                onChange={(e) =>
                  setBarangForm({ ...barangForm, is_anonim: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              Sembunyikan nama saya pada laporan publik (tampilkan sebagai{" "}
              <strong>Hamba Allah</strong>)
            </label>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Diantar langsung ke panti pukul 10.00 WITA"
                value={barangForm.catatan}
                onChange={(e) =>
                  setBarangForm({ ...barangForm, catatan: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Package className="w-4 h-4" />
                )}
                Kirim Rincian Donasi Barang
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: IDENTITAS DONATUR */}
        {activeTab === "profil" && (
          <form onSubmit={handleSaveProfil} className="p-6 space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap / Instansi Donatur
                </label>
                <input
                  type="text"
                  required
                  value={profilForm.nama_donatur}
                  onChange={(e) =>
                    setProfilForm({
                      ...profilForm,
                      nama_donatur: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tipe Donatur
                </label>
                <select
                  value={profilForm.tipe_donatur}
                  onChange={(e) =>
                    setProfilForm({
                      ...profilForm,
                      tipe_donatur: e.target.value,
                    })
                  }
                  className={inputClass}
                >
                  {tipeDonaturOptions.map((opt) => (
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nomor Telepon / WA
                </label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={profilForm.no_telepon}
                  onChange={(e) =>
                    setProfilForm({ ...profilForm, no_telepon: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="donatur@email.com"
                  value={profilForm.email}
                  onChange={(e) =>
                    setProfilForm({ ...profilForm, email: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Frekuensi Donasi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bulanan / Insidental"
                  value={profilForm.frekuensi_donasi}
                  onChange={(e) =>
                    setProfilForm({
                      ...profilForm,
                      frekuensi_donasi: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Alamat Domisili
              </label>
              <textarea
                rows={2}
                value={profilForm.alamat}
                onChange={(e) =>
                  setProfilForm({ ...profilForm, alamat: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan Identitas Donatur
            </button>
          </form>
        )}
      </div>

      {/* Riwayat Transaksi Donasi Donatur */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">
            Riwayat Donasi Saya ({riwayat.length})
          </h2>
        </div>

        {riwayat.length === 0 ? (
          <div className="p-10 text-center text-xs text-gray-500">
            Belum ada riwayat transaksi donasi yang tercatat pada akun Anda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-600 uppercase">
                  <th className="py-3 px-4">Kode & Tanggal</th>
                  <th className="py-3 px-4">Rincian Donasi</th>
                  <th className="py-3 px-4">Status Verifikasi</th>
                  <th className="py-3 px-4 text-right">Lampiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {riwayat.map((tx: DonasiTransactionItem) => (
                  <tr key={tx.id_donasi} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4 text-xs">
                      <p className="font-mono font-bold text-blue-700">
                        {tx.kode_donasi}
                      </p>
                      <p className="text-gray-600 mt-0.5">
                        {tx.tanggal_donasi_display}
                      </p>
                      {tx.is_anonim && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          Anonim (Hamba Allah)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      {tx.jenis_donasi === "uang" && tx.donasi_uang ? (
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {formatRupiah(tx.donasi_uang.nominal)}
                          </p>
                          <p className="text-gray-500 mt-0.5">
                            Metode:{" "}
                            {formatEnumLabel(tx.donasi_uang.metode_pembayaran)}
                          </p>
                        </div>
                      ) : tx.donasi_barang ? (
                        <div>
                          <p className="font-bold text-gray-900">
                            {tx.donasi_barang.nama_barang} (
                            {tx.donasi_barang.jumlah} {tx.donasi_barang.satuan})
                          </p>
                          <p className="text-gray-500 mt-0.5">
                            Kategori:{" "}
                            {formatEnumLabel(tx.donasi_barang.kategori_barang)}
                            {tx.donasi_barang.nomor_resi_ekspedisi
                              ? ` • Resi: ${tx.donasi_barang.nomor_resi_ekspedisi}`
                              : ""}
                          </p>
                        </div>
                      ) : null}
                      {tx.catatan && (
                        <p className="text-[11px] text-gray-500 mt-1">
                          {tx.catatan}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {tx.status_verifikasi === "terverifikasi" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Terverifikasi
                        </span>
                      )}
                      {tx.status_verifikasi === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          Menunggu Verifikasi
                        </span>
                      )}
                      {tx.status_verifikasi === "ditolak" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" />
                          Ditolak
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {tx.bukti_pembayaran ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewReceipt({
                              title: `Lampiran ${tx.kode_donasi}`,
                              path: tx.bukti_pembayaran!,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Pratinjau
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Pratinjau Bukti */}
      {previewReceipt && (
        <div
          onClick={() => setPreviewReceipt(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {previewReceipt.title}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewReceipt.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Tab Baru
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewReceipt(null)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center overflow-auto">
              {isPdfFile(previewReceipt.path) ? (
                <iframe
                  src={previewReceipt.path}
                  title={previewReceipt.title}
                  className="w-full h-full rounded-xl border border-gray-300 bg-white"
                />
              ) : (
                <img
                  src={previewReceipt.path}
                  alt={previewReceipt.title}
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
