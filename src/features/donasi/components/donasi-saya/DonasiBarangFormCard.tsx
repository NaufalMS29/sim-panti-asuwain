"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { Button, FormFileInput, FormInput, FormSelect } from "@/components/ui";
import { KategoriBarangDonasiType } from "../../types/donasi.types";

interface DonasiBarangFormCardProps {
  defaultNamaPengirim: string;
  loading: boolean;
  onSubmitBarang: (formData: FormData) => Promise<boolean>;
}

export function DonasiBarangFormCard({
  defaultNamaPengirim,
  loading,
  onSubmitBarang,
}: DonasiBarangFormCardProps) {
  const [barangFile, setBarangFile] = useState<File | null>(null);
  const [barangFileKey, setBarangFileKey] = useState(0);
  const [barangForm, setBarangForm] = useState(() => ({
    nama_pengirim: defaultNamaPengirim,
    tanggal_donasi: new Date().toISOString().split("T")[0],
    is_anonim: false,
    nama_barang: "",
    kategori_barang: "habis_pakai" as KategoriBarangDonasiType,
    jumlah: "1",
    satuan: "dus",
    nomor_resi_ekspedisi: "",
    catatan: "",
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("nama_pengirim", barangForm.nama_pengirim);
    fd.append("tanggal_donasi", barangForm.tanggal_donasi);
    fd.append("is_anonim", String(barangForm.is_anonim));
    fd.append("nama_barang", barangForm.nama_barang);
    fd.append("kategori_barang", barangForm.kategori_barang);
    fd.append("jumlah", barangForm.jumlah);
    fd.append("satuan", barangForm.satuan);
    fd.append("nomor_resi_ekspedisi", barangForm.nomor_resi_ekspedisi);
    fd.append("catatan", barangForm.catatan);

    if (barangFile) {
      fd.append("bukti_pembayaran", barangFile);
    }

    const ok = await onSubmitBarang(fd);
    if (ok) {
      setBarangForm((prev) => ({
        ...prev,
        nama_barang: "",
        jumlah: "1",
        satuan: "dus",
        nomor_resi_ekspedisi: "",
        catatan: "",
        is_anonim: false,
      }));
      setBarangFile(null);
      setBarangFileKey((prev) => prev + 1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Nama Pengirim"
          type="text"
          required
          value={barangForm.nama_pengirim}
          onChange={(e) =>
            setBarangForm({ ...barangForm, nama_pengirim: e.target.value })
          }
        />

        <FormInput
          label="Tanggal Pengiriman / Penyerahan"
          type="date"
          required
          value={barangForm.tanggal_donasi}
          onChange={(e) =>
            setBarangForm({ ...barangForm, tanggal_donasi: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Nama Barang yang Didonasikan"
          type="text"
          required
          placeholder="Contoh: Beras Premium / Paket Alat Tulis"
          value={barangForm.nama_barang}
          onChange={(e) =>
            setBarangForm({ ...barangForm, nama_barang: e.target.value })
          }
        />

        <FormSelect
          label="Kategori Barang"
          value={barangForm.kategori_barang}
          onChange={(e) =>
            setBarangForm({
              ...barangForm,
              kategori_barang: e.target.value as KategoriBarangDonasiType,
            })
          }
        >
          <option value="habis_pakai">
            Habis Pakai (Sembako, ATK, Perlengkapan Mandi)
          </option>
          <option value="inventaris">
            Inventaris (Perabot, Elektronik, Buku Perpustakaan)
          </option>
        </FormSelect>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormInput
          label="Jumlah"
          type="number"
          required
          min={1}
          value={barangForm.jumlah}
          onChange={(e) =>
            setBarangForm({ ...barangForm, jumlah: e.target.value })
          }
        />

        <FormInput
          label="Satuan"
          type="text"
          required
          placeholder="kg / dus / karung / unit"
          value={barangForm.satuan}
          onChange={(e) =>
            setBarangForm({ ...barangForm, satuan: e.target.value })
          }
        />

        <FormInput
          label="Nomor Resi Ekspedisi (Opsional)"
          type="text"
          placeholder="Isi jika dikirim via kurir"
          value={barangForm.nomor_resi_ekspedisi}
          onChange={(e) =>
            setBarangForm({
              ...barangForm,
              nomor_resi_ekspedisi: e.target.value,
            })
          }
        />
      </div>

      <FormFileInput
        key={barangFileKey}
        label="Foto Paket / Resi Pengiriman (Opsional)"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        maxSizeMb={5}
        showImagePreview
        hint="Format JPG, PNG, WEBP, atau PDF maksimal 5 MB."
        onChange={(e) => setBarangFile(e.target.files?.[0] ?? null)}
      />

      <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={barangForm.is_anonim}
          onChange={(e) =>
            setBarangForm({ ...barangForm, is_anonim: e.target.checked })
          }
          className="rounded border-gray-300"
        />
        Sembunyikan nama saya pada laporan publik (tampilkan sebagai{" "}
        <strong>Hamba Allah</strong>)
      </label>

      <FormInput
        label="Catatan Tambahan (Opsional)"
        type="text"
        placeholder="Contoh: Diantar langsung ke panti pukul 10.00 WITA"
        value={barangForm.catatan}
        onChange={(e) =>
          setBarangForm({ ...barangForm, catatan: e.target.value })
        }
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
          icon={<Package className="w-4 h-4" />}
        >
          Kirim Rincian Donasi Barang
        </Button>
      </div>
    </form>
  );
}
