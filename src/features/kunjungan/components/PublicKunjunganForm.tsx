"use client";

import React, { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { FormInput } from "@/components/ui/FormInput";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { Button } from "@/components/ui/Button";
import { submitKunjunganPublicAction } from "../actions/kunjungan.actions";
import { JadwalKunjunganDTO } from "../types/kunjungan.types";
import { PublicKunjunganSuccessCard } from "./PublicKunjunganSuccessCard";

interface PublicKunjunganFormProps {
  onSwitchToTracker: (kodeTiket: string) => void;
}

export function PublicKunjunganForm({
  onSwitchToTracker,
}: PublicKunjunganFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formStartedAt, setFormStartedAt] = useState<number>(() => Date.now());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] =
    useState<JadwalKunjunganDTO | null>(null);

  const [formData, setFormData] = useState({
    nama_pengunjung: "",
    email_pengunjung: "",
    no_telepon: "",
    instansi_organisasi: "",
    tanggal_rencana: "",
    jam_rencana: "10:00",
    jumlah_rombongan: 1,
    tujuan_kunjungan: "",
    website_url: "", // Honeypot tersembunyi anti-bot
  });

  const minDateToday = new Date().toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await submitKunjunganPublicAction({
        ...formData,
        jumlah_rombongan: Number(formData.jumlah_rombongan),
        form_started_at: formStartedAt,
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.message);
        return;
      }

      setSubmittedTicket(res.data);
      setFormStartedAt(Date.now());
    });
  }

  function handleResetForm() {
    setSubmittedTicket(null);
    setErrorMessage(null);
    setFormStartedAt(Date.now());
    setFormData({
      nama_pengunjung: "",
      email_pengunjung: "",
      no_telepon: "",
      instansi_organisasi: "",
      tanggal_rencana: "",
      jam_rencana: "10:00",
      jumlah_rombongan: 1,
      tujuan_kunjungan: "",
      website_url: "",
    });
  }

  if (submittedTicket) {
    return (
      <PublicKunjunganSuccessCard
        ticket={submittedTicket}
        onTrackTicket={onSwitchToTracker}
        onCreateAnother={handleResetForm}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <AlertBanner
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* Field Jebakan Bot (Honeypot) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_url">Website</label>
        <input
          id="website_url"
          name="website_url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website_url}
          onChange={(e) =>
            setFormData({ ...formData, website_url: e.target.value })
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          label="Nama Lengkap Penanggung Jawab"
          required
          minLength={3}
          maxLength={100}
          placeholder="Contoh: Ahmad Fauzi"
          value={formData.nama_pengunjung}
          onChange={(e) =>
            setFormData({ ...formData, nama_pengunjung: e.target.value })
          }
        />

        <FormInput
          label="Alamat Email Aktif (Untuk Pengiriman E-Tiket)"
          type="email"
          required
          maxLength={100}
          placeholder="nama@email.com"
          value={formData.email_pengunjung}
          onChange={(e) =>
            setFormData({ ...formData, email_pengunjung: e.target.value })
          }
        />

        <FormInput
          label="No. Telepon / WhatsApp"
          type="tel"
          required
          minLength={8}
          maxLength={20}
          placeholder="081234567890"
          value={formData.no_telepon}
          onChange={(e) =>
            setFormData({ ...formData, no_telepon: e.target.value })
          }
        />

        <FormInput
          label="Instansi / Organisasi"
          maxLength={100}
          placeholder="Kosongkan jika perorangan / keluarga"
          hint="Opsional"
          value={formData.instansi_organisasi}
          onChange={(e) =>
            setFormData({ ...formData, instansi_organisasi: e.target.value })
          }
        />

        <FormInput
          label="Tanggal Rencana Kunjungan"
          type="date"
          required
          min={minDateToday}
          value={formData.tanggal_rencana}
          onChange={(e) =>
            setFormData({ ...formData, tanggal_rencana: e.target.value })
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Jam (08:00 - 17:00)"
            type="time"
            required
            min="08:00"
            max="17:00"
            value={formData.jam_rencana}
            onChange={(e) =>
              setFormData({ ...formData, jam_rencana: e.target.value })
            }
          />

          <FormInput
            label="Jumlah Rombongan"
            type="number"
            required
            min={1}
            max={200}
            value={formData.jumlah_rombongan}
            onChange={(e) =>
              setFormData({
                ...formData,
                jumlah_rombongan: Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      <FormTextarea
        label="Tujuan & Rencana Kegiatan Kunjungan"
        required
        rows={3}
        minLength={10}
        maxLength={1000}
        placeholder="Jelaskan maksud kunjungan, contoh: Silaturahmi, santunan rutin, atau penyerahan donasi sembako..."
        value={formData.tujuan_kunjungan}
        onChange={(e) =>
          setFormData({ ...formData, tujuan_kunjungan: e.target.value })
        }
      />

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isPending}
          icon={<Send className="h-4 w-4" />}
          className="w-full"
        >
          Kirim Pengajuan Jadwal Kunjungan
        </Button>
      </div>
    </form>
  );
}
