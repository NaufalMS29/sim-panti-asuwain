"use client";

import { useState } from "react";
import { Button, FormInput, FormTextarea, Modal } from "@/components/ui";
import { PengurusActionResponse } from "../types/pengurus.types";
import { createPengurusAction } from "../actions/pengurus.actions";

interface PengurusCreateModalProps {
  open: boolean;
  onClose: () => void;
  onResult: (res: PengurusActionResponse) => void;
}

export function PengurusCreateModal({
  open,
  onClose,
  onResult,
}: PengurusCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [namaPengurus, setNamaPengurus] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [alamat, setAlamat] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createPengurusAction({
      nama_pengurus: namaPengurus,
      jabatan,
      no_telepon: noTelepon,
      alamat,
    });
    setLoading(false);

    onResult(res);
    if (res.success) {
      setNamaPengurus("");
      setJabatan("");
      setNoTelepon("");
      setAlamat("");
      onClose();
    }
  };

  return (
    <Modal open={open} title="Tambah Data Pengurus Panti" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 leading-relaxed">
          Akun login dengan role <strong>Pengurus Panti</strong> akan dibuat
          otomatis menggunakan format username{" "}
          <span className="font-mono font-semibold">pgr_nama</span> dan password
          default <span className="font-mono font-semibold">asuwain123</span>.
        </div>

        <FormInput
          label="Nama Lengkap Pengurus"
          type="text"
          required
          placeholder="Contoh: Siti Aminah, S.Pd"
          value={namaPengurus}
          onChange={(e) => setNamaPengurus(e.target.value)}
        />

        <FormInput
          label="Jabatan"
          type="text"
          required
          placeholder="Contoh: Bendahara / Pengasuh / Sekretaris"
          value={jabatan}
          onChange={(e) => setJabatan(e.target.value)}
        />

        <FormInput
          label="Nomor Telepon / WhatsApp"
          type="tel"
          required
          placeholder="Contoh: 081234567890"
          value={noTelepon}
          onChange={(e) => setNoTelepon(e.target.value)}
        />

        <FormTextarea
          label="Alamat Lengkap"
          required
          placeholder="Masukkan alamat domisili pengurus..."
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Simpan Pengurus
          </Button>
        </div>
      </form>
    </Modal>
  );
}
