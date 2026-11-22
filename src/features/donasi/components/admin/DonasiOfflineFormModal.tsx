"use client";

import { useState } from "react";
import {
  Button,
  FormFileInput,
  FormInput,
  FormSelect,
  Modal,
} from "@/components/ui";
import {
  DonaturItem,
  KategoriBarangDonasiType,
  MetodePembayaranType,
} from "../../types/donasi.types";
import { formatEnumLabel } from "../../utils/donasi.utils";

interface DonasiOfflineFormModalProps {
  open: boolean;
  donaturOptions: DonaturItem[];
  loading: boolean;
  onClose: () => void;
  onSubmitFormData: (
    createType: "uang" | "barang",
    formData: FormData,
  ) => Promise<boolean>;
}

export function DonasiOfflineFormModal({
  open,
  donaturOptions,
  loading,
  onClose,
  onSubmitFormData,
}: DonasiOfflineFormModalProps) {
  const [createType, setCreateType] = useState<"uang" | "barang">("uang");
  const [form, setForm] = useState(() => ({
    id_donatur: "",
    nama_pengirim: "",
    tanggal_donasi: new Date().toISOString().split("T")[0],
    is_anonim: false,
    nominal: "100000",
    metode_pembayaran: "tunai" as MetodePembayaranType,
    nama_barang: "",
    kategori_barang: "habis_pakai" as KategoriBarangDonasiType,
    jumlah: "1",
    satuan: "dus",
    nomor_resi_ekspedisi: "",
    catatan: "",
    auto_verify: true,
  }));
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);

  const handleSelectDonaturPreset = (idDonaturStr: string) => {
    const found = donaturOptions.find(
      (d) => String(d.id_donatur) === idDonaturStr,
    );
    setForm((prev) => ({
      ...prev,
      id_donatur: idDonaturStr,
      nama_pengirim: found ? found.nama_donatur : prev.nama_pengirim,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    if (form.id_donatur) {
      fd.append("id_donatur", form.id_donatur);
    }
    fd.append("nama_pengirim", form.nama_pengirim);
    fd.append("tanggal_donasi", form.tanggal_donasi);
    fd.append("is_anonim", String(form.is_anonim));
    fd.append("catatan", form.catatan);
    fd.append("auto_verify", String(form.auto_verify));

    if (proofFile) {
      fd.append("bukti_pembayaran", proofFile);
    }

    if (createType === "uang") {
      fd.append("nominal", form.nominal);
      fd.append("metode_pembayaran", form.metode_pembayaran);
    } else {
      fd.append("nama_barang", form.nama_barang);
      fd.append("kategori_barang", form.kategori_barang);
      fd.append("jumlah", form.jumlah);
      fd.append("satuan", form.satuan);
      fd.append("nomor_resi_ekspedisi", form.nomor_resi_ekspedisi);
    }

    const ok = await onSubmitFormData(createType, fd);
    if (ok) {
      setProofFile(null);
      setFileKey((prev) => prev + 1);
    }
  };

  return (
    <div key={open ? "open" : "closed"}>
      <Modal
        open={open}
        onClose={onClose}
        title="Catat Donasi Langsung"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCreateType("uang")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold border cursor-pointer ${
                createType === "uang"
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              Donasi Uang
            </button>
            <button
              type="button"
              onClick={() => setCreateType("barang")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold border cursor-pointer ${
                createType === "barang"
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              Donasi Barang
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormSelect
              label="Tautkan ke Donatur Terdaftar (Opsional)"
              value={form.id_donatur}
              onChange={(e) => handleSelectDonaturPreset(e.target.value)}
            >
              <option value="">-- Donatur Non-Akun / Tamu Langsung --</option>
              {donaturOptions.map((d) => (
                <option key={d.id_donatur} value={String(d.id_donatur)}>
                  {d.nama_donatur} ({formatEnumLabel(d.tipe_donatur)})
                </option>
              ))}
            </FormSelect>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Nama Pengirim"
                type="text"
                required
                placeholder="Nama pemberi donasi"
                value={form.nama_pengirim}
                onChange={(e) =>
                  setForm({ ...form, nama_pengirim: e.target.value })
                }
              />

              <FormInput
                label="Tanggal Diterima"
                type="date"
                required
                value={form.tanggal_donasi}
                onChange={(e) =>
                  setForm({ ...form, tanggal_donasi: e.target.value })
                }
              />
            </div>

            {createType === "uang" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Nominal (Rp)"
                  type="number"
                  required
                  min={1000}
                  value={form.nominal}
                  onChange={(e) =>
                    setForm({ ...form, nominal: e.target.value })
                  }
                />

                <FormSelect
                  label="Metode Penerimaan"
                  value={form.metode_pembayaran}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      metode_pembayaran: e.target.value as MetodePembayaranType,
                    })
                  }
                >
                  <option value="tunai">Tunai di Panti</option>
                  <option value="transfer_bank">Transfer Bank</option>
                  <option value="qris">QRIS</option>
                </FormSelect>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Nama Barang"
                    type="text"
                    required
                    placeholder="Contoh: Beras / Meja Belajar"
                    value={form.nama_barang}
                    onChange={(e) =>
                      setForm({ ...form, nama_barang: e.target.value })
                    }
                  />

                  <FormSelect
                    label="Kategori Barang"
                    value={form.kategori_barang}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        kategori_barang: e.target
                          .value as KategoriBarangDonasiType,
                      })
                    }
                  >
                    <option value="habis_pakai">Habis Pakai</option>
                    <option value="inventaris">Inventaris</option>
                  </FormSelect>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormInput
                    label="Jumlah"
                    type="number"
                    required
                    min={1}
                    value={form.jumlah}
                    onChange={(e) =>
                      setForm({ ...form, jumlah: e.target.value })
                    }
                  />

                  <FormInput
                    label="Satuan"
                    type="text"
                    required
                    placeholder="dus / kg / unit"
                    value={form.satuan}
                    onChange={(e) =>
                      setForm({ ...form, satuan: e.target.value })
                    }
                  />

                  <FormInput
                    label="Nomor Resi (Opsional)"
                    type="text"
                    value={form.nomor_resi_ekspedisi}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nomor_resi_ekspedisi: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            <FormFileInput
              key={fileKey}
              label="Lampiran Bukti / Foto Serah Terima (Opsional)"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              maxSizeMb={5}
              showImagePreview
              hint="Format JPG, PNG, WEBP, atau PDF maksimal 5 MB."
              onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
            />

            <FormInput
              label="Catatan (Opsional)"
              type="text"
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_anonim}
                  onChange={(e) =>
                    setForm({ ...form, is_anonim: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                Tandai sebagai Anonim
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.auto_verify}
                  onChange={(e) =>
                    setForm({ ...form, auto_verify: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                Langsung <strong>Terverifikasi</strong>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" loading={loading}>
                Simpan Donasi
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
