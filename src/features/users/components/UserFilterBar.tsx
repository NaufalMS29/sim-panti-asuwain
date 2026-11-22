"use client";

import { Search } from "lucide-react";
import { FormSelect } from "@/components/ui";
import { RoleOption } from "../types/users.types";

interface UserFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  roleFilter: string;
  onRoleFilterChange: (val: string) => void;
  authFilter: "semua" | "google" | "lokal";
  onAuthFilterChange: (val: "semua" | "google" | "lokal") => void;
  roles: RoleOption[];
}

export function UserFilterBar({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  authFilter,
  onAuthFilterChange,
  roles,
}: UserFilterBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
      <div className="relative md:col-span-6">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari username, email, atau nama profil..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="md:col-span-3">
        <FormSelect
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Role
          </option>
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
      </div>

      <div className="md:col-span-3">
        <FormSelect
          value={authFilter}
          onChange={(e) =>
            onAuthFilterChange(e.target.value as "semua" | "google" | "lokal")
          }
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Metode Login
          </option>
          <option value="lokal" className="text-gray-900 bg-white">
            Username / Password
          </option>
          <option value="google" className="text-gray-900 bg-white">
            Tertaut Google OAuth
          </option>
        </FormSelect>
      </div>
    </div>
  );
}
