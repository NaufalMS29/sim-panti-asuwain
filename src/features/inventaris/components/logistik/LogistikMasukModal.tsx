"use client";

import { useState } from "react";
import { Button, FormInput, FormSelect, Modal } from "@/components/ui";
import { LogistikMasukFormInput } from "../../schemas/inventaris.schema";
import { LogistikHabisPakaiItem } from "../../types/inventaris.types";
import { KATEGORI_LOGISTIK_PRESETS } from "../../utils/inventaris.utils";

interface LogistikMasukModalProps {
  open: boolean;
  logistikList: LogistikHabisPakaiItem[];
  preselectedLogistikId?: number | null;
  loading: boolean;
  onClose: () => void;
  onSubmitForm: (input: LogistikMasukFormInput) => Promise<boolean>;
}

export function LogistikMasukModal({
  open,
  logistikList,
  preselectedLogistikId,
  loading,
  onClose,
  onSubmitForm,
}: LogistikMasukModalProps) {
  const hasExisting = logistikList.length > 0;
  const defaultMode = preselectedLogistikId || hasExisting ? "existing" : "new";

  const [mode, setMode] = useState<"existing" | "new">(defaultMode);
  const [form, setForm] = useState(() => ({
    id_logistik: String(
      preselectedLogistikId ?? logistikList[0]?.id_logistik ?? "",
    ),
    nama_barang: "",
    kategori: KATEGORI_LOGISTIK_PRESETS[0],
    satuan: "kg",
    jumlah_masuk: "1",
    tanggal_masuk: new Date().toISOString().split("T")[0],
    keterangan: "",
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitForm({
      mode,
      id_logistik: mode === "existing" ? Number(form.id_logistik) : null,
      nama_barang: form.nama_barang,
      kategori: form.kategori,
      satuan: form.satuan,
      jumlah_masuk: Number(form.jumlah_masuk),
      tanggal_masuk: form.tanggal_masuk,
      keterangan: form.keterangan,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Catat Penerimaan Stok Logistik"
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!hasExisting}
            onClick={() => setMode("existing")}
            className={`py-2 rounded-lg text-xs font-bold border cursor-pointer disabled:opacity-50 ${
              mode === "existing"
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            Tambah Stok Barang Ada
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={`py-2 rounded-lg text-xs font-bold border cursor-pointer ${
              mode === "new"
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            Daftar Barang Baru
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "existing" ? (
            <FormSelect
              label="Pilih Item Logistik"
              required
              value={form.id_logistik}
              onChange={(e) =>
                setForm({ ...form, id_logistik: e.target.value })
              }
            >
              {logistikList.map((item) => (
                <option key={item.id_logistik} value={String(item.id_logistik)}>
                  {item.nama_barang} (Sisa: {item.stok_jumlah} {item.satuan})
                </option>
              ))}
            </FormSelect>
          ) : (
            <div className="space-y-3">
              <FormInput
                label="Nama Barang"
                type="text"
                required
                placeholder="Contoh: Beras Premium / Minyak Goreng"
                value={form.nama_barang}
                onChange={(e) =>
                  setForm({ ...form, nama_barang: e.target.value })
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Kategori Logistik"
                  value={form.kategori}
                  onChange={(e) =>
                    setForm({ ...form, kategori: e.target.value })
                  }
                >
                  {KATEGORI_LOGISTIK_PRESETS.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </FormSelect>

                <FormInput
                  label="Satuan"
                  type="text"
                  required
                  placeholder="kg / liter / dus / pcs"
                  value={form.satuan}
                  onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Jumlah Masuk"
              type="number"
              required
              min={1}
              value={form.jumlah_masuk}
              onChange={(e) =>
                setForm({ ...form, jumlah_masuk: e.target.value })
              }
            />

            <FormInput
              label="Tanggal Masuk"
              type="date"
              required
              value={form.tanggal_masuk}
              onChange={(e) =>
                setForm({ ...form, tanggal_masuk: e.target.value })
              }
            />
          </div>

          <FormInput
            label="Keterangan Sumber Barang Masuk"
            type="text"
            required
            placeholder="Contoh: Pembelian bulanan menggunakan kas operasional panti"
            value={form.keterangan}
            onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="success" loading={loading}>
              Simpan Barang Masuk
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
