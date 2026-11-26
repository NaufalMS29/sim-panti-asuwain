"use client";

import React, { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Clock, Printer, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { cekStatusKunjunganAction } from "../actions/kunjungan.actions";
import { JadwalKunjunganDTO } from "../types/kunjungan.types";

interface PublicKunjunganTrackerProps {
  initialCode?: string;
}

export function PublicKunjunganTracker({
  initialCode = "",
}: PublicKunjunganTrackerProps) {
  const [searchCode, setSearchCode] = useState(initialCode);
  const [ticket, setTicket] = useState<JadwalKunjunganDTO | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(() =>
    Boolean(initialCode.trim()),
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const trimmed = initialCode.trim();
    if (!trimmed) return;

    let cancelled = false;

    cekStatusKunjunganAction(trimmed).then((res) => {
      if (cancelled) return;
      if (!res.success || !res.data) {
        setErrorMessage(res.message);
        setTicket(null);
      } else {
        setErrorMessage(null);
        setTicket(res.data);
      }
      setIsInitialLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [initialCode]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setErrorMessage(null);
    setTicket(null);

    startTransition(async () => {
      const res = await cekStatusKunjunganAction(searchCode);
      if (!res.success || !res.data) {
        setErrorMessage(res.message);
        return;
      }
      setTicket(res.data);
    });
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="text"
          required
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
          placeholder="Masukkan Kode Tiket (contoh: KNJ-20261127-A1B2)"
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm text-gray-900 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isPending || isInitialLoading}
          icon={<Search className="h-4 w-4" />}
        >
          Cek Status
        </Button>
      </form>

      {errorMessage && (
        <AlertBanner
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {ticket && (
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                Kode Tiket Kunjungan
              </span>
              <h3 className="font-mono text-xl font-bold text-blue-800">
                {ticket.kode_tiket}
              </h3>
            </div>

            {ticket.status_kunjungan === "disetujui" && (
              <Badge
                variant="emerald"
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              >
                DISETUJUI
              </Badge>
            )}
            {ticket.status_kunjungan === "pending" && (
              <Badge variant="amber" icon={<Clock className="h-3.5 w-3.5" />}>
                MENUNGGU VERIFIKASI
              </Badge>
            )}
            {ticket.status_kunjungan === "ditolak" && (
              <Badge variant="red" icon={<XCircle className="h-3.5 w-3.5" />}>
                DITOLAK
              </Badge>
            )}
          </div>

          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-gray-500">Nama Penanggung Jawab</dt>
              <dd className="font-semibold text-gray-900">
                {ticket.nama_pengunjung}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Instansi / Organisasi</dt>
              <dd className="font-semibold text-gray-900">
                {ticket.instansi_organisasi || "Perorangan / Keluarga"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Tanggal & Jam Kunjungan</dt>
              <dd className="font-semibold text-gray-900">
                {ticket.tanggal_rencana} &bull; Pukul {ticket.jam_rencana} WIB
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Jumlah Rombongan</dt>
              <dd className="font-semibold text-gray-900">
                {ticket.jumlah_rombongan} orang
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-500">Tujuan Kunjungan</dt>
              <dd className="mt-0.5 text-gray-800">
                {ticket.tujuan_kunjungan}
              </dd>
            </div>
          </dl>

          {ticket.catatan_pengurus && (
            <AlertBanner
              type="warning"
              message={`Catatan Pengurus Panti: ${ticket.catatan_pengurus}`}
            />
          )}

          {ticket.status_kunjungan === "disetujui" && (
            <div className="flex justify-end border-t border-gray-200 pt-4 print:hidden">
              <Button
                variant="primary"
                size="sm"
                icon={<Printer className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Cetak / Simpan PDF E-Tiket
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
