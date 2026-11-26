"use client";

import { useState } from "react";
import { CalendarCheck, Search } from "lucide-react";
import { PublicKunjunganForm } from "./PublicKunjunganForm";
import { PublicKunjunganTracker } from "./PublicKunjunganTracker";

interface PublicKunjunganPortalProps {
  initialTicketCode?: string;
}

export function PublicKunjunganPortal({
  initialTicketCode = "",
}: PublicKunjunganPortalProps) {
  const [activeTab, setActiveTab] = useState<"ajukan" | "cek">(
    initialTicketCode ? "cek" : "ajukan",
  );
  const [trackerCode, setTrackerCode] = useState(initialTicketCode);

  function handleSwitchToTracker(kodeTiket: string) {
    setTrackerCode(kodeTiket);
    setActiveTab("cek");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold tracking-wide text-blue-700 uppercase">
          Layanan Publik & Silaturahmi
        </span>
        <h1 className="mt-2.5 text-3xl font-bold tracking-tight text-gray-900">
          Jadwal Kunjungan Panti Asuhan Asuwain Timor
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600">
          Ajukan permohonan kunjungan sosial, penyaluran donasi langsung, atau
          kegiatan bersama anak-anak panti. Konfirmasi e-tiket dikirim otomatis
          ke email Anda.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="mb-6 flex rounded-xl border border-gray-200 bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("ajukan")}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
            activeTab === "ajukan"
              ? "bg-blue-700 text-white shadow-2xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <CalendarCheck className="h-4 w-4" />
          Ajukan Kunjungan Baru
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cek")}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
            activeTab === "cek"
              ? "bg-blue-700 text-white shadow-2xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Search className="h-4 w-4" />
          Cek Status & E-Tiket
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs sm:p-8">
        {activeTab === "ajukan" ? (
          <PublicKunjunganForm onSwitchToTracker={handleSwitchToTracker} />
        ) : (
          <PublicKunjunganTracker key={trackerCode} initialCode={trackerCode} />
        )}
      </div>
    </div>
  );
}
