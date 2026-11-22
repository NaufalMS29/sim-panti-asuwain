"use client";

import { Eye, FolderOpen, Trash2 } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { BerkasAnakItem } from "../types/berkas-anak.types";
import { formatEnumLabel } from "../utils/berkas-anak.utils";

interface BerkasAnakTableProps {
  berkasList: BerkasAnakItem[];
  canManage: boolean;
  loading: boolean;
  onPreview: (item: BerkasAnakItem) => void;
  onDelete: (item: BerkasAnakItem) => void;
}

export function BerkasAnakTable({
  berkasList,
  canManage,
  loading,
  onPreview,
  onDelete,
}: BerkasAnakTableProps) {
  return (
    <div
      className={`${
        canManage ? "lg:col-span-2" : "lg:col-span-3"
      } bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs`}
    >
      {berkasList.length === 0 ? (
        <div className="p-10 text-center space-y-2">
          <FolderOpen className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">
            Belum ada berkas dokumen
          </p>
          <p className="text-xs text-gray-500">
            Unggah KK, Akta Kelahiran, Ijazah, KTP, atau Rapor anak pada form di
            samping.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <th className="py-3 px-4">Jenis Berkas</th>
                <th className="py-3 px-4">Nama / Keterangan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {berkasList.map((item) => (
                <tr key={item.id_berkas} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4">
                    <Badge variant="slate" className="rounded-md">
                      {formatEnumLabel(item.jenis_berkas)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-gray-900">
                    {item.nama_file}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        variant="outline-blue"
                        size="sm"
                        className="px-2.5 py-1.5"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => onPreview(item)}
                      >
                        Preview
                      </Button>

                      {canManage && (
                        <Button
                          variant="outline-red"
                          size="xs"
                          disabled={loading}
                          onClick={() => onDelete(item)}
                          title="Hapus Berkas"
                          icon={<Trash2 className="w-4 h-4" />}
                        />
                      )}
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
