"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button, FormFileInput, FormInput, FormSelect } from "@/components/ui";
import { BerkasAnakActionResponse } from "../types/berkas-anak.types";
import { uploadBerkasAnakAction } from "../actions/berkas-anak.actions";
import { formatEnumLabel } from "../utils/berkas-anak.utils";

interface BerkasUploadFormCardProps {
  idAnak: number;
  jenisBerkasOptions: string[];
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onResult: (res: BerkasAnakActionResponse) => void;
}

export function BerkasUploadFormCard({
  idAnak,
  jenisBerkasOptions,
  loading,
  onLoadingChange,
  onResult,
}: BerkasUploadFormCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [jenisBerkas, setJenisBerkas] = useState<string>(
    jenisBerkasOptions[0] ?? "",
  );
  const [namaFile, setNamaFile] = useState("");

  const isJenisLainnya = jenisBerkas.toLowerCase() === "lainnya";

  const handleUploadBerkas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isJenisLainnya && namaFile.trim().length < 3) {
      onResult({
        success: false,
        message:
          "Untuk kategori Lainnya, tuliskan nama atau jenis berkas minimal 3 karakter.",
      });
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      onResult({
        success: false,
        message: "Silakan pilih file dokumen terlebih dahulu.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("id_anak", String(idAnak));
    formData.append("jenis_berkas", jenisBerkas);
    formData.append("nama_file", namaFile);
    formData.append("file", file);

    onLoadingChange(true);
    const res = await uploadBerkasAnakAction(formData);
    onLoadingChange(false);

    onResult(res);
    if (res.success) {
      setNamaFile("");
      setFileInputKey((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 h-fit shadow-2xs">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="text-sm font-bold text-gray-900">Unggah Berkas Baru</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Format PDF, JPG, PNG, atau WEBP (maks. 5 MB).
        </p>
      </div>

      <form onSubmit={handleUploadBerkas} className="space-y-3.5">
        <FormSelect
          label="Kategori Dokumen"
          value={jenisBerkas}
          onChange={(e) => setJenisBerkas(e.target.value)}
        >
          {jenisBerkasOptions.map((opt) => (
            <option key={opt} value={opt} className="text-gray-900 bg-white">
              {formatEnumLabel(opt)}
            </option>
          ))}
        </FormSelect>

        <div>
          <FormInput
            label={
              isJenisLainnya
                ? "Nama / Jenis Berkas Lainnya"
                : "Keterangan / Nama Dokumen (Opsional)"
            }
            type="text"
            required={isJenisLainnya}
            placeholder={
              isJenisLainnya
                ? "Wajib diisi, misal: Kartu BPJS / Surat Sehat"
                : "Kosongkan untuk memakai nama file asli"
            }
            value={namaFile}
            onChange={(e) => setNamaFile(e.target.value)}
          />
          {isJenisLainnya && (
            <p className="text-[11px] text-amber-700 mt-1">
              Kategori Lainnya mewajibkan Anda menuliskan nama spesifik dokumen.
            </p>
          )}
        </div>

        <FormFileInput
          key={fileInputKey}
          ref={fileInputRef}
          label="Pilih File"
          required
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          maxSizeMb={5}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          icon={<Upload className="w-4 h-4" />}
          className="w-full text-xs font-semibold"
        >
          Unggah Dokumen
        </Button>
      </form>
    </div>
  );
}
