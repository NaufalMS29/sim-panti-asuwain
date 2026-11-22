"use client";

import { useState } from "react";
import { Button, FormInput, FormSelect, FormTextarea } from "@/components/ui";
import { DonaturFormInput } from "../../schemas/donasi.schema";
import { DonaturItem } from "../../types/donasi.types";
import { formatEnumLabel } from "../../utils/donasi.utils";

interface DonaturProfilFormCardProps {
  profil: DonaturItem;
  tipeDonaturOptions: string[];
  loading: boolean;
  onSaveProfil: (input: DonaturFormInput) => Promise<void>;
}

export function DonaturProfilFormCard({
  profil,
  tipeDonaturOptions,
  loading,
  onSaveProfil,
}: DonaturProfilFormCardProps) {
  const [profilForm, setProfilForm] = useState<DonaturFormInput>({
    nama_donatur: profil.nama_donatur ?? "",
    email: profil.email ?? "",
    no_telepon: profil.no_telepon ?? "",
    alamat: profil.alamat ?? "",
    tipe_donatur: profil.tipe_donatur ?? tipeDonaturOptions[0] ?? "tidak_tetap",
    frekuensi_donasi: profil.frekuensi_donasi ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveProfil(profilForm);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Nama Lengkap / Instansi Donatur"
          type="text"
          required
          value={profilForm.nama_donatur}
          onChange={(e) =>
            setProfilForm({ ...profilForm, nama_donatur: e.target.value })
          }
        />

        <FormSelect
          label="Tipe Donatur"
          value={profilForm.tipe_donatur}
          onChange={(e) =>
            setProfilForm({ ...profilForm, tipe_donatur: e.target.value })
          }
        >
          {tipeDonaturOptions.map((opt) => (
            <option key={opt} value={opt}>
              {formatEnumLabel(opt)}
            </option>
          ))}
        </FormSelect>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormInput
          label="Nomor Telepon / WA"
          type="text"
          placeholder="08xxxxxxxxxx"
          value={profilForm.no_telepon ?? ""}
          onChange={(e) =>
            setProfilForm({ ...profilForm, no_telepon: e.target.value })
          }
        />

        <FormInput
          label="Email"
          type="email"
          placeholder="donatur@email.com"
          value={profilForm.email ?? ""}
          onChange={(e) =>
            setProfilForm({ ...profilForm, email: e.target.value })
          }
        />

        <FormInput
          label="Frekuensi Donasi"
          type="text"
          placeholder="Contoh: Bulanan / Insidental"
          value={profilForm.frekuensi_donasi ?? ""}
          onChange={(e) =>
            setProfilForm({ ...profilForm, frekuensi_donasi: e.target.value })
          }
        />
      </div>

      <FormTextarea
        label="Alamat Domisili"
        rows={2}
        value={profilForm.alamat ?? ""}
        onChange={(e) =>
          setProfilForm({ ...profilForm, alamat: e.target.value })
        }
      />

      <Button type="submit" loading={loading}>
        Simpan Identitas Donatur
      </Button>
    </form>
  );
}
