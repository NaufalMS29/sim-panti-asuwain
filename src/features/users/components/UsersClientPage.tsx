"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  KeyRound,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { RoleOption, UserManagementItem } from "../types/users.types";
import {
  createUserAction,
  updateUserAction,
  resetUserPasswordAction,
  deleteUserAction,
} from "../actions/users.actions";

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
  const [roleFilter, setRoleFilter] = useState<string>("semua");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserManagementItem | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const defaultRoleId =
    roles.find((r) => r.nama_role === "Admin")?.id_role ||
    roles[0]?.id_role ||
    1;

  const [form, setForm] = useState({
    username: "",
    email: "",
    role_id: defaultRoleId,
    password: "",
  });

  const filteredUsers = initialUsers.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.username.toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q) ||
      (item.linked_name || "").toLowerCase().includes(q);
    const matchRole = roleFilter === "semua" || item.nama_role === roleFilter;
    return matchSearch && matchRole;
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({
      username: "",
      email: "",
      role_id: defaultRoleId,
      password: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (item: UserManagementItem) => {
    setEditingUser(item);
    setForm({
      username: item.username,
      email: item.email || "",
      role_id: item.role_id,
      password: "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBanner(null);

    const res = editingUser
      ? await updateUserAction(editingUser.id_user, {
          username: form.username,
          email: form.email,
          role_id: Number(form.role_id),
        })
      : await createUserAction({
          username: form.username,
          email: form.email,
          role_id: Number(form.role_id),
          password: form.password,
        });

    setLoading(false);

    if (!res.success) {
      setBanner({ type: "error", text: res.message });
      return;
    }

    setModalOpen(false);
    setBanner({ type: "success", text: res.message });
  };

  const handleResetPassword = async (item: UserManagementItem) => {
    const confirmed = window.confirm(
      `Reset password akun "${item.username}" menjadi "asuwain123"?`,
    );
    if (!confirmed) return;

    setLoading(true);
    const res = await resetUserPasswordAction(item.id_user);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const handleDelete = async (item: UserManagementItem) => {
    const confirmed = window.confirm(
      `Hapus akun "${item.username}" (${item.nama_role}) secara permanen?`,
    );
    if (!confirmed) return;

    setLoading(true);
    const res = await deleteUserAction(item.id_user);
    setLoading(false);

    setBanner({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const getRoleBadgeStyle = (roleName: string) => {
    switch (roleName) {
      case "Admin":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Pengurus Panti":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Anak Panti":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Donatur Tetap":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Akun</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola seluruh akun pengguna lintas role, ubah hak akses, dan reset
            password.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Buat Akun Baru
        </button>
      </div>

      {banner && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
            banner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {banner.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{banner.text}</span>
        </div>
      )}

      {/* Bilah Pencarian & Filter Role */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari username, email, atau nama pemilik..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 sm:w-52"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Role ({initialUsers.length})
          </option>
          {roles.map((r) => (
            <option
              key={r.id_role}
              value={r.nama_role}
              className="text-gray-900 bg-white"
            >
              {r.nama_role}
            </option>
          ))}
        </select>
      </div>

      {/* Tabel Daftar Akun */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <th className="py-3.5 px-4">Akun & Pemilik</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Metode Login</th>
                <th className="py-3.5 px-4">Terdaftar</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-gray-500 text-sm"
                  >
                    Tidak ada akun pengguna yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => {
                  const isSelf = currentUserId === item.id_user;

                  return (
                    <tr key={item.id_user} className="hover:bg-gray-50/70">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-gray-900 text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {item.username}
                          </span>
                          {isSelf && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3" />
                              Akun Anda
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {item.linked_name ? (
                            <span className="font-medium text-gray-800">
                              {item.linked_name}
                            </span>
                          ) : (
                            <span className="italic text-gray-400">
                              Tanpa profil terpisah
                            </span>
                          )}
                          {item.email && ` • ${item.email}`}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(
                            item.nama_role,
                          )}`}
                        >
                          {item.nama_role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="flex flex-wrap gap-1.5">
                          {item.has_password && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              Password
                            </span>
                          )}
                          {item.has_google && (
                            <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                              Google OAuth
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600">
                        {item.created_at}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleResetPassword(item)}
                            title="Reset Password ke asuwain123"
                            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-200 cursor-pointer"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => openEditModal(item)}
                            title="Ubah Username, Email, atau Role"
                            className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 border border-blue-200 cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {!isSelf && (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleDelete(item)}
                              title="Hapus Akun"
                              className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 border border-red-200 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* Modal Tambah / Ubah Akun */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingUser ? "Ubah Akun Pengguna" : "Buat Akun Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!editingUser && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                Untuk menambah <strong>Pengurus Panti</strong> atau{" "}
                <strong>Anak Panti</strong> beserta biodatanya, gunakan menu{" "}
                <em>Data Pengurus</em> atau <em>Data Anak Panti</em> agar profil
                otomatis terhubung.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Username Login
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: admin_kedua"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Role / Hak Akses
                </label>
                <select
                  value={form.role_id}
                  onChange={(e) =>
                    setForm({ ...form, role_id: Number(e.target.value) })
                  }
                  className={inputClass}
                >
                  {roles.map((r) => (
                    <option
                      key={r.id_role}
                      value={r.id_role}
                      className="text-gray-900 bg-white"
                    >
                      {r.nama_role}
                    </option>
                  ))}
                </select>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password Awal (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Kosongkan untuk default: asuwain123"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingUser ? "Simpan Perubahan" : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
