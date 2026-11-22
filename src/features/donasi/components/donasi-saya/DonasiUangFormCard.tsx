"use client";

import { useState } from "react";
import { Building2, Upload } from "lucide-react";
import {
  Button,
  FormFileInput,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/ui";
import { MetodePembayaranType } from "../../types/donasi.types";
import {
  formatRupiah,
  NOMINAL_PRESETS,
  REKENING_PANTI,
} from "../../utils/donasi.utils";

interface DonasiUangFormCardProps {
  defaultNamaPengirim: string;
  loading: boolean;
  onValidationError: (message: string) => void;
  onSubmitUang: (formData: FormData) => Promise<boolean>;
}

export function DonasiUangFormCard({
  defaultNamaPengirim,
  loading,
  onValidationError,
  onSubmitUang,
}: DonasiUangFormCardProps) {
  const [uangFile, setUangFile] = useState<File | null>(null);
  const [uangFileKey, setUangFileKey] = useState(0);
  const [uangForm, setUangForm] = useState(() => ({
    nama_pengirim: defaultNamaPengirim,
    tanggal_donasi: new Date().toISOString().split("T")[0],
    nominal: "100000",
    metode_pembayaran: "transfer_bank" as MetodePembayaranType,
    is_anonim: false,
    catatan: "",
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uangFile) {
      onValidationError(
        "Silakan unggah foto atau PDF bukti pembayaran terlebih dahulu.",
      );
      return;
    }

    const fd = new FormData();
    fd.append("nama_pengirim", uangForm.nama_pengirim);
    fd.append("tanggal_donasi", uangForm.tanggal_donasi);
    fd.append("nominal", uangForm.nominal);
    fd.append("metode_pembayaran", uangForm.metode_pembayaran);
    fd.append("is_anonim", String(uangForm.is_anonim));
    fd.append("catatan", uangForm.catatan);
    fd.append("bukti_pembayaran", uangFile);

    const ok = await onSubmitUang(fd);
    if (ok) {
      setUangForm((prev) => ({ ...prev, catatan: "", is_anonim: false }));
      setUangFile(null);
      setUangFileKey((prev) => prev + 1);
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4 h-fit">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Building2 className="w-4 h-4 text-blue-700" />
          Rekening Resmi Panti Asuhan
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Lakukan transfer atau pembayaran QRIS ke rekening berikut, kemudian
          unggah bukti pembayarannya pada formulir di samping.
        </p>

        <div className="space-y-2.5 pt-1">
          {REKENING_PANTI.map((rek) => (
            <div
              key={rek.bank}
              className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-0.5"
            >
              <p className="font-bold text-blue-800">{rek.bank}</p>
              <p className="font-mono font-semibold text-gray-900 text-sm">
                {rek.nomor}
              </p>
              <p className="text-gray-500">a.n. {rek.atasNama}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Pilih Nominal Cepat atau Ketik Nominal (Rp)
          </label>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {NOMINAL_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() =>
                  setUangForm({ ...uangForm, nominal: String(preset) })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  Number(uangForm.nominal) === preset
                    ? "bg-blue-700 text-white border-blue-700"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {formatRupiah(preset)}
              </button>
            ))}
          </div>
          <FormInput
            type="number"
            required
            min={1000}
            step={500}
            value={uangForm.nominal}
            onChange={(e) =>
              setUangForm({ ...uangForm, nominal: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            label="Nama Pengirim"
            type="text"
            required
            value={uangForm.nama_pengirim}
            onChange={(e) =>
              setUangForm({ ...uangForm, nama_pengirim: e.target.value })
            }
          />

          <FormInput
            label="Tanggal Transfer"
            type="date"
            required
            value={uangForm.tanggal_donasi}
            onChange={(e) =>
              setUangForm({ ...uangForm, tanggal_donasi: e.target.value })
            }
          />

          <FormSelect
            label="Metode Pembayaran"
            value={uangForm.metode_pembayaran}
            onChange={(e) =>
              setUangForm({
                ...uangForm,
                metode_pembayaran: e.target.value as MetodePembayaranType,
              })
            }
          >
            <option value="transfer_bank">Transfer Bank</option>
            <option value="qris">QRIS</option>
          </FormSelect>
        </div>

        <FormFileInput
          key={uangFileKey}
          label="Unggah Bukti Pembayaran (JPG, PNG, WEBP, atau PDF)"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          maxSizeMb={5}
          showImagePreview
          required
          hint="Wajib dilampirkan untuk verifikasi mutasi rekening (maks. 5 MB)."
          onChange={(e) => setUangFile(e.target.files?.[0] ?? null)}
        />

        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={uangForm.is_anonim}
            onChange={(e) =>
              setUangForm({ ...uangForm, is_anonim: e.target.checked })
            }
            className="rounded border-gray-300"
          />
          Sembunyikan nama saya pada laporan publik (tampilkan sebagai{" "}
          <strong>Hamba Allah</strong>)
        </label>

        <FormTextarea
          label="Catatan / Doa / Peruntukan (Opsional)"
          rows={2}
          placeholder="Contoh: Semoga bermanfaat untuk kebutuhan sekolah anak-anak panti..."
          value={uangForm.catatan}
          onChange={(e) =>
            setUangForm({ ...uangForm, catatan: e.target.value })
          }
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            icon={<Upload className="w-4 h-4" />}
          >
            Kirim Konfirmasi Donasi
          </Button>
        </div>
      </form>
    </div>
  );
}
