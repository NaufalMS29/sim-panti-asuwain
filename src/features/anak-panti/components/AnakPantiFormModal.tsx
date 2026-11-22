"use client";

import { useState } from "react";
import { Button, FormInput, FormSelect, Modal } from "@/components/ui";
import {
  AnakPantiActionResponse,
  AnakPantiItem,
} from "../types/anak-panti.types";
import {
  createAnakPantiAction,
  updateAnakPantiAction,
} from "../actions/anak-panti.actions";
import { formatEnumLabel } from "../utils/anak-panti.utils";

interface AnakPantiFormModalProps {
  open: boolean;
  editingItem: AnakPantiItem | null;
  jenisKelaminOptions: string[];
  statusAnakOptions: string[];
  onClose: () => void;
  onResult: (res: AnakPantiActionResponse) => void;
}

export function AnakPantiFormModal({
  open,
  editingItem,
  jenisKelaminOptions,
  statusAnakOptions,
  onClose,
  onResult,
}: AnakPantiFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama_anak: editingItem?.nama_anak ?? "",
    nik: editingItem?.nik ?? "",
    tempat_lahir: editingItem?.tempat_lahir ?? "",
    tanggal_lahir: editingItem?.tanggal_lahir_iso ?? "",
    jenis_kelamin: editingItem?.jenis_kelamin ?? jenisKelaminOptions[0] ?? "L",
    status_anak: editingItem?.status_anak ?? statusAnakOptions[0] ?? "yatim",
    tanggal_masuk:
      editingItem?.tanggal_masuk_iso ?? new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = editingItem
      ? await updateAnakPantiAction(editingItem.id_anak, form)
      : await createAnakPantiAction(form);

    setLoading(false);
    onResult(res);

    if (res.success) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      maxWidth="lg"
      title={editingItem ? "Ubah Biodata Anak Panti" : "Tambah Data Anak"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!editingItem && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 leading-relaxed">
            Sistem akan otomatis membuatkan akun portal{" "}
            <strong>Anak Panti</strong> dengan awalan{" "}
            <code className="font-mono font-semibold">ank_</code> dan password
            bawaan <code className="font-mono font-semibold">asuwain123</code>.
          </div>
        )}

        <FormInput
          label="Nama Lengkap Anak"
          type="text"
          required
          placeholder="Contoh: Syaiful"
          value={form.nama_anak}
          onChange={(e) => setForm({ ...form, nama_anak: e.target.value })}
        />

        <FormInput
          label="NIK (16 Digit — Opsional)"
          type="text"
          maxLength={16}
          placeholder="5371xxxxxxxxxxxx"
          value={form.nik}
          onChange={(e) => setForm({ ...form, nik: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Tempat Lahir"
            type="text"
            required
            placeholder="Contoh: Kupang"
            value={form.tempat_lahir}
            onChange={(e) => setForm({ ...form, tempat_lahir: e.target.value })}
          />

          <FormInput
            label="Tanggal Lahir"
            type="date"
            required
            value={form.tanggal_lahir}
            onChange={(e) =>
              setForm({ ...form, tanggal_lahir: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label="Jenis Kelamin"
            value={form.jenis_kelamin}
            onChange={(e) =>
              setForm({ ...form, jenis_kelamin: e.target.value })
            }
          >
            {jenisKelaminOptions.map((jk) => (
              <option key={jk} value={jk} className="text-gray-900 bg-white">
                {formatEnumLabel(jk)}
              </option>
            ))}
          </FormSelect>

          <FormSelect
            label="Kategori Sosial Anak"
            value={form.status_anak}
            onChange={(e) => setForm({ ...form, status_anak: e.target.value })}
          >
            {statusAnakOptions.map((st) => (
              <option key={st} value={st} className="text-gray-900 bg-white">
                {formatEnumLabel(st)}
              </option>
            ))}
          </FormSelect>
        </div>

        <FormInput
          label="Tanggal Masuk Panti"
          type="date"
          required
          value={form.tanggal_masuk}
          onChange={(e) => setForm({ ...form, tanggal_masuk: e.target.value })}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {editingItem ? "Simpan Perubahan" : "Simpan Data Anak"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
