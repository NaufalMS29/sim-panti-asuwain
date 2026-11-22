"use client";

import { useState } from "react";
import {
  Button,
  FormInput,
  FormSelect,
  FormTextarea,
  Modal,
} from "@/components/ui";
import { DonaturFormInput } from "../../schemas/donasi.schema";
import { DonaturItem } from "../../types/donasi.types";
import { formatEnumLabel } from "../../utils/donasi.utils";

interface DonaturFormModalProps {
  open: boolean;
  editingItem: DonaturItem | null;
  tipeDonaturOptions: string[];
  loading: boolean;
  onClose: () => void;
  onSubmitForm: (input: DonaturFormInput) => Promise<void>;
}

export function DonaturFormModal({
  open,
  editingItem,
  tipeDonaturOptions,
  loading,
  onClose,
  onSubmitForm,
}: DonaturFormModalProps) {
  const defaultTipe = tipeDonaturOptions[0] ?? "tidak_tetap";

  const [form, setForm] = useState<DonaturFormInput>(() =>
    editingItem
      ? {
          nama_donatur: editingItem.nama_donatur,
          email: editingItem.email ?? "",
          no_telepon: editingItem.no_telepon ?? "",
          alamat: editingItem.alamat ?? "",
          tipe_donatur: editingItem.tipe_donatur,
          frekuensi_donasi: editingItem.frekuensi_donasi ?? "",
        }
      : {
          nama_donatur: "",
          email: "",
          no_telepon: "",
          alamat: "",
          tipe_donatur: defaultTipe,
          frekuensi_donasi: "",
        },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitForm(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingItem ? "Ubah Data Donatur" : "Tambah Donatur Baru"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <FormInput
          label="Nama Donatur / Instansi"
          type="text"
          required
          value={form.nama_donatur}
          onChange={(e) => setForm({ ...form, nama_donatur: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormSelect
            label="Tipe Donatur"
            value={form.tipe_donatur}
            onChange={(e) => setForm({ ...form, tipe_donatur: e.target.value })}
          >
            {tipeDonaturOptions.map((opt) => (
              <option key={opt} value={opt}>
                {formatEnumLabel(opt)}
              </option>
            ))}
          </FormSelect>

          <FormInput
            label="Frekuensi Donasi"
            type="text"
            placeholder="Bulanan / Insidental"
            value={form.frekuensi_donasi ?? ""}
            onChange={(e) =>
              setForm({ ...form, frekuensi_donasi: e.target.value })
            }
          />
        </div>

        <FormInput
          label="Nomor Telepon / WhatsApp"
          type="text"
          value={form.no_telepon ?? ""}
          onChange={(e) => setForm({ ...form, no_telepon: e.target.value })}
        />

        <FormInput
          label="Email"
          type="email"
          value={form.email ?? ""}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <FormTextarea
          label="Alamat"
          rows={2}
          value={form.alamat ?? ""}
          onChange={(e) => setForm({ ...form, alamat: e.target.value })}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
