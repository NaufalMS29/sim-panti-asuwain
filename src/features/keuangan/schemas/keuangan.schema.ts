import { z } from "zod";

export const transaksiKasSchema = z.object({
  jenis_transaksi: z.enum(["pemasukan", "pengeluaran"], {
    message: "Jenis transaksi kas wajib dipilih.",
  }),
  id_kategori_kas: z.coerce
    .number()
    .int()
    .positive("Kategori kas wajib dipilih."),
  nominal: z.coerce
    .number()
    .min(500, "Nominal transaksi minimal Rp 500.")
    .max(9999999999, "Nominal melebihi batas maksimum."),
  tanggal_transaksi: z.string().min(1, "Tanggal transaksi wajib diisi."),
  keterangan: z
    .string()
    .trim()
    .min(2, "Keterangan transaksi wajib diisi minimal 2 karakter.")
    .max(1000, "Keterangan maksimal 1.000 karakter."),
});

export type TransaksiKasFormInput = z.infer<typeof transaksiKasSchema>;
