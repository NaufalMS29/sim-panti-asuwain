"use client";

import { useState } from "react";
import { Button, FormInput, FormTextarea, Modal } from "@/components/ui";
import { PengurusActionResponse, PengurusItem } from "../types/pengurus.types";
import { updatePengurusAction } from "../actions/pengurus.actions";

interface PengurusEditModalProps {
  pengurus: PengurusItem | null;
  onClose: () => void;
  onResult: (res: PengurusActionResponse) => void;
}

export function PengurusEditModal({
  pengurus,
  onClose,
  onResult,
}: PengurusEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [namaPengurus, setNamaPengurus] = useState(
    pengurus?.nama_pengurus ?? "",
  );
  const [jabatan, setJabatan] = useState(pengurus?.jabatan ?? "");
  const [noTelepon, setNoTelepon] = useState(pengurus?.no_telepon ?? "");
  const [alamat, setAlamat] = useState(pengurus?.alamat ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengurus) return;

    setLoading(true);
    const res = await updatePengurusAction(pengurus.id_pengurus, {
      nama_pengurus: namaPengurus,
      jabatan,
      no_telepon: noTelepon,
      alamat,
    });
    setLoading(false);

    onResult(res);
    if (res.success) {
      onClose();
    }
  };

  return (
    <Modal
      open={Boolean(pengurus)}
      title={pengurus ? `Ubah Data Pengurus (${pengurus.username})` : ""}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Nama Lengkap Pengurus"
          type="text"
          required
          value={namaPengurus}
          onChange={(e) => setNamaPengurus(e.target.value)}
        />

        <FormInput
          label="Jabatan"
          type="text"
          required
          value={jabatan}
          onChange={(e) => setJabatan(e.target.value)}
        />

        <FormInput
          label="Nomor Telepon / WhatsApp"
          type="tel"
          required
          value={noTelepon}
          onChange={(e) => setNoTelepon(e.target.value)}
        />

        <FormTextarea
          label="Alamat Lengkap"
          required
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
