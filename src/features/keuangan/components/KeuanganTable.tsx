"use client";

import {
  Eye,
  Link2,
  Pencil,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { TransaksiKasItem } from "../types/keuangan.types";
import { formatRupiah } from "../utils/keuangan.utils";

interface KeuanganTableProps {
  transactions: TransaksiKasItem[];
  canManage: boolean;
  loading: boolean;
  onPreviewNota: (preview: { title: string; path: string }) => void;
  onEdit: (item: TransaksiKasItem) => void;
  onDelete: (item: TransaksiKasItem) => void;
}

export function KeuanganTable({
  transactions,
  canManage,
  loading,
  onPreviewNota,
  onEdit,
  onDelete,
}: KeuanganTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
              <th className="py-3.5 px-4">Tanggal & Sumber</th>
              <th className="py-3.5 px-4">Jenis & Kategori</th>
              <th className="py-3.5 px-4">Keterangan</th>
              <th className="py-3.5 px-4 text-right">Nominal</th>
              <th className="py-3.5 px-4 text-right">Nota & Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-gray-500 text-sm"
                >
                  Belum ada catatan transaksi kas yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id_transaksi_kas} className="hover:bg-gray-50/70">
                  <td className="py-3.5 px-4 text-xs">
                    <p className="font-semibold text-gray-900">
                      {tx.tanggal_transaksi_display}
                    </p>
                    <div className="mt-1">
                      {tx.is_auto_donasi ? (
                        <Badge
                          variant="blue"
                          icon={<Link2 className="w-3 h-3" />}
                          className="text-[10px] font-mono"
                        >
                          {tx.kode_donasi}
                        </Badge>
                      ) : (
                        <Badge variant="slate" className="text-[10px]">
                          Kas Manual
                        </Badge>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs">
                    {tx.jenis_transaksi === "pemasukan" ? (
                      <Badge
                        variant="emerald"
                        icon={<TrendingUp className="w-3.5 h-3.5" />}
                      >
                        Pemasukan
                      </Badge>
                    ) : (
                      <Badge
                        variant="red"
                        icon={<TrendingDown className="w-3.5 h-3.5" />}
                      >
                        Pengeluaran
                      </Badge>
                    )}
                    <p className="font-semibold text-gray-800 mt-1">
                      {tx.nama_kategori}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-xs max-w-md">
                    <p className="text-gray-800 leading-relaxed">
                      {tx.keterangan}
                    </p>
                    {tx.pencatat_nama && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        {tx.is_auto_donasi ? "Diverifikasi" : "Dicatat"} oleh:{" "}
                        <span className="font-medium text-gray-700">
                          {tx.pencatat_nama}
                        </span>
                      </p>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span
                      className={`font-bold text-sm ${
                        tx.jenis_transaksi === "pemasukan"
                          ? "text-emerald-700"
                          : "text-red-700"
                      }`}
                    >
                      {tx.jenis_transaksi === "pemasukan" ? "+ " : "- "}
                      {formatRupiah(tx.nominal)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {tx.file_nota && (
                        <Button
                          type="button"
                          variant="outline-blue"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() =>
                            onPreviewNota({
                              title: `Nota Kas: ${tx.nama_kategori} (${tx.tanggal_transaksi_display})`,
                              path: tx.file_nota!,
                            })
                          }
                          title="Lihat Nota / Bukti"
                        >
                          Nota
                        </Button>
                      )}

                      {canManage && !tx.is_auto_donasi && (
                        <>
                          <Button
                            type="button"
                            variant="outline-amber"
                            size="xs"
                            disabled={loading}
                            onClick={() => onEdit(tx)}
                            title="Ubah Transaksi Manual"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline-red"
                            size="xs"
                            disabled={loading}
                            onClick={() => onDelete(tx)}
                            title="Hapus Transaksi Manual"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
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
