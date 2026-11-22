"use client";

import { useState } from "react";
import { Button, FormInput, FormSelect, Modal } from "@/components/ui";
import { LogistikKeluarFormInput } from "../../schemas/inventaris.schema";
import { LogistikHabisPakaiItem } from "../../types/inventaris.types";

interface LogistikKeluarModalProps {
  open: boolean;
  logistikList: LogistikHabisPakaiItem[];
  preselectedLogistikId?: number | null;
  loading: boolean;
  onClose: () => void;
  onSubmitForm: (input: LogistikKeluarFormInput) => Promise<boolean>;
}

export function LogistikKeluarModal({
  open,
  logistikList,
  preselectedLogistikId,
  loading,
  onClose,
  onSubmitForm,
}: LogistikKeluarModalProps) {
  const availableItems = logistikList.filter((item) => item.stok_jumlah > 0);
  const initialId =
    preselectedLogistikId &&
    availableItems.some((i) => i.id_logistik === preselectedLogistikId)
      ? preselectedLogistikId
      : (availableItems[0]?.id_logistik ?? 0);

  const [form, setForm] = useState(() => ({
    id_logistik: String(initialId || ""),
    jumlah_keluar: "1",
    tanggal_keluar: new Date().toISOString().split("T")[0],
    peruntukan: "",
  }));

  const selectedItem = availableItems.find(
    (item) => String(item.id_logistik) === form.id_logistik,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitForm({
      id_logistik: Number(form.id_logistik),
      jumlah_keluar: Number(form.jumlah_keluar),
      tanggal_keluar: form.tanggal_keluar,
      peruntukan: form.peruntukan,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Catat Pemakaian / Barang Keluar"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormSelect
          label="Pilih Item Logistik (Stok Tersedia)"
          required
          value={form.id_logistik}
          onChange={(e) => setForm({ ...form, id_logistik: e.target.value })}
        >
          {availableItems.length === 0 ? (
            <option value="">Tidak ada item dengan stok tersedia</option>
          ) : (
            availableItems.map((item) => (
              <option key={item.id_logistik} value={String(item.id_logistik)}>
                {item.nama_barang} — Sisa: {item.stok_jumlah} {item.satuan}
              </option>
            ))
          )}
        </FormSelect>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label={`Jumlah Keluar${selectedItem ? ` (Maks: ${selectedItem.stok_jumlah} ${selectedItem.satuan})` : ""}`}
            type="number"
            required
            min={1}
            max={selectedItem?.stok_jumlah ?? undefined}
            value={form.jumlah_keluar}
            onChange={(e) =>
              setForm({ ...form, jumlah_keluar: e.target.value })
            }
          />

          <FormInput
            label="Tanggal Keluar"
            type="date"
            required
            value={form.tanggal_keluar}
            onChange={(e) =>
              setForm({ ...form, tanggal_keluar: e.target.value })
            }
          />
        </div>

        <FormInput
          label="Peruntukan / Kebutuhan Pemakaian"
          type="text"
          required
          placeholder="Contoh: Kebutuhan masak dapur pekan ke-3 November"
          value={form.peruntukan}
          onChange={(e) => setForm({ ...form, peruntukan: e.target.value })}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={availableItems.length === 0}
          >
            Simpan Barang Keluar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
