"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { verifyKunjunganAction } from "../actions/kunjungan.actions";
import { JadwalKunjunganDTO } from "../types/kunjungan.types";

interface KunjunganVerifyModalProps {
  item: JadwalKunjunganDTO | null;
  onClose: () => void;
}

export function KunjunganVerifyModal({
  item,
  onClose,
}: KunjunganVerifyModalProps) {
  const [catatan, setCatatan] = useState(item?.catatan_pengurus || "");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [pendingDecision, setPendingDecision] = useState<
    "disetujui" | "ditolak" | null
  >(null);
  const [isPending, startTransition] = useTransition();

  if (!item) return null;

  function handleDecision(decision: "disetujui" | "ditolak") {
    if (!item) return;
    setFeedback(null);
    setPendingDecision(decision);

    startTransition(async () => {
      const res = await verifyKunjunganAction({
        id_kunjungan: item.id_kunjungan,
        status_kunjungan: decision,
        catatan_pengurus: catatan,
      });

      setPendingDecision(null);

      if (!res.success) {
        setFeedback({ type: "error", message: res.message });
        return;
      }

      setFeedback({ type: "success", message: res.message });
      setTimeout(() => {
        onClose();
      }, 900);
    });
  }

  return (
    <Modal
      open={Boolean(item)}
      title={`Verifikasi Tiket #${item.kode_tiket}`}
      maxWidth="lg"
      closeOnBackdrop={!isPending}
      onClose={isPending ? () => {} : onClose}
    >
      <div className="space-y-4">
        <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-gray-900">
              {item.nama_pengunjung}
            </span>
            <Badge
              variant={
                item.status_kunjungan === "disetujui"
                  ? "emerald"
                  : item.status_kunjungan === "ditolak"
                    ? "red"
                    : "amber"
              }
            >
              {item.status_kunjungan.toUpperCase()}
            </Badge>
          </div>
          <p>
            <span className="text-gray-500">Instansi:</span>{" "}
            {item.instansi_organisasi || "Perorangan / Keluarga"}
          </p>
          <p>
            <span className="text-gray-500">Kontak:</span>{" "}
            {item.email_pengunjung} &bull; {item.no_telepon}
          </p>
          <p>
            <span className="text-gray-500">Jadwal:</span>{" "}
            <strong className="text-gray-900">
              {item.tanggal_rencana} pukul {item.jam_rencana} WIB
            </strong>{" "}
            ({item.jumlah_rombongan} orang)
          </p>
          <div className="border-t border-gray-200 pt-2">
            <span className="block font-semibold text-gray-600">
              Tujuan Kunjungan:
            </span>
            <p className="mt-0.5 leading-relaxed text-gray-800">
              {item.tujuan_kunjungan}
            </p>
          </div>
        </div>

        <FormTextarea
          label="Catatan / Arahan Pengurus (Dikirim Otomatis ke Email Pengunjung)"
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          disabled={isPending}
          placeholder="Contoh: Silakan hadir 15 menit sebelum jadwal melalui pintu utama. Jika menolak, wajib tuliskan alasan penolakan..."
          hint="Wajib diisi minimal 5 karakter apabila pengajuan ditolak."
        />

        {feedback && (
          <AlertBanner
            type={feedback.type}
            message={feedback.message}
            onClose={() => setFeedback(null)}
          />
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-3">
          <Button variant="secondary" disabled={isPending} onClick={onClose}>
            Tutup
          </Button>
          <Button
            variant="danger"
            icon={<XCircle className="h-4 w-4" />}
            loading={isPending && pendingDecision === "ditolak"}
            disabled={isPending}
            onClick={() => handleDecision("ditolak")}
          >
            Tolak Pengajuan
          </Button>
          <Button
            variant="success"
            icon={<CheckCircle2 className="h-4 w-4" />}
            loading={isPending && pendingDecision === "disetujui"}
            disabled={isPending}
            onClick={() => handleDecision("disetujui")}
          >
            Setujui & Kirim E-Tiket
          </Button>
        </div>
      </div>
    </Modal>
  );
}
