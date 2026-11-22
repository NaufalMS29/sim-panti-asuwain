"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { AlertBanner, Button, ConfirmModal } from "@/components/ui";
import {
  RoleOption,
  UserActionResponse,
  UserManagementItem,
} from "../types/users.types";
import {
  deleteUserAction,
  resetUserPasswordAction,
} from "../actions/users.actions";
import { UserFilterBar } from "./UserFilterBar";
import { UserTable } from "./UserTable";
import { UserCreateModal } from "./UserCreateModal";
import { UserEditModal } from "./UserEditModal";

interface UsersClientPageProps {
  initialUsers: UserManagementItem[];
  roles: RoleOption[];
  currentUserId: number | null;
}

export function UsersClientPage({
  initialUsers,
  roles,
  currentUserId,
}: UsersClientPageProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("semua");
  const [authFilter, setAuthFilter] = useState<"semua" | "google" | "lokal">(
    "semua",
  );

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserManagementItem | null>(null);
  const [resetTarget, setResetTarget] = useState<UserManagementItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<UserManagementItem | null>(
    null,
  );

  const filteredUsers = initialUsers.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.username.toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.linked_name || "").toLowerCase().includes(q);
    const matchRole =
      roleFilter === "semua" || String(u.role_id) === roleFilter;
    const matchAuth =
      authFilter === "semua" ||
      (authFilter === "google" && u.has_google) ||
      (authFilter === "lokal" && u.has_password);

    return matchSearch && matchRole && matchAuth;
  });

  const handleActionResult = (res: UserActionResponse) => {
    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const handleConfirmResetPassword = async () => {
    if (!resetTarget) return;

    setLoading(true);
    setBanner(null);
    const res = await resetUserPasswordAction(resetTarget.id_user);
    setLoading(false);
    setResetTarget(null);
    handleActionResult(res);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setLoading(true);
    setBanner(null);
    const res = await deleteUserAction(deleteTarget.id_user);
    setLoading(false);
    setDeleteTarget(null);
    handleActionResult(res);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Akun & Hak Akses
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola akun Admin, Pengurus Panti, Anak Panti, dan Donatur.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => setCreateOpen(true)}
        >
          Tambah Akun Baru
        </Button>
      </div>

      {banner && (
        <AlertBanner
          type={banner.type}
          message={banner.text}
          onClose={() => setBanner(null)}
        />
      )}

      <UserFilterBar
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        authFilter={authFilter}
        onAuthFilterChange={setAuthFilter}
        roles={roles}
      />

      <UserTable
        users={filteredUsers}
        currentUserId={currentUserId}
        loading={loading}
        onEdit={setEditTarget}
        onResetDefaultPassword={setResetTarget}
        onDelete={setDeleteTarget}
      />

      <UserCreateModal
        open={createOpen}
        roles={roles}
        onClose={() => setCreateOpen(false)}
        onResult={handleActionResult}
      />

      <UserEditModal
        key={editTarget?.id_user ?? "closed"}
        user={editTarget}
        roles={roles}
        onClose={() => setEditTarget(null)}
        onResult={handleActionResult}
      />

      <ConfirmModal
        open={Boolean(resetTarget)}
        title="Reset Password ke Default"
        variant="primary"
        confirmLabel="Ya, Reset Password"
        loading={loading}
        onClose={() => setResetTarget(null)}
        onConfirm={handleConfirmResetPassword}
        description={
          resetTarget && (
            <>
              Apakah Anda yakin ingin mereset password akun{" "}
              <span className="font-semibold font-mono text-gray-900">
                {resetTarget.username}
              </span>{" "}
              menjadi password default{" "}
              <span className="font-semibold font-mono text-blue-700">
                asuwain123
              </span>
              ?
            </>
          )
        }
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Akun Pengguna"
        variant="danger"
        confirmLabel="Ya, Hapus Akun"
        loading={loading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        description={
          deleteTarget && (
            <>
              Apakah Anda yakin ingin menghapus permanen akun{" "}
              <span className="font-semibold font-mono text-gray-900">
                {deleteTarget.username}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </>
          )
        }
      />
    </div>
  );
}
