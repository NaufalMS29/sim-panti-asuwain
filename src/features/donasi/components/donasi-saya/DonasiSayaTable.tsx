"use client";

import { CheckCircle2, Clock, Eye, XCircle } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { DonasiTransactionItem } from "../../types/donasi.types";
import { formatEnumLabel, formatRupiah } from "../../utils/donasi.utils";

interface DonasiSayaTableProps {
  riwayat: DonasiTransactionItem[];
  onPreviewReceipt: (preview: { title: string; path: string }) => void;
}

export function DonasiSayaTable({
  riwayat,
  onPreviewReceipt,
}: DonasiSayaTableProps) {
  return (
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
              {riwayat.map((tx) => (
                <tr key={tx.id_donasi} className="hover:bg-gray-50/70">
                  <td className="py-3.5 px-4 text-xs">
                    <p className="font-mono font-bold text-blue-700">
                      {tx.kode_donasi}
                    </p>
                    <p className="text-gray-600 mt-0.5">
                      {tx.tanggal_donasi_display}
                    </p>
                    {tx.is_anonim && (
                      <Badge variant="slate" className="mt-1 text-[10px]">
                        Anonim (Hamba Allah)
                      </Badge>
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
                      <Badge variant="emerald">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Terverifikasi
                      </Badge>
                    )}
                    {tx.status_verifikasi === "pending" && (
                      <Badge variant="amber">
                        <Clock className="w-3.5 h-3.5" />
                        Menunggu Verifikasi
                      </Badge>
                    )}
                    {tx.status_verifikasi === "ditolak" && (
                      <Badge variant="red">
                        <XCircle className="w-3.5 h-3.5" />
                        Ditolak
                      </Badge>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {tx.bukti_pembayaran ? (
                      <Button
                        type="button"
                        variant="outline-blue"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() =>
                          onPreviewReceipt({
                            title: `Lampiran ${tx.kode_donasi}`,
                            path: tx.bukti_pembayaran!,
                          })
                        }
                      >
                        Pratinjau
                      </Button>
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
  );
}
