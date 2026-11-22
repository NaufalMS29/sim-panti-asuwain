"use client";

import { useState } from "react";
import { Button, FormInput, FormSelect, Modal } from "@/components/ui";
import { RoleOption, UserActionResponse } from "../types/users.types";
import { createUserAction } from "../actions/users.actions";

interface UserCreateModalProps {
  open: boolean;
  roles: RoleOption[];
  onClose: () => void;
  onResult: (res: UserActionResponse) => void;
}

export function UserCreateModal({
  open,
  roles,
  onClose,
  onResult,
}: UserCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<string>(String(roles[0]?.id_role ?? ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createUserAction({
      username,
      email,
      password,
      role_id: Number(roleId),
    });
    setLoading(false);

    onResult(res);
    if (res.success) {
      setUsername("");
      setEmail("");
      setPassword("");
      onClose();
    }
  };

  return (
    <Modal open={open} title="Tambah Akun Pengguna Baru" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormSelect
          label="Role Akun"
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

        <FormInput
          label="Username Login"
          type="text"
          required
          placeholder="Contoh: pengurus.siti"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <FormInput
          label="Email (Opsional)"
          type="email"
          placeholder="nama@email.com"
          hint="Digunakan untuk OTP atau login Google OAuth."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormInput
          label="Password Awal (Opsional)"
          type="password"
          placeholder="Kosongkan untuk password default"
          hint="Minimal 6 karakter, atau kosongkan untuk memakai default: asuwain123"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Simpan Akun
          </Button>
        </div>
      </form>
    </Modal>
  );
}
