"use client";

import { useState } from "react";
import { FolderPlus } from "lucide-react";
import {
  Button,
  FormFileInput,
  FormInput,
  FormSelect,
  FormTextarea,
  Modal,
} from "@/components/ui";
import {
  JenisKasType,
  KategoriKasOption,
  TransaksiKasItem,
} from "../types/keuangan.types";

interface KeuanganFormModalProps {
  open: boolean;
  editingItem: TransaksiKasItem | null;
  defaultJenis: JenisKasType;
  kategoriOptions: KategoriKasOption[];
  loading: boolean;
  onClose: () => void;
  onAddKategori: (
    namaKategori: string,
    jenisKas: JenisKasType,
  ) => Promise<boolean>;
  onSubmitFormData: (
    formData: FormData,
    editingId?: number,
  ) => Promise<boolean>;
}

export function KeuanganFormModal({
  open,
  editingItem,
  defaultJenis,
  kategoriOptions,
  loading,
  onClose,
  onAddKategori,
  onSubmitFormData,
}: KeuanganFormModalProps) {
  const initialJenis = editingItem ? editingItem.jenis_transaksi : defaultJenis;
  const initialKategori = editingItem
    ? String(editingItem.id_kategori_kas)
    : String(
        kategoriOptions.find((k) => k.jenis_kas === initialJenis)
          ?.id_kategori_kas ?? "",
      );

  const [form, setForm] = useState(() => ({
    jenis_transaksi: initialJenis,
    id_kategori_kas: initialKategori,
    nominal: editingItem ? String(editingItem.nominal) : "",
    tanggal_transaksi: editingItem
      ? editingItem.tanggal_transaksi_iso
      : new Date().toISOString().split("T")[0],
    keterangan: editingItem ? editingItem.keterangan : "",
  }));

  const [notaFile, setNotaFile] = useState<File | null>(null);
  const [newKategoriOpen, setNewKategoriOpen] = useState(false);
  const [newKategoriName, setNewKategoriName] = useState("");

  const activeKategoriOptions = kategoriOptions.filter(
    (k) => k.jenis_kas === form.jenis_transaksi,
  );

  const effectiveKategoriId = activeKategoriOptions.some(
    (k) => String(k.id_kategori_kas) === form.id_kategori_kas,
  )
    ? form.id_kategori_kas
    : String(activeKategoriOptions[0]?.id_kategori_kas ?? "");

  const handleJenisSwitch = (targetJenis: JenisKasType) => {
    const firstMatch = kategoriOptions.find((k) => k.jenis_kas === targetJenis);
    setForm((prev) => ({
      ...prev,
      jenis_transaksi: targetJenis,
      id_kategori_kas: String(firstMatch?.id_kategori_kas ?? ""),
    }));
  };

  const handleCreateKategori = async () => {
    if (newKategoriName.trim().length < 2) return;
    const ok = await onAddKategori(newKategoriName, form.jenis_transaksi);
    if (ok) {
      setNewKategoriName("");
      setNewKategoriOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("jenis_transaksi", form.jenis_transaksi);
    fd.append("id_kategori_kas", effectiveKategoriId);
    fd.append("nominal", form.nominal);
    fd.append("tanggal_transaksi", form.tanggal_transaksi);
    fd.append("keterangan", form.keterangan);

    if (notaFile) {
      fd.append("file_nota", notaFile);
    }

    const ok = await onSubmitFormData(fd, editingItem?.id_transaksi_kas);
    if (ok) {
      setNotaFile(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        editingItem ? "Ubah Transaksi Kas Manual" : "Catat Transaksi Kas Baru"
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleJenisSwitch("pemasukan")}
            className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              form.jenis_transaksi === "pemasukan"
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            + Pemasukan Kas
          </button>
          <button
            type="button"
            onClick={() => handleJenisSwitch("pengeluaran")}
            className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              form.jenis_transaksi === "pengeluaran"
                ? "bg-red-700 text-white border-red-700"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            - Pengeluaran Kas
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">
                Kategori Kas
              </label>
              <button
                type="button"
                onClick={() => setNewKategoriOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                <FolderPlus className="w-3 h-3" />
                Kategori Baru
              </button>
            </div>

            <FormSelect
              required
              value={effectiveKategoriId}
              onChange={(e) =>
                setForm({ ...form, id_kategori_kas: e.target.value })
              }
            >
              {activeKategoriOptions.length === 0 ? (
                <option value="">
                  Belum ada kategori ({form.jenis_transaksi})
                </option>
              ) : (
                activeKategoriOptions.map((kat) => (
                  <option
                    key={kat.id_kategori_kas}
                    value={String(kat.id_kategori_kas)}
                  >
                    {kat.nama_kategori}
                  </option>
                ))
              )}
            </FormSelect>
          </div>

          <FormInput
            label="Tanggal Transaksi"
            type="date"
            required
            value={form.tanggal_transaksi}
            onChange={(e) =>
              setForm({ ...form, tanggal_transaksi: e.target.value })
            }
          />
        </div>

        {newKategoriOpen && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-end gap-2">
            <div className="flex-1">
              <FormInput
                type="text"
                placeholder={`Nama kategori ${form.jenis_transaksi} baru...`}
                value={newKategoriName}
                onChange={(e) => setNewKategoriName(e.target.value)}
              />
            </div>
            <Button
              type="button"
              size="sm"
              loading={loading}
              onClick={handleCreateKategori}
            >
              Tambah
            </Button>
          </div>
        )}

        <FormInput
          label="Nominal (Rp)"
          type="number"
          required
          min={500}
          step={500}
          placeholder="Contoh: 250000"
          value={form.nominal}
          onChange={(e) => setForm({ ...form, nominal: e.target.value })}
        />

        <FormTextarea
          label="Keterangan / Rincian Penggunaan"
          rows={3}
          required
          placeholder="Contoh: Pembelian beras 50 kg dan telur 3 tray untuk konsumsi anak panti..."
          value={form.keterangan}
          onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
        />

        <FormFileInput
          label="Unggah File Nota / Kwitansi (Opsional)"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          maxSizeMb={5}
          showImagePreview
          hint={
            editingItem?.file_nota
              ? "Biarkan kosong jika tidak ingin mengganti file nota yang sudah tersimpan (maks. 5 MB)."
              : "Format JPG, PNG, WEBP, atau PDF maksimal 5 MB."
          }
          onChange={(e) => setNotaFile(e.target.files?.[0] ?? null)}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            {editingItem ? "Simpan Perubahan" : "Simpan Transaksi Kas"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
