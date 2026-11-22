"use client";

import { useState } from "react";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  HeartHandshake,
  Package,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { DonaturFormInput } from "../../schemas/donasi.schema";
import { DonaturPortalData } from "../../types/donasi.types";
import {
  submitDonasiBarangAction,
  submitDonasiUangAction,
  updateOwnDonaturProfileAction,
} from "../../actions/donasi.actions";
import { formatEnumLabel } from "../../utils/donasi.utils";
import { DonasiSayaStatsCards } from "./DonasiSayaStatsCards";
import { DonasiUangFormCard } from "./DonasiUangFormCard";
import { DonasiBarangFormCard } from "./DonasiBarangFormCard";
import { DonaturProfilFormCard } from "./DonaturProfilFormCard";
import { DonasiSayaTable } from "./DonasiSayaTable";
import { DonasiLampiranPreviewModal } from "./DonasiLampiranPreviewModal";

interface DonasiSayaClientPageProps {
  portalData: DonaturPortalData;
  tipeDonaturOptions: string[];
}

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

  const [previewReceipt, setPreviewReceipt] = useState<{
    title: string;
    path: string;
  } | null>(null);

  const handleSubmitUang = async (fd: FormData): Promise<boolean> => {
    setBanner(null);
    setLoading(true);
    const res = await submitDonasiUangAction(fd);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
    return res.success;
  };

  const handleSubmitBarang = async (fd: FormData): Promise<boolean> => {
    setBanner(null);
    setLoading(true);
    const res = await submitDonasiBarangAction(fd);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
    return res.success;
  };

  const handleSaveProfil = async (input: DonaturFormInput) => {
    setBanner(null);
    setLoading(true);
    const res = await updateOwnDonaturProfileAction(input);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const pendingCount = riwayat.filter(
    (r) => r.status_verifikasi === "pending",
  ).length;

  return (
    <div className="space-y-6 max-w-5xl">
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

        <Badge variant="blue" className="px-3.5 py-2 text-xs w-fit">
          <HeartHandshake className="w-4 h-4 text-blue-700" />
          {profil.nama_donatur} ({formatEnumLabel(profil.tipe_donatur)})
        </Badge>
      </div>

      <DonasiSayaStatsCards
        totalDonasiUang={profil.total_donasi_uang}
        totalTransaksi={profil.total_transaksi}
        pendingCount={pendingCount}
      />

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

        {activeTab === "uang" && (
          <DonasiUangFormCard
            key={`uang-${profil.nama_donatur}`}
            defaultNamaPengirim={profil.nama_donatur ?? ""}
            loading={loading}
            onValidationError={(text) => setBanner({ type: "error", text })}
            onSubmitUang={handleSubmitUang}
          />
        )}

        {activeTab === "barang" && (
          <DonasiBarangFormCard
            key={`barang-${profil.nama_donatur}`}
            defaultNamaPengirim={profil.nama_donatur ?? ""}
            loading={loading}
            onSubmitBarang={handleSubmitBarang}
          />
        )}

        {activeTab === "profil" && (
          <DonaturProfilFormCard
            key={profil.id_donatur}
            profil={profil}
            tipeDonaturOptions={tipeDonaturOptions}
            loading={loading}
            onSaveProfil={handleSaveProfil}
          />
        )}
      </div>

      <DonasiSayaTable riwayat={riwayat} onPreviewReceipt={setPreviewReceipt} />

      <DonasiLampiranPreviewModal
        preview={previewReceipt}
        onClose={() => setPreviewReceipt(null)}
      />
    </div>
  );
}
