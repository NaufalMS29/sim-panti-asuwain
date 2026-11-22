import { z } from "zod";

export const inventarisBarangSchema = z.object({
  nama_barang: z
    .string()
    .trim()
    .min(2, "Nama barang inventaris minimal 2 karakter.")
    .max(100, "Nama barang maksimal 100 karakter."),
  jumlah: z.coerce
    .number()
    .int("Jumlah unit harus bilangan bulat.")
    .min(1, "Jumlah unit minimal 1."),
  kondisi: z.enum(["baik", "rusak_ringan", "rusak_berat"], {
    message: "Kondisi inventaris tidak valid.",
  }),
  lokasi_penyimpanan: z
    .string()
    .trim()
    .min(2, "Lokasi penyimpanan wajib diisi.")
    .max(100, "Lokasi penyimpanan maksimal 100 karakter."),
  tgl_perolehan: z.string().min(1, "Tanggal perolehan wajib diisi."),
  keterangan: z
    .string()
    .trim()
    .max(1000, "Keterangan maksimal 1.000 karakter.")
    .optional()
    .or(z.literal("")),
});

export const logistikMasukSchema = z
  .object({
    mode: z.enum(["existing", "new"]),
    id_logistik: z.coerce.number().int().positive().optional().nullable(),
    nama_barang: z.string().trim().max(100).optional().or(z.literal("")),
    kategori: z.string().trim().max(50).optional().or(z.literal("")),
    satuan: z.string().trim().max(20).optional().or(z.literal("")),
    jumlah_masuk: z.coerce
      .number()
      .int("Jumlah masuk harus bilangan bulat.")
      .min(1, "Jumlah masuk minimal 1."),
    tanggal_masuk: z.string().min(1, "Tanggal masuk wajib diisi."),
    keterangan: z
      .string()
      .trim()
      .min(2, "Keterangan sumber barang masuk wajib diisi.")
      .max(255, "Keterangan maksimal 255 karakter."),
  })
  .superRefine((val, ctx) => {
    if (val.mode === "existing" && !val.id_logistik) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["id_logistik"],
        message: "Pilih item logistik yang sudah terdaftar.",
      });
    }
    if (val.mode === "new") {
      if (!val.nama_barang || val.nama_barang.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["nama_barang"],
          message: "Nama barang baru minimal 2 karakter.",
        });
      }
      if (!val.kategori || val.kategori.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["kategori"],
          message: "Kategori barang wajib diisi.",
        });
      }
      if (!val.satuan || val.satuan.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["satuan"],
          message: "Satuan wajib diisi (misal: kg, dus, pcs).",
        });
      }
    }
  });

export const logistikKeluarSchema = z.object({
  id_logistik: z.coerce.number().int().positive("Item logistik wajib dipilih."),
  jumlah_keluar: z.coerce
    .number()
    .int("Jumlah keluar harus bilangan bulat.")
    .min(1, "Jumlah keluar minimal 1."),
  tanggal_keluar: z.string().min(1, "Tanggal keluar wajib diisi."),
  peruntukan: z
    .string()
    .trim()
    .min(2, "Peruntukan pemakaian wajib diisi minimal 2 karakter.")
    .max(255, "Peruntukan maksimal 255 karakter."),
});

export type InventarisBarangFormInput = z.infer<typeof inventarisBarangSchema>;
export type LogistikMasukFormInput = z.infer<typeof logistikMasukSchema>;
export type LogistikKeluarFormInput = z.infer<typeof logistikKeluarSchema>;
