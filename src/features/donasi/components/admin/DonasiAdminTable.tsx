"use client";

import {
  Banknote,
  CheckCircle2,
  Clock,
  Eye,
  Package,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { DonasiTransactionItem } from "../../types/donasi.types";
import { formatEnumLabel, formatRupiah } from "../../utils/donasi.utils";

interface DonasiAdminTableProps {
  transactions: DonasiTransactionItem[];
  canVerify: boolean;
  canDelete: boolean;
  loading: boolean;
  onInspect: (tx: DonasiTransactionItem) => void;
  onDelete: (tx: DonasiTransactionItem) => void;
}

export function DonasiAdminTable({
  transactions,
  canVerify,
  canDelete,
  loading,
  onInspect,
  onDelete,
}: DonasiAdminTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
              <th className="py-3.5 px-4">Kode & Pengirim</th>
              <th className="py-3.5 px-4">Jenis</th>
              <th className="py-3.5 px-4">Rincian Donasi</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Verifikasi & Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-gray-500 text-sm"
                >
                  Tidak ada transaksi donasi yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id_donasi} className="hover:bg-gray-50/70">
                  <td className="py-3.5 px-4">
                    <p className="text-[11px] font-mono font-bold text-blue-700">
                      {tx.kode_donasi}
                    </p>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {tx.nama_pengirim}
                      {tx.is_anonim && (
                        <Badge variant="slate" className="ml-1.5 text-[10px]">
                          Anonim
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tx.tanggal_donasi_display}
                      {tx.nama_donatur_terdaftar
                        ? ` • Akun: ${tx.nama_donatur_terdaftar}`
                        : ""}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    {tx.jenis_donasi === "uang" ? (
                      <Badge variant="emerald">
                        <Banknote className="w-3.5 h-3.5" />
                        Uang
                      </Badge>
                    ) : (
                      <Badge variant="blue">
                        <Package className="w-3.5 h-3.5" />
                        Barang
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
                          {formatEnumLabel(tx.donasi_barang.kategori_barang)}
                          {tx.donasi_barang.nomor_resi_ekspedisi
                            ? ` • Resi: ${tx.donasi_barang.nomor_resi_ekspedisi}`
                            : ""}
                        </p>
                      </div>
                    ) : null}
                    {tx.catatan && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
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
                    {tx.status_verifikasi === "terverifikasi" &&
                      tx.verifikator_nama && (
                        <p className="text-[11px] text-gray-500 mt-1">
                          Oleh:{" "}
                          <span className="font-medium text-gray-700">
                            {tx.verifikator_nama}
                          </span>
                        </p>
                      )}
                    {tx.status_verifikasi === "pending" && (
                      <Badge variant="amber">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
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
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline-blue"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => onInspect(tx)}
                      >
                        {tx.status_verifikasi === "pending" && canVerify
                          ? "Periksa & Verifikasi"
                          : "Detail"}
                      </Button>

                      {canDelete && (
                        <Button
                          type="button"
                          variant="outline-red"
                          size="xs"
                          disabled={loading}
                          onClick={() => onDelete(tx)}
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
