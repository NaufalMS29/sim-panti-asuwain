"use client";

import { useState } from "react";
import {
  Button,
  FormInput,
  FormSelect,
  FormTextarea,
  Modal,
} from "@/components/ui";
import {
  AlumniActionResponse,
  AlumniListItem,
  EligibleAnakOption,
} from "../types/alumni.types";
import {
  createAlumniAction,
  updateAlumniAction,
} from "../actions/alumni.actions";

interface AlumniFormModalProps {
  open: boolean;
  editingItem: AlumniListItem | null;
  eligibleAnak: EligibleAnakOption[];
  onClose: () => void;
  onResult: (res: AlumniActionResponse) => void;
}

export function AlumniFormModal({
  open,
  editingItem,
  eligibleAnak,
  onClose,
  onResult,
}: AlumniFormModalProps) {
  const currentYear = new Date().getFullYear();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id_anak: editingItem
      ? String(editingItem.id_anak)
      : eligibleAnak[0]?.id_anak
        ? String(eligibleAnak[0].id_anak)
        : "",
    tahun_lulus: editingItem
      ? String(editingItem.tahun_lulus)
      : String(currentYear),
    pekerjaan_sekarang: editingItem?.pekerjaan_sekarang ?? "",
    kontak: editingItem?.kontak ?? "",
    alamat_sekarang: editingItem?.alamat_sekarang ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = editingItem
      ? await updateAlumniAction(editingItem.id_alumni, {
          tahun_lulus: Number(form.tahun_lulus),
          alamat_sekarang: form.alamat_sekarang,
          pekerjaan_sekarang: form.pekerjaan_sekarang || undefined,
          kontak: form.kontak || undefined,
        })
      : await createAlumniAction({
          id_anak: Number(form.id_anak),
          tahun_lulus: Number(form.tahun_lulus),
          alamat_sekarang: form.alamat_sekarang,
          pekerjaan_sekarang: form.pekerjaan_sekarang || undefined,
          kontak: form.kontak || undefined,
        });

    setLoading(false);
    onResult(res);

    if (res.success) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      maxWidth="lg"
      title={editingItem ? "Perbarui Data Alumni" : "Catat Alumni Baru"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {editingItem ? (
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
            Alumni: <strong>{editingItem.nama_anak}</strong>
          </div>
        ) : (
          <FormSelect
            label="Pilih Anak Asuh Aktif"
            required
            value={form.id_anak}
            onChange={(e) => setForm({ ...form, id_anak: e.target.value })}
          >
            {eligibleAnak.map((anak) => (
              <option
                key={anak.id_anak}
                value={String(anak.id_anak)}
                className="text-gray-900 bg-white"
              >
                {anak.nama_anak}
                {anak.nik ? ` (${anak.nik})` : ""}
              </option>
            ))}
          </FormSelect>
        )}

        <FormInput
          label="Tahun Lulus"
          type="number"
          required
          min={1990}
          max={currentYear + 1}
          value={form.tahun_lulus}
          onChange={(e) => setForm({ ...form, tahun_lulus: e.target.value })}
        />

        <FormInput
          label="Pekerjaan / Aktivitas Saat Ini"
          type="text"
          placeholder="Contoh: Mahasiswa Teknik Informatika / Karyawan Swasta"
          value={form.pekerjaan_sekarang}
          onChange={(e) =>
            setForm({ ...form, pekerjaan_sekarang: e.target.value })
          }
        />

        <FormInput
          label="Kontak / Nomor HP / WhatsApp"
          type="text"
          placeholder="08xxxxxxxxxx"
          value={form.kontak}
          onChange={(e) => setForm({ ...form, kontak: e.target.value })}
        />

        <FormTextarea
          label="Alamat Domisili Sekarang"
          rows={2}
          required
          placeholder="Alamat tempat tinggal alumni saat ini..."
          value={form.alamat_sekarang}
          onChange={(e) =>
            setForm({ ...form, alamat_sekarang: e.target.value })
          }
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {editingItem ? "Simpan Perubahan" : "Simpan Data Alumni"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
