"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { JadwalKunjunganDTO } from "../types/kunjungan.types";

interface PublicKunjunganSuccessCardProps {
  ticket: JadwalKunjunganDTO;
  onTrackTicket: (kodeTiket: string) => void;
  onCreateAnother: () => void;
}

export function PublicKunjunganSuccessCard({
  ticket,
  onTrackTicket,
  onCreateAnother,
}: PublicKunjunganSuccessCardProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(ticket.kode_tiket);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Pengajuan Jadwal Kunjungan Terkirim
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Bukti pengajuan telah dikirimkan ke email{" "}
          <span className="font-semibold text-gray-900">
            {ticket.email_pengunjung}
          </span>
          . Simpan kode tiket berikut untuk memantau status verifikasi:
        </p>
      </div>

      <div className="mx-auto max-w-md rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/60 p-5">
        <span className="block text-[11px] font-semibold tracking-wider text-blue-700 uppercase">
          Kode Tiket Kunjungan
        </span>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="font-mono text-2xl font-bold tracking-widest text-blue-900">
            {ticket.kode_tiket}
          </span>
          <Button
            variant="secondary"
            size="xs"
            icon={
              copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )
            }
            onClick={handleCopy}
          >
            {copied ? "Tersalin" : "Salin"}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-xs text-gray-700">
        <div className="flex justify-between">
          <span className="text-gray-500">Penanggung Jawab</span>
          <span className="font-semibold text-gray-900">
            {ticket.nama_pengunjung}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Rencana Kedatangan</span>
          <span className="font-semibold text-gray-900">
            {ticket.tanggal_rencana} &bull; {ticket.jam_rencana} WIB
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Jumlah Rombongan</span>
          <span className="font-semibold text-gray-900">
            {ticket.jumlah_rombongan} orang
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-gray-500">Status Saat Ini</span>
          <Badge variant="amber" icon={<Clock className="h-3 w-3" />}>
            Menunggu Verifikasi
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Button
          variant="primary"
          size="md"
          onClick={() => onTrackTicket(ticket.kode_tiket)}
        >
          Pantau Status Tiket Ini
        </Button>
        <Button variant="secondary" size="md" onClick={onCreateAnother}>
          Ajukan Jadwal Lain
        </Button>
      </div>
    </div>
  );
}
