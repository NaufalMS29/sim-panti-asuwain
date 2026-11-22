"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  Button,
  FormInput,
  FormSelect,
  FormTextarea,
  Modal,
} from "@/components/ui";
import { InventarisBarangFormInput } from "../../schemas/inventaris.schema";
import {
  InventarisBarangItem,
  KondisiInventarisType,
} from "../../types/inventaris.types";
import { LOKASI_INVENTARIS_PRESETS } from "../../utils/inventaris.utils";

interface InventarisFormModalProps {
  open: boolean;
  editingItem: InventarisBarangItem | null;
  loading: boolean;
  onClose: () => void;
  onSubmitForm: (input: InventarisBarangFormInput) => Promise<boolean>;
}

export function InventarisFormModal({
  open,
  editingItem,
  loading,
  onClose,
  onSubmitForm,
}: InventarisFormModalProps) {
  const isFromDonasi = Boolean(editingItem?.is_auto_donasi);

  const [form, setForm] = useState(() => ({
    nama_barang: editingItem ? editingItem.nama_barang : "",
    jumlah: editingItem ? String(editingItem.jumlah) : "1",
    kondisi: (editingItem
      ? editingItem.kondisi
      : "baik") as KondisiInventarisType,
    lokasi_penyimpanan: editingItem
      ? editingItem.lokasi_penyimpanan
      : LOKASI_INVENTARIS_PRESETS[0],
    tgl_perolehan: editingItem
      ? editingItem.tgl_perolehan_iso
      : new Date().toISOString().split("T")[0],
    keterangan: editingItem?.keterangan ?? "",
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitForm({
      nama_barang: form.nama_barang,
      jumlah: Number(form.jumlah),
      kondisi: form.kondisi,
      lokasi_penyimpanan: form.lokasi_penyimpanan,
      tgl_perolehan: form.tgl_perolehan,
      keterangan: form.keterangan,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        editingItem
          ? `Ubah Inventaris (${editingItem.kode_inventaris})`
          : "Tambah Aset Inventaris Baru"
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isFromDonasi && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-700" />
            <span>
              Aset ini tercatat otomatis dari donasi{" "}
              <strong className="font-mono">{editingItem?.kode_donasi}</strong>.
              Nama barang, jumlah, dan tanggal perolehan mengikuti data donasi;
              Anda tetap bebas memperbarui <strong>kondisi</strong>,{" "}
              <strong>lokasi penyimpanan</strong>, dan{" "}
              <strong>keterangan</strong>.
            </span>
          </div>
        )}

        <FormInput
          label="Nama Barang / Aset"
          type="text"
          required
          disabled={isFromDonasi}
          placeholder="Contoh: Lemari Pakaian Kayu 2 Pintu"
          value={form.nama_barang}
          onChange={(e) => setForm({ ...form, nama_barang: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Jumlah Unit"
            type="number"
            required
            min={1}
            disabled={isFromDonasi}
            value={form.jumlah}
            onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
          />

          <FormSelect
            label="Kondisi Aset"
            value={form.kondisi}
            onChange={(e) =>
              setForm({
                ...form,
                kondisi: e.target.value as KondisiInventarisType,
              })
            }
          >
            <option value="baik">Baik</option>
            <option value="rusak_ringan">Rusak Ringan</option>
            <option value="rusak_berat">Rusak Berat</option>
          </FormSelect>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Lokasi Penyimpanan"
            type="text"
            required
            list="lokasi-inventaris-list"
            placeholder="Contoh: Asrama Putra"
            value={form.lokasi_penyimpanan}
            onChange={(e) =>
              setForm({ ...form, lokasi_penyimpanan: e.target.value })
            }
          />
          <datalist id="lokasi-inventaris-list">
            {LOKASI_INVENTARIS_PRESETS.map((lok) => (
              <option key={lok} value={lok} />
            ))}
          </datalist>

          <FormInput
            label="Tanggal Perolehan"
            type="date"
            required
            disabled={isFromDonasi}
            value={form.tgl_perolehan}
            onChange={(e) =>
              setForm({ ...form, tgl_perolehan: e.target.value })
            }
          />
        </div>

        <FormTextarea
          label="Keterangan / Catatan Kondisi (Opsional)"
          rows={3}
          placeholder="Contoh: Ditempatkan di kamar lantai 2, kondisi engsel pintu aman..."
          value={form.keterangan}
          onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            {editingItem ? "Simpan Perubahan" : "Simpan Inventaris"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
