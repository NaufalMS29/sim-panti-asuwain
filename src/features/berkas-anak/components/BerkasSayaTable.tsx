"use client";

import { Download, Eye, FolderOpen } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { BerkasAnakItem } from "../types/berkas-anak.types";
import { formatEnumLabel } from "../utils/berkas-anak.utils";

interface BerkasSayaTableProps {
  berkasList: BerkasAnakItem[];
  totalUploaded: number;
  onPreview: (item: BerkasAnakItem) => void;
}

export function BerkasSayaTable({
  berkasList,
  totalUploaded,
  onPreview,
}: BerkasSayaTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
      {berkasList.length === 0 ? (
        <div className="p-12 text-center space-y-2">
          <FolderOpen className="w-9 h-9 text-gray-400 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">
            {totalUploaded === 0
              ? "Belum ada berkas dokumen yang diunggah"
              : "Tidak ada berkas yang sesuai dengan filter"}
          </p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {totalUploaded === 0
              ? "Dokumen seperti Kartu Keluarga, Akta Kelahiran, Rapor, dan Ijazah Anda akan muncul di sini setelah diunggah oleh pengurus panti."
              : "Coba ubah kata kunci pencarian atau pilih kategori dokumen lainnya."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <th className="py-3.5 px-4">Kategori Berkas</th>
                <th className="py-3.5 px-4">Nama / Keterangan Dokumen</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {berkasList.map((item) => (
                <tr key={item.id_berkas} className="hover:bg-gray-50/70">
                  <td className="py-3.5 px-4">
                    <Badge variant="slate" className="rounded-md">
                      {formatEnumLabel(item.jenis_berkas)}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-gray-900">
                    {item.nama_file}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        variant="outline-blue"
                        size="sm"
                        className="px-3 py-1.5"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => onPreview(item)}
                      >
                        Pratinjau
                      </Button>
                    </div>
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
