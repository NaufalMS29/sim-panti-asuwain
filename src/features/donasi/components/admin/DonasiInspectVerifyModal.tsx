"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { Button, FormInput, Modal } from "@/components/ui";
import { DonasiTransactionItem } from "../../types/donasi.types";
import {
  formatEnumLabel,
  formatRupiah,
  isPdfFile,
} from "../../utils/donasi.utils";

interface DonasiInspectVerifyModalProps {
  transaction: DonasiTransactionItem | null;
  canVerify: boolean;
  loading: boolean;
  onClose: () => void;
  onVerifyDecision: (
    id_donasi: number,
    decision: "terverifikasi" | "ditolak",
    catatan?: string,
  ) => Promise<void>;
}

export function DonasiInspectVerifyModal({
  transaction,
  canVerify,
  loading,
  onClose,
  onVerifyDecision,
}: DonasiInspectVerifyModalProps) {
  const [rejectReason, setRejectReason] = useState("");

  return (
    <Modal
      open={Boolean(transaction)}
      onClose={onClose}
      title={
        transaction
          ? `Detail Transaksi ${transaction.kode_donasi}`
          : "Detail Transaksi"
      }
      maxWidth="4xl"
    >
      {transaction && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 -mt-1">
            Pengirim: <strong>{transaction.nama_pengirim}</strong> •{" "}
            {transaction.tanggal_donasi_display}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <p className="font-bold text-slate-800 uppercase">
                  Ringkasan Transaksi
                </p>
                {transaction.jenis_donasi === "uang" &&
                transaction.donasi_uang ? (
                  <>
                    <p className="text-lg font-bold text-emerald-700">
                      {formatRupiah(transaction.donasi_uang.nominal)}
                    </p>
                    <p className="text-gray-700">
                      Metode:{" "}
                      <strong>
                        {formatEnumLabel(
                          transaction.donasi_uang.metode_pembayaran,
                        )}
                      </strong>
                    </p>
                  </>
                ) : transaction.donasi_barang ? (
                  <>
                    <p className="text-base font-bold text-gray-900">
                      {transaction.donasi_barang.nama_barang} (
                      {transaction.donasi_barang.jumlah}{" "}
                      {transaction.donasi_barang.satuan})
                    </p>
                    <p className="text-gray-700">
                      Kategori:{" "}
                      <strong>
                        {formatEnumLabel(
                          transaction.donasi_barang.kategori_barang,
                        )}
                      </strong>
                    </p>
                    <p className="text-gray-700">
                      Nomor Resi:{" "}
                      <span className="font-mono">
                        {transaction.donasi_barang.nomor_resi_ekspedisi || "-"}
                      </span>
                    </p>
                  </>
                ) : null}
                <p className="text-gray-700">
                  Publikasi:{" "}
                  <strong>
                    {transaction.is_anonim
                      ? "Anonim (Hamba Allah)"
                      : transaction.nama_pengirim}
                  </strong>
                </p>
                <p className="text-gray-600 pt-1">
                  Catatan: {transaction.catatan || "-"}
                </p>
              </div>

              {canVerify && transaction.status_verifikasi === "pending" && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-3">
                  <p className="text-xs font-bold text-amber-900">
                    Tindakan Verifikasi Pengurus
                  </p>

                  <Button
                    type="button"
                    variant="success"
                    loading={loading}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() =>
                      onVerifyDecision(transaction.id_donasi, "terverifikasi")
                    }
                    className="w-full"
                  >
                    Setujui & Verifikasi Donasi
                  </Button>

                  <div className="border-t border-amber-200 pt-3 space-y-2">
                    <FormInput
                      label="Alasan Penolakan (Jika Bukti Tidak Valid / Barang Tidak Sesuai)"
                      type="text"
                      placeholder="Contoh: Nominal pada bukti transfer berbeda..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="danger"
                      loading={loading}
                      icon={<XCircle className="w-4 h-4" />}
                      onClick={() =>
                        onVerifyDecision(
                          transaction.id_donasi,
                          "ditolak",
                          rejectReason,
                        )
                      }
                      className="w-full"
                    >
                      Tolak Transaksi
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-100 rounded-xl border border-gray-200 p-3 flex flex-col min-h-80">
              {transaction.bukti_pembayaran ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">
                      Lampiran Bukti Pembayaran / Paket
                    </span>
                    <a
                      href={transaction.bukti_pembayaran}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Buka Penuh
                    </a>
                  </div>
                  <div className="flex-1 flex items-center justify-center overflow-hidden">
                    {isPdfFile(transaction.bukti_pembayaran) ? (
                      <iframe
                        src={transaction.bukti_pembayaran}
                        title="Lampiran Bukti"
                        className="w-full h-80 rounded-lg border border-gray-300 bg-white"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={transaction.bukti_pembayaran}
                        alt="Lampiran Bukti"
                        className="max-h-80 object-contain rounded-lg shadow-xs bg-white"
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-500 text-center p-6">
                  Transaksi ini tidak memiliki lampiran file bukti.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
