"use client";

import { Pencil, KeyRound, Trash2, Mail, Globe, Lock } from "lucide-react";
import { Badge, BadgeVariant, Button, EmptyTableRow } from "@/components/ui";
import { UserManagementItem } from "../types/users.types";

interface UserTableProps {
  users: UserManagementItem[];
  currentUserId: number | null;
  loading: boolean;
  onEdit: (user: UserManagementItem) => void;
  onResetDefaultPassword: (user: UserManagementItem) => void;
  onDelete: (user: UserManagementItem) => void;
}

function getRoleBadgeVariant(roleName: string): BadgeVariant {
  const key = roleName.toLowerCase();
  if (key === "admin") return "purple";
  if (key.includes("pengurus")) return "blue";
  if (key.includes("anak")) return "amber";
  return "emerald";
}

export function UserTable({
  users,
  currentUserId,
  loading,
  onEdit,
  onResetDefaultPassword,
  onDelete,
}: UserTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
              <th className="py-3.5 px-4">Akun & Profil</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Metode Autentikasi</th>
              <th className="py-3.5 px-4">Terdaftar</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {users.length === 0 ? (
              <EmptyTableRow
                colSpan={5}
                message="Tidak ada akun pengguna yang sesuai dengan filter."
              />
            ) : (
              users.map((u) => {
                const isSelf =
                  currentUserId !== null && u.id_user === currentUserId;
                return (
                  <tr key={u.id_user} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 font-mono">
                          {u.username}
                        </span>
                        {isSelf && (
                          <Badge variant="slate" className="text-[10px] py-0">
                            Anda
                          </Badge>
                        )}
                      </div>
                      {u.email && (
                        <p className="inline-flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {u.email}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {u.linked_name
                          ? `Profil Terkait: ${u.linked_name}`
                          : "Belum tertaut profil detail"}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={getRoleBadgeVariant(u.nama_role)}>
                        {u.nama_role}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.has_password && (
                          <Badge
                            variant="slate"
                            icon={<Lock className="w-3 h-3" />}
                          >
                            Password
                          </Badge>
                        )}
                        {u.has_google && (
                          <Badge
                            variant="blue"
                            icon={<Globe className="w-3 h-3" />}
                          >
                            Google
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      {u.created_at}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="outline-blue"
                          size="xs"
                          disabled={loading}
                          onClick={() => onResetDefaultPassword(u)}
                          title="Reset Password ke Default (asuwain123)"
                          icon={<KeyRound className="w-4 h-4" />}
                        />

                        <Button
                          variant="outline-amber"
                          size="xs"
                          disabled={loading}
                          onClick={() => onEdit(u)}
                          title="Ubah Username, Email, atau Role"
                          icon={<Pencil className="w-4 h-4" />}
                        />

                        {!isSelf && (
                          <Button
                            variant="outline-red"
                            size="xs"
                            disabled={loading}
                            onClick={() => onDelete(u)}
                            title="Hapus Akun"
                            icon={<Trash2 className="w-4 h-4" />}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
