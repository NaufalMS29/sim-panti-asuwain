"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { DonaturItem } from "../../types/donasi.types";
import { formatEnumLabel, formatRupiah } from "../../utils/donasi.utils";

interface DonaturTableProps {
  donaturList: DonaturItem[];
  canManage: boolean;
  onEdit: (item: DonaturItem) => void;
  onDelete: (item: DonaturItem) => void;
}

export function DonaturTable({
  donaturList,
  canManage,
  onEdit,
  onDelete,
}: DonaturTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
              <th className="py-3.5 px-4">Nama Donatur</th>
              <th className="py-3.5 px-4">Tipe & Frekuensi</th>
              <th className="py-3.5 px-4">Kontak & Alamat</th>
              <th className="py-3.5 px-4">Kontribusi Terverifikasi</th>
              {canManage && <th className="py-3.5 px-4 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {donaturList.length === 0 ? (
              <tr>
                <td
                  colSpan={canManage ? 5 : 4}
                  className="py-10 text-center text-gray-500 text-sm"
                >
                  Tidak ada data donatur yang sesuai.
                </td>
              </tr>
            ) : (
              donaturList.map((item) => (
                <tr key={item.id_donatur} className="hover:bg-gray-50/70">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-gray-900">
                      {item.nama_donatur}
                    </p>
                    {item.username && (
                      <p className="text-[11px] font-mono text-blue-700 mt-0.5">
                        Akun Portal: {item.username}
                      </p>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-xs">
                    <Badge variant="purple">
                      {formatEnumLabel(item.tipe_donatur)}
                    </Badge>
                    {item.frekuensi_donasi && (
                      <p className="text-gray-500 mt-1">
                        Frekuensi: {item.frekuensi_donasi}
                      </p>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-xs text-gray-600 space-y-0.5">
                    <p className="font-mono text-gray-800">
                      {item.no_telepon || "-"}
                    </p>
                    {item.email && <p>{item.email}</p>}
                    {item.alamat && (
                      <p className="line-clamp-1 text-gray-500">
                        {item.alamat}
                      </p>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-xs">
                    <p className="font-bold text-emerald-700">
                      {formatRupiah(item.total_donasi_uang)}
                    </p>
                    <p className="text-gray-500 mt-0.5">
                      {item.total_transaksi} transaksi terverifikasi
                    </p>
                  </td>

                  {canManage && (
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline-blue"
                          size="xs"
                          onClick={() => onEdit(item)}
                          title="Ubah Data Donatur"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline-red"
                          size="xs"
                          onClick={() => onDelete(item)}
                          title="Hapus Data Donatur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
