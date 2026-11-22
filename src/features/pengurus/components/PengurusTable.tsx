"use client";

import { Pencil, KeyRound, Trash2, Phone, MapPin } from "lucide-react";
import { Badge, Button, EmptyTableRow } from "@/components/ui";
import { PengurusItem } from "../types/pengurus.types";

interface PengurusTableProps {
  pengurusList: PengurusItem[];
  loading: boolean;
  canResetPassword: boolean;
  onEdit: (item: PengurusItem) => void;
  onResetPassword: (item: PengurusItem) => void;
  onDelete: (item: PengurusItem) => void;
}

export function PengurusTable({
  pengurusList,
  loading,
  canResetPassword,
  onEdit,
  onResetPassword,
  onDelete,
}: PengurusTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
              <th className="py-3.5 px-4">Nama & Alamat</th>
              <th className="py-3.5 px-4">Jabatan</th>
              <th className="py-3.5 px-4">No. Telepon</th>
              <th className="py-3.5 px-4">Akun Login</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {pengurusList.length === 0 ? (
              <EmptyTableRow
                colSpan={5}
                message="Belum ada data pengurus yang sesuai dengan filter."
              />
            ) : (
              pengurusList.map((item) => (
                <tr key={item.id_pengurus} className="hover:bg-gray-50/70">
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-semibold text-gray-900">
                      {item.nama_pengurus}
                    </p>
                    <p className="inline-flex items-start gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{item.alamat}</span>
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant="blue">{item.jabatan}</Badge>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-gray-700 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {item.no_telepon}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge
                      variant="slate"
                      icon={<KeyRound className="w-3 h-3" />}
                      className="font-mono"
                    >
                      {item.username}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {canResetPassword && (
                        <Button
                          variant="outline-blue"
                          size="xs"
                          disabled={loading}
                          onClick={() => onResetPassword(item)}
                          title="Reset Password ke Default (asuwain123)"
                          icon={<KeyRound className="w-4 h-4" />}
                        />
                      )}

                      <Button
                        variant="outline-amber"
                        size="xs"
                        disabled={loading}
                        onClick={() => onEdit(item)}
                        title="Ubah Data Pengurus"
                        icon={<Pencil className="w-4 h-4" />}
                      />

                      <Button
                        variant="outline-red"
                        size="xs"
                        disabled={loading}
                        onClick={() => onDelete(item)}
                        title="Hapus Pengurus & Akun"
                        icon={<Trash2 className="w-4 h-4" />}
                      />
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
