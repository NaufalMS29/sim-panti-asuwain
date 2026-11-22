"use client";

import { useState } from "react";
import { Button, FormInput, FormSelect, Modal } from "@/components/ui";
import {
  RoleOption,
  UserActionResponse,
  UserManagementItem,
} from "../types/users.types";
import { updateUserAction } from "../actions/users.actions";

interface UserEditModalProps {
  user: UserManagementItem | null;
  roles: RoleOption[];
  onClose: () => void;
  onResult: (res: UserActionResponse) => void;
}

export function UserEditModal({
  user,
  roles,
  onClose,
  onResult,
}: UserEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [roleId, setRoleId] = useState(user ? String(user.role_id) : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const res = await updateUserAction(user.id_user, {
      username,
      email,
      role_id: Number(roleId),
    });
    setLoading(false);

    onResult(res);
    if (res.success) {
      onClose();
    }
  };

  return (
    <Modal
      open={Boolean(user)}
      title={user ? `Ubah Data Akun (${user.username})` : ""}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <FormInput
          label="Email (Opsional)"
          type="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormSelect
          label="Role Pengguna"
          required
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
        >
          {roles.map((r) => (
            <option
              key={r.id_role}
              value={String(r.id_role)}
              className="text-gray-900 bg-white"
            >
              {r.nama_role}
            </option>
          ))}
        </FormSelect>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
